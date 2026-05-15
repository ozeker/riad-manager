# Codex Prompts

## Prompt 1 — UI Prototype

You are building the first prototype of a riad management web app.

Tech stack:

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- date-fns
- lucide-react
- sonner

Goal of this first milestone:

Build the UI prototype only, using mock data.

Do not connect a database yet.

Do not implement auth yet.

Do not implement iCal sync yet.

Do not implement PDF generation yet.

Product:

A single-owner internal management tool for a Moroccan riad.

Pages:

1. Dashboard
2. Calendar
3. Bookings
4. Guests
5. Payments
6. Cash Drawer
7. Invoices
8. Settings

Main requirement:

Build a polished dashboard layout with a sidebar and a reservation calendar.

Calendar:

- Rooms are rows
- Dates are columns
- Bookings appear as colored blocks
- Colors depend on source:
  - Booking.com
  - Airbnb
  - Direct
  - Walk-in
  - HotelRunner
- Clicking an empty cell opens a create booking modal
- Clicking an existing booking opens an edit booking modal

Booking fields:

- guest name
- room
- check-in date
- check-out date
- source
- amount
- currency
- notes

Use mock data for:

- 5 rooms
- 5 bookings

Design:

- Premium SaaS feel, similar to Linear, Stripe Dashboard, or Notion
- Clean spacing
- Modern cards
- Responsive layout
- Use shadcn/ui components where appropriate

Create reusable components:

- AppSidebar
- CalendarGrid
- BookingBlock
- BookingModal
- StatCard
- PageHeader

After implementation:

- Explain how to run the app locally
- Explain the folder structure
- Mention any assumptions made
