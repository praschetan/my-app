import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { db } from "@/server/db";
import {
  campaigns,
  audiences,
  content,
  channels,
  agentActions,
} from "@/server/db/schema";
import { eq } from "drizzle-orm";

export function createGetCampaignTool() {
  return new DynamicStructuredTool({
    name: "get_campaign",
    description: "Get campaign details by ID",
    schema: z.object({
      campaignId: z.string().describe("The campaign ID"),
    }),
    func: async ({ campaignId }) => {
      const campaign = await db.query.campaigns.findFirst({
        where: eq(campaigns.id, campaignId),
        with: {
          audiences: { with: { members: true } },
          content: { with: { variants: true } },
          executions: true,
        },
      });
      return JSON.stringify(campaign, null, 2);
    },
  });
}

export function createUpdateCampaignTool() {
  return new DynamicStructuredTool({
    name: "update_campaign",
    description: "Update campaign with AI-generated plan and change status",
    schema: z.object({
      campaignId: z.string().describe("The campaign ID"),
      status: z
        .enum(["draft", "planning", "ready", "scheduled", "running", "paused", "completed", "failed"])
        .optional()
        .describe("New campaign status"),
      aiPlan: z.record(z.unknown()).optional().describe("AI-generated campaign plan"),
    }),
    func: async ({ campaignId, status, aiPlan }) => {
      const [updated] = await db
        .update(campaigns)
        .set({
          ...(status && { status }),
          ...(aiPlan && { aiPlan }),
          updatedAt: new Date(),
        })
        .where(eq(campaigns.id, campaignId))
        .returning();
      return JSON.stringify(updated, null, 2);
    },
  });
}

export function createCreateAudienceTool() {
  return new DynamicStructuredTool({
    name: "create_audience",
    description: "Create a new audience segment for a campaign",
    schema: z.object({
      campaignId: z.string().describe("The campaign ID"),
      name: z.string().describe("Audience segment name"),
      description: z.string().optional().describe("Audience description"),
      criteria: z.record(z.unknown()).describe("Segmentation criteria"),
      aiInsights: z.record(z.unknown()).optional().describe("AI-generated insights"),
    }),
    func: async ({ campaignId, name, description, criteria, aiInsights }) => {
      const [audience] = await db
        .insert(audiences)
        .values({
          campaignId,
          name,
          description,
          criteria,
          aiInsights,
        })
        .returning();
      return JSON.stringify(audience, null, 2);
    },
  });
}

export function createCreateContentTool() {
  return new DynamicStructuredTool({
    name: "create_content",
    description: "Create marketing content for a campaign",
    schema: z.object({
      campaignId: z.string().describe("The campaign ID"),
      type: z
        .enum(["email", "sms", "social_post", "landing_page", "ad_copy"])
        .describe("Content type"),
      title: z.string().describe("Content title"),
      body: z.string().describe("Content body"),
      subject: z.string().optional().describe("Email subject line"),
      aiGenerationPrompt: z.string().optional().describe("Prompt used to generate this content"),
    }),
    func: async ({ campaignId, type, title, body, subject, aiGenerationPrompt }) => {
      const [contentItem] = await db
        .insert(content)
        .values({
          campaignId,
          type,
          title,
          body,
          subject,
          aiGenerationPrompt,
        })
        .returning();
      return JSON.stringify(contentItem, null, 2);
    },
  });
}

export function createLogActionTool(runId: string) {
  return new DynamicStructuredTool({
    name: "log_action",
    description: "Log an agent action for audit trail",
    schema: z.object({
      agent: z
        .enum(["campaign_planner", "audience_analyzer", "content_creator", "channel_optimizer", "performance_monitor"])
        .describe("Agent taking the action"),
      action: z.string().describe("Action being taken"),
      input: z.record(z.unknown()).optional().describe("Action input"),
      output: z.record(z.unknown()).optional().describe("Action output"),
      reasoning: z.string().optional().describe("Agent's reasoning"),
    }),
    func: async ({ agent, action, input, output, reasoning }) => {
      const [logged] = await db
        .insert(agentActions)
        .values({
          runId,
          agent,
          action,
          input,
          output,
          reasoning,
          success: true,
        })
        .returning();
      return JSON.stringify(logged, null, 2);
    },
  });
}

export function createGetChannelsTool() {
  return new DynamicStructuredTool({
    name: "get_channels",
    description: "Get all available and configured channels",
    schema: z.object({}),
    func: async () => {
      const allChannels = await db.query.channels.findMany({
        where: eq(channels.isActive, true),
      });
      return JSON.stringify(allChannels, null, 2);
    },
  });
}
