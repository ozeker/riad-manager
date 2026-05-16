# Beta Owner Testing Guide

## Purpose

This guide is for the riad owner testing the first beta version of Riad Manager.

The goal is to confirm whether the app is useful for daily riad operations before
it becomes part of the real workflow.

## What To Test First

Use the beta with simple test data first.

Do not rely on it as the official record until the owner confirms the workflows
below are working correctly.

## Access

1. Open the beta link.
2. Enter the owner password.
3. Confirm the dashboard opens.
4. Use logout and confirm the app returns to the login screen.

Expected result:

- the owner can log in
- unauthenticated users cannot see the app
- logout works

## Property Settings

Go to Settings and check:

1. Riad name.
2. Legal name.
3. Address.
4. Phone number.
5. ICE number.
6. Tourist tax.
7. VAT rate.

Expected result:

- property details can be updated
- saved details remain after refreshing the page

## Rooms

Go to Settings and review the rooms.

Test:

1. Add a room.
2. Edit a room name.
3. Change capacity.
4. Change MAD, EUR, and USD rates.
5. Mark a room inactive if needed.

Expected result:

- rooms save correctly
- inactive rooms are clearly marked

## Guests

Go to Guests.

Test:

1. Create a guest.
2. Add phone, email, nationality, ID/passport number, and notes.
3. Edit the guest.
4. Refresh the page.

Expected result:

- guest data is still there after refresh
- guest details are easy to correct

## Bookings

Go to Calendar or Bookings.

Test:

1. Create a manual booking.
2. Select guest, room, check-in, check-out, source, amount, currency, and notes.
3. Edit the booking.
4. Try to create a booking that overlaps the same room and dates.
5. Cancel or delete a test booking.

Expected result:

- valid bookings save correctly
- same-room date conflicts are blocked
- edited bookings remain after refresh

## Payments

Go to Payments or open a booking with payments.

Test:

1. Add a cash payment.
2. Add a card, bank transfer, OTA prepaid, or other payment if relevant.
3. Confirm booking payment status updates.
4. Edit or delete a test payment.

Expected result:

- unpaid, partially paid, and paid states make sense
- payment totals match the booking amount

## Cash Drawer

Go to Cash Drawer.

Test:

1. Add opening balance.
2. Add cash in.
3. Add cash out with a category.
4. Confirm totals make sense.

Expected result:

- daily cash tracking is clear
- cash-out categories are useful

## Invoices

Go to Invoices.

Test:

1. Create an invoice draft from a booking.
2. Edit invoice lines before finalizing.
3. Download the PDF.
4. Finalize a test invoice.

Expected result:

- draft PDF downloads correctly
- finalized invoices receive a final number
- finalized invoices cannot be edited like drafts

## iCal Feeds

Go to Settings and find iCal feed setup.

Test when real links are available:

1. Add Booking.com iCal URL.
2. Assign it to the correct room.
3. Add Airbnb iCal URL.
4. Assign it to the correct room.
5. Add HotelRunner iCal URL if available.
6. Run import.
7. Run import again.

Expected result:

- imported bookings appear on the calendar
- repeated imports do not create duplicates
- import status is understandable

## CSV Exports

Go to Settings and test CSV exports.

Export:

- bookings
- guests
- payments
- invoices
- cash movements

Expected result:

- each file downloads
- the data opens correctly in Excel or Google Sheets

## Feedback To Send

For each issue, send:

1. Page name.
2. What you clicked.
3. What you expected.
4. What happened instead.
5. Screenshot if possible.

## Beta Decision

After testing, choose one:

- accepted for daily beta use
- accepted after small fixes
- not ready yet

