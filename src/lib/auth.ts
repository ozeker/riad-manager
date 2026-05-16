export const AUTH_COOKIE_NAME = "riad_owner_session"

const SESSION_LABEL = "riad-manager-owner-session-v1"
const MIN_PASSWORD_LENGTH = 12
const MIN_SECRET_LENGTH = 32

const placeholderValues = new Set([
  "change-this-owner-password",
  "change-this-to-a-long-random-secret",
  "riad-owner-demo",
])

export function getOwnerPassword() {
  return process.env.OWNER_PASSWORD
}

export function validateAuthConfig() {
  const ownerPassword = process.env.OWNER_PASSWORD
  const authSecret = process.env.AUTH_SECRET

  if (!ownerPassword || placeholderValues.has(ownerPassword)) {
    return {
      ok: false,
      message: "OWNER_PASSWORD must be set to a private value in .env",
    }
  }

  if (ownerPassword.length < MIN_PASSWORD_LENGTH) {
    return {
      ok: false,
      message: `OWNER_PASSWORD must be at least ${MIN_PASSWORD_LENGTH} characters`,
    }
  }

  if (!authSecret || placeholderValues.has(authSecret)) {
    return {
      ok: false,
      message: "AUTH_SECRET must be set to a private value in .env",
    }
  }

  if (authSecret.length < MIN_SECRET_LENGTH) {
    return {
      ok: false,
      message: `AUTH_SECRET must be at least ${MIN_SECRET_LENGTH} characters`,
    }
  }

  return { ok: true, message: "" }
}

function getAuthSecret() {
  const secret = process.env.AUTH_SECRET

  if (secret) {
    return secret
  }

  throw new Error("AUTH_SECRET is required")
}

async function sha256Hex(value: string) {
  const data = new TextEncoder().encode(value)
  const digest = await crypto.subtle.digest("SHA-256", data)

  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")
}

function constantTimeEqual(left: string, right: string) {
  const maxLength = Math.max(left.length, right.length)
  let mismatch = left.length === right.length ? 0 : 1

  for (let index = 0; index < maxLength; index += 1) {
    const leftCode = left.charCodeAt(index) || 0
    const rightCode = right.charCodeAt(index) || 0
    mismatch |= leftCode ^ rightCode
  }

  return mismatch === 0
}

export async function createSessionToken() {
  return sha256Hex(`${getAuthSecret()}:${SESSION_LABEL}`)
}

export async function isValidSessionToken(token: string | undefined | null) {
  if (!token) {
    return false
  }

  const expectedToken = await createSessionToken()

  return constantTimeEqual(token, expectedToken)
}
