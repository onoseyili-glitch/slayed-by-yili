# Quick Reference - Commands & Features

## ⏱️ Availability Hours (Quick Reference)

| Day | Start | End | Max Clients |
|-----|-------|-----|-------------|
| Monday | 15:30 | 23:59 | 1 |
| Tuesday | 15:30 | 23:59 | 1 |
| Wednesday | 15:30 | 23:59 | 1 |
| Thursday | 06:00 | 23:59 | 2 |
| Friday | 06:00 | 23:59 | 2 |
| Saturday | 06:00 | 23:59 | 2 |
| Sunday | 15:30 | 23:59 | 1 |

## 📱 Services & Pricing at a Glance

```
BRAIDS                  TWISTS                  LOC STYLES
├─ Knotless: £45-75     ├─ Passion: £40-70      ├─ Butterfly: £35-65
├─ Box: £45-75          ├─ Spring: £40-70       ├─ Soft: £35-65
├─ Fulani: £45-75       ├─ Mini: £40-70         ├─ Faux: £35-65
├─ Feed-in: £45-75      ├─ Rope: £40-70         ├─ Goddess: £35-65
├─ Jumbo: £45-75        ├─ Two-Strand: £40-70   └─ Sister Locs: £35-65
├─ Boho: £45-75         └─ Patching: £40-70
└─ Invisible: £45-75

CORNROWS               NATURAL HAIR            SEW-IN
├─ Straight-back: £25-35   ├─ Wash & Go: £15      └─ Standard: £35
├─ Fulani: £25-35          ├─ Finger Coils: £20
└─ Curved: £25-35          └─ Two-Strand: £30

KIDS STYLES
├─ Braids: £20-30
├─ Beaded Braids: £20-30
├─ Natural Styles: £20-30
└─ Cornrows: £20-30
```

## 💰 Add-ons (Optional Extras)

| Add-on | Price |
|--------|-------|
| Beads / Accessories | £3 |
| Curved / Heart Parts | £5 |
| Boho Curls | £8 |
| Coloured Extensions | £8 |
| Extra Density | £10 |

**Example:** Box Braids (Medium) £55 + Beads £3 + Curls £8 = **£66 Total**

## 🔌 Terminal Commands

**Start Server**
```bash
npm start
```

**View Blocked Dates**
```bash
curl http://localhost:5000/api/blocked-dates
```

**Block a Date** (School holiday example)
```bash
curl -X POST http://localhost:5000/api/blocked-dates \
  -H "Content-Type: application/json" \
  -d '{"date": "2026-04-05"}'
```

**Unblock a Date**
```bash
curl -X DELETE http://localhost:5000/api/blocked-dates/2026-04-05
```

**Get All Bookings**
```bash
curl http://localhost:5000/api/bookings
```

**Kill Running Server**
```bash
taskkill /F /IM node.exe
```

## 📍 URL Reference

| URL | Purpose |
|-----|---------|
| http://localhost:5000 | Main website |
| http://localhost:5000/api/bookings | View all bookings |
| http://localhost:5000/api/blocked-dates | View blocked dates |

## ✉️ Email Configuration

**File:** `.env`

```
EMAIL_USER=pecusadoh@gmail.com
EMAIL_PASSWORD=ljiygnijfciwaoca
EMAIL_TO=pecusadoh@gmail.com
PORT=5000
```

**Emails sent to:**
- Stylist: pecusadoh@gmail.com (booking details)
- Customer: Their email (if provided)

## 🧪 Quick Test Flow

1. Open http://localhost:5000
2. Click "Braids"
3. Click "Box"
4. Click "Medium — £55"
5. Check "Beads" (adds £3)
6. Click "Pay Deposit & Continue"
7. Pay $1.00 via Square (test card)
8. Select date (e.g., tomorrow)
9. Click available time
10. Fill name, phone
11. Submit
12. Check pecusadoh@gmail.com for email

## 🔄 Booking Flow in 5 Steps

```
1️⃣ SELECT
   Service → Hairstyle → Length

2️⃣ PRICE
   View total with add-ons

3️⃣ PAY
   £10 deposit via Square

4️⃣ TIME
   Pick date & available slot

5️⃣ BOOK
   Enter contact details → Confirm
```

## 🚀 Deploy Checklist

- [ ] Install dependencies: `npm install`
- [ ] Set `.env` variables
- [ ] Start server: `npm start`
- [ ] Open http://localhost:5000
- [ ] Complete test booking
- [ ] Check email confirmation
- [ ] Block/unblock test date via API
- [ ] View bookings: `/api/bookings`
- [ ] Test on mobile (responsive)
- [ ] Ready for production!

## 📞 Emergency Restart

If something breaks:

```bash
# Kill all Node processes
taskkill /F /IM node.exe

# Restart
npm start
```

## 🆘 Troubleshooting

| Problem | Solution |
|---------|----------|
| Page won't load | `npm start` - server not running |
| Time slots not showing | Check `.env`, verify availability config |
| Email not sending | Check Gmail 2FA enabled, app password correct |
| Deposit button does nothing | Check Square link in code |
| Booking won't submit | Check console (F12) for errors |

## 📋 Blocked Dates Format

**YYYY-MM-DD format only**

✅ Correct:
```
2026-04-05
2026-12-25
```

❌ Incorrect:
```
April 5, 2026
05/04/2026
2026-4-5
```

## 🎨 Design Colors

- **Black:** `#0a0a0a` (Primary)
- **Gold:** `#d4af37` (Accent)
- **Pink:** `#f4a6c1` (Secondary)
- **White:** `#ffffff` (Background)

## 📊 JSON Response Examples

**Booking Object:**
```json
{
  "fullName": "Jane Doe",
  "phone": "07123456789",
  "email": "jane@example.com",
  "preferredDate": "2026-02-01",
  "preferredTime": "15:30",
  "hairstyle": "Box Braids",
  "length": "Medium",
  "price": 55,
  "addons": [{"name": "Beads", "price": 3}],
  "totalPrice": 58,
  "depositPaid": 10
}
```

**Blocked Dates Array:**
```json
["2026-04-05", "2026-04-06", "2026-04-07"]
```

---

**Quick Help:** Check **ADMIN_GUIDE.md** for detailed API docs  
**Testing Help:** Check **BOOKING_TEST_CHECKLIST.md** for full test procedure  
**System Info:** Check **BOOKING_SYSTEM_README.md** for complete documentation
