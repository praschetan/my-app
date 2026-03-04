# Quick Start Guide

Get up and running in 5 minutes!

## Prerequisites Check

```bash
# Check Node.js version (need 18+)
node --version

# Check npm
npm --version
```

## Installation Steps

### 1. Install Dependencies (1 minute)

```bash
npm install
```

### 2. Start PostgreSQL (30 seconds)

**With Docker (recommended):**
```bash
docker compose up -d
```

**Without Docker:**
- macOS: `brew services start postgresql`
- Ubuntu: `sudo systemctl start postgresql`
- Windows: Start PostgreSQL service

### 3. Setup Environment (1 minute)

```bash
cp .env.example .env
```

Edit `.env`:
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/marketing_automation
ANTHROPIC_API_KEY=your_key_here  # Get from console.anthropic.com
```

### 4. Initialize Database (30 seconds)

```bash
npm run db:push       # Create tables
npm run db:seed       # Add sample data (optional)
```

### 5. Start Application (10 seconds)

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Your First Campaign

1. Click **"Create New Campaign"**

2. Fill in:
   - **Name**: "Test Campaign"
   - **Goal**: "Generate 100 leads for our SaaS product targeting small business owners"

3. Click **"Create Campaign"**

4. Click **"Start AI Planning"**

5. Watch the AI agents work:
   - Campaign Planner creates strategy
   - Audience Analyzer segments audiences
   - Content Creator generates content
   - Channel Optimizer recommends delivery
   - Performance Monitor sets up tracking

6. View the results:
   - AI-generated campaign plan
   - Audience segments with targeting criteria
   - Marketing content across channels
   - Channel optimization recommendations

## What You Can Do Now

### Create & Manage Campaigns
- Create campaigns with business goals
- Let AI plan the entire campaign
- Review AI-generated strategies
- Approve and execute campaigns

### Explore Audiences
- View AI-segmented audiences
- See targeting criteria and insights
- Track audience sizes
- Monitor engagement scores

### Browse Content
- View AI-generated content
- See content across channels (email, SMS, social)
- Review content variations
- Track content performance

### Configure Channels
- View available channels
- Check channel status
- (Phase 5) Configure real integrations

## Troubleshooting

### "Cannot connect to database"
- Make sure PostgreSQL is running: `docker compose ps`
- Check DATABASE_URL in `.env`
- Try: `psql $DATABASE_URL` to test connection

### "Agent workflow failed"
- Check ANTHROPIC_API_KEY is set in `.env`
- Verify key at [console.anthropic.com](https://console.anthropic.com)
- Check API quota/credits
- Restart dev server: Ctrl+C then `npm run dev`

### "Module not found"
- Run `npm install` again
- Delete `node_modules` and `.next`
- Run `npm install && npm run dev`

### "Port 3000 already in use"
- Kill the process: `lsof -ti:3000 | xargs kill`
- Or use different port: `PORT=3001 npm run dev`

## Development Tools

```bash
# View database in GUI
npm run db:studio

# Check types
npm run build

# Run linter
npm run lint
```

## What's Next?

### Immediate Next Steps
1. Add your Anthropic API key to test real AI agents
2. Create a few test campaigns
3. Explore the agent workflow UI
4. Check the analytics dashboard

### Phase 5 Integration (When Ready)
1. Get SendGrid API key for email
2. Get Twilio credentials for SMS
3. Update channel service implementations
4. Test real message delivery

### Production Deployment (When Ready)
1. Follow [DEPLOYMENT.md](./DEPLOYMENT.md)
2. Deploy to Railway.app
3. Add production database
4. Configure environment variables
5. Go live!

## Need Help?

- **Setup Issues**: See [SETUP_GUIDE.md](./SETUP_GUIDE.md)
- **Architecture Questions**: See [ARCHITECTURE.md](./ARCHITECTURE.md)
- **Deployment**: See [DEPLOYMENT.md](./DEPLOYMENT.md)

## Tips

💡 **Start Simple**: Create a test campaign first to understand the flow

💡 **Watch Agents Work**: The agent status UI shows real-time progress

💡 **Use Sample Data**: Run `npm run db:seed` to get started quickly

💡 **Explore the Code**: All agents are in `src/server/agents/agents/`

💡 **Check Logs**: Agent actions are logged to the database for debugging

Happy automating! 🚀
