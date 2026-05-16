# Owner Acceptance Testing Checklist

## Purpose

Use this document to test whether Riad Manager is ready for a real owner beta.

Run this checklist once yourself before sharing the app with the riad owner.

Then run it again with the owner using real riad data.

## How To Record Results

For each test, mark:

- `Pass` if it works as expected
- `Fail` if it breaks
- `Needs change` if it technically works but feels wrong or confusing

Use the Notes column for bugs, missing fields, wording problems, or owner feedback.

## Test Environment

Tester:

Date:

App URL:

Device:

Browser:

Test data used:

## Pre-Test Setup

| ID | Test | Expected Result | Result | Notes |
|---|---|---|---|---|
| SETUP-01 | Run `npm.cmd run verify` | Lint and build pass |  |  |
| SETUP-02 | Run `npm.cmd run dev` | App starts on `http://localhost:3000` |  |  |
| SETUP-03 | Open app URL | Login page appears |  |  |
| SETUP-04 | Confirm `.env` has private `OWNER_PASSWORD` | Password is not an example value |  |  |

## 1. Login And Access

| ID | Test | Expected Result | Result | Notes |
|---|---|---|---|---|
| AUTH-01 | Open `/` while logged out | App redirects to `/login` |  |  |
| AUTH-02 | Enter wrong password | Login is rejected |  |  |
| AUTH-03 | Enter correct owner password | Dashboard opens |  |  |
| AUTH-04 | Click owner menu then sign out | App returns to `/login` |  |  |
| AUTH-05 | Try opening `/settings` after logout | App redirects to `/login` |  |  |

## 2. Property Settings

| ID | Test | Expected Result | Result | Notes |
|---|---|---|---|---|
| PROP-01 | Open Settings | Property, rooms, iCal feeds, and backup exports are visible |  |  |
| PROP-02 | Edit property name | New name saves and displays |  |  |
| PROP-03 | Edit legal name, address, phone, ICE | Details save and display |  |  |
| PROP-04 | Edit tourist tax and VAT | Values save and display |  |  |
| PROP-05 | Leave required field empty and save | App shows validation error |  |  |

## 3. Room Setup

| ID | Test | Expected Result | Result | Notes |
|---|---|---|---|---|
| ROOM-01 | Create a new room | Room appears in Settings |  |  |
| ROOM-02 | Edit room capacity | Updated capacity displays |  |  |
| ROOM-03 | Edit MAD/EUR/USD rates | Updated rates display |  |  |
| ROOM-04 | Deactivate room | Room shows inactive status |  |  |
| ROOM-05 | Open Calendar | Only active rooms appear |  |  |
| ROOM-06 | Reactivate room | Room returns to active status |  |  |

## 4. Calendar

| ID | Test | Expected Result | Result | Notes |
|---|---|---|---|---|
| CAL-01 | Open Calendar page | Room rows and date columns display |  |  |
| CAL-02 | Click empty calendar cell | Create booking modal opens |  |  |
| CAL-03 | Save booking from calendar | Booking block appears on calendar |  |  |
| CAL-04 | Click existing booking block | Edit booking modal opens |  |  |
| CAL-05 | Change booking dates | Booking block moves or resizes correctly |  |  |
| CAL-06 | Check source colors | Booking colors match source legend |  |  |

## 5. Bookings

| ID | Test | Expected Result | Result | Notes |
|---|---|---|---|---|
| BOOK-01 | Open Bookings page | Booking table loads |  |  |
| BOOK-02 | Create direct booking with new guest | Booking saves and appears |  |  |
| BOOK-03 | Create booking with existing guest | Booking saves under selected guest |  |  |
| BOOK-04 | Try overlapping booking in same room/date | App blocks the booking |  |  |
| BOOK-05 | Create overlapping booking in different room | Booking is allowed |  |  |
| BOOK-06 | Set status to cancelled | Booking status updates |  |  |
| BOOK-07 | Archive booking | Booking disappears from normal list |  |  |
| BOOK-08 | Enter guest count above room capacity | App blocks save |  |  |

## 6. Guests

| ID | Test | Expected Result | Result | Notes |
|---|---|---|---|---|
| GUEST-01 | Open Guests page | Guest table loads |  |  |
| GUEST-02 | Create guest | Guest saves and appears |  |  |
| GUEST-03 | Edit phone/email/nationality/passport | Updated details save |  |  |
| GUEST-04 | Open guest booking history | Related bookings display |  |  |
| GUEST-05 | Save guest without full name | App shows validation error |  |  |

## 7. Payments

| ID | Test | Expected Result | Result | Notes |
|---|---|---|---|---|
| PAY-01 | Open Payments page | Payment table loads |  |  |
| PAY-02 | Add cash payment to booking | Payment saves and appears |  |  |
| PAY-03 | Add partial payment | Booking payment status becomes partial |  |  |
| PAY-04 | Add full payment | Booking payment status becomes paid |  |  |
| PAY-05 | Delete payment | Payment is removed and totals update |  |  |
| PAY-06 | Save payment with zero amount | App shows validation error |  |  |

## 8. Cash Drawer

| ID | Test | Expected Result | Result | Notes |
|---|---|---|---|---|
| CASH-01 | Open Cash Drawer page | Cash table and date controls load |  |  |
| CASH-02 | Add opening balance | Balance appears |  |  |
| CASH-03 | Add cash in | Cash total increases |  |  |
| CASH-04 | Add cash out | Cash total decreases |  |  |
| CASH-05 | Add closing balance | Dashboard cash position updates |  |  |
| CASH-06 | Delete cash movement | Movement disappears and totals update |  |  |

## 9. Invoices

| ID | Test | Expected Result | Result | Notes |
|---|---|---|---|---|
| INV-01 | Open Invoices page | Invoice table loads |  |  |
| INV-02 | Create invoice draft from booking | Draft saves and appears |  |  |
| INV-03 | Edit invoice line | Line and total update |  |  |
| INV-04 | Download invoice PDF | PDF downloads and opens |  |  |
| INV-05 | Confirm PDF business details | Name, address, phone, ICE are correct |  |  |
| INV-06 | Finalize invoice | Final invoice number is created |  |  |
| INV-07 | Try editing final invoice | App blocks edit |  |  |
| INV-08 | Try deleting final invoice | App blocks delete |  |  |

## 10. iCal Feeds

| ID | Test | Expected Result | Result | Notes |
|---|---|---|---|---|
| ICAL-01 | Add iCal feed URL | Feed saves |  |  |
| ICAL-02 | Assign feed to room | Room displays in feed table |  |  |
| ICAL-03 | Import one feed | Import status updates |  |  |
| ICAL-04 | Import all active feeds | Counts update for each feed |  |  |
| ICAL-05 | Import same feed again | Existing events update, no duplicates |  |  |
| ICAL-06 | Use invalid URL | Feed save or import shows error |  |  |

## 11. CSV Exports

| ID | Test | Expected Result | Result | Notes |
|---|---|---|---|---|
| CSV-01 | Export bookings | CSV downloads with booking headers |  |  |
| CSV-02 | Export guests | CSV downloads with guest headers |  |  |
| CSV-03 | Export payments | CSV downloads with payment headers |  |  |
| CSV-04 | Export invoices | CSV includes final number and finalized date |  |  |
| CSV-05 | Export cash movements | CSV downloads with cash headers |  |  |
| CSV-06 | Use date-filtered export URL | CSV filename includes selected range |  |  |

## 12. Dashboard Review

| ID | Test | Expected Result | Result | Notes |
|---|---|---|---|---|
| DASH-01 | Open Dashboard | Stats load without errors |  |  |
| DASH-02 | Add booking for today | Occupancy changes |  |  |
| DASH-03 | Add payment | Open balance changes |  |  |
| DASH-04 | Add closing cash balance | Cash position changes |  |  |
| DASH-05 | Create invoice draft | Draft count changes |  |  |

## 13. Mobile / Small Screen Review

| ID | Test | Expected Result | Result | Notes |
|---|---|---|---|---|
| MOB-01 | Open app on phone-width screen | Layout is usable |  |  |
| MOB-02 | Open mobile navigation | Sidebar links are accessible |  |  |
| MOB-03 | Create booking on small screen | Modal is usable and scrolls |  |  |
| MOB-04 | Review calendar on small screen | Horizontal scroll works |  |  |

## 14. Owner Feedback Questions

Ask the owner:

1. What felt confusing?
2. What field was missing?
3. What wording should change?
4. Does the invoice PDF look acceptable?
5. Does the calendar match how you think about rooms and dates?
6. Are the cash categories correct?
7. Are the export files useful?
8. Would this replace any current paper or Excel workflow?
9. What would stop you from using this daily?
10. What is the single most important improvement?

## Final Acceptance Decision

Mark one:

- [ ] Accepted for beta use
- [ ] Accepted after listed fixes
- [ ] Not accepted yet

Required fixes before beta:

1.
2.
3.

Nice-to-have fixes:

1.
2.
3.

Tester signature / initials:

Date:
