import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define public routes that don't require authentication
const publicRoutes = [
  '/',
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/auth/callback',
  '/api',
  '/_next',
  '/favicon.ico',
  '/public',
];

// Define protected routes that require authentication
const protectedRoutes = [
  '/dashboard',
];

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            req.cookies.set(name, value);
          });
          res.headers.set('set-cookie', req.cookies.toString());
        },
      },
    }
  );

  const path = req.nextUrl.pathname;

  // Bypass middleware for internal Next.js routes
  if (path.startsWith('/_next/') || path.startsWith('/api/') || path.startsWith('/public/')) {
    return res;
  }

  // Check if the path is public
  const isPublicRoute = publicRoutes.some(route =>
    path === route || path.startsWith(route + '/')
  );

  // If it's a public route, allow access
  if (isPublicRoute) {
    return res;
  }

  // Check if it's a protected route
  const isProtectedRoute = protectedRoutes.some(route =>
    path === route || path.startsWith(route + '/')
  );

  // If it's a protected route, check authentication
  if (isProtectedRoute) {
    const { data: { user } } = await supabase.auth.getUser();

    // If not authenticated, redirect to login
    if (!user) {
      const redirectUrl = new URL('/login', req.url);
      redirectUrl.searchParams.set('redirectTo', path);
      return NextResponse.redirect(redirectUrl);
    }
  }

  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};