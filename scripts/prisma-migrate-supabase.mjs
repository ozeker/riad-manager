import "dotenv/config"

import { exec } from "node:child_process"

if (!process.env.DIRECT_URL) {
  console.error("DIRECT_URL is required for Supabase Prisma migrations.")
  process.exit(1)
}

const command =
  process.platform === "win32"
    ? "npm.cmd exec -- prisma migrate deploy"
    : "npm exec -- prisma migrate deploy"
const env = Object.fromEntries(
  Object.entries(process.env).filter(([key, value]) => {
    return !key.startsWith("=") && typeof value === "string"
  }),
)

const child = exec(command, {
  env: {
    ...env,
    DATABASE_URL: process.env.DIRECT_URL,
  },
})

child.stdout?.pipe(process.stdout)
child.stderr?.pipe(process.stderr)

child.on("exit", (code) => {
  process.exit(code ?? 1)
})
