# Booking Flow Test Checklist

## Quick Test Summary

✅ **All 7 Services Configured**
✅ **Complete Booking Flow Implemented**
✅ **Time Slot System Active**  
✅ **Deposit Payment Integration**
✅ **Email Notifications Active**
✅ **Add-ons System Working**

---

## Testing Steps

### 1. Service Selection Test
- [ ] Load http://localhost:5000
- [ ] See all 7 service cards:
  - [ ] Braids
  - [ ] Twists
  - [ ] Loc Styles (Pre-made / Install Only)
  - [ ] Cornrows
  - [ ] Natural Hair
  - [ ] Sew-In
  - [ ] Kids Styles (Under 12)

### 2. Hairstyle Selection Modal
- [ ] Click "Braids" → Modal shows 7 hairstyles
  - [ ] Knotless
  - [ ] Box
  - [ ] Fulani
  - [ ] Feed-in
  - [ ] Jumbo
  - [ ] Boho
  - [ ] Invisible

### 3. Length Selection (Variable Pricing)
- [ ] Click "Knotless" → Length modal shows:
  - [ ] Short — £45
  - [ ] Medium — £55
  - [ ] Long — £65
  - [ ] Extra Long — £75

### 4. Fixed Pricing Services
- [ ] Click "Natural Hair" → No length selection needed
- [ ] Click "Wash & Go" → Price modal shows "Standard" with £15 price
- [ ] Click "Sew-In" → Direct to pricing modal with £35 fixed price

### 5. Price Summary Modal
- [ ] Shows selected hairstyle, length, and price
- [ ] Add-ons section visible with 5 options:
  - [ ] Beads / Accessories — £3
  - [ ] Curved / Heart Parts — £5
  - [ ] Boho Curls — £8
  - [ ] Coloured Extensions — £8
  - [ ] Extra Density — £10
- [ ] Real-time price update when add-ons selected
- [ ] Deposit info displayed (£10 non-refundable)

### 6. Payment
- [ ] Click "Pay Deposit & Continue to Booking"
- [ ] Square payment link opens in new tab
- [ ] After payment, booking modal appears

### 7. Time Slot Selection
- [ ] Modal shows date picker
- [ ] Selecting a date generates time slots
- [ ] Monday-Wednesday shows slots from 15:30
- [ ] Thursday-Saturday shows slots from 06:00
- [ ] Sunday shows slots from 15:30
- [ ] Clicking time slot pre-fills booking form

### 8. Booking Form
- [ ] Form pre-filled with selected date and time
- [ ] Can enter:
  - [ ] Full Name (required)
  - [ ] Phone Number (required)
  - [ ] Email Address (optional)
  - [ ] Additional Notes (optional)

### 9. Confirmation
- [ ] Booking submitted successfully
- [ ] Confirmation modal appears
- [ ] "Booking Confirmed!" message displays
- [ ] Mention of confirmation email sent

### 10. Email Verification
- [ ] Check pecusadoh@gmail.com for:
  - [ ] Confirmation email from booking
  - [ ] Contains customer details
  - [ ] Shows hairstyle, length, price
  - [ ] Lists add-ons (if any)
  - [ ] Shows deposit amount (£10)
  - [ ] Shows date/time selected
  - [ ] Requests confirmation from stylist

---

## Service-Specific Test Cases

### Braids (Variable Pricing)
- [ ] Select "Braids" → See 7 styles
- [ ] Select any style → Get length options (4 lengths)
- [ ] Prices: Short £45, Medium £55, Long £65, Extra Long £75
- [ ] Can add any add-ons
- [ ] **Total with add-ons:** e.g., £55 (Braids) + £8 (Curls) = £63

### Twists (Variable Pricing)  
- [ ] Select "Twists" → See 6 styles
- [ ] Select any style → Get length options (4 lengths)
- [ ] Prices: Short £40, Medium £50, Long £60, Extra Long £70

### Loc Styles (Variable Pricing)
- [ ] Select "Loc Styles" → See 5 styles
- [ ] Select any style → Get length options (4 lengths)
- [ ] Prices: Short £35, Medium £45, Long £55, Extra Long £65

### Cornrows (Limited Lengths)
- [ ] Select "Cornrows" → See 3 styles
- [ ] Select any style → Get only 3 length options (no Extra Long)
- [ ] Prices: Short £25, Medium £30, Long £35

### Natural Hair (Fixed Pricing)
- [ ] Select "Natural Hair" → See 3 styles
- [ ] "Wash & Go" → £15 (no length selection)
- [ ] "Finger Coils" → £20 (no length selection)
- [ ] "Two-Strand Twists" → £30 (no length selection)

### Sew-In (Fixed Pricing)
- [ ] Select "Sew-In" → See 1 option
- [ ] "Sew-In" → £35 (no length selection)

### Kids Styles (Variable Pricing)
- [ ] Select "Kids Styles" → See 4 styles
- [ ] Each style has 3 length options (no Extra Long)
- [ ] Prices: Short £20, Medium £25, Long £30

---

## Availability Testing

### Term-Time Hours Verification
- [ ] Monday 15:30 - slots available
- [ ] Monday 15:00 - no slots (before hours)
- [ ] Tuesday 15:30 - slots available
- [ ] Wednesday 15:30 - slots available
- [ ] Thursday 06:00 - slots available
- [ ] Friday 06:00 - slots available
- [ ] Saturday 06:00 - slots available
- [ ] Sunday 15:30 - slots available
- [ ] Sunday 14:00 - no slots (before hours)

### Blocked Dates Test
```bash
# Block a date
curl -X POST http://localhost:5000/api/blocked-dates \
  -H "Content-Type: application/json" \
  -d '{"date": "2026-02-01"}'
```
- [ ] Blocked date shows error in time slot modal
- [ ] Cannot select blocked date
- [ ] Other dates still work normally

---

## Add-ons Testing

- [ ] Adding 1 add-on increases price correctly
- [ ] Adding multiple add-ons shows total breakdown
- [ ] Add-ons appear in confirmation email
- [ ] Removing all add-ons still allows booking
- [ ] Prices are exact (no rounding errors)

---

## Error Handling

- [ ] Invalid date selection → Error message
- [ ] Missing required fields → Form validation
- [ ] Server down → Error alert
- [ ] Blocked date selection → Cannot proceed

---

## Final Verification

- [ ] Server runs without errors: `npm start`
- [ ] No console errors (F12 Developer Tools)
- [ ] All pages load quickly
- [ ] Mobile responsive (test on mobile browser)
- [ ] Colors correct (black #0a0a0a, gold #d4af37, pink #f4a6c1)
- [ ] Buttons functional and clickable
- [ ] Modals close/open smoothly

---

## Booking Details in Database

After successful booking, check `/api/bookings`:
```bash
curl http://localhost:5000/api/bookings
```

Should contain:
- Booking ID
- Customer name, phone, email
- Hairstyle and length
- Price breakdown
- Add-ons list
- Date and time
- Deposit paid status
- Timestamp

---

## Notes

- Time slots are pre-filled from availability config
- Maximum of 2 clients Thursday-Saturday, 1 client other days
- Deposit is always £10 for all services (except add-ons only)
- Email confirmation sent to both business owner and customer
- Service continues until 23:59 end time
