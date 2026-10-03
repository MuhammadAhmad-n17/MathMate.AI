# 🚀 Deployment Guide

## Deploying MathAI

Complete guide for deploying MathAI to production.

## Option 1: Render.com (Recommended - Free)

### Backend Deployment

1. **Connect GitHub**
   - Go to [render.com](https://render.com)
   - Sign up with GitHub
   - Connect your repository

2. **Create Web Service**
   - Click "New +"
   - Select "Web Service"
   - Choose GitHub repo

3. **Configure**
   - Name: `mathai-backend`
   - Build Command: `npm install`
   - Start Command: `node server.js`
   - Select Free tier

4. **Environment Variables**
   - Add all variables from `.env.example`
   - Render provides free MongoDB and Redis

5. **Deploy**
   - Click Deploy
   - Wait for build completion

### Frontend Deployment

1. **Vercel (Better for React)**
   - Go to [vercel.com](https://vercel.com)
   - Import GitHub repo
   - Add build settings:
     - Framework: Create React App
     - Build Command: `npm run build`

2. **Configure Environment**

   ```
   REACT_APP_API_URL=https://your-backend.onrender.com/api
   ```

3. **Deploy**
   - Vercel deploys automatically on push

## Option 2: Docker Deployment

### AWS ECS

```bash
# Build Docker images
docker build -t mathai-backend ./backend
docker build -t mathai-frontend ./frontend

# Tag for AWS ECR
docker tag mathai-backend:latest 123456789.dkr.ecr.us-east-1.amazonaws.com/mathai-backend:latest
docker tag mathai-frontend:latest 123456789.dkr.ecr.us-east-1.amazonaws.com/mathai-frontend:latest

# Push to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 123456789.dkr.ecr.us-east-1.amazonaws.com
docker push 123456789.dkr.ecr.us-east-1.amazonaws.com/mathai-backend:latest
docker push 123456789.dkr.ecr.us-east-1.amazonaws.com/mathai-frontend:latest
```

### DigitalOcean App Platform

1. Create account at [digitalocean.com](https://digitalocean.com)
2. Create Docker Compose app
3. Upload `docker-compose.yml`
4. Configure environment variables
5. Deploy

## Option 3: Heroku (Paid)

```bash
# Install Heroku CLI
npm install -g heroku

# Login
heroku login

# Create apps
heroku create mathai-backend
heroku create mathai-frontend

# Add buildpacks
heroku buildpacks:add heroku/nodejs -a mathai-backend

# Set config vars
heroku config:set MONGODB_URI=... -a mathai-backend
heroku config:set REDIS_URL=... -a mathai-backend

# Deploy
git push heroku main
```

## Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use strong `JWT_SECRET`
- [ ] Configure CORS properly
- [ ] Enable HTTPS
- [ ] Set up monitoring
- [ ] Configure backups
- [ ] Set up logging
- [ ] Enable rate limiting
- [ ] Test all endpoints
- [ ] Set up CI/CD

## Monitoring & Logging

### Sentry (Error Tracking)

```javascript
// backend/server.js
const Sentry = require("@sentry/node");

Sentry.init({ dsn: "your-sentry-dsn" });

app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.errorHandler());
```

### PM2 (Process Management)

```bash
npm install -g pm2

pm2 start server.js --name "mathai-backend"
pm2 logs mathai-backend
pm2 save
```

## Database Backups

### MongoDB Atlas Auto Backup

- Enabled by default
- Automatic daily backups
- Point-in-time recovery

### Manual Backup

```bash
mongodump --uri "mongodb://..." --out ./backup

mongorestore --uri "mongodb://..." ./backup
```

## Performance Optimization

### Frontend

- Enable gzip compression
- Use CDN for static files
- Minify CSS/JS
- Lazy load components
- Image optimization

### Backend

- Enable caching with Redis
- Database indexing
- Connection pooling
- Load balancing
- Rate limiting

## Security Hardening

```javascript
// Add helmet for security headers
const helmet = require("helmet");
app.use(helmet());

// HTTPS only
const enforce = require("express-enforce-https");
app.use(enforce());

// CORS with credentials
cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true,
});
```

## Continuous Integration

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy Backend
        run: npm run deploy-backend
      - name: Deploy Frontend
        run: npm run deploy-frontend
```

## Troubleshooting Deployment

### Issue: Build fails

- Check logs in platform console
- Verify environment variables
- Test locally first

### Issue: Memory issues

- Increase container memory
- Optimize code
- Enable caching

### Issue: Database connection

- Verify connection string
- Check firewall rules
- Test connection locally

## Rollback

```bash
# Render.com
# Use Dashboard > Deployments > Previous

# Vercel
# Use Dashboard > Deployments > Promote

# Docker
docker pull previous-image
docker run ...
```

## Cost Optimization

### Free Options

- Render.com (free tier)
- Vercel (free tier)
- MongoDB Atlas (512MB free)
- Redis Labs (30MB free)

### Paid but Cheap

- DigitalOcean: $5/month
- Linode: $5/month
- Railway: Pay per use

## Next Steps

1. Choose hosting platform
2. Set up CI/CD
3. Configure monitoring
4. Enable auto-scaling
5. Set up logging
6. Backup strategy

---

For questions, check [render.com docs](https://render.com/docs) or [vercel.com docs](https://vercel.com/docs)
