import { pgTable, text, timestamp, uuid, jsonb, integer, boolean, index, varchar, real, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Enums
export const campaignStatusEnum = pgEnum("campaign_status", [
  "draft",
  "planning",
  "ready",
  "scheduled",
  "running",
  "paused",
  "completed",
  "failed"
]);

export const contentTypeEnum = pgEnum("content_type", [
  "email",
  "sms",
  "social_post",
  "landing_page",
  "ad_copy"
]);

export const channelTypeEnum = pgEnum("channel_type", [
  "email",
  "sms",
  "facebook",
  "instagram",
  "twitter",
  "linkedin"
]);

export const agentTypeEnum = pgEnum("agent_type", [
  "campaign_planner",
  "audience_analyzer",
  "content_creator",
  "channel_optimizer",
  "performance_monitor"
]);

export const agentStatusEnum = pgEnum("agent_status", [
  "pending",
  "running",
  "completed",
  "failed",
  "paused"
]);

// Campaigns Table
export const campaigns = pgTable("campaigns", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  goal: text("goal").notNull(), // Business goal provided by user
  status: campaignStatusEnum("status").notNull().default("draft"),
  aiPlan: jsonb("ai_plan"), // AI-generated campaign plan
  metadata: jsonb("metadata"), // Additional campaign metadata
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  scheduledAt: timestamp("scheduled_at"),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
});

export const campaignsRelations = relations(campaigns, ({ many }) => ({
  audiences: many(audiences),
  content: many(content),
  executions: many(campaignExecutions),
}));

// Audiences Table
export const audiences = pgTable("audiences", {
  id: uuid("id").defaultRandom().primaryKey(),
  campaignId: uuid("campaign_id").references(() => campaigns.id),
  name: text("name").notNull(),
  description: text("description"),
  criteria: jsonb("criteria").notNull(), // Segmentation criteria
  aiInsights: jsonb("ai_insights"), // AI-generated insights
  memberCount: integer("member_count").default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  campaignIdx: index("audience_campaign_idx").on(table.campaignId),
}));

export const audiencesRelations = relations(audiences, ({ one, many }) => ({
  campaign: one(campaigns, {
    fields: [audiences.campaignId],
    references: [campaigns.id],
  }),
  members: many(audienceMembers),
}));

// Audience Members Table
export const audienceMembers = pgTable("audience_members", {
  id: uuid("id").defaultRandom().primaryKey(),
  audienceId: uuid("audience_id").references(() => audiences.id).notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  firstName: text("first_name"),
  lastName: text("last_name"),
  attributes: jsonb("attributes"), // Additional attributes
  engagementScore: real("engagement_score").default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  audienceIdx: index("member_audience_idx").on(table.audienceId),
  emailIdx: index("member_email_idx").on(table.email),
}));

export const audienceMembersRelations = relations(audienceMembers, ({ one }) => ({
  audience: one(audiences, {
    fields: [audienceMembers.audienceId],
    references: [audiences.id],
  }),
}));

// Content Table
export const content = pgTable("content", {
  id: uuid("id").defaultRandom().primaryKey(),
  campaignId: uuid("campaign_id").references(() => campaigns.id),
  type: contentTypeEnum("type").notNull(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  subject: text("subject"), // For emails
  metadata: jsonb("metadata"), // Additional content metadata
  aiGenerationPrompt: text("ai_generation_prompt"), // Prompt used to generate
  version: integer("version").notNull().default(1),
  parentId: uuid("parent_id"), // For versioning
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  campaignIdx: index("content_campaign_idx").on(table.campaignId),
  typeIdx: index("content_type_idx").on(table.type),
}));

export const contentRelations = relations(content, ({ one, many }) => ({
  campaign: one(campaigns, {
    fields: [content.campaignId],
    references: [campaigns.id],
  }),
  variants: many(contentVariants),
}));

// Content Variants Table (for A/B testing)
export const contentVariants = pgTable("content_variants", {
  id: uuid("id").defaultRandom().primaryKey(),
  contentId: uuid("content_id").references(() => content.id).notNull(),
  name: text("name").notNull(),
  body: text("body").notNull(),
  subject: text("subject"),
  metadata: jsonb("metadata"),
  trafficPercentage: integer("traffic_percentage").default(50),
  sentCount: integer("sent_count").default(0),
  openedCount: integer("opened_count").default(0),
  clickedCount: integer("clicked_count").default(0),
  convertedCount: integer("converted_count").default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  contentIdx: index("variant_content_idx").on(table.contentId),
}));

export const contentVariantsRelations = relations(contentVariants, ({ one }) => ({
  content: one(content, {
    fields: [contentVariants.contentId],
    references: [content.id],
  }),
}));

// Channels Table
export const channels = pgTable("channels", {
  id: uuid("id").defaultRandom().primaryKey(),
  type: channelTypeEnum("type").notNull(),
  name: text("name").notNull(),
  configuration: jsonb("configuration").notNull(), // API keys, credentials, etc.
  isActive: boolean("is_active").notNull().default(true),
  dailyLimit: integer("daily_limit"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  typeIdx: index("channel_type_idx").on(table.type),
}));

// Campaign Executions Table
export const campaignExecutions = pgTable("campaign_executions", {
  id: uuid("id").defaultRandom().primaryKey(),
  campaignId: uuid("campaign_id").references(() => campaigns.id).notNull(),
  channelId: uuid("channel_id").references(() => channels.id).notNull(),
  contentId: uuid("content_id").references(() => content.id),
  status: text("status").notNull().default("scheduled"), // scheduled, running, completed, failed
  targetAudienceSize: integer("target_audience_size").default(0),
  sentCount: integer("sent_count").default(0),
  deliveredCount: integer("delivered_count").default(0),
  openedCount: integer("opened_count").default(0),
  clickedCount: integer("clicked_count").default(0),
  convertedCount: integer("converted_count").default(0),
  failedCount: integer("failed_count").default(0),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  campaignIdx: index("execution_campaign_idx").on(table.campaignId),
  statusIdx: index("execution_status_idx").on(table.status),
}));

export const campaignExecutionsRelations = relations(campaignExecutions, ({ one }) => ({
  campaign: one(campaigns, {
    fields: [campaignExecutions.campaignId],
    references: [campaigns.id],
  }),
  channel: one(channels, {
    fields: [campaignExecutions.channelId],
    references: [channels.id],
  }),
  content: one(content, {
    fields: [campaignExecutions.contentId],
    references: [content.id],
  }),
}));

// Agent Runs Table (LangGraph workflow state)
export const agentRuns = pgTable("agent_runs", {
  id: uuid("id").defaultRandom().primaryKey(),
  campaignId: uuid("campaign_id").references(() => campaigns.id),
  threadId: text("thread_id").notNull().unique(), // LangGraph thread ID
  status: agentStatusEnum("status").notNull().default("pending"),
  currentAgent: agentTypeEnum("current_agent"),
  state: jsonb("state"), // LangGraph state snapshot
  input: jsonb("input"), // Initial input to workflow
  output: jsonb("output"), // Final workflow output
  error: text("error"),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  threadIdx: index("agent_run_thread_idx").on(table.threadId),
  campaignIdx: index("agent_run_campaign_idx").on(table.campaignId),
  statusIdx: index("agent_run_status_idx").on(table.status),
}));

export const agentRunsRelations = relations(agentRuns, ({ one, many }) => ({
  campaign: one(campaigns, {
    fields: [agentRuns.campaignId],
    references: [campaigns.id],
  }),
  actions: many(agentActions),
}));

// Agent Actions Table (detailed audit log)
export const agentActions = pgTable("agent_actions", {
  id: uuid("id").defaultRandom().primaryKey(),
  runId: uuid("run_id").references(() => agentRuns.id).notNull(),
  agent: agentTypeEnum("agent").notNull(),
  action: text("action").notNull(), // Action taken
  input: jsonb("input"), // Action input
  output: jsonb("output"), // Action output
  reasoning: text("reasoning"), // Agent's reasoning
  success: boolean("success").notNull().default(true),
  error: text("error"),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
}, (table) => ({
  runIdx: index("action_run_idx").on(table.runId),
  agentIdx: index("action_agent_idx").on(table.agent),
  timestampIdx: index("action_timestamp_idx").on(table.timestamp),
}));

export const agentActionsRelations = relations(agentActions, ({ one }) => ({
  run: one(agentRuns, {
    fields: [agentActions.runId],
    references: [agentRuns.id],
  }),
}));

// Events Table (time-series analytics)
export const events = pgTable("events", {
  id: uuid("id").defaultRandom().primaryKey(),
  campaignId: uuid("campaign_id").references(() => campaigns.id).notNull(),
  executionId: uuid("execution_id").references(() => campaignExecutions.id),
  audienceMemberId: uuid("audience_member_id").references(() => audienceMembers.id),
  eventType: text("event_type").notNull(), // sent, delivered, opened, clicked, converted, bounced, unsubscribed
  channelType: channelTypeEnum("channel_type").notNull(),
  metadata: jsonb("metadata"), // Additional event data
  timestamp: timestamp("timestamp").notNull().defaultNow(),
}, (table) => ({
  campaignIdx: index("event_campaign_idx").on(table.campaignId),
  typeIdx: index("event_type_idx").on(table.eventType),
  timestampIdx: index("event_timestamp_idx").on(table.timestamp),
  memberIdx: index("event_member_idx").on(table.audienceMemberId),
}));

export const eventsRelations = relations(events, ({ one }) => ({
  campaign: one(campaigns, {
    fields: [events.campaignId],
    references: [campaigns.id],
  }),
  execution: one(campaignExecutions, {
    fields: [events.executionId],
    references: [campaignExecutions.id],
  }),
  audienceMember: one(audienceMembers, {
    fields: [events.audienceMemberId],
    references: [audienceMembers.id],
  }),
}));

// Type exports
export type Campaign = typeof campaigns.$inferSelect;
export type NewCampaign = typeof campaigns.$inferInsert;
export type Audience = typeof audiences.$inferSelect;
export type NewAudience = typeof audiences.$inferInsert;
export type AudienceMember = typeof audienceMembers.$inferSelect;
export type NewAudienceMember = typeof audienceMembers.$inferInsert;
export type Content = typeof content.$inferSelect;
export type NewContent = typeof content.$inferInsert;
export type ContentVariant = typeof contentVariants.$inferSelect;
export type NewContentVariant = typeof contentVariants.$inferInsert;
export type Channel = typeof channels.$inferSelect;
export type NewChannel = typeof channels.$inferInsert;
export type CampaignExecution = typeof campaignExecutions.$inferSelect;
export type NewCampaignExecution = typeof campaignExecutions.$inferInsert;
export type AgentRun = typeof agentRuns.$inferSelect;
export type NewAgentRun = typeof agentRuns.$inferInsert;
export type AgentAction = typeof agentActions.$inferSelect;
export type NewAgentAction = typeof agentActions.$inferInsert;
export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;
