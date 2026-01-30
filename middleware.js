import { NextResponse } from 'next/server';

export function middleware(request) {
    const { pathname } = request.nextUrl;

    // Public routes that don't require authentication
    const publicRoutes = ['/login', '/signup', '/forgot-password'];

    // Check if the current path is public
    const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

    // Allow public routes and static files
    if (isPublicRoute || pathname.startsWith('/_next') || pathname.startsWith('/api')) {
        return NextResponse.next();
    }

    // For all other routes, the auth check will be handled by the page component
    // This middleware just ensures proper routing
    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
