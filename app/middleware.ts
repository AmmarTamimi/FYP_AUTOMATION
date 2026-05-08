// middleware.ts
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequestWithAuth } from "next-auth/middleware";

export default withAuth(
  function middleware(req: NextRequestWithAuth) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Root path handling
    if (path === '/') {
      if (!token) {
        return NextResponse.redirect(new URL('/login', req.url));
      }
      return NextResponse.next();
    }
   

    // If user is logged in and tries to access login/register, redirect to dashboard
    if (token && (path === '/login' || path === '/register')) {
      switch (token?.role) {
        case 'ADMIN':
          return NextResponse.redirect(new URL('/admin/dashboard', req.url));
        case 'TEACHER':
          return NextResponse.redirect(new URL('/teacher/dashboard', req.url));
        case 'STUDENT':
          return NextResponse.redirect(new URL('/student/dashboard', req.url));
        default:
          return NextResponse.redirect(new URL('/login', req.url));
      }
    }
    

    // Role-based route protection
    if (path.startsWith('/admin') && token?.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }
    
    if (path.startsWith('/teacher') && token?.role !== 'TEACHER') {
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }
    
    if (path.startsWith('/student') && token?.role !== 'STUDENT') {
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const publicPaths = ['/login', '/register'];
        if (publicPaths.includes(req.nextUrl.pathname)) {
          return true;
        }

         // ✅ Allow API routes (IMPORTANT FIX)
        if (req.nextUrl.pathname.startsWith('/api')) {
          return true;
        }
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    /*
      Apply middleware to everything EXCEPT:
      - /api (all API routes)
      - /_next (Next.js internals)
      - static files
    */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};