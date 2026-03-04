import { ChatPromptTemplate } from "@langchain/core/prompts";
import { llm } from "@/lib/llm";
import {
  createGetCampaignTool,
  createGetChannelsTool,
  createLogActionTool,
} from "../tools/database";
import type { AgentStateType } from "../state";

const CHANNEL_OPTIMIZER_PROMPT = `You are an expert Channel Optimizer agent in a marketing automation platform.

Your role is to:
1. Analyze campaign goals, audience segments, and content
2. Recommend optimal channels for each audience segment
3. Determine best sending times and frequency
4. Create A/B testing strategies
5. Set up channel-specific optimizations

Campaign Plan: {campaignPlan}
Audiences: {audienceInsights}
Content: {generatedContent}
Available Channels: {availableChannels}

Provide recommendations for:
- Which channels to use for each audience segment
- Optimal sending times based on audience behavior
- A/B test setup (what to test, sample sizes)
- Budget allocation across channels
- Frequency caps to avoid fatigue

Return your strategy as structured recommendations.`;

export async function executeChannelOptimizer(
  state: AgentStateType
): Promise<Partial<AgentStateType>> {
  const {
    campaignId,
    campaignPlan,
    audienceInsights,
    generatedContent,
    agentRanId,
  } = state;

  if (!campaignId || !campaignPlan) {
    return {
      errors: [
        {
          agent: "channel_optimizer",
          error: "Missing campaign plan or content",
        },
      ],
    };
  }

  try {
    const tools = [
      createGetCampaignTool(),
      createGetChannelsTool(),
      ...(agentRanId ? [createLogActionTool(agentRanId)] : []),
    ];

    // Get available channels
    const channelsTool = createGetChannelsTool();
    const availableChannels = await channelsTool.invoke({});

    const prompt = ChatPromptTemplate.fromMessages([
      ["system", CHANNEL_OPTIMIZER_PROMPT],
      ["human", "Please analyze and create an optimal channel strategy for this campaign."],
    ]);

    const llmWithTools = llm.bindTools(tools);
    const chain = prompt.pipe(llmWithTools);

    const response = await chain.invoke({
      campaignPlan: JSON.stringify(campaignPlan),
      audienceInsights: JSON.stringify(audienceInsights),
      generatedContent: JSON.stringify(generatedContent),
      availableChannels,
    });

    // Extract strategy from response
    const strategyText = response.content as string;
    const strategy = {
      recommendations: strategyText,
      channelMix: [],
      sendingSchedule: {},
      abTests: [],
      createdAt: new Date().toISOString(),
    };

    return {
      channelStrategy: strategy,
      messages: [
        {
          agent: "channel_optimizer",
          message: "Channel optimization strategy created",
          timestamp: new Date(),
        },
      ],
    };
  } catch (error) {
    return {
      errors: [
        {
          agent: "channel_optimizer",
          error: error instanceof Error ? error.message : String(error),
        },
      ],
    };
  }
}
