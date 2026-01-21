# Email Issue on Render

## Problem
Gmail blocks SMTP connections from Render's free tier IPs (ETIMEDOUT error).

## Temporary Solution
Bookings are logged to Render console. Check logs to see booking details.

## Permanent Solution (Choose One)

### Option 1: SendGrid (Recommended - Free 100 emails/day)
1. Sign up at https://sendgrid.com
2. Get API key
3. Add to Render env: `SENDGRID_API_KEY`
4. Update code to use SendGrid API

### Option 2: Mailgun (Free 5000 emails/month first 3 months)
1. Sign up at https://mailgun.com
2. Get API key and domain
3. Add to Render env vars
4. Update code to use Mailgun API

### Option 3: Resend (Modern, easy API)
1. Sign up at https://resend.com
2. Get API key
3. Simple REST API

All these services work from cloud hosting unlike Gmail SMTP.
