import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createRouteClient } from '@/utils/supabase/route';
import { cookies } from 'next/headers';

const BUNDLES = {
  mini: {
    price: 500, // $5.00
    tokens: 50,
    name: 'Mini Pack',
  },
  standard: {
    price: 1400, // $14.00
    tokens: 200,
    name: 'Standard Pack',
  },
  agency: {
    price: 2900, // $29.00
    tokens: 500,
    name: 'Agency Pack',
  },
};

export async function POST(req: Request) {
  try {
    const supabase = await createRouteClient();
    
    // Debug: Check what cookies we have
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();
    console.log('[STRIPE_CHECKOUT] All cookies:', allCookies.map(c => c.name));
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const projectId = supabaseUrl.split('.')[0].split('//')[1];
    console.log('[STRIPE_CHECKOUT] Configured Project ID:', projectId);

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    console.log('[STRIPE_CHECKOUT] User check:', { user: user?.id, error: userError });

    if (!user || userError) {
      console.error('[STRIPE_CHECKOUT] Authentication failed:', userError);
      return new NextResponse(JSON.stringify({ error: 'Unauthorized', details: userError?.message }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const body = await req.json();
    const { bundleType } = body;

    if (!bundleType || !BUNDLES[bundleType as keyof typeof BUNDLES]) {
      return new NextResponse('Invalid bundle type', { status: 400 });
    }

    const bundle = BUNDLES[bundleType as keyof typeof BUNDLES];

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${bundle.name} (${bundle.tokens} tokens)`,
            },
            unit_amount: bundle.price,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
      metadata: {
        userId: user.id,
        bundleType: bundleType,
        tokens: bundle.tokens.toString(),
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('[STRIPE_CHECKOUT]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
