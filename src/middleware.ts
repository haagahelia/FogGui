// src/middleware.js
import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';

export default async function middleware(req: any) {
  const { pathname } = req.nextUrl;

  console.log('Middleware - Path:', pathname);

  // List of protected routes
  const protectedRoutes = ['/dashboard', '/images', '/groups'];

  // Check if the user is trying to access a protected route
  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    console.log('Middleware - Token:', token);

    // If the user is not authenticated, redirect to the login page

    if (!token) {
      console.log('Middleware - Redirecting to login');
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  // Allow the request to proceed if the user is authenticated or accessing a public route
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};