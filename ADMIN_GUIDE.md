# Admin Guide - Slayed by Yili Booking System

## Overview
This guide explains how to manage the Slayed by Yili booking system, including availability settings, blocked dates, and viewing bookings.

## Availability Configuration

### Current Schedule (Term Time)

The system is configured with the following fixed availability:

**Monday–Wednesday:**
- Available from **3:30 PM** onwards
- Max 1 client per day

**Thursday–Saturday:**
- Available from **6:00 AM** onwards  
- Max 2 clients per day

**Sunday:**
- Available from **3:30 PM** onwards (after church)
- Max 1 client

### School Holidays (Manual Updates)

For school holidays when you want to block all bookings:
- Use the blocked dates management API to add/remove date ranges
- Currently, you'll need to manually add each date

## Managing Blocked Dates

### Block a Date (Holiday, Maintenance, etc.)

**Using Terminal/API:**
```bash
curl -X POST http://localhost:5000/api/blocked-dates \
  -H "Content-Type: application/json" \
  -d '{"date": "2026-02-15"}'
```

**Response:**
```json
{
  "success": true,
  "message": "Date 2026-02-15 has been blocked",
  "blockedDates": ["2026-02-15"]
}
```

### Unblock a Date

**Using Terminal/API:**
```bash
curl -X DELETE http://localhost:5000/api/blocked-dates/2026-02-15
```

**Response:**
```json
{
  "success": true,
  "message": "Date 2026-02-15 has been unblocked",
  "blockedDates": []
}
```

### View All Blocked Dates

**Using Terminal/API:**
```bash
curl http://localhost:5000/api/blocked-dates
```

**Response:**
```json
["2026-02-15", "2026-02-16", "2026-04-05"]
```

## Viewing Bookings

### Get All Bookings

**Using Terminal/API:**
```bash
curl http://localhost:5000/api/bookings
```

**Response:**
```json
[
  {
    "id": 1673456789,
    "fullName": "Jane Doe",
    "phone": "07123456789",
    "email": "jane@example.com",
    "preferredDate": "2026-02-01",
    "preferredTime": "15:30",
    "notes": "First time",
    "hairstyle": "Box Braids",
    "length": "Medium",
    "price": 55,
    "addons": [
      {
        "name": "Beads / Accessories",
        "price": 3
      }
    ],
    "addonTotal": 3,
    "totalPrice": 58,
    "depositPaid": 10,
    "bookedAt": "2026-01-21T14:30:00.000Z"
  }
]
```

## Booking Flow Explained

Customers follow this flow:

1. **Service Selection** - Choose a category (Braids, Twists, Cornrows, etc.)
2. **Style Selection** - Pick a specific hairstyle
3. **Length Selection** - Choose hair length (Short, Medium, Long, Extra Long) or accept fixed pricing
4. **Price Review** - View base price and add optional extras (Beads, Parts, Curls, Extensions, Density)
5. **Payment** - Pay £10 non-refundable deposit via Square
6. **Time Selection** - Pick available appointment date and time slot
   - Times are auto-generated based on your availability rules
   - Blocked dates are automatically hidden
7. **Booking Form** - Enter contact details
8. **Confirmation** - Receive confirmation email

## Email Notifications

### Configuration
Email settings are in `.env` file:
```
EMAIL_USER=pecusadoh@gmail.com
EMAIL_PASSWORD=ljiygnijfciwaoca (Gmail App Password)
EMAIL_TO=pecusadoh@gmail.com
PORT=5000
```

### Who Gets Emails
- **Business Owner** - Receives full booking details to confirm appointment
- **Customer** - Receives confirmation with booking summary (if email provided)

### Email Contents
Emails include:
- Customer name and contact details
- Hairstyle and length selected
- All add-ons ordered
- Total price and deposit amount
- Preferred date and time
- Any additional notes

## Updating Availability

### To Change Regular Hours

Edit `/public/app.js` and find `availabilityConfig`:

```javascript
const availabilityConfig = {
    termTime: {
        Monday: { startTime: '15:30', endTime: '23:59', maxClients: 1 },
        Tuesday: { startTime: '15:30', endTime: '23:59', maxClients: 1 },
        // ... etc
    }
};
```

Edit the times and restart the server:
```bash
npm start
```

### To Create Holiday Availability

For school holidays, you have two options:

**Option 1: Block specific dates**
```bash
# Block dates during school holiday
curl -X POST http://localhost:5000/api/blocked-dates \
  -H "Content-Type: application/json" \
  -d '{"date": "2026-04-05"}'
```

**Option 2: Add separate availability config** (future feature)
Edit `/public/app.js` and add a new availability config object for holidays. This requires manual code update.

## Viewing Metrics

### Bookings by Service
No dashboard currently - but you can view bookings and filter manually

### Revenue Tracking
Total revenue = sum of all `totalPrice` fields in bookings

## Troubleshooting

### Issue: Time slots not showing
1. Check if date is blocked: `curl http://localhost:5000/api/blocked-dates`
2. Verify availability config in `/public/app.js`
3. Restart server: `npm start`

### Issue: Emails not sending
1. Check `.env` file has correct Gmail App Password
2. Verify Gmail account has 2-Factor Authentication enabled
3. Check email logs in terminal for error messages

### Issue: Bookings not submitting
1. Open browser console (F12) and check for errors
2. Verify server is running: `npm start`
3. Check server console output for error messages

## API Endpoints Reference

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/` | Serve main page |
| POST | `/submit-booking` | Submit a booking |
| GET | `/api/bookings` | Get all bookings |
| GET | `/api/blocked-dates` | Get blocked dates |
| POST | `/api/blocked-dates` | Block a date |
| DELETE | `/api/blocked-dates/:date` | Unblock a date |

## Security Notes

⚠️ **Important for Production:**
- The `/api/bookings` endpoint has no authentication - protect this with authentication middleware
- Consider storing bookings in a real database instead of memory
- Blocked dates are lost when server restarts - use a database

## Contact Information

- **Business Email:** pecusadoh@gmail.com
- **Phone:** 07500 039928
- **Instagram:** @slayed_by_yili
