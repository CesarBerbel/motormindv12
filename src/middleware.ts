import { auth } from "@/auth"
import { NextResponse } from "next/server"

const AUTH_ROUTES = ["/login", "/forgot-password"]
const PROTECTED_PREFIXES = ["/dashboard", "/settings"]

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isLoggedIn = !!req.auth

  const isAuthRoute = AUTH_ROUTES.some((r) => pathname.startsWith(r))
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p))

  if (isProtected && !isLoggedIn) {
    const loginUrl = new URL("/login", req.url)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico|api/health).*)"],
}
