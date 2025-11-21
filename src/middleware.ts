import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // This should appear in terminal if middleware is running
  console.log('🚀 MIDDLEWARE RUNNING FOR:', pathname);

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Add a header to verify middleware is running
  response.headers.set('x-middleware-executed', 'true');

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  // Refresh session if expired - required for Server Components
  const { data: { session } } = await supabase.auth.getSession();

  // Define public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/login',
    '/register',
    '/pricing',
    '/terms-of-service',
    '/privacy-policy',
    '/proposal-generator',
  ];

  const isPublicRoute = publicRoutes.includes(pathname) || pathname.startsWith('/share');
  const isAuthPage = pathname === '/login' || pathname === '/register';
  const isProtectedRoute = !isPublicRoute;

  // Debug logging
  console.log('🔒 Middleware Check:', {
    pathname,
    hasSession: !!session,
    userId: session?.user?.id,
    isPublicRoute,
    isProtectedRoute,
    willRedirect: !session && isProtectedRoute
  });

  // If user is authenticated and trying to access auth pages, redirect to dashboard
  if (session && isAuthPage) {
    console.log('✅ Authenticated user on auth page, redirecting to dashboard');
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/dashboard';
    return NextResponse.redirect(redirectUrl);
  }

  // If user is not authenticated and trying to access protected routes, redirect to login
  if (!session && isProtectedRoute) {
    console.log('🚫 REDIRECTING TO LOGIN - No session for protected route:', pathname);
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/login';
    
    // Preserve the original URL as a redirect parameter
    if (pathname !== '/login' && pathname !== '/register') {
      redirectUrl.searchParams.set('redirect', pathname);
    }
    
    return NextResponse.redirect(redirectUrl);
  }

  console.log('✅ Allowing access to:', pathname);
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api (API routes)
     */
    '/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

