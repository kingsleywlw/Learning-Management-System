import { clerkMiddleware,createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher(['/api/webhooks(.*)','/sign-in(.*)'])

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect()
  }
  const session = await auth()
  const role = session?.sessionClaims?.metadata?.role
  // If signed in and on the root route, redirect based on role
  if (req.nextUrl.pathname === '/') {
    if (role === 'teacher') {
      return NextResponse.redirect(new URL('/teacher', req.url))
    }
    else if (role === 'admin') {
      return NextResponse.redirect(new URL('/admin', req.url))
    }
    else{
      return NextResponse.redirect(new URL('/student', req.url))
    }
  }

})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};