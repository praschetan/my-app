# Deploy to Railway Now

## Step 1: Login to Railway

Run this command (it will open your browser for authentication):

```bash
railway login
```

This will open https://railway.app in your browser. Sign in with:
- GitHub (recommended)
- Google
- Email

Once you see "Logged in as [your-email]" in the terminal, proceed to Step 2.

## Step 2: Run Automated Deployment

I've created an automated deployment script. Run:

```bash
./RAILWAY_DEPLOY.sh
```

This script will:
1. Initialize Railway project
2. Add PostgreSQL database
3. Ask for your Anthropic API key
4. Deploy the application
5. Run database migrations
6. Optionally seed sample data

**OR** manually run these commands:

```bash
# Initialize project
railway init

# Add PostgreSQL
railway add --database postgres

# Set environment variables
railway variables set ANTHROPIC_API_KEY=your_key_here

# Deploy
railway up

# Run migrations
railway run npm run db:push

# Seed database (optional)
railway run npm run db:seed

# Open your app
railway open
```

## Step 3: Get Your Anthropic API Key

If you don't have one:

1. Go to https://console.anthropic.com
2. Sign up or log in
3. Navigate to "API Keys"
4. Create a new API key
5. Copy it (starts with `sk-ant-...`)

You'll need this when the deployment script asks for it!

## What Happens During Deployment

1. **Railway detects Dockerfile** and builds your app
2. **PostgreSQL addon** is created and DATABASE_URL is set automatically
3. **Environment variables** are configured
4. **Database schema** is pushed (creates all 9 tables)
5. **Sample data** is seeded (optional)
6. **App is live!** Railway provides a URL

## After Deployment

Your app will be live at: `https://[your-project].up.railway.app`

### Verify Deployment

```bash
# View logs
railway logs

# Check status
railway status

# Open app in browser
railway open

# Connect to database
railway connect postgres
```

### Update Environment Variables Later

```bash
# View all variables
railway variables

# Set a variable
railway variables set KEY=value

# Delete a variable
railway variables delete KEY
```

## Troubleshooting

### "Unauthorized. Please login"
- Run `railway login` again
- Make sure you complete the browser authentication

### "Build failed"
- Check logs: `railway logs`
- The build should pass (we tested it locally)
- Check that Dockerfile exists

### "Database connection error"
- Railway auto-sets DATABASE_URL
- Check variables: `railway variables`
- Should see DATABASE_URL starting with `postgresql://`

### "Agent workflow fails"
- Make sure ANTHROPIC_API_KEY is set
- Check: `railway variables`
- Verify key at console.anthropic.com

## Cost Estimate

Railway pricing:
- **Hobby Plan**: $5/month (includes $5 credit)
  - Enough for development/testing
  - Shared CPU and memory

- **PostgreSQL**: Included in hobby plan
  - 1 GB storage
  - Shared resources

- **Usage-based**: You pay for actual compute time
  - Typically $0-5/month for light usage
  - Scales with traffic

## Need Help?

Let me know when you've completed `railway login` and I can help with the next steps!
