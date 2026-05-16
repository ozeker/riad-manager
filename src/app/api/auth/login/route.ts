import { NextResponse } from "next/server"

import {
  AUTH_COOKIE_NAME,
  createSessionToken,
  getOwnerPassword,
  validateAuthConfig,
} from "@/lib/auth"

export async function POST(request: Request) {
  const authConfig = validateAuthConfig()

  if (!authConfig.ok) {
    return NextResponse.json({ error: authConfig.message }, { status: 500 })
  }

  const ownerPassword = getOwnerPassword()

  if (!ownerPassword) {
    return NextResponse.json(
      { error: "OWNER_PASSWORD is not configured" },
      { status: 500 }
    )
  }

  const body = await request.json().catch(() => null)
  const password = typeof body?.password === "string" ? body.password : ""

  if (password !== ownerPassword) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 })
  }

  const response = NextResponse.json({ ok: true })

  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: await createSessionToken(),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  })

  return response
}
