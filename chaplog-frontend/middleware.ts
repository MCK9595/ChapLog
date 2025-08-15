import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Protected routes that require authentication
const protectedRoutes = ['/dashboard', '/books', '/entries', '/reviews', '/statistics', '/settings'];

// Public routes that should redirect to dashboard if authenticated
const authRoutes = ['/login', '/register'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  
  // Check if the route is an auth route
  const isAuthRoute = authRoutes.some(route => pathname === route);
  
  // Get the auth token from cookies
  const token = request.cookies.get('chaplog-token');
  
  // Debug logging in development
  if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_API_DEBUG === 'true') {
    console.log('Middleware - Path:', pathname);
    console.log('Middleware - Protected:', isProtectedRoute);
    console.log('Middleware - Auth route:', isAuthRoute);
    console.log('Middleware - Token present:', !!token);
    
    // Aspire Service Discovery debugging
    console.log('Aspire Service Discovery Env Vars:', {
      'services__api__http__0': process.env.services__api__http__0,
      'services__api__https__0': process.env.services__api__https__0,
      'NEXT_PUBLIC_API_BASE_URL': process.env.NEXT_PUBLIC_API_BASE_URL
    });
  }
  
  // Redirect to login if accessing protected route without auth
  if (isProtectedRoute && !token) {
    const url = new URL('/login', request.url);
    url.searchParams.set('from', pathname);
    return NextResponse.redirect(url);
  }
  
  // Redirect to dashboard if accessing auth routes while authenticated
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};