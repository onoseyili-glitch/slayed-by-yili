# Reschedule Feature - User Guide

## What's New

Customers can now reschedule their bookings instead of just cancelling. They go back to select a new date and time, and their old slot is automatically freed up.

---

## Customer Experience

### Step 1: View Cancellation Page
Customer receives confirmation email with **Cancel Booking** button and clicks it.

### Step 2: Three Options on Cancellation Page
```
┌─────────────────────────────┐
│  CANCEL YOUR BOOKING        │
├─────────────────────────────┤
│                             │
│  [Back]  [Reschedule] [Cancel]
│                             │
└─────────────────────────────┘
```

- **Back** - Return without making changes
- **Reschedule** - Pick a new date/time (old slot freed immediately)
- **Cancel** - Cancel entirely (with 24-hour rule)

### Step 3: Reschedule Flow
Customer clicks **Reschedule** button and:
1. Sees their current booking details
2. Gets redirected to time slot selection
3. Picks a new date and time
4. Sees booking updated immediately
5. Receives confirmation email with new details

---

## How It Works

### Booking Object Updates
When rescheduling, the booking gains:
```javascript
{
  "rescheduled": true,
  "rescheduledFrom": "2026-01-15 14:30",
  "rescheduledAt": "2026-01-21T14:22:00.000Z",
  "preferredDate": "2026-02-01",      // NEW DATE
  "preferredTime": "15:30"             // NEW TIME
}
```

### Date Liberation Logic
```
OLD SLOT: 2026-01-15 (blocked → freed up)
NEW SLOT: 2026-02-01 (freed up → blocked)
```

- Old date is removed from `blockedDates` (available for rebooking)
- New date is added to `blockedDates` (unavailable)

### Email Notifications

**To Customer:**
```
Subject: Booking Rescheduled Successfully

Hi Jane,

Your appointment has been rescheduled!

Original Booking:
  Date: 2026-01-15
  Time: 14:30

New Booking:
  Date: 2026-02-01
  Time: 15:30
  Hairstyle: Box Braids
  Price: £66.00

Your deposit is still valid and will be applied to the new appointment.
```

**To You (Stylist):**
```
Subject: Booking Rescheduled: Jane Doe - New Date: 2026-02-01

Jane Doe has rescheduled their booking.

Old: 2026-01-15 14:30
New: 2026-02-01 15:30
```

---

## API Endpoints

### POST /api/reschedule-booking
Reschedule an existing booking

**Request:**
```bash
curl -X POST http://localhost:5000/api/reschedule-booking \
  -H "Content-Type: application/json" \
  -d '{
    "id": "booking123",
    "token": "secure_token_here",
    "newDate": "2026-02-01",
    "newTime": "15:30"
  }'
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Booking rescheduled successfully",
  "bookingId": "booking123",
  "newDate": "2026-02-01",
  "newTime": "15:30"
}
```

**Response (Error):**
```json
{
  "error": "Selected date is no longer available"
}
```

### GET /api/available-slots
Get list of available time slots for rescheduling

**Request:**
```bash
curl http://localhost:5000/api/available-slots
```

**Response:**
```json
[
  {
    "date": "2026-01-22",
    "time": "15:30",
    "dayName": "Wednesday"
  },
  {
    "date": "2026-01-22",
    "time": "16:00",
    "dayName": "Wednesday"
  },
  {
    "date": "2026-01-23",
    "time": "06:00",
    "dayName": "Thursday"
  }
]
```

---

## Key Features

✅ **No New Payment Required**
- Rescheduling is free
- Existing deposit carries over
- Same price applies

✅ **Automatic Date Liberation**
- Old slot immediately becomes available
- New slot is blocked
- No manual intervention needed

✅ **Secure Token Validation**
- Customers can only reschedule their own bookings
- Token matches booking ID

✅ **Email Notifications**
- Customer gets new booking confirmation
- You get rescheduled notification
- Includes old and new details

✅ **30-90 Day Availability**
- Shows slots up to 90 days in advance
- Excludes blocked dates
- Excludes already-booked slots
- 30-minute intervals

---

## Comparison: Cancel vs. Reschedule

### Cancellation Path
```
Customer clicks Cancel → 24-hour rule applies
                      → £5 fee if < 24h
                      → Deposit refunded
                      → Slot freed permanently
```

### Reschedule Path
```
Customer clicks Reschedule → No 24-hour limit
                           → No fees
                           → Deposit carries over
                           → Old slot freed
                           → New slot blocked
```

---

## Testing Reschedule

1. **Create a booking** for any future date
2. **Receive confirmation email** with cancel link
3. **Click cancel link**
4. **Choose "Reschedule" button** (gold button)
5. **Select new date/time**
6. **See success message** with new date/time
7. **Check email** - should have reschedule confirmation
8. **Verify** - old date should now be available for rebooking

---

## Troubleshooting

### Issue: "Selected date is no longer available"
**Reason:** Someone just booked that slot
**Solution:** Show customer different available slot

### Issue: Customer doesn't receive reschedule email
**Check:**
- Email address correct in booking
- Check spam/promotions folder
- Verify `.env` EMAIL_PASSWORD is correct

### Issue: Old slot not freed up after reschedule
**Check:**
- Reload page to refresh
- Check `blockedDates` array in backend
- Verify no other bookings on old date

### Issue: Customer can't see reschedule button
**Check:**
- Make sure they have valid cancel link (from email)
- Browser JavaScript enabled
- Token matches booking

---

## Session Storage Flow

When reschedule is initiated, booking data is stored temporarily:
```javascript
sessionStorage.setItem('rescheduleBookingId', bookingId);
sessionStorage.setItem('rescheduleToken', token);
sessionStorage.setItem('rescheduleHairstyle', hairstyle);
sessionStorage.setItem('rescheduleLength', length);
sessionStorage.setItem('reschedulePrice', price);
sessionStorage.setItem('rescheduleAddons', JSON.stringify(addons));
sessionStorage.setItem('rescheduleOldDate', oldDate);
```

This data is:
- Used to display current booking info
- Sent with the reschedule request
- Cleared after reschedule completes
- NOT stored in database until confirmed

---

## Refund/Payment Logic

### Rescheduled Booking Refund

If customer reschedules and later cancels:
- **Free cancellation** (>24h from NEW appointment) → Full refund
- **Paid cancellation** (<24h from NEW appointment) → £5 fee
- Fee waiver still applies if valid reason given

Example:
```
Original: Jan 15 → Rescheduled to Feb 1
Feb 1 is new appointment time for 24-hour calculation
If customer cancels on Jan 31 → FREE (>24h before Feb 1)
If customer cancels on Feb 1 morning → PAID (£5 fee)
```

---

## Important Notes for You (Stylist)

1. **No extra admin work** - System handles date blocking automatically
2. **Same customer** - Rescheduled bookings keep customer info
3. **Same price** - Price doesn't change on reschedule
4. **Check your email** - You get notified of each reschedule
5. **No fees to you** - Rescheduling costs customer nothing

---

## Summary

**Reschedule Button:** Appears on cancellation page  
**Cost:** FREE for customers  
**Notifications:** Both customer & stylist emailed  
**Date Liberation:** Automatic  
**Deposit:** Carries over to new appointment  
**Time Limit:** No 24-hour restriction  
**Available Slots:** Next 90 days, 30-min intervals  

This feature gives customers flexibility while protecting your time and ensuring smooth scheduling. 🎉

