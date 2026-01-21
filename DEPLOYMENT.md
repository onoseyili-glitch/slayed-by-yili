# Deployment Guide - Slayed by Yili

## Deployment Options

Choose one of the following deployment platforms:

---

## 1. Heroku (Easiest for Beginners)

### Prerequisites
- Heroku account (free at https://www.heroku.com)
- Heroku CLI installed
- Git repository initialized

### Steps

1. **Create Heroku app:**
```bash
heroku create slayed-by-yili
```

2. **Set environment variables:**
```bash
heroku config:set STRIPE_SECRET_KEY=sk_test_...
heroku config:set STRIPE_PUBLIC_KEY=pk_test_...
heroku config:set EMAIL_USER=your-email@gmail.com
heroku config:set EMAIL_PASSWORD=your-app-password
heroku config:set EMAIL_TO=yili@example.com
heroku config:set NODE_ENV=production
```

3. **Create Procfile** (if not exists):
```
web: node src/server.js
```

4. **Deploy:**
```bash
git push heroku main
```

5. **View logs:**
```bash
heroku logs --tail
```

### Pros:
- ✓ Easy setup
- ✓ Free tier available
- ✓ Automatic HTTPS
- ✓ Good for learning

### Cons:
- ✗ Paid plans needed for production
- ✗ Slower cold starts
- ✗ Limited customization

---

## 2. DigitalOcean App Platform

### Prerequisites
- DigitalOcean account
- GitHub repository connected

### Steps

1. **Create new app:**
   - Go to https://cloud.digitalocean.com/apps
   - Click "Create Apps"
   - Connect your GitHub repository

2. **Configure build command:**
```
npm install
```

3. **Configure run command:**
```
npm start
```

4. **Add environment variables:**
   - STRIPE_SECRET_KEY
   - STRIPE_PUBLIC_KEY
   - EMAIL_USER
   - EMAIL_PASSWORD
   - EMAIL_TO
   - NODE_ENV=production

5. **Deploy:**
   - Click "Deploy"

### Pros:
- ✓ Affordable
- ✓ Simple setup
- ✓ Good performance
- ✓ Auto HTTPS

### Cons:
- ✗ Minimum cost ($5-12/month)
- ✗ Less feature-rich

---

## 3. AWS (Most Scalable)

### Prerequisites
- AWS account
- AWS CLI installed

### Steps

1. **Create Elastic Beanstalk environment:**
```bash
eb init -p node.js-14 slayed-by-yili
eb create production
```

2. **Set environment variables:**
```bash
eb setenv STRIPE_SECRET_KEY=sk_test_...
eb setenv STRIPE_PUBLIC_KEY=pk_test_...
eb setenv EMAIL_USER=your-email@gmail.com
eb setenv EMAIL_PASSWORD=your-app-password
eb setenv EMAIL_TO=yili@example.com
```

3. **Deploy:**
```bash
eb deploy
```

### Pros:
- ✓ Highly scalable
- ✓ Reliable
- ✓ Enterprise-grade

### Cons:
- ✗ Complex setup
- ✗ Steep learning curve
- ✗ Expensive

---

## 4. Render (Modern Alternative)

### Prerequisites
- Render account (free at https://render.com)
- GitHub repository

### Steps

1. **Connect repository:**
   - Go to https://dashboard.render.com
   - Click "New Web Service"
   - Connect GitHub

2. **Configure:**
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`

3. **Add environment variables:**
   - Add all required env vars

4. **Deploy:**
   - Click "Create Web Service"

### Pros:
- ✓ Modern platform
- ✓ Easy setup
- ✓ Free tier available
- ✓ Good UI

### Cons:
- ✗ Newer platform
- ✗ Limited customization

---

## 5. Self-Hosted (VPS)

### Prerequisites
- VPS (DigitalOcean, Linode, AWS EC2, etc.)
- SSH access
- Domain name (optional)

### Steps

1. **SSH into server:**
```bash
ssh root@your-vps-ip
```

2. **Install Node.js:**
```bash
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt-get install -y nodejs
```

3. **Install PM2 (process manager):**
```bash
npm install -g pm2
```

4. **Clone repository:**
```bash
git clone https://github.com/your-username/slayed-by-yili.git
cd slayed-by-yili
npm install
```

5. **Create .env file:**
```bash
nano .env
```

6. **Start with PM2:**
```bash
pm2 start src/server.js --name "slayed-by-yili"
pm2 startup
pm2 save
```

7. **Setup Nginx reverse proxy:**
```bash
sudo apt-get install nginx
```

Edit `/etc/nginx/sites-available/default`:
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

8. **Install SSL with Let's Encrypt:**
```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### Pros:
- ✓ Full control
- ✓ Cost-effective
- ✓ Highly customizable

### Cons:
- ✗ Requires technical knowledge
- ✗ Manual maintenance
- ✗ Security responsibility

---

## 6. Netlify + Serverless Backend

### Frontend on Netlify:
1. Deploy `public/` folder to Netlify

### Backend on Netlify Functions:
Create `netlify/functions/api.js` with server code.

### Pros:
- ✓ Decoupled architecture
- ✓ Easy frontend deployment
- ✓ Built-in CI/CD

### Cons:
- ✗ Requires code restructuring
- ✗ Cold start issues

---

## Post-Deployment Checklist

After deploying to any platform:

- [ ] Update STRIPE_PUBLIC_KEY in HTML (if using production keys)
- [ ] Test booking flow end-to-end
- [ ] Verify email notifications work
- [ ] Test with real credit card (Stripe live keys)
- [ ] Set up SSL/HTTPS
- [ ] Configure custom domain
- [ ] Set up monitoring/logging
- [ ] Enable error tracking (Sentry)
- [ ] Test on mobile devices
- [ ] Verify payment processing
- [ ] Check email delivery
- [ ] Set up backups (if database used)

---

## Domain Setup

Once deployed, set up your domain:

1. **Get a domain:**
   - Namecheap, GoDaddy, Google Domains, etc.

2. **Point to your host:**
   - Heroku: Create CNAME to `your-app.herokuapp.com`
   - DigitalOcean: Update A record to app IP
   - AWS: Create Route 53 record

3. **Enable HTTPS:**
   - Most platforms auto-enable
   - Use Let's Encrypt for self-hosted

---

## Monitoring & Logs

### Heroku
```bash
heroku logs --tail
heroku logs --dyno=web
```

### DigitalOcean
- Check dashboard logs
- SSH into app and check `/var/log`

### Self-Hosted
```bash
pm2 logs
tail -f ~/.pm2/logs/slayed-by-yili-out.log
```

---

## Scaling Considerations

As traffic grows:

1. **Database:** Switch from in-memory to MongoDB/PostgreSQL
2. **Caching:** Add Redis for session management
3. **Load Balancing:** Use load balancer for multiple server instances
4. **CDN:** Use CloudFlare for static assets
5. **Monitoring:** Set up Sentry for error tracking

---

## Security in Production

- [ ] Use HTTPS (SSL certificate)
- [ ] Validate all input
- [ ] Implement rate limiting
- [ ] Use environment variables for secrets
- [ ] Enable CSRF protection
- [ ] Set security headers
- [ ] Use Stripe live keys only
- [ ] Enable API authentication
- [ ] Set up logging/monitoring
- [ ] Regular security audits

---

## Cost Comparison

| Platform | Cost | Setup | Ease |
|----------|------|-------|------|
| Heroku | $7-25/month | Easy | Very Easy |
| DigitalOcean | $5-12/month | Medium | Easy |
| Render | $0-25/month | Easy | Very Easy |
| AWS | $5-50+/month | Hard | Moderate |
| Self-Hosted | $4-15/month | Hard | Hard |
| Netlify | $0-99/month | Medium | Easy |

---

## Troubleshooting Deployment

### App crashes after deploy
- Check logs for errors
- Verify all env vars are set
- Ensure package.json has all dependencies

### Emails not sending
- Verify EMAIL_USER and EMAIL_PASSWORD
- Check Gmail app password setup
- Verify EMAIL_TO is correct

### Stripe errors
- Ensure keys are correct format
- Check production vs test keys
- Verify Stripe account is active

### Slow performance
- Check server logs for bottlenecks
- Upgrade hosting tier
- Implement caching
- Optimize database queries

---

## Recommended Setup

**For production, I recommend:**

1. **Frontend:** Netlify (free tier)
2. **Backend:** DigitalOcean App Platform ($5-12/month)
3. **Database:** MongoDB Atlas (free tier)
4. **Domain:** Namecheap (~£5/year)
5. **SSL:** Auto-enabled by both platforms
6. **Monitoring:** Sentry (free tier)

**Total monthly cost: ~$5-12**

---

## Next Steps

1. Choose your hosting platform
2. Follow the deployment steps
3. Test everything thoroughly
4. Set up monitoring
5. Configure your domain
6. Go live!

---

For specific platform help, refer to their official documentation.
