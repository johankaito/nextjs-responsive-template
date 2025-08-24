import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { UserType as UserRole } from '@/types/drizzle';

// Define protected routes and their required roles
const protectedRoutes = {
  '/dashboard': [], // All authenticated users can access dashboard
  '/admin': ['ADMIN'], // Keep for backward compatibility
  '/owner': ['OWNER', 'ADMIN'], // Keep for backward compatibility
  '/manager': ['MANAGER', 'ADMIN', 'OWNER'], // Keep for backward compatibility
  '/contractor': ['CONTRACTOR', 'ADMIN'], // Keep for backward compatibility
  '/onboarding': [], // No specific role required, just authenticated
  '/jobs': [], // All authenticated users can view jobs
};

// Define role-based default routes - now all point to unified dashboard
const roleDefaultRoutes: Record<UserRole, string> = {
  ADMIN: '/dashboard?tab=analytics',
  OWNER: '/dashboard?tab=dashboard',
  MANAGER: '/dashboard?tab=dashboard',
  CONTRACTOR: '/dashboard?tab=my-jobs',
};

// Define public routes that don't require authentication
const publicRoutes = [
  '/login',
  '/forgot-password',
  '/reset-password',
  '/not-authorized',
  '/auth/callback',  // Add support for auth callbacks
  '/api',
  '/_next',
  '/favicon.ico',
];

interface UserData {
  type: UserRole;
}

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
  if (path.startsWith('/_next/') || path.startsWith('/api/')) {
    return res;
  }

  // Block any signup attempts - public signup is disabled
  if (path === '/signup' || path.startsWith('/signup/')) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Special handling for password reset - completely bypass all auth checks
  if (path === '/reset-password') {
    return res;
  }

  // Check if the path is public - return early to completely bypass auth checks
  if (publicRoutes.some(route => path.startsWith(route))) {
    return res;
  }

  // Check authentication using getUser for security
  const { data: { user } } = await supabase.auth.getUser();

  // If not authenticated, redirect to login
  if (!user) {
    const redirectUrl = new URL('/login', req.url);
    redirectUrl.searchParams.set('redirectTo', path);
    return NextResponse.redirect(redirectUrl);
  }

  // Get user type from User table
  const { data: userData } = await supabase
    .from('users')
    .select('type')
    .eq('email', user.email)
    .single() as { data: UserData | null };

  if (!userData) {
    return NextResponse.redirect(new URL('/not-authorized', req.url));
  }

  // Check if user needs onboarding (no full name with space)
  const { data: userDetails } = await supabase
    .from('users')
    .select('name')
    .eq('email', user.email)
    .single();

  const needsOnboarding = !userDetails?.name || !userDetails.name.includes(' ');
  
  // If user needs onboarding and not on onboarding page, redirect to onboarding
  if (needsOnboarding && path !== '/onboarding') {
    return NextResponse.redirect(new URL('/onboarding', req.url));
  }
  
  // If user is onboarded and on onboarding page, redirect to dashboard
  if (!needsOnboarding && path === '/onboarding') {
    const defaultRoute = roleDefaultRoutes[userData.type];
    if (defaultRoute) {
      return NextResponse.redirect(new URL(defaultRoute, req.url));
    }
  }

  // For root path, redirect to role-specific default route
  if (path === '/') {
    const defaultRoute = roleDefaultRoutes[userData.type];
    if (defaultRoute) {
      return NextResponse.redirect(new URL(defaultRoute, req.url));
    }
  }

  // Redirect old role-specific routes to unified dashboard
  if (path === '/admin' || path === '/owner' || path === '/manager' || path === '/contractor') {
    const defaultRoute = roleDefaultRoutes[userData.type];
    if (defaultRoute) {
      return NextResponse.redirect(new URL(defaultRoute, req.url));
    }
  }

  // Check if the path is protected
  const isProtectedRoute = Object.keys(protectedRoutes).some(route => path.startsWith(route));
  if (!isProtectedRoute) {
    return res;
  }

  // Check role-based access
  const requiredRoles = Object.entries(protectedRoutes)
    .find(([route]) => path.startsWith(route))?.[1] as UserRole[];

  if (requiredRoles && requiredRoles.length > 0 && !requiredRoles.includes(userData.type)) {
    return NextResponse.redirect(new URL('/not-authorized', req.url));
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