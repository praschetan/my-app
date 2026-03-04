# AI Marketing Automation Platform

An AI-first marketing automation platform where autonomous agents plan, create, and optimize marketing campaigns.

## Features

- **AI Campaign Planning**: AI agents create complete campaign strategies from business goals
- **Autonomous Content Creation**: AI generates personalized content across channels
- **Audience Intelligence**: AI-powered audience segmentation and insights
- **Channel Optimization**: AI selects optimal channels and timing
- **Performance Monitoring**: Continuous AI-driven campaign optimization

## Tech Stack

- **Frontend/Backend**: Next.js 14+ (App Router, TypeScript)
- **Database**: PostgreSQL with Drizzle ORM
- **API**: tRPC for end-to-end type safety
- **AI Orchestration**: LangGraph + LangChain
- **LLM**: Anthropic Claude with OpenAI fallback
- **UI**: shadcn/ui + Tailwind CSS
- **Deployment**: Railway.app

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+ (or Docker for local development)
- Anthropic API key (get from [console.anthropic.com](https://console.anthropic.com))

### Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Setup PostgreSQL**

   **Option A: Using Docker (Recommended)**
   ```bash
   docker compose up -d
   ```

   **Option B: Local PostgreSQL**
   - Install PostgreSQL 14+
   - Create database: `createdb marketing_automation`
   - Default connection: `postgresql://postgres:postgres@localhost:5432/marketing_automation`

3. **Configure environment**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add your API keys:
   ```
   ANTHROPIC_API_KEY=your_anthropic_key_here
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/marketing_automation
   ```

4. **Setup database**
   ```bash
   npm run db:push      # Push schema to database
   npm run db:seed      # (Optional) Add sample data
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Open the app**

   Navigate to [http://localhost:3000](http://localhost:3000)

### First Campaign

1. Click "Create New Campaign"
2. Enter a campaign name and business goal
3. Click "Start AI Planning" to watch agents work
4. AI agents will automatically:
   - Create a campaign strategy
   - Segment audiences
   - Generate content
   - Optimize channels
   - Monitor performance

## Database Management

```bash
# Push schema to database (development)
npm run db:push

# Seed database with sample data
npm run db:seed

# Open Drizzle Studio (database GUI)
npm run db:studio

# Generate migrations (when schema changes)
npm run db:generate
```

## Project Structure

```
my-app/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── campaigns/          # Campaign management UI
│   │   ├── audiences/          # Audience management UI
│   │   ├── content/            # Content library UI
│   │   └── channels/           # Channel configuration UI
│   ├── components/             # React components
│   │   ├── ui/                 # shadcn/ui components
│   │   └── agents/             # Agent-specific components
│   ├── lib/                    # Utilities
│   │   ├── trpc/               # tRPC client/server
│   │   └── channels/           # Channel integrations
│   └── server/
│       ├── api/                # tRPC routers
│       ├── db/                 # Database schema & client
│       └── agents/             # AI agent system
│           ├── graph.ts        # LangGraph workflow
│           ├── state.ts        # Workflow state
│           ├── agents/         # Individual agents
│           └── tools/          # Agent tools
├── Dockerfile                  # Production Docker image
├── railway.json                # Railway deployment config
└── docker-compose.yml          # Local PostgreSQL setup
```

## Architecture

The platform uses five specialized AI agents orchestrated through LangGraph:

1. **Campaign Planner Agent** - Creates campaign strategies
2. **Audience Analyzer Agent** - Segments and targets audiences
3. **Content Creator Agent** - Generates multi-channel content
4. **Channel Optimizer Agent** - Optimizes delivery channels
5. **Performance Monitor Agent** - Monitors and optimizes campaigns

Agents collaborate through a LangGraph workflow with parallel execution, conditional routing, and persistent state in PostgreSQL.

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete deployment instructions for Railway.app.

## Architecture Deep Dive

### AI Agent Workflow

The platform uses LangGraph to orchestrate five specialized agents:

```
START
  ↓
Campaign Planner (creates strategy)
  ↓
  ├──→ Audience Analyzer (segments audiences) ──┐
  └──→ Content Creator (generates content) ─────┤
                                                 ↓
                                    Channel Optimizer (recommends channels)
                                                 ↓
                                    Performance Monitor (analyzes & optimizes)
                                                 ↓
                                               END
```

**Key Features:**
- Parallel execution of audience analysis and content creation
- Persistent state in PostgreSQL (survives restarts)
- Complete audit trail of all agent actions
- Real-time UI updates
- Error handling and retry logic

### Database Schema

**Core Tables:**
- `campaigns` - Campaign metadata and AI plans
- `audiences` - Audience segments with AI insights
- `audience_members` - Individual contacts
- `content` - Content with versioning
- `content_variants` - A/B test variations
- `channels` - Channel configurations
- `campaign_executions` - Execution tracking
- `agent_runs` - Agent workflow state
- `agent_actions` - Detailed agent audit log
- `events` - Time-series analytics

### API Layer

tRPC provides end-to-end type safety from database to UI:

```typescript
// Server
export const campaignsRouter = createTRPCRouter({
  list: publicProcedure.query(async ({ ctx }) => {
    return await ctx.db.query.campaigns.findMany();
  }),
});

// Client
const { data } = api.campaigns.list.useQuery();
// data is fully typed!
```

## Current Implementation Status

### ✅ Completed (MVP Ready)

- [x] Next.js 14 with App Router and TypeScript
- [x] PostgreSQL database with Drizzle ORM
- [x] Complete database schema (all tables)
- [x] tRPC API with full CRUD operations
- [x] Five specialized AI agents
- [x] LangGraph multi-agent workflow
- [x] Real-time agent status UI
- [x] Campaign, audience, content, channel pages
- [x] Analytics and dashboard
- [x] Railway deployment configuration
- [x] Docker Compose for local development

### 🚧 To Be Implemented

- [ ] Actual LLM calls (requires API keys)
- [ ] Real email sending (SendGrid/Resend)
- [ ] Real SMS sending (Twilio)
- [ ] Social media API integrations
- [ ] Scheduling system with cron jobs
- [ ] Advanced analytics visualizations
- [ ] User authentication
- [ ] Webhook support for event tracking
- [ ] Advanced A/B testing logic
- [ ] Cost tracking for AI API calls

## License

MIT
