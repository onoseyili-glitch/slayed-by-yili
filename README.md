# Slayed by Yili - Professional Hair Stylist Booking Website

A professional, modern, and fully-functional hair stylist booking website with integrated payment processing, interactive service selection, and automated email confirmations.

## Features

✨ **Interactive Booking Flow**
- Service category selection (Braids, Twists, Locs, Cornrows, Natural Hair, Sew-ins, Kids Styles)
- Hairstyle selection within each category
- Hair length selection (Short, Medium, Long, Extra Long)
- Dynamic pricing based on selections
- Secure deposit payment via Stripe

💳 **Payment Processing**
- £10 non-refundable deposit required
- Deposit deducted from final price
- Secure Stripe integration
- Card payment processing

📧 **Email Notifications**
- Automated email to business owner with booking details
- Optional customer confirmation email
- Includes all booking information and payment confirmation

🎨 **Professional Design**
- Clean, minimal, modern layout
- Elegant neutral color scheme (black, nude, soft tones)
- Fully responsive mobile design
- Salon-quality feel

📱 **Responsive & Mobile-Friendly**
- Works perfectly on desktop, tablet, and mobile
- Touch-optimized buttons and forms
- Fast loading times

## Project Structure

```
slayed-by-yili/
├── public/
│   ├── app.js              # Frontend JavaScript (Stripe, booking flow)
│   └── styles.css          # Responsive CSS styling
├── src/
│   └── server.js           # Express backend (payments, emails, bookings)
├── views/
│   └── index.html          # Main HTML file
├── package.json            # Node.js dependencies
├── .env.example            # Environment variables template
└── README.md               # This file
```

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Stripe account (https://stripe.com)
- Gmail account (for email notifications)

### Step 1: Install Dependencies

```bash
npm install
```

This will install:
- express (web framework)
- stripe (payment processing)
- nodemailer (email notifications)
- dotenv (environment variables)
- cors (cross-origin support)

### Step 2: Configure Environment Variables

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Update `.env` with your configuration:

```env
# Stripe API Keys (get from https://dashboard.stripe.com)
STRIPE_SECRET_KEY=sk_test_your_secret_key
STRIPE_PUBLIC_KEY=pk_test_your_public_key

# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_TO=yili@example.com

# Server
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5000
```

#### Getting Stripe Keys:
1. Go to https://dashboard.stripe.com
2. Click "Developers" → "API Keys"
3. Copy your Test Secret Key and Test Publishable Key

#### Setting Up Gmail for Email Notifications:
1. Go to https://myaccount.google.com
2. Enable 2-Step Verification
3. Go to App Passwords (https://myaccount.google.com/apppasswords)
4. Generate an app password for "Mail" on "Windows (or your device)"
5. Use this password in `.env` as `EMAIL_PASSWORD`

### Step 3: Start the Server

```bash
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

The website will be available at: **http://localhost:5000**

## Usage

### For Users (Booking)

1. **Select Service Category** - Click on one of the service categories (Braids, Twists, Locs, etc.)
2. **Choose Hairstyle** - Select the specific hairstyle you want
3. **Pick Hair Length** - Choose from Short, Medium, Long, or Extra Long
4. **Review Pricing** - See the total price (deposit will be deducted later)
5. **Pay Deposit** - Enter card details and pay the £10 non-refundable deposit
6. **Complete Booking Form** - Enter name, phone, email, preferred date/time
7. **Confirmation** - Receive booking confirmation and email notification

### For Business Owner (Yili)

- Check your email for booking notifications
- Review booking details including:
  - Client name and phone number
  - Hairstyle and length selection
  - Preferred date and time
  - Deposit payment confirmation
  - Any additional notes

## Pricing Structure

Pricing varies by hairstyle and hair length:

**Braids:**
- Knotless Braids: £40-70 (depending on length)
- Box Braids: £45-75
- Jumbo Braids: £35-65
- Micro Braids: £60-90
- Feed-In Braids: £50-80

**Twists:**
- Two-Strand Twists: £40-70
- Flat Twists: £45-75
- Senegalese Twists: £50-80
- Marley Twists: £35-65
- Butterfly Locs: £55-85

**Loc Styles:**
- Faux Locs: £50-80
- Goddess Locs: £55-85
- Boho Locs: £45-75
- Maintenance Locs: £40-70

**Cornrows:**
- Basic Cornrows: £30-60
- Cornrow Pattern Design: £40-70
- Edges Cornrow: £35-65
- Feed-In Cornrows: £45-75

**Natural Hair:**
- Bantu Knots: £35-65
- Coils: £40-70
- Twist Out Styling: £30-60
- Wash & Set: £35-65

**Sew-Ins:**
- Full Sew-In Weave: £60-120
- Closure Sew-In: £70-130
- Partial Sew-In: £50-110
- Maintenance/Redo: £40-100

**Kids Styles:**
- Kids Braids: £25-55
- Kids Twists: £25-55
- Kids Cornrows: £20-50
- Kids Puffs & Buns: £15-45

## Booking Policies

- ✓ £10 non-refundable deposit required to secure all appointments
- ✓ Deposit is deducted from the final price
- ✓ Appointments over 15 minutes late may be cancelled or charged a £5 late fee
- ✓ Only one client booked per day depending on the style
- ✓ No deposit = no appointment secured

## Customization

### Update Business Contact
Edit `views/index.html`:
```html
<a href="https://instagram.com/your-account" target="_blank">Instagram</a>
<a href="https://wa.me/447700000000" target="_blank">WhatsApp</a>
```

### Modify Pricing
Edit `public/app.js` in the `services` object to adjust prices for each hairstyle and length combination.

### Change Colors
Edit `public/styles.css` to modify the CSS custom properties:
```css
:root {
    --primary: #1a1a1a;      /* Main dark color */
    --accent: #d4a574;       /* Gold/nude accent */
    --text: #333;            /* Text color */
}
```

### Add More Hairstyles
Edit `public/app.js` in the `services` object to add new hairstyles within categories.

## Payment Testing

Use Stripe's test card numbers:

- **Success**: 4242 4242 4242 4242
- **Decline**: 4000 0000 0000 0002
- **Requires Authentication**: 4000 0025 0000 3155

Expiry: Any future date
CVC: Any 3 digits

## Deployment

### Heroku Deployment

1. Create a Heroku account at https://www.heroku.com
2. Install Heroku CLI
3. Create a new app:
   ```bash
   heroku create your-app-name
   ```
4. Set environment variables:
   ```bash
   heroku config:set STRIPE_SECRET_KEY=sk_test_...
   heroku config:set STRIPE_PUBLIC_KEY=pk_test_...
   heroku config:set EMAIL_USER=your-email@gmail.com
   heroku config:set EMAIL_PASSWORD=your-app-password
   heroku config:set EMAIL_TO=yili@example.com
   ```
5. Deploy:
   ```bash
   git push heroku main
   ```

### Other Hosting Options
- DigitalOcean
- AWS
- Netlify + Serverless Functions
- Vercel

## Database Integration

Currently, bookings are stored in memory (will be lost when server restarts). For production, integrate:

- **MongoDB** - Document database
- **PostgreSQL** - Relational database
- **Firebase** - Serverless database

## Future Enhancements

- [ ] Admin dashboard to manage bookings
- [ ] Calendar/availability management
- [ ] Client history and repeat booking discounts
- [ ] SMS notifications (Twilio)
- [ ] Installment payment plans
- [ ] Gallery/portfolio of work
- [ ] Client reviews and testimonials
- [ ] Automated SMS reminders
- [ ] Integration with calendar apps (Google Calendar, Outlook)

## Troubleshooting

### Email not sending
- Verify Gmail app password is correct
- Check that 2-Step Verification is enabled
- Ensure EMAIL_USER and EMAIL_TO are correct

### Payment failing
- Verify Stripe keys are correct
- Check that Stripe is in test mode
- Use test card numbers provided

### Port already in use
```bash
# Change port in .env or use a different port:
PORT=3000 npm start
```

## Support

For issues or questions about the website setup, contact the developer or refer to:
- Stripe Documentation: https://stripe.com/docs
- Express Documentation: https://expressjs.com
- Nodemailer Documentation: https://nodemailer.com

## License

MIT License - Feel free to use and modify as needed.

---

**Slayed by Yili** - Professional Hair Styling for Everyone

For more information or bookings, visit the website!
