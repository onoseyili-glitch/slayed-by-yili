# Cancellation System - Visual Quick Guide

## The 24-Hour Rule (Simple Version)

```
APPOINTMENT: Monday 10:00 AM
   ↓
CANCEL BEFORE: Sunday 10:00 AM
   └─→ ✓ FREE (no payment)
   
CANCEL AFTER: Sunday 10:01 AM
   └─→ ✗ £5 FEE REQUIRED
```

---

## What Customer Sees

### Email with Booking Confirmation
```
┌─────────────────────────────────────────┐
│                                         │
│  ✓ BOOKING CONFIRMED                   │
│                                         │
│  Hairstyle: Box Braids                  │
│  Date: 2026-02-01                       │
│  Time: 15:30                            │
│  Price: £66.00                          │
│  Deposit: £10.00                        │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  CANCEL BOOKING                 │   │
│  │  (Click to cancel anytime)      │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Free cancellation if done 24+ hours   │
│  before your appointment.              │
│                                         │
└─────────────────────────────────────────┘
```

### Cancellation Page (Free Scenario)
```
CANCEL YOUR BOOKING

Booking Details:
┌────────────────────────────┐
│ Hairstyle: Box Braids      │
│ Length: Medium             │
│ Date: 2026-02-01           │
│ Time: 15:30                │
│ Total: £66.00              │
└────────────────────────────┘

✓ FREE CANCELLATION
Hours until appointment: 48h
No cancellation fee required!

Optional: [Reason text box]

[ Cancel ] [ Back ]
```

### Cancellation Page (Paid Scenario)
```
CANCEL YOUR BOOKING

Booking Details:
┌────────────────────────────┐
│ Hairstyle: Box Braids      │
│ Length: Medium             │
│ Date: 2026-02-01           │
│ Time: 15:30                │
│ Total: £66.00              │
└────────────────────────────┘

⚠️ CANCELLATION FEE REQUIRED
Hours until appointment: 12h
A £5 fee applies. Valid reasons may waive fee.

Optional: [Reason for waiver]

[ Cancel ] [ Back ]
→ Clicking cancel sends to Square payment
```

---

## What YOU Receive

### Notification Email
```
TO: pecusadoh@gmail.com
FROM: Slayed by Yili System
SUBJECT: Cancellation Request: Jane Doe - 2026-02-01

┌─────────────────────────────────────────┐
│                                         │
│  BOOKING CANCELLATION NOTIFICATION      │
│                                         │
│  Jane Doe has requested to cancel      │
│                                         │
│  Hairstyle: Box Braids                  │
│  Length: Medium                         │
│  Date: 2026-02-01                       │
│  Time: 15:30                            │
│  Reason: Medical appointment            │
│                                         │
│  REFUND POLICY                          │
│  Hours before: 48h                      │
│  Status: Free cancellation confirmed    │
│  Action: Process refund of £10.00       │
│                                         │
│  CLIENT CONTACT:                        │
│  Name: Jane Doe                         │
│  Phone: 07123456789                     │
│  Email: jane@example.com                │
│                                         │
└─────────────────────────────────────────┘
```

---

## Decision Tree for Fee Waivers

```
CUSTOMER CANCELS < 24 HOURS
            ↓
   REASON PROVIDED?
      ↙       ↘
   YES         NO
    ↓           ↓
REVIEW       AUTO DENIED
REASON       MUST PAY £5
    ↓
IS IT VALID?
(Emergency, illness, medical conflict, etc)
   ↙      ↘
YES        NO
 ↓          ↓
WAIVE    CUSTOMER
 £5       PAYS £5
 FEE      FEE
```

---

## Timeline Example

```
WEDNESDAY 10:00 AM - Booking Confirmed
                     Customer gets email with cancel link
                     
FRIDAY 10:00 AM - 48 hours before
                  ✓ FREE CANCELLATION AVAILABLE
                  Customer can click cancel
                  No payment needed
                  Date freed up
                  
SATURDAY 10:00 AM - 24 hours before
                    ✗ PAID CANCELLATION REQUIRED
                    Customer must pay £5
                    Reason field available
                    You decide on waiver
                    
SUNDAY 10:00 AM - Appointment day!
                  ✗ Cannot cancel anymore
                  No-show forfeits deposit
```

---

## Email Notification Flowchart

```
CANCELLATION SUBMITTED
         ↓
    IS VALID TOKEN?
      ↙      ↘
    YES       NO
     ↓        ERROR: Show error message
CHECK IF CANCELLED
     ↓
  ALREADY CANCELLED?
    ↙      ↘
   YES      NO
    ↓       Continue...
  ERROR:   FREE CANCELLATION?
  Already    ↙        ↘
 cancelled  YES        NO
            ↓          ↓
        ✓ SEND      NEEDS
        FREE EMAIL   £5 PAYMENT
        ↓          ↓
        EMAIL:    REDIRECT
        Customer  TO
        Stylist   SQUARE
        ↓         ↓
        DATE      AWAIT
        FREED     PAYMENT
        ↓         ↓
        DONE      ✓ SEND
               PAID EMAIL
               ↓
               DATE
               FREED
               ↓
               DONE
```

---

## Quick Commands (Copy & Paste)

### View All Bookings
```bash
curl http://localhost:5000/api/bookings | jq '.' > bookings.txt
```

### Find Cancelled Bookings
```bash
curl http://localhost:5000/api/bookings | jq '.[] | select(.cancelled == true)'
```

### Block Multiple Dates (School Holiday)
```bash
# Block April 5-7, 2026
curl -X POST http://localhost:5000/api/blocked-dates -H "Content-Type: application/json" -d '{"date": "2026-04-05"}'
curl -X POST http://localhost:5000/api/blocked-dates -H "Content-Type: application/json" -d '{"date": "2026-04-06"}'
curl -X POST http://localhost:5000/api/blocked-dates -H "Content-Type: application/json" -d '{"date": "2026-04-07"}'
```

### Unblock Dates After Holiday
```bash
curl -X DELETE http://localhost:5000/api/blocked-dates/2026-04-05
curl -X DELETE http://localhost:5000/api/blocked-dates/2026-04-06
curl -X DELETE http://localhost:5000/api/blocked-dates/2026-04-07
```

---

## Booking Status Indicators

In the booking object, look for:

```javascript
{
  "status": "confirmed",      // Initial status
  "cancelled": false,         // Not yet cancelled
  "cancelledAt": null         // No cancellation time
}
```

After cancellation:
```javascript
{
  "status": "cancelled",              // Changed to cancelled
  "cancelled": true,                  // Flag set to true
  "cancelledAt": "2026-01-21T14:00Z", // Timestamp
  "cancellationReason": "Emergency"   // Reason provided
}
```

---

## What Happens to Money

### Free Cancellation (>24 hours)
```
Customer pays £10 deposit
         ↓
Customer cancels (free)
         ↓
£10 refunded to customer
         ↓
You receive: £0 (they get it back)
```

### Paid Cancellation (<24 hours)
```
Customer pays £10 deposit
         ↓
Customer cancels (requires £5)
         ↓
Customer pays £5 to you
         ↓
£10 refunded to customer
         ↓
You receive: £5 (cancellation fee)
```

### No-Show (Didn't Cancel, Didn't Attend)
```
Customer pays £10 deposit
         ↓
No cancellation submitted
No attendance
         ↓
£10 forfeited
         ↓
You receive: £10 (deposit kept)
Date blocked in system
```

---

## Testing Checklist

- [ ] Create test booking for 3 days from now
- [ ] Receive confirmation email with cancel link
- [ ] Click cancel link
- [ ] See green "Free Cancellation" box
- [ ] Add optional reason
- [ ] Click confirm
- [ ] Get cancellation confirmation email
- [ ] Check booking shows `"cancelled": true`
- [ ] Verify date is freed up (can be rebooked)

- [ ] Create second test booking for tomorrow
- [ ] Click cancel link
- [ ] See yellow "Fee Required" box
- [ ] Add reason for fee waiver
- [ ] Click confirm
- [ ] Get redirected to Square
- [ ] (Don't actually pay for test)
- [ ] Go back and verify booking shows pending

---

## Common Issues

### Issue: Cancel link doesn't work
**Check:**
- Token in URL matches booking record
- Booking hasn't already been cancelled
- Appointment time hasn't passed

### Issue: Customer didn't receive email
**Check:**
- Email address correct in booking
- Check spam/promotions folder
- Verify `.env` EMAIL_PASSWORD is correct

### Issue: Can't decide on fee waiver
**Remember:**
- Check if reason is genuine emergency
- Be fair but protective of your time
- £5 is reasonable late cancellation fee
- Document your waiver decisions

### Issue: Date not freed after cancellation
**Check:**
- Reload page to refresh availability
- Date should be removed from `blockedDates`
- Try booking that date again
- Should work immediately

---

## Deposit vs Final Payment

```
DEPOSIT (£10):
- Paid upfront via Square
- Non-refundable normally
- Deducted from final price
- Paid: Before booking confirmed

FINAL PAYMENT:
- Remaining balance
- Paid in person or on appointment day
- You collect this
- Amount: Total - £10 deposit
```

Example:
```
Hairstyle: Box Braids = £55 base
Add-ons: Beads (£3) = Total £58

Deposit paid upfront: £10
Final payment (day of): £48

Customer cancels (free):
Gets £10 refund
```

---

**Quick Reference Version:** 1.0  
**Updated:** January 21, 2026  
**For:** Student Hairstylist (Slayed by Yili)

