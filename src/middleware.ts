import { getToken } from 'next-auth/jwt';
import { NextResponse, NextRequest } from 'next/server';

export default async function middleware(req: any) {
  const { pathname } = req.nextUrl;

  console.log('Middleware - Path:', pathname);

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  console.log('Middleware - Token:', token);

  const protectedRoutes = ['/dashboard', '/hosts', '/images', '/groups', '/tasks'];
  const adminOnlyRoutes = ['/admin'];

  // Redirect unauthenticated users from any protected route
  if ([...protectedRoutes, ...adminOnlyRoutes].some(route => pathname.startsWith(route))) {
    if (!token) {
      console.log('Middleware - Redirecting to login (unauthenticated)');
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  // Redirect non-admin users from admin routes
  if (adminOnlyRoutes.some(route => pathname.startsWith(route))) {
    if (token?.role !== 'admin') {
      console.log('Middleware - Redirecting to dashboard (not admin)');
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};