# Slayed by Yili - Configuration Guide

## Email Setup (IMPORTANT!)

Your booking system is now set up to send email notifications. To make it work, you need to:

### 1. Gmail App Password Setup

Since Gmail has restricted less secure app access, you need to create an **App Password**:

1. Go to your Google Account: https://myaccount.google.com/
2. Click **Security** in the left menu
3. Scroll down to **How you sign in to Google**
4. Enable **2-Step Verification** if you haven't already
5. Go back to Security and find **App passwords**
6. Select **Mail** and **Windows Computer** (or your device)
7. Google will generate a 16-character password
8. Copy this password

### 2. Update .env File

Open `.env` in your project root and update:

```
EMAIL_USER=pecusadoh@gmail.com
EMAIL_PASSWORD=paste_your_16_character_app_password_here
EMAIL_TO=pecusadoh@gmail.com
```

## Square Deposit Payment

The deposit link is already integrated:
- **Link**: https://square.link/u/0f0lHs5y
- When a customer clicks "Pay Deposit & Continue to Booking", it opens your Square payment link in a new window
- After payment, they return to complete the booking form
- The booking details (including the square payment) are stored in the system

## Website Contact Details

All updated with your information:
- **Email**: pecusadoh@gmail.com
- **Phone**: 07500 039928
- **Instagram**: @slayed_by_yili
- **WhatsApp**: Available via link

## Color Theme

✨ **Luxury Theme Applied**:
- **Main Background**: Deep Black (#0a0a0a)
- **Accent Color**: Gold (#d4af37)
- **Highlight Color**: Soft Pink (#f4a6c1)
- All buttons, headings, borders, and interactive elements now use gold accents
- Professional, high-end aesthetic throughout

## Stylist Profile Picture

To add your profile picture:
1. Save your professional photo as `yili-profile.jpg`
2. Place it in the `/public` folder
3. It will automatically display in the About section as a circular image with gold border

## Booking Flow

1. Customer selects service category
2. Customer selects specific hairstyle
3. Customer selects hair length (if applicable)
4. Customer sees pricing summary
5. Customer clicks "Pay Deposit & Continue to Booking"
6. Square payment opens in new window (£10 deposit)
7. After payment, booking form appears
8. Customer fills in: Full Name, Phone, Email, Date, Time, Notes
9. Form submitted → You receive email with all details

## Deposit Policy (Now Live)

✓ £10 non-refundable deposit required
✓ Deposit is deducted from final price
✓ No deposit = no appointment
✓ Late cancellations: Over 15 minutes late = £5 fee
✓ One client per day depending on style

## Testing

1. Run the server: `npm start`
2. Open http://localhost:5000
3. Select a service and go through the booking flow
4. Check your email for booking confirmations

**Note**: Make sure to have the .env file configured with your Gmail App Password before testing the email functionality.
