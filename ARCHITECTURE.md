# Architecture Documentation

## Overview

This platform is built with an **AI-first architecture** where autonomous agents are the primary actors, not just assistive features. Users provide high-level business goals, and AI agents handle the execution.

## Core Principles

1. **Agent Autonomy** - Agents make decisions and take actions independently
2. **Observability** - Complete audit trail of all agent actions
3. **Type Safety** - End-to-end TypeScript from database to UI
4. **Scalability** - Designed for serverless deployment (Railway, Vercel)
5. **Extensibility** - Easy to add new agents, tools, and channels

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend (Next.js)                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │Dashboard │  │Campaigns │  │Audiences │  │ Channels │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└────────────────────────┬────────────────────────────────────┘
                         │ tRPC (Type-safe API)
┌────────────────────────┴────────────────────────────────────┐
│                      Backend (Next.js API)                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                  tRPC Routers                         │  │
│  │  • campaigns  • audiences  • content  • channels     │  │
│  │  • agents     • execution  • analytics               │  │
│  └──────────────────────────────────────────────────────┘  │
│                         │                                    │
│  ┌──────────────────────┴──────────────────────────────┐  │
│  │              AI Agent Orchestration                   │  │
│  │                   (LangGraph)                         │  │
│  │                                                        │  │
│  │  ┌──────────────┐      ┌──────────────┐             │  │
│  │  │   Campaign   │──┬──→│  Audience    │──┐          │  │
│  │  │   Planner    │  │   │  Analyzer    │  │          │  │
│  │  └──────────────┘  │   └──────────────┘  │          │  │
│  │                     │                      ├──→ ...  │  │
│  │  ┌──────────────┐  │   ┌──────────────┐  │          │  │
│  │  │   Content    │←─┘   │   Channel    │←─┘          │  │
│  │  │   Creator    │      │  Optimizer   │             │  │
│  │  └──────────────┘      └──────────────┘             │  │
│  └────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────┴────────────────────────────────────┐
│                  PostgreSQL Database                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Campaigns   │  │  Audiences   │  │   Content    │     │
│  │  Agent Runs  │  │   Channels   │  │   Events     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└──────────────────────────────────────────────────────────────┘
```

## Agent System Design

### LangGraph Workflow

LangGraph orchestrates the multi-agent workflow with:

- **State Management** - Shared state across all agents
- **Conditional Routing** - Dynamic workflow based on agent outputs
- **Parallel Execution** - Audience analysis and content creation run simultaneously
- **Checkpointing** - Workflow state persists in database
- **Error Handling** - Failures are logged and can be recovered

### Agent Communication

Agents communicate through:
1. **Shared State** - LangGraph state object
2. **Database Tools** - Read/write operations via tools
3. **Message Passing** - Structured messages in state
4. **Audit Log** - All actions logged to `agent_actions` table

### Agent Implementation Pattern

Each agent follows this pattern:

```typescript
export async function executeAgent(
  state: AgentStateType
): Promise<Partial<AgentStateType>> {
  // 1. Extract relevant state
  const { campaignId, someInput } = state;

  // 2. Create tools for this agent
  const tools = [
    createDatabaseTool(),
    createLogActionTool(),
  ];

  // 3. Create prompt with context
  const prompt = ChatPromptTemplate.fromMessages([
    ["system", AGENT_PROMPT],
    ["human", "Execute your task"],
  ]);

  // 4. Bind tools to LLM
  const llmWithTools = llm.bindTools(tools);
  const chain = prompt.pipe(llmWithTools);

  // 5. Execute agent
  const response = await chain.invoke({ ...context });

  // 6. Process tool calls
  if (response.tool_calls) {
    for (const toolCall of response.tool_calls) {
      const tool = tools.find(t => t.name === toolCall.name);
      await tool?.invoke(toolCall.args);
    }
  }

  // 7. Return state updates
  return {
    someOutput: extractedData,
    messages: [{ agent: "name", message: "done", timestamp: new Date() }],
  };
}
```

## Data Flow

### Campaign Creation Flow

1. User creates campaign with name and goal
2. Campaign stored in database with status "draft"
3. User clicks "Start AI Planning"
4. System creates `agent_run` record
5. LangGraph workflow executes:
   - Campaign Planner analyzes goal and creates strategy
   - Audience Analyzer creates segments in parallel with
   - Content Creator generating content
   - Channel Optimizer selects channels and timing
   - Performance Monitor sets up tracking
6. All outputs saved to database
7. Campaign status updated to "ready"
8. User can review and approve

### Campaign Execution Flow

1. User approves campaign plan
2. System creates `campaign_execution` records
3. Execution engine processes queue:
   - Retrieves audience members
   - Applies channel configurations
   - Sends via channel services
   - Tracks events (sent, delivered, opened, clicked)
4. Performance Monitor continuously analyzes
5. Optimizations applied in real-time

## Technology Decisions

### Why Next.js App Router?

- Server and client components in one framework
- API routes for tRPC endpoints
- Built-in optimizations (image, fonts, etc.)
- Easy deployment (Railway, Vercel)

### Why tRPC?

- End-to-end type safety
- No code generation needed
- Automatic API client
- Great DX with React Query integration

### Why Drizzle ORM?

- TypeScript-first ORM
- Excellent type inference
- SQL-like syntax
- Fast and lightweight

### Why LangGraph?

- Built for multi-agent workflows
- Persistent state management
- Conditional routing and cycles
- Great observability
- Production-ready

### Why PostgreSQL?

- JSONB for flexible agent state
- Strong consistency for workflows
- Time-series capabilities for events
- Excellent Railway/Vercel support
- Native full-text search (future)

## Security Considerations

### Current State (MVP)

- No authentication (add before production!)
- Environment variables for secrets
- No rate limiting
- No input sanitization on user fields

### Production Recommendations

1. **Add Authentication**
   - Use NextAuth.js or Clerk
   - Secure all API routes
   - Add user_id to all tables

2. **Rate Limiting**
   - Limit API calls per user
   - Throttle agent workflows
   - Monitor LLM token usage

3. **Input Validation**
   - Validate all user inputs
   - Sanitize before storing
   - Prevent XSS and SQL injection

4. **API Key Management**
   - Store channel keys encrypted
   - Rotate keys regularly
   - Use Railway/Vercel secret management

5. **Audit Logging**
   - Log all user actions
   - Monitor suspicious activity
   - Retain logs for compliance

## Performance Optimization

### Database

- Indexes on all foreign keys and query fields
- Connection pooling via postgres.js
- Prepared statements disabled for serverless

### Frontend

- React Query caching
- Optimistic updates
- Pagination for large lists
- Lazy loading for heavy components

### AI Agents

- Streaming responses (future)
- Parallel agent execution
- Tool call batching
- Checkpoint caching

## Scalability

### Current Limits

- Single-threaded agent execution
- In-memory LangGraph checkpoints
- No queue system for executions

### Scaling Strategy

1. **Add Job Queue** (Bull/BullMQ)
   - Background execution processing
   - Retry logic for failures
   - Distributed workers

2. **PostgreSQL Checkpointer**
   - Persistent workflow state
   - Horizontal scaling of agents

3. **Caching Layer** (Redis)
   - Cache campaign data
   - Cache agent responses
   - Rate limiting

4. **CDN for Assets**
   - Serve static assets from CDN
   - Reduce server load

## Testing Strategy

### Unit Tests

- Test individual agent functions
- Test tRPC routers
- Test database operations
- Test utility functions

### Integration Tests

- Test full agent workflow
- Test API endpoints
- Test database transactions

### E2E Tests

- Test campaign creation flow
- Test agent execution
- Test UI interactions

## Monitoring

### Metrics to Track

- Agent execution time
- LLM token usage and costs
- API response times
- Database query performance
- Error rates
- Campaign delivery rates

### Logging

- Structured logging (JSON)
- Agent actions logged to database
- Error tracking (Sentry recommended)
- Performance monitoring (Vercel Analytics)

## Future Enhancements

1. **Advanced AI Features**
   - Multi-modal content (images, videos)
   - Voice/audio content generation
   - Real-time personalization
   - Predictive analytics

2. **Collaboration Features**
   - Team workspaces
   - Approval workflows
   - Comments and annotations
   - Version history

3. **Advanced Analytics**
   - Attribution modeling
   - Cohort analysis
   - Revenue tracking
   - ROI calculations

4. **Integrations**
   - CRM sync (Salesforce, HubSpot)
   - Analytics platforms (Google Analytics, Mixpanel)
   - Data warehouses (Snowflake, BigQuery)
   - Marketing clouds (Marketo, Braze)
