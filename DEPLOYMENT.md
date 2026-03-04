# Deployment Guide

## Railway.app Deployment

### Prerequisites

1. Create a Railway account at [railway.app](https://railway.app)
2. Install Railway CLI: `npm i -g @railway/cli`
3. Login: `railway login`

### Setup Steps

1. **Create a new project**
   ```bash
   railway init
   ```

2. **Add PostgreSQL database**
   ```bash
   railway add --database postgres
   ```

3. **Set environment variables**
   ```bash
   railway variables set ANTHROPIC_API_KEY=your_key_here
   railway variables set OPENAI_API_KEY=your_key_here
   ```

   Railway will automatically set `DATABASE_URL` from the PostgreSQL addon.

4. **Deploy the application**
   ```bash
   railway up
   ```

5. **Run database migrations**
   ```bash
   railway run npm run db:push
   ```

6. **Seed the database (optional)**
   ```bash
   railway run npm run db:seed
   ```

### Environment Variables

Required variables:
- `DATABASE_URL` - Set automatically by Railway PostgreSQL addon
- `ANTHROPIC_API_KEY` - Your Anthropic API key for Claude
- `OPENAI_API_KEY` - (Optional) OpenAI API key for fallback

Optional variables for Phase 5:
- `SENDGRID_API_KEY` - For email delivery
- `TWILIO_ACCOUNT_SID` - For SMS delivery
- `TWILIO_AUTH_TOKEN` - For SMS delivery

### Monitoring

View logs:
```bash
railway logs
```

View database:
```bash
railway connect postgres
```

### Continuous Deployment

Railway automatically deploys when you push to your connected Git repository.

To connect your Git repository:
1. Go to your Railway project dashboard
2. Click "Settings"
3. Connect your GitHub/GitLab repository
4. Select the branch to deploy

## Local Development with PostgreSQL

### Option 1: Docker Compose (Recommended)

```bash
docker compose up -d
npm run db:push
npm run db:seed
npm run dev
```

### Option 2: Local PostgreSQL

1. Install PostgreSQL 14+
2. Create database: `createdb marketing_automation`
3. Update `.env` with your connection string
4. Run migrations: `npm run db:push`
5. Seed database: `npm run db:seed`
6. Start dev server: `npm run dev`

## Production Checklist

- [ ] Set all required environment variables
- [ ] Run database migrations
- [ ] Configure channel API keys (Phase 5)
- [ ] Setup monitoring and error tracking
- [ ] Configure domain and SSL
- [ ] Test agent workflows end-to-end
- [ ] Setup backup strategy for PostgreSQL
- [ ] Configure rate limiting for AI API calls
- [ ] Review security settings (add auth in production)
