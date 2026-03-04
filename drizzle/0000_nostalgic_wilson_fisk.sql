CREATE TYPE "public"."agent_status" AS ENUM('pending', 'running', 'completed', 'failed', 'paused');--> statement-breakpoint
CREATE TYPE "public"."agent_type" AS ENUM('campaign_planner', 'audience_analyzer', 'content_creator', 'channel_optimizer', 'performance_monitor');--> statement-breakpoint
CREATE TYPE "public"."campaign_status" AS ENUM('draft', 'planning', 'ready', 'scheduled', 'running', 'paused', 'completed', 'failed');--> statement-breakpoint
CREATE TYPE "public"."channel_type" AS ENUM('email', 'sms', 'facebook', 'instagram', 'twitter', 'linkedin');--> statement-breakpoint
CREATE TYPE "public"."content_type" AS ENUM('email', 'sms', 'social_post', 'landing_page', 'ad_copy');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "agent_actions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"run_id" uuid NOT NULL,
	"agent" "agent_type" NOT NULL,
	"action" text NOT NULL,
	"input" jsonb,
	"output" jsonb,
	"reasoning" text,
	"success" boolean DEFAULT true NOT NULL,
	"error" text,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "agent_runs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campaign_id" uuid,
	"thread_id" text NOT NULL,
	"status" "agent_status" DEFAULT 'pending' NOT NULL,
	"current_agent" "agent_type",
	"state" jsonb,
	"input" jsonb,
	"output" jsonb,
	"error" text,
	"started_at" timestamp,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "agent_runs_thread_id_unique" UNIQUE("thread_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "audience_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"audience_id" uuid NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"first_name" text,
	"last_name" text,
	"attributes" jsonb,
	"engagement_score" real DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "audiences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campaign_id" uuid,
	"name" text NOT NULL,
	"description" text,
	"criteria" jsonb NOT NULL,
	"ai_insights" jsonb,
	"member_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "campaign_executions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campaign_id" uuid NOT NULL,
	"channel_id" uuid NOT NULL,
	"content_id" uuid,
	"status" text DEFAULT 'scheduled' NOT NULL,
	"target_audience_size" integer DEFAULT 0,
	"sent_count" integer DEFAULT 0,
	"delivered_count" integer DEFAULT 0,
	"opened_count" integer DEFAULT 0,
	"clicked_count" integer DEFAULT 0,
	"converted_count" integer DEFAULT 0,
	"failed_count" integer DEFAULT 0,
	"started_at" timestamp,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "campaigns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"goal" text NOT NULL,
	"status" "campaign_status" DEFAULT 'draft' NOT NULL,
	"ai_plan" jsonb,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"scheduled_at" timestamp,
	"started_at" timestamp,
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "channels" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" "channel_type" NOT NULL,
	"name" text NOT NULL,
	"configuration" jsonb NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"daily_limit" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "content" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campaign_id" uuid,
	"type" "content_type" NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"subject" text,
	"metadata" jsonb,
	"ai_generation_prompt" text,
	"version" integer DEFAULT 1 NOT NULL,
	"parent_id" uuid,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "content_variants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"content_id" uuid NOT NULL,
	"name" text NOT NULL,
	"body" text NOT NULL,
	"subject" text,
	"metadata" jsonb,
	"traffic_percentage" integer DEFAULT 50,
	"sent_count" integer DEFAULT 0,
	"opened_count" integer DEFAULT 0,
	"clicked_count" integer DEFAULT 0,
	"converted_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campaign_id" uuid NOT NULL,
	"execution_id" uuid,
	"audience_member_id" uuid,
	"event_type" text NOT NULL,
	"channel_type" "channel_type" NOT NULL,
	"metadata" jsonb,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "agent_actions" ADD CONSTRAINT "agent_actions_run_id_agent_runs_id_fk" FOREIGN KEY ("run_id") REFERENCES "public"."agent_runs"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "agent_runs" ADD CONSTRAINT "agent_runs_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "audience_members" ADD CONSTRAINT "audience_members_audience_id_audiences_id_fk" FOREIGN KEY ("audience_id") REFERENCES "public"."audiences"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "audiences" ADD CONSTRAINT "audiences_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "campaign_executions" ADD CONSTRAINT "campaign_executions_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "campaign_executions" ADD CONSTRAINT "campaign_executions_channel_id_channels_id_fk" FOREIGN KEY ("channel_id") REFERENCES "public"."channels"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "campaign_executions" ADD CONSTRAINT "campaign_executions_content_id_content_id_fk" FOREIGN KEY ("content_id") REFERENCES "public"."content"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "content" ADD CONSTRAINT "content_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "content_variants" ADD CONSTRAINT "content_variants_content_id_content_id_fk" FOREIGN KEY ("content_id") REFERENCES "public"."content"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "events" ADD CONSTRAINT "events_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "events" ADD CONSTRAINT "events_execution_id_campaign_executions_id_fk" FOREIGN KEY ("execution_id") REFERENCES "public"."campaign_executions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "events" ADD CONSTRAINT "events_audience_member_id_audience_members_id_fk" FOREIGN KEY ("audience_member_id") REFERENCES "public"."audience_members"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "action_run_idx" ON "agent_actions" USING btree ("run_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "action_agent_idx" ON "agent_actions" USING btree ("agent");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "action_timestamp_idx" ON "agent_actions" USING btree ("timestamp");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "agent_run_thread_idx" ON "agent_runs" USING btree ("thread_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "agent_run_campaign_idx" ON "agent_runs" USING btree ("campaign_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "agent_run_status_idx" ON "agent_runs" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "member_audience_idx" ON "audience_members" USING btree ("audience_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "member_email_idx" ON "audience_members" USING btree ("email");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "audience_campaign_idx" ON "audiences" USING btree ("campaign_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "execution_campaign_idx" ON "campaign_executions" USING btree ("campaign_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "execution_status_idx" ON "campaign_executions" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "channel_type_idx" ON "channels" USING btree ("type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "content_campaign_idx" ON "content" USING btree ("campaign_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "content_type_idx" ON "content" USING btree ("type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "variant_content_idx" ON "content_variants" USING btree ("content_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "event_campaign_idx" ON "events" USING btree ("campaign_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "event_type_idx" ON "events" USING btree ("event_type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "event_timestamp_idx" ON "events" USING btree ("timestamp");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "event_member_idx" ON "events" USING btree ("audience_member_id");