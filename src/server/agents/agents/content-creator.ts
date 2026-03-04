import { ChatPromptTemplate } from "@langchain/core/prompts";
import { getLLM } from "@/lib/llm";
import {
  createGetCampaignTool,
  createCreateContentTool,
  createLogActionTool,
} from "../tools/database";
import type { AgentStateType } from "../state";

const CONTENT_CREATOR_PROMPT = `You are an expert Content Creator agent in a marketing automation platform.

Your role is to:
1. Analyze the campaign plan and audience insights
2. Generate compelling, personalized content for each channel
3. Adapt messaging for different audience segments
4. Create variations for A/B testing
5. Ensure brand consistency and best practices

Campaign Plan: {campaignPlan}
Audience Insights: {audienceInsights}
Campaign Goal: {campaignGoal}

Create high-quality marketing content for this campaign. Consider:
- Channel-specific best practices (email, SMS, social media)
- Audience segment personalization
- Clear calls-to-action
- Engaging headlines and copy
- Mobile-first design

Generate 3-5 content pieces across different channels and save them using the create_content tool.`;

export async function executeContentCreator(
  state: AgentStateType
): Promise<Partial<AgentStateType>> {
  const { campaignId, campaignGoal, campaignPlan, audienceInsights, agentRanId } = state;

  if (!campaignId || !campaignPlan) {
    return {
      errors: [
        {
          agent: "content_creator",
          error: "Missing campaign plan",
        },
      ],
    };
  }

  try {
    const tools = [
      createGetCampaignTool(),
      createCreateContentTool(),
      ...(agentRanId ? [createLogActionTool(agentRanId)] : []),
    ];

    const prompt = ChatPromptTemplate.fromMessages([
      ["system", CONTENT_CREATOR_PROMPT],
      ["human", "Please create compelling content for this campaign across multiple channels."],
    ]);

    const llmWithTools = getLLM().bindTools(tools);
    const chain = prompt.pipe(llmWithTools);

    const response = await chain.invoke({
      campaignPlan: JSON.stringify(campaignPlan),
      audienceInsights: JSON.stringify(audienceInsights),
      campaignGoal,
    });

    // Process tool calls
    const createdContent = [];
    if (response.tool_calls && response.tool_calls.length > 0) {
      for (const toolCall of response.tool_calls) {
        const tool = tools.find((t) => t.name === toolCall.name);
        if (tool) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const result = await (tool as any).invoke(toolCall.args);
          if (toolCall.name === "create_content") {
            createdContent.push(JSON.parse(result));
          }
        }
      }
    }

    return {
      generatedContent: createdContent.map((content) => ({
        id: content.id,
        type: content.type,
        title: content.title,
        body: content.body,
      })),
      messages: [
        {
          agent: "content_creator",
          message: `Generated ${createdContent.length} content pieces`,
          timestamp: new Date(),
        },
      ],
    };
  } catch (error) {
    return {
      errors: [
        {
          agent: "content_creator",
          error: error instanceof Error ? error.message : String(error),
        },
      ],
    };
  }
}
