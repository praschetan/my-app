import { StateGraph, START, END, MemorySaver } from "@langchain/langgraph";
import { AgentState, type AgentStateType } from "./state";
import { executeCampaignPlanner } from "./agents/campaign-planner";
import { executeAudienceAnalyzer } from "./agents/audience-analyzer";
import { executeContentCreator } from "./agents/content-creator";
import { executeChannelOptimizer } from "./agents/channel-optimizer";
import { executePerformanceMonitor } from "./agents/performance-monitor";
import { db } from "@/server/db";
import { agentRuns } from "@/server/db/schema";
import { eq } from "drizzle-orm";

// Checkpoint saver using PostgreSQL
// For now using in-memory, will add PostgreSQL persistence later
const checkpointSaver = new MemorySaver();

// Router function to determine next step after parallel execution
function routeAfterParallel(state: AgentStateType): string {
  // Check if there are errors
  if (state.errors && state.errors.length > 0) {
    return "handle_errors";
  }

  // If both audience analysis and content creation completed, move to channel optimization
  if (state.audienceInsights.length > 0 && state.generatedContent.length > 0) {
    return "channel_optimizer";
  }

  // Otherwise, complete
  return "complete";
}

// Define the workflow
const workflow = new StateGraph(AgentState)
  .addNode("campaign_planner", executeCampaignPlanner)
  .addNode("audience_analyzer", executeAudienceAnalyzer)
  .addNode("content_creator", executeContentCreator)
  .addNode("channel_optimizer", executeChannelOptimizer)
  .addNode("performance_monitor", executePerformanceMonitor)
  .addNode("handle_errors", async (state: AgentStateType) => {
    // Error handling node
    if (state.agentRanId) {
      await db
        .update(agentRuns)
        .set({
          status: "failed",
          error: JSON.stringify(state.errors),
          completedAt: new Date(),
        })
        .where(eq(agentRuns.id, state.agentRanId));
    }

    return {
      currentStep: "failed",
      shouldContinue: false,
    };
  })
  .addNode("complete", async (state: AgentStateType) => {
    // Mark workflow as complete
    if (state.agentRanId) {
      await db
        .update(agentRuns)
        .set({
          status: "completed",
          completedAt: new Date(),
          output: {
            plan: state.campaignPlan,
            audiences: state.audienceInsights,
            content: state.generatedContent,
            channelStrategy: state.channelStrategy,
            performance: state.performanceMetrics,
          },
        })
        .where(eq(agentRuns.id, state.agentRanId));
    }

    return {
      currentStep: "completed",
      shouldContinue: false,
    };
  });

// Define workflow edges
workflow
  .addEdge(START, "campaign_planner")
  .addEdge("campaign_planner", "audience_analyzer")
  .addEdge("campaign_planner", "content_creator")
  .addConditionalEdges("audience_analyzer", routeAfterParallel)
  .addConditionalEdges("content_creator", routeAfterParallel)
  .addEdge("channel_optimizer", "performance_monitor")
  .addEdge("performance_monitor", "complete")
  .addEdge("handle_errors", END)
  .addEdge("complete", END);

// Compile the graph
export const agentGraph = workflow.compile({
  checkpointer: checkpointSaver,
});

// Execute workflow helper
export async function executeAgentWorkflow(input: {
  campaignId: string;
  campaignGoal: string;
  agentRanId?: string;
  threadId: string;
}) {
  const { campaignId, campaignGoal, agentRanId, threadId } = input;

  const config = {
    configurable: { thread_id: threadId },
  };

  const initialState: Partial<AgentStateType> = {
    campaignId,
    campaignGoal,
    agentRanId: agentRanId || null,
    currentStep: "starting",
    shouldContinue: true,
  };

  // Update agent run status to running
  if (agentRanId) {
    await db
      .update(agentRuns)
      .set({
        status: "running",
        startedAt: new Date(),
      })
      .where(eq(agentRuns.id, agentRanId));
  }

  try {
    const result = await agentGraph.invoke(initialState, config);
    return result;
  } catch (error) {
    // Update agent run with error
    if (agentRanId) {
      await db
        .update(agentRuns)
        .set({
          status: "failed",
          error: error instanceof Error ? error.message : String(error),
          completedAt: new Date(),
        })
        .where(eq(agentRuns.id, agentRanId));
    }
    throw error;
  }
}
