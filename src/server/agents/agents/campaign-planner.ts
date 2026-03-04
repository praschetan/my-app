import { ChatPromptTemplate } from "@langchain/core/prompts";
import { llm } from "@/lib/llm";
import {
  createGetCampaignTool,
  createUpdateCampaignTool,
  createCreateAudienceTool,
  createLogActionTool,
} from "../tools/database";
import type { AgentStateType } from "../state";

const CAMPAIGN_PLANNER_PROMPT = `You are an expert Campaign Planner agent in a marketing automation platform.

Your role is to:
1. Analyze the business goal provided by the user
2. Create a comprehensive campaign strategy
3. Define key performance indicators (KPIs)
4. Determine target audience segments
5. Plan the campaign timeline and milestones
6. Update the campaign with your strategic plan

Current Campaign Goal: {campaignGoal}

Think step by step:
- What are the key objectives?
- Who is the target audience?
- What channels should be used?
- What is the optimal timeline?
- What metrics will indicate success?

Create a detailed campaign plan and save it to the campaign. Then suggest audience segments to create.`;

export async function executeCampaignPlanner(
  state: AgentStateType
): Promise<Partial<AgentStateType>> {
  const { campaignId, campaignGoal, agentRanId } = state;

  if (!campaignId || !campaignGoal) {
    return {
      errors: [
        {
          agent: "campaign_planner",
          error: "Missing campaignId or campaignGoal",
        },
      ],
      shouldContinue: false,
    };
  }

  try {
    // Create tools for this agent
    const tools = [
      createGetCampaignTool(),
      createUpdateCampaignTool(),
      createCreateAudienceTool(),
      ...(agentRanId ? [createLogActionTool(agentRanId)] : []),
    ];

    const prompt = ChatPromptTemplate.fromMessages([
      ["system", CAMPAIGN_PLANNER_PROMPT],
      ["human", "Please analyze the campaign goal and create a comprehensive plan."],
    ]);

    const llmWithTools = llm.bindTools(tools);
    const chain = prompt.pipe(llmWithTools);

    // Execute the agent
    const response = await chain.invoke({
      campaignGoal,
    });

    // Process tool calls
    if (response.tool_calls && response.tool_calls.length > 0) {
      for (const toolCall of response.tool_calls) {
        const tool = tools.find((t) => t.name === toolCall.name);
        if (tool) {
          await tool.invoke(toolCall.args);
        }
      }
    }

    // Extract campaign plan from the response
    const planText = response.content as string;
    const plan = {
      strategy: planText,
      kpis: [],
      timeline: {},
      targetAudiences: [],
      recommendedChannels: [],
      createdAt: new Date().toISOString(),
    };

    return {
      campaignPlan: plan,
      currentStep: "audience_analysis",
      messages: [
        {
          agent: "campaign_planner",
          message: `Campaign plan created: ${planText.slice(0, 200)}...`,
          timestamp: new Date(),
        },
      ],
    };
  } catch (error) {
    return {
      errors: [
        {
          agent: "campaign_planner",
          error: error instanceof Error ? error.message : String(error),
        },
      ],
      shouldContinue: false,
    };
  }
}
