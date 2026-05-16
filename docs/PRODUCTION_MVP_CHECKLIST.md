# Production MVP Checklist

Use this checklist before the owner relies on Riad Manager for daily operations.

## Access

- [ ] `OWNER_PASSWORD` is private and not the example value.
- [ ] `AUTH_SECRET` is private, random, and at least 32 characters.
- [ ] Login redirects unauthenticated users to `/login`.
- [ ] Logout returns the owner to `/login`.

## Data

- [ ] Supabase PostgreSQL project is active.
- [ ] `npm run db:migrate:supabase` has been run successfully.
- [ ] Property settings are correct: name, legal name, address, phone, ICE, tax, VAT.
- [ ] Room list is correct and inactive rooms are disabled.
- [ ] CSV backup exports are downloadable from Settings.

## Daily Workflow

- [ ] Owner can create and edit a booking.
- [ ] Same-room date conflicts are blocked.
- [ ] Owner can create and edit guests.
- [ ] Owner can record payments.
- [ ] Owner can record cash in and cash out.
- [ ] Dashboard reflects real occupancy, arrivals, cash, and open balances.

## Documents

- [ ] Invoice drafts can be created from bookings.
- [ ] Invoice PDF downloads correctly.
- [ ] Final invoices get a final number.
- [ ] Final invoices cannot be edited or deleted.

## iCal

- [ ] Booking.com feed URL is saved and assigned to the correct room.
- [ ] Airbnb feed URL is saved and assigned to the correct room.
- [ ] HotelRunner feed URL is saved and assigned to the correct room.
- [ ] Import status shows success, partial, or error.
- [ ] Imported bookings do not duplicate on repeated imports.

## Verification Commands

Run:

```bash
npm run verify
```

Expected:

- lint passes
- production build passes

With the app running, run:

```bash
npm run test:mvp
```

Expected:

- `MVP smoke test passed`

## Current Production Caveat

This MVP uses a single owner password and a simple signed session cookie.

Before adding staff/receptionist accounts, upgrade authentication and
permissions.
