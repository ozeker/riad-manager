# BRD - Riad Manager

## Purpose

This Business Requirements Document is the living feature register for Riad Manager.

It should stay up to date whenever the app changes.

Use it to answer:

- what the app does today
- what the owner should test
- what is intentionally not included yet
- what future improvements are worth considering

## Product Summary

Riad Manager is a single-owner internal web app for a small Moroccan riad.

The app helps the owner manage daily operations:

- rooms
- bookings
- guests
- payments
- cash drawer movements
- invoice drafts and PDFs
- iCal imports
- CSV exports
- property settings

The first production target is a practical MVP for one owner, not a full hotel platform.

## Target User

The primary user is the riad owner.

The owner needs to:

- see room availability quickly
- create and correct bookings
- track guest details
- track payments in MAD, EUR, and USD
- track cash in and cash out
- generate invoice drafts
- import reservations from external calendar feeds
- export records when needed

## Business Goals

1. Reduce daily operational confusion.
2. Replace scattered paper, WhatsApp, Excel, and manual notes.
3. Give the owner a clear view of bookings, cash, and invoices.
4. Keep data editable and exportable.
5. Keep the app simple enough for non-technical daily use.

## Current MVP Status

Status: MVP candidate.

The current app is ready for owner acceptance testing.

It is not yet considered fully production-hardened until:

- real property data is entered
- real iCal feeds are tested
- the owner completes a manual workflow test
- deployment and backup strategy are confirmed

## Current Functional Requirements

### 1. Owner Login

The app supports one owner login.

Current behavior:

- unauthenticated users are redirected to `/login`
- login uses `OWNER_PASSWORD` from `.env`
- session uses an HttpOnly cookie
- owner can sign out from the top-right menu
- API routes are protected

Acceptance checks:

- visiting `/` without login redirects to `/login`
- wrong password is rejected
- correct password opens the dashboard
- logout returns to `/login`

Future improvements:

- password change screen
- email-based login
- session expiration controls
- two-factor authentication
- staff/receptionist accounts

### 2. Dashboard

The dashboard gives the owner an operational overview.

Current behavior:

- shows occupied rooms today
- shows upcoming arrivals
- shows cash position
- shows open booking balances
- lists upcoming arrivals
- shows invoice draft count
- provides quick CSV export buttons

Acceptance checks:

- dashboard loads after login
- stats update when bookings, payments, or cash movements change
- upcoming arrivals list real bookings

Future improvements:

- date selector for dashboard
- today/tomorrow arrival cards
- unpaid checkout warnings
- iCal import warnings
- recent activity feed

### 3. Rooms

The owner can manage rooms from Settings.

Current behavior:

- create rooms
- edit rooms
- activate or deactivate rooms
- set capacity
- set default rates in MAD, EUR, and USD

Acceptance checks:

- created rooms appear in room list
- active rooms appear on calendar
- inactive rooms cannot receive new bookings

Future improvements:

- room photos
- room amenities
- room order sorting
- seasonal rates
- maintenance/blocked-room dates

### 4. Calendar

The calendar is the main reservations view.

Current behavior:

- rooms are displayed as rows
- dates are displayed as columns
- bookings appear as colored blocks
- colors depend on booking source
- click empty cell to create booking
- click booking block to edit booking

Acceptance checks:

- active rooms appear in calendar
- bookings appear in the correct room row
- booking colors match source
- clicking empty cell opens create modal
- clicking booking opens edit modal

Future improvements:

- month navigation
- today shortcut
- mobile calendar improvements
- drag-to-change dates
- blocked dates
- printable calendar view

### 5. Bookings

The owner can create and manage reservations.

Current behavior:

- create booking
- edit booking
- cancel booking
- archive booking using soft delete
- assign guest
- select room
- set check-in and check-out dates
- set guest count
- set source
- set amount and currency
- set status
- add notes
- same-room date conflicts are blocked
- room capacity is validated

Booking statuses:

- confirmed
- checked in
- checked out
- cancelled
- no show

Booking sources:

- Booking.com
- Airbnb
- HotelRunner
- Direct
- Walk-in
- Other

Acceptance checks:

- booking can be created from Bookings page
- booking can be created from Calendar page
- overlapping active booking in same room is rejected
- cancelled/no-show bookings do not block availability
- archived booking disappears from normal booking lists

Future improvements:

- deposit field
- balance due date
- arrival time
- checkout time
- booking confirmation PDF
- room move history
- bulk edit

### 6. Guests

The owner can manage guest records.

Current behavior:

- create guest
- edit guest
- store phone
- store email
- store nationality
- store ID/passport number
- store notes
- view booking history

Acceptance checks:

- guest can be created manually
- guest can be created from booking form
- guest history shows related bookings

Future improvements:

- guest search filters
- repeat guest marker
- scanned document upload
- nationality reporting
- guest communication notes

### 7. Payments

The owner can track payments against bookings.

Current behavior:

- create payment
- edit payment
- delete payment
- assign payment to booking
- set amount
- set currency: MAD, EUR, USD
- set method
- set payment date
- add notes
- booking payment status is shown as unpaid, partial, or paid

Payment methods:

- cash
- card
- bank transfer
- OTA prepaid
- other

Acceptance checks:

- payment can be added to booking
- payment status changes after payment is added
- payment can be deleted

Future improvements:

- overpayment warning
- exchange-rate handling
- payment receipt PDF
- payment method totals by day
- OTA commission tracking

### 8. Cash Drawer

The owner can track daily cash.

Current behavior:

- create cash movement
- edit cash movement
- delete cash movement
- record opening balance
- record cash in
- record cash out
- record closing balance
- view daily cash totals

Cash-out categories:

- supplier
- staff
- maintenance
- food
- cleaning
- owner withdrawal
- other

Acceptance checks:

- cash in increases daily cash total
- cash out decreases daily cash total
- closing balance appears in dashboard cash position

Future improvements:

- daily closing workflow
- discrepancy warning
- cash report PDF
- category budgets
- recurring expenses

### 9. Invoices

The owner can create invoice drafts from bookings.

Current behavior:

- create invoice draft from booking
- edit invoice lines while draft
- generate invoice PDF
- finalize invoice
- final invoices receive final invoice number
- final invoices cannot be edited
- final invoices cannot be deleted
- PDF reflects draft or final status

Invoice draft includes:

- riad name
- legal name
- address
- phone
- ICE
- guest details
- room
- stay dates
- invoice lines
- tourist tax line when applicable
- VAT rate note
- total
- currency

Acceptance checks:

- draft invoice can be created from booking
- draft invoice can be edited
- PDF downloads
- final invoice gets final number
- final invoice edit/delete actions are blocked

Future improvements:

- accountant-approved invoice layout
- configurable invoice numbering prefix
- logo image embedded in PDF
- VAT line calculation rules
- tourist tax reports
- credit note/cancellation invoice

### 10. iCal Feeds

The owner can configure and import external calendar feeds.

Current behavior:

- create iCal feed
- edit iCal feed
- delete iCal feed
- activate or pause feed
- assign feed to room
- import active feeds
- import one feed
- store last import status
- store last import message
- store imported, updated, skipped, and error counts
- imports are read-only
- repeated imports update existing external events instead of duplicating them

Supported sources:

- Booking.com
- Airbnb
- HotelRunner
- Other

Acceptance checks:

- feed URL can be saved
- feed can be assigned to room
- active feed imports reservations
- repeated import does not duplicate same event
- failed feed shows error status

Future improvements:

- automatic scheduled imports
- conflict review screen
- manual import preview before save
- OTA cancellation handling review
- feed health notifications

### 11. CSV Exports

The owner can export operational records.

Current behavior:

- export bookings CSV
- export guests CSV
- export payments CSV
- export invoices CSV
- export cash movements CSV
- optional date filters for operational datasets
- filenames include dataset and date/range
- Settings page includes backup export buttons

Acceptance checks:

- each CSV downloads after login
- CSV has headers even when filtered result is empty
- invoice CSV includes final number and finalized date

Future improvements:

- export all data as ZIP
- scheduled backups
- Google Sheets export
- accountant-specific export format

### 12. Settings

The owner can configure app setup data.

Current behavior:

- edit property name
- edit legal name
- edit invoice address
- edit city and country
- edit phone
- edit ICE
- edit logo URL
- edit default currency
- edit tourist tax
- edit VAT rate
- manage rooms
- manage iCal feeds
- access backup exports

Acceptance checks:

- property changes save
- invoice PDF uses updated business details
- backup export buttons work

Future improvements:

- upload logo file
- invoice numbering settings
- default check-in/check-out times
- default payment currency
- owner profile settings
- app language settings

## Non-Functional Requirements

### Usability

- app should be simple enough for a non-technical owner
- forms should stay short
- important data should be editable
- destructive actions should be clear

### Security

- app requires owner login
- secrets must stay in `.env`
- production password must not use example values
- API routes require authentication

### Data Ownership

- owner should be able to export core data at any time
- database should remain under owner control
- backups are required before real production use

### Reliability

- booking conflicts must be blocked
- final invoices must be locked
- iCal imports must not duplicate events
- app should pass `npm run verify`
- app should pass `npm run test:mvp` with the app running

## Out of Scope For Current MVP

The following are not part of the current MVP:

- receptionist account
- multi-user permissions
- mobile app
- WhatsApp integration
- online payment collection
- full channel manager
- housekeeping module
- advanced accounting
- advanced analytics
- dynamic pricing
- Arabic interface
- multi-property support

## Future Roadmap

### Near-Term Improvements

1. Owner acceptance testing pass.
2. PostgreSQL migration prep.
3. Real deployment setup.
4. Real iCal feed testing.
5. Accountant review of invoice PDF.
6. Backup/export-all workflow.

### Medium-Term Improvements

1. Staff/receptionist mode.
2. Housekeeping status per room.
3. Payment receipts.
4. Better calendar navigation.
5. Guest document storage.
6. Scheduled iCal imports.

### Long-Term Improvements

1. Multi-property support.
2. Advanced analytics.
3. Dynamic pricing.
4. WhatsApp messaging.
5. Online payment collection.
6. Full channel manager integrations.

## Change Management Rule

When a feature is added, changed, removed, or deferred, update this BRD in the same pull request or commit.

For every new feature, add or update:

- current behavior
- acceptance checks
- future improvements if relevant

This document should remain the owner-readable source of truth for the product.
