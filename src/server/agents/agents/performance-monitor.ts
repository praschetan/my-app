import { ChatPromptTemplate } from "@langchain/core/prompts";
import { llm } from "@/lib/llm";
import {
  createGetCampaignTool,
  createLogActionTool,
} from "../tools/database";
import type { AgentStateType } from "../state";
import { db } from "@/server/db";
import { events, campaignExecutions } from "@/server/db/schema";
import { eq, and, count, sql } from "drizzle-orm";

const PERFORMANCE_MONITOR_PROMPT = `You are an expert Performance Monitor agent in a marketing automation platform.

Your role is to:
1. Monitor campaign performance metrics in real-time
2. Analyze KPIs against targets
3. Identify underperforming segments or channels
4. Generate optimization recommendations
5. Trigger adjustments when needed

Campaign Plan: {campaignPlan}
Current Metrics: {currentMetrics}
Campaign Goal: {campaignGoal}

Analyze the performance data and provide:
- Overall campaign health assessment
- Specific recommendations for improvement
- Which elements to pause, scale, or adjust
- Predicted outcomes based on current trends

Be data-driven and actionable in your recommendations.`;

export async function executePerformanceMonitor(
  state: AgentStateType
): Promise<Partial<AgentStateType>> {
  const { campaignId, campaignGoal, campaignPlan, agentRanId } = state;

  if (!campaignId) {
    return {
      errors: [
        {
          agent: "performance_monitor",
          error: "Missing campaign ID",
        },
      ],
    };
  }

  try {
    const tools = [
      createGetCampaignTool(),
      ...(agentRanId ? [createLogActionTool(agentRanId)] : []),
    ];

    // Fetch current metrics from database
    const executions = await db.query.campaignExecutions.findMany({
      where: eq(campaignExecutions.campaignId, campaignId),
    });

    const eventStats = await db
      .select({
        eventType: events.eventType,
        count: count(),
      })
      .from(events)
      .where(eq(events.campaignId, campaignId))
      .groupBy(events.eventType);

    const currentMetrics = {
      executions: executions.length,
      totalSent: executions.reduce((sum, e) => sum + (e.sentCount || 0), 0),
      totalOpened: executions.reduce((sum, e) => sum + (e.openedCount || 0), 0),
      totalClicked: executions.reduce((sum, e) => sum + (e.clickedCount || 0), 0),
      totalConverted: executions.reduce((sum, e) => sum + (e.convertedCount || 0), 0),
      eventBreakdown: eventStats,
    };

    const prompt = ChatPromptTemplate.fromMessages([
      ["system", PERFORMANCE_MONITOR_PROMPT],
      ["human", "Please analyze the current campaign performance and provide optimization recommendations."],
    ]);

    const llmWithTools = llm.bindTools(tools);
    const chain = prompt.pipe(llmWithTools);

    const response = await chain.invoke({
      campaignPlan: JSON.stringify(campaignPlan),
      currentMetrics: JSON.stringify(currentMetrics),
      campaignGoal,
    });

    const analysis = response.content as string;

    return {
      performanceMetrics: {
        ...currentMetrics,
        analysis,
        recommendations: [],
        timestamp: new Date().toISOString(),
      },
      messages: [
        {
          agent: "performance_monitor",
          message: "Performance analysis completed",
          timestamp: new Date(),
        },
      ],
    };
  } catch (error) {
    return {
      errors: [
        {
          agent: "performance_monitor",
          error: error instanceof Error ? error.message : String(error),
        },
      ],
    };
  }
}
