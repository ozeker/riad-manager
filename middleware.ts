import { NextRequest, NextResponse } from "next/server"

import { AUTH_COOKIE_NAME, isValidSessionToken } from "@/lib/auth"

function isPublicAsset(pathname: string) {
  return (
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico" ||
    pathname.match(/\.(.*)$/)
  )
}

function getSafeNextPath(request: NextRequest) {
  return `${request.nextUrl.pathname}${request.nextUrl.search}`
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (isPublicAsset(pathname)) {
    return NextResponse.next()
  }

  const isLoginPage = pathname === "/login"
  const isAuthApi = pathname.startsWith("/api/auth")
  const isAuthenticated = await isValidSessionToken(
    request.cookies.get(AUTH_COOKIE_NAME)?.value
  )

  if (isAuthApi) {
    return NextResponse.next()
  }

  if (isLoginPage) {
    if (!isAuthenticated) {
      return NextResponse.next()
    }

    return NextResponse.redirect(new URL("/", request.url))
  }

  if (isAuthenticated) {
    return NextResponse.next()
  }

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const loginUrl = new URL("/login", request.url)
  loginUrl.searchParams.set("next", getSafeNextPath(request))

  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
