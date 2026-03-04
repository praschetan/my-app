# Setup Guide

This guide will help you set up the AI Marketing Automation platform from scratch.

## Step 1: Install Node.js

Ensure you have Node.js 18 or higher:
```bash
node --version  # Should be 18.x or higher
```

## Step 2: Install Dependencies

```bash
npm install
```

This will install all required packages including:
- Next.js for the web framework
- Drizzle ORM for database access
- tRPC for API layer
- LangGraph for AI agent orchestration
- LangChain for LLM integration
- shadcn/ui for UI components

## Step 3: Setup PostgreSQL

You have two options:

### Option A: Docker (Easiest)

If you have Docker installed:
```bash
docker compose up -d
```

This starts PostgreSQL on `localhost:5432` with:
- Database: `marketing_automation`
- Username: `postgres`
- Password: `postgres`

### Option B: Local PostgreSQL

1. Install PostgreSQL 14+:
   - macOS: `brew install postgresql@16`
   - Ubuntu: `sudo apt install postgresql postgresql-contrib`
   - Windows: Download from [postgresql.org](https://www.postgresql.org/download/)

2. Start PostgreSQL service

3. Create database:
   ```bash
   createdb marketing_automation
   ```

4. Update `.env` if using different credentials

## Step 4: Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and set:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/marketing_automation
ANTHROPIC_API_KEY=sk-ant-...  # Get from console.anthropic.com
OPENAI_API_KEY=sk-...          # (Optional) Get from platform.openai.com
```

### Getting API Keys

**Anthropic API Key:**
1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Sign up or log in
3. Navigate to API Keys
4. Create a new key
5. Copy and paste into `.env`

**OpenAI API Key (Optional):**
- Only needed if you want OpenAI as a fallback
- Get from [platform.openai.com/api-keys](https://platform.openai.com/api-keys)

## Step 5: Initialize Database

Push the database schema:
```bash
npm run db:push
```

This creates all tables:
- campaigns, audiences, audience_members
- content, content_variants
- channels, campaign_executions
- agent_runs, agent_actions
- events (analytics)

Optionally seed with sample data:
```bash
npm run db:seed
```

This creates:
- Sample campaign ("Product Launch Campaign")
- Sample audience ("SMB Decision Makers")
- Sample audience members (3 contacts)
- Sample content (email and social post)
- Sample channels (email and SMS)

## Step 6: Start Development Server

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

## Step 7: Test the Platform

1. **View Dashboard**
   - Go to http://localhost:3000
   - You should see stats cards and quick actions

2. **Create a Campaign**
   - Click "Create New Campaign"
   - Enter name: "Test Campaign"
   - Enter goal: "Test the AI agent workflow"
   - Click "Create Campaign"

3. **Trigger AI Planning**
   - On the campaign detail page, click "Start AI Planning"
   - Watch the Agent Workflow card show real-time progress
   - AI agents will run in sequence:
     - Campaign Planner → creates strategy
     - Audience Analyzer → creates segments
     - Content Creator → generates content
     - Channel Optimizer → recommends channels
     - Performance Monitor → analyzes results

4. **View Results**
   - Refresh the page to see created audiences
   - Check the generated content
   - Review the AI-generated plan

## Troubleshooting

### Database Connection Errors

If you see `ECONNREFUSED` errors:
- Make sure PostgreSQL is running
- Docker: `docker compose ps` should show postgres as "Up"
- Local: Check service status with `pg_isready`
- Verify DATABASE_URL in `.env` matches your setup

### Missing API Keys

If agent workflows fail:
- Check that ANTHROPIC_API_KEY is set in `.env`
- Verify the key is valid at [console.anthropic.com](https://console.anthropic.com)
- Check Node.js can read the .env file (restart dev server)

### Build Errors

If `npm run build` fails:
- Clear `.next` folder: `rm -rf .next`
- Delete node_modules: `rm -rf node_modules`
- Reinstall: `npm install`
- Try again: `npm run build`

### Type Errors

If TypeScript errors occur:
- Make sure all dependencies are installed
- Run `npm install` again
- Check that `tsconfig.json` paths are correct

## Next Steps

### Phase 5: Channel Integration

To actually send campaigns:

1. Add SendGrid or Resend for email:
   ```bash
   npm install @sendgrid/mail
   # or
   npm install resend
   ```

2. Update `src/lib/channels/email.ts` with real implementation

3. Add Twilio for SMS:
   ```bash
   npm install twilio
   ```

4. Update `src/lib/channels/sms.ts` with real implementation

5. Set API keys in `.env`:
   ```env
   SENDGRID_API_KEY=your_key
   TWILIO_ACCOUNT_SID=your_sid
   TWILIO_AUTH_TOKEN=your_token
   ```

### Production Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for Railway deployment instructions.

## Development Tools

```bash
# View database in GUI
npm run db:studio

# Type check
npm run build

# Lint code
npm run lint

# View logs
# Check terminal where npm run dev is running
```

## Support

- **Issues**: Report bugs or request features
- **Documentation**: See inline code comments
- **AI Agents**: Check `src/server/agents/` for agent implementations
- **Database Schema**: See `src/server/db/schema.ts`
