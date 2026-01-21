# SendGrid Setup Instructions

## What I Did
- Installed SendGrid package
- Replaced Gmail SMTP with SendGrid API (works from cloud hosting)
- Bookings now work even without API key (logs to console)

## Your Next Steps

### 1. Sign Up for SendGrid (Free)
Go to: https://signup.sendgrid.com/
- Free tier: 100 emails/day forever
- No credit card needed

### 2. Get Your API Key
After signing up:
1. Go to Settings → API Keys
2. Click "Create API Key"
3. Name it "slayed-by-yili"
4. Choose "Full Access"
5. Copy the key (shows only once!)

### 3. Add to Render
In your Render dashboard:
1. Go to your service → Environment
2. Add new variable:
   - Key: `SENDGRID_API_KEY`
   - Value: (paste the API key from step 2)
3. Click "Save Changes"
4. Render will auto-redeploy

### 4. Verify Sender Email (Required by SendGrid)
SendGrid requires you to verify your sender email:
1. In SendGrid dashboard → Settings → Sender Authentication
2. Click "Verify a Single Sender"
3. Enter your email (pecusadoh@gmail.com)
4. Check your inbox and click the verification link

## What Happens Now
- **Without API key**: Bookings work but no emails sent (logged to Render console)
- **With API key**: Bookings work AND emails sent to you + customer

## Testing
After adding the API key and redeploying:
1. Make a test booking on your live site
2. Check your email inbox
3. Customer should also receive confirmation with cancel link

That's it! Emails will work perfectly from Render.
