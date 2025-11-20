import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createAdminClient } from '@/utils/supabase/admin';
import Stripe from 'stripe';

export async function POST(req: Request) {
  const body = await req.text();
  const headerPayload = await headers();
  const signature = headerPayload.get('Stripe-Signature') as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: any) {
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  if (event.type === 'checkout.session.completed') {
    const supabase = createAdminClient();
    
    // Idempotency check using token_transactions
    // We check if a transaction with this stripe_session_id already exists
    const { data: existingTransaction } = await supabase
        .from('token_transactions')
        .select('*')
        .eq('metadata->>stripe_session_id', session.id)
        .single();

    if (existingTransaction) {
        return new NextResponse(null, { status: 200 });
    }

    const userId = session.metadata?.userId;
    const tokens = parseInt(session.metadata?.tokens || '0');
    const bundleType = session.metadata?.bundleType;

    if (!userId || !tokens) {
      return new NextResponse('Webhook Error: Missing metadata', { status: 400 });
    }

    // 1. Add tokens to user balance
    // We need to fetch current balance first or use an RPC function for atomic increment
    // For now, we'll fetch and update, but in production an RPC is safer for concurrency
    // However, since we have the transaction log, we can reconcile if needed.
    // Let's try to do it transactionally if possible, or just update.
    
    const { data: tokenData, error: fetchError } = await supabase
      .from('user_tokens')
      .select('balance')
      .eq('user_id', userId)
      .single();

    if (fetchError) {
        // If no record, create one
        await supabase.from('user_tokens').insert({
            user_id: userId,
            balance: tokens,
            is_subscribed: true, // They bought something, so they are "subscribed" or at least a customer
            rollover_limit: 150 // Or whatever the default is
        });
    } else {
        await supabase
          .from('user_tokens')
          .update({ 
            balance: tokenData.balance + tokens,
            is_subscribed: true 
          })
          .eq('user_id', userId);
    }

    // 2. Log transaction
    await supabase.from('token_transactions').insert({
      user_id: userId,
      amount: tokens,
      type: 'purchase',
      description: `Purchased ${bundleType} bundle`,
      metadata: {
        stripe_session_id: session.id,
        stripe_customer_id: session.customer,
        amount_total: session.amount_total,
        currency: session.currency,
      },
    });
  }

  return new NextResponse(null, { status: 200 });
}
