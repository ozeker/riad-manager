import fs from "node:fs/promises"

const baseUrl = process.env.MVP_TEST_BASE_URL ?? "http://localhost:3000"
let cookie = ""

function requireEnvValue(name, envText) {
  const match = envText.match(new RegExp(`${name}="([^"]+)"`))
  if (!match?.[1]) {
    throw new Error(`${name} is missing from .env`)
  }

  return match[1]
}

async function request(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    redirect: "manual",
    ...options,
    headers: {
      ...(options.headers ?? {}),
      ...(cookie ? { cookie } : {}),
    },
  })
  const setCookie = response.headers.get("set-cookie")

  if (setCookie) {
    cookie = setCookie.split(";")[0]
  }

  return response
}

async function jsonRequest(path, body, options = {}) {
  const response = await request(path, {
    method: options.method ?? "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  })
  const text = await response.text()
  const payload = text ? JSON.parse(text) : null

  if (!response.ok) {
    throw new Error(`${path} failed with ${response.status}: ${text}`)
  }

  return payload
}

async function expectStatus(label, response, expectedStatus) {
  if (response.status !== expectedStatus) {
    throw new Error(`${label}: expected ${expectedStatus}, got ${response.status}`)
  }
}

async function main() {
  const envText = await fs.readFile(".env", "utf8")
  const ownerPassword = requireEnvValue("OWNER_PASSWORD", envText)
  const created = {
    bookingId: "",
    paymentId: "",
    cashMovementId: "",
    invoiceId: "",
  }

  try {
    await expectStatus("unauthenticated dashboard redirect", await request("/"), 307)

    await jsonRequest("/api/auth/login", { password: ownerPassword })

    const dashboard = await request("/")
    await expectStatus("dashboard", dashboard, 200)

    const booking = await jsonRequest("/api/bookings", {
      guestName: "MVP Smoke Guest",
      roomId: "terrace-room",
      checkIn: "2026-06-20",
      checkOut: "2026-06-21",
      guests: 2,
      source: "Direct",
      amount: 800,
      currency: "MAD",
      status: "confirmed",
      notes: "Created by MVP smoke test.",
    })
    created.bookingId = booking.id

    const conflict = await request("/api/bookings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        guestName: "MVP Conflict Guest",
        roomId: "terrace-room",
        checkIn: "2026-06-20",
        checkOut: "2026-06-21",
        guests: 1,
        source: "Direct",
        amount: 400,
        currency: "MAD",
        status: "confirmed",
        notes: "This should conflict.",
      }),
    })
    await expectStatus("booking conflict", conflict, 409)

    const payment = await jsonRequest("/api/payments", {
      bookingId: created.bookingId,
      amount: 800,
      currency: "MAD",
      method: "cash",
      paymentDate: "2026-06-20",
      notes: "Smoke test payment.",
    })
    created.paymentId = payment.id

    const cashMovement = await jsonRequest("/api/cash-movements", {
      date: "2026-06-20",
      type: "cash in",
      category: "room payment",
      amount: 800,
      notes: "Smoke test cash movement.",
    })
    created.cashMovementId = cashMovement.id

    const invoice = await jsonRequest("/api/invoices", {
      bookingId: created.bookingId,
      issueDate: "2026-06-20",
      lines: [
        {
          description: "Room stay",
          quantity: 1,
          unitPrice: 800,
        },
      ],
    })
    created.invoiceId = invoice.id

    const pdf = await request(`/api/invoices/pdf?id=${created.invoiceId}`)
    await expectStatus("invoice pdf", pdf, 200)

    const csv = await request(
      "/api/export?dataset=bookings&from=2026-06-01&to=2026-06-30"
    )
    await expectStatus("bookings csv", csv, 200)
    const csvText = await csv.text()
    if (!csvText.includes("guest_name") || !csvText.includes("MVP Smoke Guest")) {
      throw new Error("bookings CSV did not include expected test booking")
    }
  } finally {
    if (created.invoiceId) {
      await request(`/api/invoices?id=${created.invoiceId}`, { method: "DELETE" })
    }
    if (created.paymentId) {
      await request(`/api/payments?id=${created.paymentId}`, { method: "DELETE" })
    }
    if (created.cashMovementId) {
      await request(`/api/cash-movements?id=${created.cashMovementId}`, {
        method: "DELETE",
      })
    }
    if (created.bookingId) {
      await request(`/api/bookings?id=${created.bookingId}`, { method: "DELETE" })
    }
  }

  console.log("MVP smoke test passed")
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
