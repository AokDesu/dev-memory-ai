# Deployment Guide

This guide covers deploying Developer Memory AI to various platforms.

## Prerequisites

- Node.js 20+
- Git repository
- API keys (Google Gemini or OpenAI)

## Environment Variables

Required environment variables:

```bash
# Database
DATABASE_URL="file:./dev.db"

# AI Provider
GOOGLE_API_KEY=your_gemini_api_key
AI_PROVIDER=gemini

# External API Authentication
API_SECRET_KEY=your_secret_key_here

# Application Settings
NEXT_PUBLIC_MAX_FILE_SIZE=10485760
NODE_ENV=production
```

## Deployment Options

### 1. Vercel (Recommended)

**Pros:**
- Zero configuration
- Automatic HTTPS
- Global CDN
- Free tier available

**Steps:**

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy:
```bash
cd developer-memory-ai
vercel
```

4. Set environment variables in Vercel dashboard:
   - Go to Project Settings → Environment Variables
   - Add all required variables from `.env.example`

5. Redeploy:
```bash
vercel --prod
```

**Note:** Vercel uses serverless functions, so file system access is limited. For full functionality, use Docker or VPS deployment.

### 2. Docker

**Pros:**
- Full control
- Consistent environment
- Easy scaling
- Works anywhere

**Steps:**

1. Create `.env` file:
```bash
cp .env.example .env
# Edit .env with your values
```

2. Build and run:
```bash
docker-compose up -d
```

3. Check logs:
```bash
docker-compose logs -f
```

4. Stop:
```bash
docker-compose down
```

**With Ollama (local LLM):**
```bash
docker-compose --profile local-llm up -d
```

### 3. VPS (Ubuntu/Debian)

**Pros:**
- Full control
- Cost-effective
- Can access local repositories

**Steps:**

1. Install Node.js 20:
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

2. Install PM2:
```bash
sudo npm install -g pm2
```

3. Clone repository:
```bash
git clone https://github.com/yourusername/developer-memory-ai.git
cd developer-memory-ai
```

4. Install dependencies:
```bash
npm ci --legacy-peer-deps
```

5. Create `.env.local`:
```bash
cp .env.example .env.local
# Edit with your values
```

6. Build:
```bash
npm run build
```

7. Start with PM2:
```bash
pm2 start npm --name "dev-memory-ai" -- start
pm2 save
pm2 startup
```

8. Setup Nginx reverse proxy:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

9. Enable HTTPS with Let's Encrypt:
```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### 4. Railway

**Pros:**
- Simple deployment
- Free tier
- Automatic HTTPS

**Steps:**

1. Install Railway CLI:
```bash
npm i -g @railway/cli
```

2. Login:
```bash
railway login
```

3. Initialize project:
```bash
railway init
```

4. Add environment variables:
```bash
railway variables set GOOGLE_API_KEY=your_key
railway variables set AI_PROVIDER=gemini
railway variables set API_SECRET_KEY=your_secret
```

5. Deploy:
```bash
railway up
```

### 5. DigitalOcean App Platform

**Pros:**
- Managed platform
- Auto-scaling
- Built-in monitoring

**Steps:**

1. Create new app in DigitalOcean dashboard
2. Connect GitHub repository
3. Configure build settings:
   - Build Command: `npm run build`
   - Run Command: `npm start`
4. Add environment variables
5. Deploy

## Post-Deployment

### 1. Verify Health

```bash
curl https://your-domain.com/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "database": "connected"
}
```

### 2. Test API

```bash
curl -X POST https://your-domain.com/api/projects/select \
  -H "Content-Type: application/json" \
  -d '{"path": "/path/to/repo"}'
```

### 3. Generate API Key

For external integrations, generate a secure API key:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Add to `.env`:
```bash
API_SECRET_KEY=generated_key_here
```

## Monitoring

### Application Logs

**Docker:**
```bash
docker-compose logs -f app
```

**PM2:**
```bash
pm2 logs dev-memory-ai
```

**Vercel:**
```bash
vercel logs
```

### Health Checks

Set up monitoring with:
- UptimeRobot
- Pingdom
- StatusCake

Monitor endpoint: `https://your-domain.com/api/health`

### Performance Monitoring

Optional integrations:
- Sentry for error tracking
- LogRocket for session replay
- New Relic for APM

## Scaling

### Horizontal Scaling

1. **Load Balancer:** Use Nginx or cloud load balancer
2. **Multiple Instances:** Run multiple app instances
3. **Shared Database:** Use PostgreSQL instead of SQLite

### Vertical Scaling

Increase resources:
- CPU: 2+ cores recommended
- RAM: 2GB+ recommended
- Storage: 10GB+ for embeddings

## Backup

### Database Backup

**SQLite:**
```bash
# Backup
cp data/dev.db data/backup-$(date +%Y%m%d).db

# Restore
cp data/backup-20240101.db data/dev.db
```

**Automated backup script:**
```bash
#!/bin/bash
# backup.sh
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
cp data/dev.db "$BACKUP_DIR/dev-$DATE.db"
# Keep only last 7 days
find "$BACKUP_DIR" -name "dev-*.db" -mtime +7 -delete
```

Add to crontab:
```bash
0 2 * * * /path/to/backup.sh
```

## Security

### 1. API Key Rotation

Rotate API keys regularly:
```bash
# Generate new key
NEW_KEY=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")

# Update environment
railway variables set API_SECRET_KEY=$NEW_KEY
# or
vercel env add API_SECRET_KEY production
```

### 2. HTTPS Only

Ensure all traffic uses HTTPS:
```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}
```

### 3. Rate Limiting

Add rate limiting to Nginx:
```nginx
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;

location /api/ {
    limit_req zone=api burst=20;
    proxy_pass http://localhost:3000;
}
```

### 4. Firewall

Configure firewall:
```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

## Troubleshooting

### Database Connection Issues

```bash
# Check database file permissions
ls -la data/dev.db

# Reset database
rm data/dev.db
npm run db:push
```

### Memory Issues

Increase Node.js memory:
```bash
NODE_OPTIONS="--max-old-space-size=4096" npm start
```

### Port Already in Use

```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>
```

### Build Failures

```bash
# Clear cache
rm -rf .next node_modules
npm ci --legacy-peer-deps
npm run build
```

## Cost Estimation

### Vercel
- Free tier: 100GB bandwidth, 100 hours compute
- Pro: $20/month

### Railway
- Free tier: $5 credit/month
- Hobby: $5/month + usage

### DigitalOcean
- Basic Droplet: $6/month
- App Platform: $5/month + usage

### VPS (Self-hosted)
- 2GB RAM, 1 CPU: $5-10/month
- 4GB RAM, 2 CPU: $12-20/month

### AI API Costs
- Gemini: Free tier (60 requests/min)
- OpenAI: ~$0.002 per 1K tokens
- Ollama: Free (self-hosted)

## Support

- Documentation: https://docs.devmemory.ai
- GitHub Issues: https://github.com/yourusername/developer-memory-ai/issues
- Discord: https://discord.gg/devmemory
