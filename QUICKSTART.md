# Quick Start Guide - Slayed by Yili Website

## 🚀 Get Running in 5 Minutes

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Configure Email (.env file)
Create `.env` file with:
```
EMAIL_USER=pecusadoh@gmail.com
EMAIL_PASSWORD=your_gmail_app_password_here
EMAIL_TO=pecusadoh@gmail.com
PORT=5000
```

**📧 Email Setup Instructions:**
Follow the Gmail App Password guide in SETUP_GUIDE.md

### Step 3: Add Your Photo (Optional)
- Save professional headshot as `yili-profile.jpg`
- Place in `/public` folder
- Automatically displays in About section

### Step 4: Start the Server
```bash
npm start
```

Visit: **http://localhost:5000**

---

## 🎨 What's Been Updated

✅ **Luxury Design Theme** - Black, Gold & Pink  
✅ **Square Deposit** - https://square.link/u/0f0lHs5y  
✅ **Email Notifications** - Auto-send booking confirmations  
✅ **Updated Services** - 8 categories with new pricing  
✅ **Contact Info** - Your details everywhere  
✅ **Professional Styling** - High-end appearance  

---

## 📝 Important Configuration

### Stripe Setup
1. Go to https://dashboard.stripe.com
2. Click "Developers" → "API Keys"
3. Copy your **Test Secret Key** and **Test Publishable Key**
4. Paste in `.env`

### Gmail Setup
1. Go to https://myaccount.google.com
2. Enable "2-Step Verification"
3. Go to https://myaccount.google.com/apppasswords
4. Generate app password for "Mail"
5. Use this in `.env` as `EMAIL_PASSWORD`

---

## ✅ Testing the Website

### Test Booking Flow:
1. Click **"Book Appointment"**
2. Select a service category (e.g., Braids)
3. Choose a hairstyle
4. Pick a length
5. Review pricing
6. Pay with test card: **4242 4242 4242 4242**
7. Complete booking form
8. Check your email for confirmation

### Test Cards:
- **Success**: 4242 4242 4242 4242
- **Decline**: 4000 0000 0000 0002
- **Auth Required**: 4000 0025 0000 3155

---

## 🎨 Customization Tips

### Change Colors
Edit `public/styles.css`:
```css
:root {
    --primary: #1a1a1a;      /* Main dark */
    --accent: #d4a574;       /* Gold */
}
```

### Update Business Info
Edit `views/index.html`:
- Change Instagram/WhatsApp links
- Update business email in footer

### Adjust Pricing
Edit `public/app.js` in the `services` object

---

## 📧 Email Issues?

Check:
- ✓ Gmail 2-Step Verification enabled
- ✓ App password generated (not regular password)
- ✓ EMAIL_USER and EMAIL_TO are correct
- ✓ EMAIL_PASSWORD is correct app password

---

## 🆘 Need Help?

Check `README.md` for full documentation or troubleshooting section.

Enjoy! 🎉
