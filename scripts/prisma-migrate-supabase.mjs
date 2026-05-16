import { spawn } from "node:child_process"

if (!process.env.DIRECT_URL) {
  console.error("DIRECT_URL is required for Supabase Prisma migrations.")
  process.exit(1)
}

const command = process.platform === "win32" ? "npm.cmd" : "npm"
const child = spawn(command, ["exec", "prisma", "migrate", "deploy"], {
  env: {
    ...process.env,
    DATABASE_URL: process.env.DIRECT_URL,
  },
  shell: false,
  stdio: "inherit",
})

child.on("exit", (code) => {
  process.exit(code ?? 1)
})
