import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isLoggedIn = !!req.auth
  // @ts-ignore
  const isAdmin = req.auth?.user?.role === 'ADMIN'

  // Protect dashboard routes
  if (pathname.startsWith('/my-library') && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // Protect admin routes
  if (pathname.startsWith('/admin') && !isAdmin) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  // Protect checkout
  if (pathname.startsWith('/checkout') && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', req.url))
  }
})

export const config = {
  matcher: ['/my-library/:path*', '/admin/:path*', '/checkout/:path*']
}
