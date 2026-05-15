# PRD — Riad Manager

## Product Name

Riad Manager

## Target User

The first target user is the owner of a small riad in Fes, Morocco.

He manages reservations, rooms, guests, payments, invoices, and cash.

The business is cash-heavy and receives guests from Morocco, Europe, and the US.

## Problem

Small riad owners often manage operations across multiple tools:

- Booking.com
- Airbnb
- HotelRunner
- WhatsApp
- paper notes
- Excel
- manual invoices
- cash records

This creates operational friction:

- hard to see real availability
- hard to track cash
- hard to know who paid what
- hard to generate clean invoices
- hard to keep guest history
- hard to export clean data

## Solution

A simple internal web app that centralizes daily riad operations.

The app should be:

- fast
- simple
- editable
- cash-friendly
- focused on one owner
- easy to use without training
- designed for Moroccan riad reality

## Design Principles

1. Calendar first.
2. Cash is a first-class feature.
3. Everything important should be editable.
4. Keep forms short.
5. Support MAD, EUR, and USD.
6. Draft before finalizing invoices.
7. The owner controls and exports all data.
8. Avoid complexity until the user asks for it.

## Core Pages

1. Dashboard
2. Calendar
3. Bookings
4. Guests
5. Payments
6. Cash Drawer
7. Invoices
8. Settings

## MVP Success Criteria

The MVP is successful if the owner can:

1. Set up his rooms.
2. See bookings on a calendar.
3. Add and edit manual bookings.
4. Import reservations from iCal feeds.
5. Record guest payments.
6. Track cash in and cash out.
7. Generate invoice draft PDFs.
8. Export his data.

## First Technical Milestone

The first implementation milestone is a UI prototype only.

It should include:

- app layout
- sidebar navigation
- dashboard
- calendar page
- mock rooms
- mock bookings
- booking create/edit modal

It should not include yet:

- real database
- auth
- PDF generation
- iCal sync
- deployment
