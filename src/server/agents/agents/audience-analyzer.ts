import { ChatPromptTemplate } from "@langchain/core/prompts";
import { llm } from "@/lib/llm";
import {
  createGetCampaignTool,
  createCreateAudienceTool,
  createLogActionTool,
} from "../tools/database";
import type { AgentStateType } from "../state";

const AUDIENCE_ANALYZER_PROMPT = `You are an expert Audience Analyzer agent in a marketing automation platform.

Your role is to:
1. Analyze the campaign plan and goals
2. Identify optimal audience segments
3. Define segmentation criteria (demographics, behaviors, interests)
4. Generate insights about each segment
5. Create audience records in the database

Campaign Plan: {campaignPlan}
Campaign Goal: {campaignGoal}

Create 2-4 specific audience segments that would be most relevant for this campaign. For each segment:
- Define clear targeting criteria
- Explain why this segment is valuable
- Suggest personalization strategies

Use the create_audience tool to save each segment to the database.`;

export async function executeAudienceAnalyzer(
  state: AgentStateType
): Promise<Partial<AgentStateType>> {
  const { campaignId, campaignGoal, campaignPlan, agentRanId } = state;

  if (!campaignId || !campaignPlan) {
    return {
      errors: [
        {
          agent: "audience_analyzer",
          error: "Missing campaign plan - this agent depends on campaign_planner",
        },
      ],
    };
  }

  try {
    const tools = [
      createGetCampaignTool(),
      createCreateAudienceTool(),
      ...(agentRanId ? [createLogActionTool(agentRanId)] : []),
    ];

    const prompt = ChatPromptTemplate.fromMessages([
      ["system", AUDIENCE_ANALYZER_PROMPT],
      ["human", "Please analyze the campaign and create optimal audience segments."],
    ]);

    const llmWithTools = llm.bindTools(tools);
    const chain = prompt.pipe(llmWithTools);

    const response = await chain.invoke({
      campaignPlan: JSON.stringify(campaignPlan),
      campaignGoal,
    });

    // Process tool calls
    const audienceSegments = [];
    if (response.tool_calls && response.tool_calls.length > 0) {
      for (const toolCall of response.tool_calls) {
        const tool = tools.find((t) => t.name === toolCall.name);
        if (tool) {
          const result = await tool.invoke(toolCall.args);
          if (toolCall.name === "create_audience") {
            audienceSegments.push(JSON.parse(result));
          }
        }
      }
    }

    return {
      audienceInsights: audienceSegments.map((seg) => ({
        id: seg.id,
        name: seg.name,
        criteria: seg.criteria,
        insights: seg.aiInsights,
      })),
      messages: [
        {
          agent: "audience_analyzer",
          message: `Created ${audienceSegments.length} audience segments`,
          timestamp: new Date(),
        },
      ],
    };
  } catch (error) {
    return {
      errors: [
        {
          agent: "audience_analyzer",
          error: error instanceof Error ? error.message : String(error),
        },
      ],
    };
  }
}
