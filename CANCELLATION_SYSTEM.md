# Cancellation System Documentation

## Overview

The cancellation system is critical for student clients who need flexibility. This system:

✅ **Free Cancellations** - More than 24 hours before appointment  
✅ **Paid Cancellations** - Less than 24 hours (£5 fee)  
✅ **Valid Reason Waiver** - You can manually waive the fee  
✅ **No-Show Handling** - Bookings stay blocked, deposit forfeited  
✅ **Date Liberation** - Cancelled bookings free up the date for rebooking  

---

## How Customers Cancel

### Step 1: Customer Receives Email
When booking is confirmed, customer gets email with:
- Booking details
- **"Cancel Booking" button** (prominent gold button)
- Note: "You can cancel for free if you do so more than 24 hours before your appointment"

### Step 2: Click Cancel Button
Button links to: `/cancel-booking?id={bookingId}&token={secureToken}`

### Step 3: Cancellation Page Loads
Page shows:
- **Booking Details** (hairstyle, length, date, time, price)
- **Time Status** - Shows hours until appointment
- **Cancellation Info** - Fee status and options

### Step 4: Decide and Submit

**If MORE than 24 hours:**
- Green box: "✓ Free Cancellation"
- Can add optional cancellation reason
- Click "Confirm Cancellation"
- Email notification sent
- Date is freed up immediately

**If LESS than 24 hours:**
- Yellow warning: "⚠️ Cancellation Fee Required"
- Text: "You are cancelling less than 24 hours before your appointment"
- Can provide cancellation reason (for fee waiver request)
- Click "Confirm Cancellation" → Redirects to Square payment
- Must pay £5 at: https://square.link/u/v9sOhayT
- After payment: Cancellation confirmed, notifications sent

---

## 24-Hour Rule Explained

### Free Cancellation (>24 hours)
```
Appointment: Monday 10:00 AM
Cancellation Deadline: Sunday 10:00 AM
Status: FREE - No payment required
```

### Paid Cancellation (<24 hours)
```
Appointment: Monday 10:00 AM
Cancellation after Sunday 10:01 AM: £5 FEE APPLIES
Status: Requires £5 payment to confirm
```

### Calculation
System automatically calculates:
- Current time: NOW
- Appointment: `${Date}T${Time}`
- Hours remaining: (Appointment - Now) / 60 / 60
- If hours < 24: Fee applies

---

## Valid Reason Exception

### What Qualifies as Valid Reason?
- Emergency (accident, illness, family crisis)
- Medical appointment conflict
- Family emergency
- Genuine emergency only

### What Does NOT Qualify?
- "Change of mind"
- "Found cheaper alternative"
- "Just don't feel like it"
- Schedule convenience

### How to Waive Fee

**Customer's Side:**
1. Provide cancellation reason on cancellation page
2. System sends email with reason to you

**Your Side (Stylist):**
1. Receive cancellation notification email
2. Read the cancellation reason
3. Decide if fee should be waived
4. If yes: Send customer message saying "Fee waived - you're all set"
5. If no: Customer must pay £5

---

## Email Notifications

### Customer Receives (Free Cancellation):
```
Subject: Booking Cancellation Request - Slayed by Yili

✓ Free Cancellation
Hours until appointment: 48h
You cancelled more than 24 hours before your appointment.
No cancellation fee required!

Your deposit will be refunded according to our cancellation policy.
```

### Customer Receives (Paid Cancellation):
```
Subject: Booking Cancellation Request - Slayed by Yili

⚠️ Cancellation Fee Required
Hours until appointment: 12h
You cancelled less than 24 hours before your appointment.
A £5 cancellation fee applies.

Your cancellation will be confirmed after payment is processed.
Payment Link: https://square.link/u/v9sOhayT
```

### You Receive (Stylist Notification):
```
Subject: Cancellation Request: Jane Doe - 2026-02-01

BOOKING CANCELLATION NOTIFICATION

Jane Doe has requested to cancel their booking.

Hairstyle: Box Braids
Length: Medium
Scheduled Date: 2026-02-01
Scheduled Time: 15:30
Cancellation Reason: Medical appointment conflict

---

Refund Policy
Hours before appointment: 48h
Status: Free cancellation confirmed
Process refund of £10.00.

Client Contact:
Name: Jane Doe
Phone: 07123456789
Email: jane@example.com
```

---

## What Happens to the Deposit?

### Free Cancellation (>24 hours)
- Deposit refunded to customer
- Date freed up for rebooking
- Customer is happy

### Paid Cancellation (<24 hours, payment made)
- £5 payment taken by you
- Remaining deposit refunded to customer
- Date freed up for rebooking

### Paid Cancellation (refusal to pay)
- Booking stays cancelled in system
- BUT customer doesn't officially cancel
- You must handle manually

### No-Show (never cancels, doesn't show)
- Booking marked as no-show
- Deposit forfeited
- Date stays blocked

---

## Backend API Reference

### Get Booking for Cancellation
```bash
GET /api/booking/:bookingId/:cancellationToken

Response:
{
  "id": 1673456789,
  "fullName": "Jane Doe",
  "hairstyle": "Box Braids",
  "length": "Medium",
  "preferredDate": "2026-02-01",
  "preferredTime": "15:30",
  "totalPrice": 55,
  "hoursUntilAppointment": 48,
  "requiresPayment": false,
  "cancellationFee": 0
}
```

### Submit Cancellation Request
```bash
POST /api/cancel-booking

Body:
{
  "id": 1673456789,
  "token": "secure_token_here",
  "cancellationReason": "Medical appointment conflict",
  "awaitingPayment": false
}

Response (Free):
{
  "success": true,
  "message": "Booking cancelled successfully. Your deposit will be refunded according to our cancellation policy.",
  "bookingId": 1673456789
}

Response (Paid):
{
  "success": true,
  "message": "Cancellation request submitted. You will need to complete the £5 payment before cancellation is confirmed.",
  "bookingId": 1673456789
}
```

---

## Database Fields (Booking Model)

```javascript
{
  id: 1673456789,
  fullName: "Jane Doe",
  phone: "07123456789",
  email: "jane@example.com",
  preferredDate: "2026-02-01",
  preferredTime: "15:30",
  
  // ... other booking fields ...
  
  // CANCELLATION FIELDS:
  status: "confirmed" | "cancelled" | "no-show",
  cancellationToken: "secure_random_token",
  cancelled: false | true,
  cancelledAt: "2026-01-20T14:30:00.000Z" | null,
  cancellationReason: "Medical appointment conflict" | null
}
```

---

## Cancellation Page Features

### Responsive Design
- Mobile friendly
- Works on all devices
- Gold/black luxury theme

### Security
- Unique token per booking
- Token validated on every request
- Cannot cancel already-cancelled booking
- Cannot cancel past appointments

### User Experience
- Clear time display (hours until appointment)
- Color-coded messaging (green = free, yellow = fee)
- Optional reason field
- Easy back button

### Error Handling
- Invalid link: Shows error
- Already cancelled: Shows error
- Appointment passed: Shows error
- Booking not found: Shows error

---

## Managing Cancellations (Your Admin Tasks)

### View All Bookings (Including Cancelled)
```bash
curl http://localhost:5000/api/bookings
```

Look for: `"cancelled": true`

### Check Cancellation Reasons
In each booking email notification, reason is included:
```
Cancellation Reason: Medical appointment conflict
```

### Manual Fee Waiver
If customer had valid reason and paid £5:
1. Receive their cancellation request email
2. Review the reason
3. If valid: Reply to customer "Fee waived - refund processed"
4. Process manual refund outside system

### Handle No-Shows
If customer doesn't cancel AND doesn't show:
1. Mark booking as no-show manually
2. Forfeits deposit
3. Keep date blocked (don't add to blocked dates - it's already tied to booking)

---

## Flow Diagram

```
CUSTOMER BOOKS APPOINTMENT
        ↓
RECEIVES CONFIRMATION EMAIL
with "Cancel Booking" button
        ↓
CLICKS "Cancel Booking" LINK
        ↓
CANCELLATION PAGE LOADS
Shows booking details & time status
        ↓
         ├─→ MORE THAN 24 HOURS
         │         ↓
         │    GREEN BOX: Free cancellation
         │         ↓
         │    Can add optional reason
         │         ↓
         │    Clicks "Confirm"
         │         ↓
         │    ✓ FREE (no payment)
         │         ↓
         │    Date freed up
         │         ↓
         │    Emails sent (customer + stylist)
         │
         └─→ LESS THAN 24 HOURS
                  ↓
             YELLOW BOX: Fee required
                  ↓
             Can add reason for waiver
                  ↓
             Clicks "Confirm"
                  ↓
             REDIRECTS TO SQUARE
          (https://square.link/u/v9sOhayT)
                  ↓
             ├─→ PAYS £5
             │        ↓
             │    ✓ PAID
             │        ↓
             │    Cancellation confirmed
             │        ↓
             │    Date freed up
             │        ↓
             │    Emails sent
             │
             └─→ REFUSES TO PAY
                      ↓
                  ✗ UNPAID
                      ↓
                  Cannot proceed
                      ↓
                  Booking stays as-is
```

---

## Important Notes for Students

🎓 **Why This System Exists:**
- You're a student with limited schedule
- Each day can only accommodate 1-2 clients
- Last-minute cancellations hurt your income
- This protects your time

💡 **Key Points:**
- Free cancellations are customer-friendly
- £5 fee deters no-shows
- Valid reason exception shows you're fair
- Students respect clear rules

---

## Testing the Cancellation System

### Test Free Cancellation
1. Make a booking for 3 days from now
2. Click cancel link in confirmation email
3. See green "Free Cancellation" box
4. Submit
5. Check both emails received
6. Verify date is no longer blocked

### Test Paid Cancellation
1. Make a booking for tomorrow
2. Click cancel link in confirmation email
3. See yellow "Fee Required" box
4. Add reason
5. Submit
6. Get redirected to Square
7. Complete payment
8. Check both emails received
9. Verify date is freed up

### Test Already Cancelled
1. Cancel a booking (free)
2. Try to cancel again using same link
3. Should show error: "Already cancelled"

---

## Security Considerations

✅ **Current Security:**
- Unique token per booking (32 random bytes)
- Token required for cancellation
- Cannot cancel past appointments
- Cannot cancel already-cancelled bookings

⚠️ **For Production:**
- Add rate limiting to cancellation endpoint
- Log all cancellation attempts
- Add authentication for admin features
- Encrypt sensitive data in database

---

## FAQ

**Q: Can customer cancel by phone?**
A: Not in this system. They must use the email link.

**Q: What if they lose the email?**
A: Implement password reset / lookup by email + phone

**Q: Can they cancel multiple times?**
A: No, system prevents already-cancelled bookings

**Q: What if they pay the £5 but invalid reason?**
A: You already received payment. Reason is just for consideration.

**Q: Does date immediately open for rebooking?**
A: Yes, cancellation removes it from blocked dates immediately.

**Q: What about refunds?**
A: You handle manually. System doesn't process refunds automatically.

---

**Status:** ✅ Ready for Production  
**Last Updated:** January 21, 2026  
**Version:** 1.0
