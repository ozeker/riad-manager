# MVP Scope — Riad Manager

## Vision

Riad Manager is a simple internal web app for a small Moroccan riad owner.

The app helps the owner manage:

- rooms
- reservations
- guests
- payments
- cash movements
- invoice draft PDFs
- iCal reservation imports
- data exports

The app is designed for a cash-heavy business where the owner needs to easily add, edit, and correct information.

## MVP Features

### 1. Single Owner Access

Only one owner user for now.

No receptionist account.

No staff permissions.

No multi-user workflow.

### 2. Room Setup

The owner can create and edit rooms.

Each room has:

- name
- capacity
- default rate in MAD
- default rate in EUR
- default rate in USD
- active/inactive status

### 3. Reservation Calendar

The main screen is a calendar.

Calendar structure:

- rooms as rows
- dates as columns
- bookings shown as blocks
- booking colour depends on source

Sources:

- Booking.com
- Airbnb
- HotelRunner
- Direct
- Walk-in
- Other

The owner can:

- click an empty cell to create a booking
- click a booking to edit it
- delete a booking using soft delete only

### 4. Bookings

Each booking has:

- guest
- room
- check-in date
- check-out date
- number of guests
- source
- agreed amount
- currency
- status
- notes

Booking statuses:

- confirmed
- checked in
- checked out
- cancelled
- no show

### 5. Guests

Each guest has:

- full name
- phone
- email
- nationality
- ID/passport number
- notes
- booking history

### 6. Payments

Each booking can have multiple payments.

Each payment has:

- amount
- currency: MAD, EUR, USD
- method: cash, card, bank transfer, OTA prepaid, other
- payment date
- notes

The app should show whether a booking is:

- unpaid
- partially paid
- paid

### 7. Cash Drawer

The owner can track daily cash.

Cash movements:

- opening balance
- cash in
- cash out
- closing balance

Cash-out categories:

- supplier
- staff
- maintenance
- food
- cleaning
- owner withdrawal
- other

### 8. Invoice Draft PDF

The owner can generate an invoice draft PDF from a booking.

The invoice draft includes:

- riad name
- logo
- address
- phone
- ICE number
- guest details
- room
- stay dates
- invoice lines
- tourist tax line
- VAT if applicable
- total
- currency: MAD, EUR, USD

The invoice starts as draft.

The owner can edit invoice lines before finalizing.

### 9. iCal Import

The owner can paste iCal URLs from:

- Booking.com
- Airbnb
- HotelRunner

The app imports reservations from these feeds.

The iCal import is read-only.

The app does not modify anything on Booking.com, Airbnb, or HotelRunner.

### 10. Export

The owner can export CSV files for:

- bookings
- guests
- payments
- invoices
- cash movements

## Explicitly Out of Scope

Not included in the MVP:

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
