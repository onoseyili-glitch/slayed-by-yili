# API Documentation - Slayed by Yili

## Base URL
```
http://localhost:5000
```

## Endpoints

### Public Endpoints

#### 1. GET Config
Returns Stripe public key for frontend initialization.

```http
GET /config
```

**Response:**
```json
{
    "publicKey": "pk_test_..."
}
```

---

#### 2. POST Create Payment Intent
Creates a Stripe payment intent for the £10 deposit.

```http
POST /create-payment-intent
```

**Request Body:**
```json
{
    "amount": 1000,
    "hairstyle": "Knotless Braids",
    "length": "Medium"
}
```

**Response (Success):**
```json
{
    "clientSecret": "pi_..._secret_...",
    "paymentIntentId": "pi_..."
}
```

**Response (Error):**
```json
{
    "error": "Invalid amount"
}
```

---

#### 3. POST Submit Booking
Submits the booking form after successful payment. Triggers email notifications.

```http
POST /submit-booking
```

**Request Body:**
```json
{
    "fullName": "John Doe",
    "phone": "+447700000000",
    "email": "john@example.com",
    "preferredDate": "2025-02-15",
    "preferredTime": "10:00",
    "notes": "I have sensitive scalp",
    "hairstyle": "Knotless Braids",
    "length": "Medium",
    "price": 50,
    "paymentIntentId": "pi_..."
}
```

**Response (Success):**
```json
{
    "success": true,
    "bookingId": 1705763400000,
    "message": "Booking confirmed successfully"
}
```

**Response (Error):**
```json
{
    "error": "Missing required fields"
}
```

---

### Admin Endpoints

#### 4. GET All Bookings
Retrieves all bookings made through the system. **⚠️ Protect this endpoint in production!**

```http
GET /api/bookings
```

**Response:**
```json
[
    {
        "id": 1705763400000,
        "fullName": "John Doe",
        "phone": "+447700000000",
        "email": "john@example.com",
        "preferredDate": "2025-02-15",
        "preferredTime": "10:00",
        "notes": "I have sensitive scalp",
        "hairstyle": "Knotless Braids",
        "length": "Medium",
        "price": 50,
        "depositPaid": 10,
        "paymentIntentId": "pi_...",
        "bookedAt": "2025-01-20T15:30:00.000Z"
    }
]
```

---

## Error Codes

| Code | Message | Solution |
|------|---------|----------|
| 400 | Invalid amount | Ensure amount is at least 1000 (£10) |
| 400 | Missing required fields | Check all required fields are provided |
| 500 | Internal server error | Check server logs |
| 500 | Email sending error | Verify Gmail configuration |

---

## Request Headers

All requests should include:
```
Content-Type: application/json
```

---

## Example Integration (JavaScript/Fetch)

### Creating a Payment Intent
```javascript
const response = await fetch('/create-payment-intent', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        amount: 1000,
        hairstyle: "Knotless Braids",
        length: "Medium"
    })
});

const data = await response.json();
console.log(data.clientSecret);
```

### Submitting a Booking
```javascript
const response = await fetch('/submit-booking', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        fullName: "Jane Smith",
        phone: "+447700000000",
        email: "jane@example.com",
        preferredDate: "2025-02-20",
        preferredTime: "14:00",
        notes: "",
        hairstyle: "Box Braids",
        length: "Long",
        price: 65,
        paymentIntentId: "pi_..."
    })
});

const result = await response.json();
if (result.success) {
    console.log("Booking confirmed!");
}
```

---

## Booking Object Structure

```javascript
{
    id: number,                    // Unique booking ID (timestamp)
    fullName: string,              // Client's full name
    phone: string,                 // Contact phone number
    email: string,                 // Contact email (optional)
    preferredDate: string,         // YYYY-MM-DD format
    preferredTime: string,         // HH:mm format (24-hour)
    notes: string,                 // Additional notes
    hairstyle: string,             // Selected hairstyle
    length: string,                // Short | Medium | Long | Extra Long
    price: number,                 // Total price in GBP
    depositPaid: number,           // Always 10 (£10)
    paymentIntentId: string,       // Stripe payment intent ID
    bookedAt: string               // ISO 8601 timestamp
}
```

---

## Rate Limiting

Currently not implemented. For production:
- Implement rate limiting (1 request per second per IP)
- Use packages like `express-rate-limit`

---

## Security Considerations

⚠️ **For Production:**
1. Protect `/api/bookings` endpoint with authentication
2. Validate all input on backend
3. Use HTTPS (not HTTP)
4. Set proper CORS headers
5. Add CSRF protection
6. Implement request logging
7. Use database instead of in-memory storage
8. Add input sanitization
9. Implement API key authentication for admin endpoints
10. Enable Stripe webhook verification

---

## Webhook Integration (Recommended)

For robust payment handling, implement Stripe webhooks:

```javascript
app.post('/webhook', express.raw({type: 'application/json'}), async (req, res) => {
    const event = req.body;
    
    switch(event.type) {
        case 'payment_intent.succeeded':
            // Handle successful payment
            break;
        case 'payment_intent.payment_failed':
            // Handle failed payment
            break;
    }
    
    res.json({received: true});
});
```

---

## Environment Variables Required

```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLIC_KEY=pk_test_...
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_TO=business@example.com
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5000
```

---

## Testing Checklist

- [ ] Can create payment intent
- [ ] Payment processes with test card
- [ ] Booking form accepts submission
- [ ] Confirmation email sent to business
- [ ] Confirmation email sent to customer
- [ ] Booking stored in system
- [ ] All required fields validated
- [ ] Error handling works correctly

---

## Support

For issues, check server logs:
```bash
node src/server.js
```

Look for:
- Payment processing errors
- Email sending errors
- Booking validation errors
