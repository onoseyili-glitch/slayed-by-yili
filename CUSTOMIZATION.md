# Customization Guide - Slayed by Yili

Complete guide to customizing the website to match your brand and business needs.

---

## 1. Business Information

### Update Company Name & Branding

**File:** `views/index.html`

```html
<!-- Update in navbar -->
<div class="logo">Your Business Name</div>

<!-- Update in hero section -->
<h1>Your Business Name</h1>
<p class="tagline">Your tagline here</p>

<!-- Update in footer -->
<p>&copy; 2026 Your Business Name. All rights reserved.</p>
```

### Update Social Links

**File:** `views/index.html` - Contact Section

```html
<div class="social-links">
    <a href="https://instagram.com/your-handle" target="_blank">Instagram</a>
    <a href="https://wa.me/447700000000" target="_blank">WhatsApp</a>
</div>
```

WhatsApp link format: `https://wa.me/44XXXXXXXXXX`
- Replace with your country code and number

### Update Business Email

**File:** `.env`

```env
EMAIL_TO=yili@example.com
```

---

## 2. Colors & Design

### Primary Colors

**File:** `public/styles.css`

```css
:root {
    --primary: #1a1a1a;      /* Main dark color (navigation, text) */
    --secondary: #f5f5f5;    /* Light background */
    --accent: #d4a574;       /* Gold/highlight color (buttons, accents) */
    --text: #333;            /* Text color */
    --light: #f9f9f9;        /* Very light background */
    --border: #e0e0e0;       /* Border color */
}
```

### Quick Color Combinations

**Option 1: Classic Black & Gold**
```css
--primary: #1a1a1a;
--accent: #d4a574;
```

**Option 2: Deep Purple & Gold**
```css
--primary: #2d1b4e;
--accent: #d4a574;
```

**Option 3: Rich Brown & Cream**
```css
--primary: #3e2723;
--accent: #f5deb3;
```

**Option 4: Navy & Rose Gold**
```css
--primary: #001f3f;
--accent: #c97878;
```

### Font Changes

**File:** `public/styles.css`

```css
body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    /* Change to your preferred font */
}
```

Popular alternatives:
```css
font-family: 'Georgia', serif;              /* Elegant serif */
font-family: 'Playfair Display', serif;     /* Luxury serif */
font-family: 'Montserrat', sans-serif;      /* Modern sans-serif */
font-family: 'Poppins', sans-serif;         /* Contemporary */
```

---

## 3. Services & Pricing

### Add New Service Category

**File:** `public/app.js`

```javascript
const services = {
    newcategory: {
        name: 'Category Name',
        description: 'Category description',
        hairstyles: [
            { name: 'Style 1', pricing: { short: 30, medium: 40, long: 50, extra: 60 } },
            { name: 'Style 2', pricing: { short: 35, medium: 45, long: 55, extra: 65 } },
        ]
    }
};
```

### Update Pricing

**File:** `public/app.js`

Edit pricing in the `services` object:

```javascript
{ name: 'Knotless Braids', pricing: { 
    short: 40,      // Short hair price
    medium: 50,     // Medium hair price
    long: 60,       // Long hair price
    extra: 70       // Extra long hair price
}}
```

### Remove Service Category

Simply delete the entire service block from the `services` object in `public/app.js`.

---

## 4. Policies & Terms

### Update Booking Policies

**File:** `views/index.html` - Policies Section

```html
<div class="policy-card">
    <h3>Your Policy Title</h3>
    <p>Your policy description here</p>
</div>
```

### Add Late Fee or Cancellation Policy

Example additions:

```html
<div class="policy-card">
    <h3>Cancellation Policy</h3>
    <p>Cancellations must be made at least 48 hours in advance for a full refund of deposit.</p>
</div>

<div class="policy-card">
    <h3>Rescheduling</h3>
    <p>You can reschedule up to 2 times before the appointment date without losing your deposit.</p>
</div>
```

---

## 5. Text & Copy

### About Section

**File:** `views/index.html`

```html
<section id="about" class="about">
    <div class="container">
        <h2>About Yili</h2>
        <div class="about-content">
            <p>Update your story here...</p>
            <p>Add more paragraphs as needed...</p>
        </div>
    </div>
</section>
```

### Hero Tagline

**File:** `views/index.html`

```html
<p class="tagline">Your custom tagline - keep it short and compelling</p>
```

Good taglines:
- "Professional protective styling for all hair types"
- "Braids, twists, and natural hair done right"
- "Quality styles that protect your natural hair"

### Hero Button Text

**File:** `views/index.html`

```html
<button class="btn btn-primary" onclick="scrollToServices()">Your Button Text</button>
```

---

## 6. Deposit Amount

### Change £10 Deposit

**File 1:** `public/app.js`

Change the payment amount:
```javascript
amount: 1000  // 1000 pence = £10
// For £15: use 1500
// For £20: use 2000
```

**File 2:** `views/index.html`

Update all references to "£10":
- Search and replace "£10" with your amount
- Update: "Deposit (Non-refundable): £10.00"
- Update: "Pay £10.00" button text

**File 3:** `src/server.js`

```javascript
// Update payment amount display
const emailContent = `...
<p><strong>Deposit Paid:</strong> £${booking.depositPaid}.00</p>
...`
```

---

## 7. Hours & Availability

### Add Working Hours

**File:** `views/index.html` - Footer or Contact Section

```html
<div class="working-hours">
    <h3>Working Hours</h3>
    <p>Monday - Friday: 9am - 6pm</p>
    <p>Saturday: 10am - 5pm</p>
    <p>Sunday: Closed</p>
</div>
```

### Add CSS for Hours

**File:** `public/styles.css`

```css
.working-hours {
    background-color: var(--light);
    padding: 2rem;
    border-radius: 8px;
    text-align: center;
    margin: 2rem 0;
}

.working-hours p {
    margin: 0.5rem 0;
    color: #666;
}
```

---

## 8. Referral Program

### Update Referral Offer

**File:** `views/index.html` - Referral Section

```html
<section class="referral">
    <div class="container">
        <div class="referral-content">
            <h2>Refer a Friend</h2>
            <p>Know someone who needs professional protective styling? Refer them to [Your Name] and receive <strong>15% off your next hairstyle!</strong></p>
        </div>
    </div>
</section>
```

---

## 9. Contact Information

### Add Phone Number

**File:** `views/index.html` - Contact Section

```html
<div class="contact-info">
    <p>Call: <a href="tel:+447700000000">+44 7700 000000</a></p>
</div>
```

### Add Business Address

```html
<div class="contact-info">
    <p>Location: Your City, UK</p>
    <p><a href="https://maps.google.com/maps?q=Your+Address" target="_blank">View on Google Maps</a></p>
</div>
```

---

## 10. Email Templates

### Update Business Owner Email

**File:** `src/server.js`

Update the `sendConfirmationEmail` function to customize the email format:

```javascript
const emailContent = `
    <h2>New Booking!</h2>
    <p>Hi [Your Name],</p>
    <p>You have a new booking:</p>
    <!-- Update HTML template here -->
`;
```

### Update Customer Confirmation Email

**File:** `src/server.js`

Update the `sendCustomerConfirmationEmail` function:

```javascript
const emailContent = `
    <h2>Your Booking Confirmation</h2>
    <p>Hi ${booking.fullName},</p>
    <!-- Update HTML template here -->
`;
```

---

## 11. Favicon & Metadata

### Add Favicon

1. Create/get a favicon (`.ico` file)
2. Save to `public/favicon.ico`
3. **File:** `views/index.html`

```html
<head>
    <link rel="icon" type="image/x-icon" href="/favicon.ico">
</head>
```

### Update Meta Tags

**File:** `views/index.html`

```html
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Professional hair styling - braids, twists, sew-ins, and protective styles">
    <meta name="keywords" content="hair styling, braids, protective hairstyles, UK">
    <meta name="author" content="Your Name">
    <title>Your Business Name - Professional Hair Styling</title>
</head>
```

---

## 12. Advanced Customizations

### Add Gallery Section

**File:** `views/index.html` - Add after Services section

```html
<section id="gallery" class="gallery">
    <div class="container">
        <h2>Gallery</h2>
        <div class="gallery-grid">
            <img src="/images/style1.jpg" alt="Hairstyle 1">
            <img src="/images/style2.jpg" alt="Hairstyle 2">
            <!-- Add more images -->
        </div>
    </div>
</section>
```

### Add Testimonials

**File:** `views/index.html`

```html
<section id="testimonials" class="testimonials">
    <div class="container">
        <h2>Client Reviews</h2>
        <div class="testimonials-grid">
            <div class="testimonial">
                <p>"Great service and professional!"</p>
                <p><strong>- Client Name</strong></p>
            </div>
        </div>
    </div>
</section>
```

### Add FAQ Section

**File:** `views/index.html`

```html
<section id="faq" class="faq">
    <div class="container">
        <h2>Frequently Asked Questions</h2>
        <details>
            <summary>How long does a style take?</summary>
            <p>Style durations vary: 2-3 hours for braids, 4-6 hours for sew-ins.</p>
        </details>
    </div>
</section>
```

---

## 13. Database Integration

### Switch to MongoDB

Install MongoDB Atlas, then update `src/server.js`:

```javascript
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URL);

const bookingSchema = new mongoose.Schema({
    fullName: String,
    phone: String,
    // ... other fields
});

const Booking = mongoose.model('Booking', bookingSchema);
```

---

## 14. Common Changes Checklist

- [ ] Update business name everywhere
- [ ] Update email addresses
- [ ] Update social media links
- [ ] Update phone number
- [ ] Adjust color scheme
- [ ] Update pricing
- [ ] Add/remove services
- [ ] Update about section
- [ ] Update policies
- [ ] Add favicon
- [ ] Test all forms
- [ ] Test payment flow
- [ ] Test emails
- [ ] Mobile responsive test

---

## Need Help?

Refer to:
- `README.md` - Full documentation
- `QUICKSTART.md` - Quick setup
- `API.md` - API documentation
- Comments in code files

Good luck customizing! 🎨
