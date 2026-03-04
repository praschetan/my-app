import { Annotation } from "@langchain/langgraph";

export const AgentState = Annotation.Root({
  // Campaign context
  campaignId: Annotation<string>(),
  campaignGoal: Annotation<string>(),

  // Current workflow state
  currentStep: Annotation<string>(),
  agentRanId: Annotation<string | null>({
    reducer: (_, newValue) => newValue,
    default: () => null,
  }),

  // Outputs from each agent
  campaignPlan: Annotation<Record<string, unknown> | null>({
    reducer: (_, newValue) => newValue,
    default: () => null,
  }),
  audienceInsights: Annotation<Array<Record<string, unknown>>>({
    reducer: (current, newValue) => [...current, ...newValue],
    default: () => [],
  }),
  generatedContent: Annotation<Array<Record<string, unknown>>>({
    reducer: (current, newValue) => [...current, ...newValue],
    default: () => [],
  }),
  channelStrategy: Annotation<Record<string, unknown> | null>({
    reducer: (_, newValue) => newValue,
    default: () => null,
  }),
  performanceMetrics: Annotation<Record<string, unknown> | null>({
    reducer: (_, newValue) => newValue,
    default: () => null,
  }),

  // Agent messages and history
  messages: Annotation<Array<{ agent: string; message: string; timestamp: Date }>>({
    reducer: (current, newValue) => [...current, ...newValue],
    default: () => [],
  }),

  // Error handling
  errors: Annotation<Array<{ agent: string; error: string }>>({
    reducer: (current, newValue) => [...current, ...newValue],
    default: () => [],
  }),

  // Control flow
  needsHumanApproval: Annotation<boolean>({
    reducer: (_, newValue) => newValue,
    default: () => false,
  }),
  approved: Annotation<boolean>({
    reducer: (_, newValue) => newValue,
    default: () => false,
  }),
  shouldContinue: Annotation<boolean>({
    reducer: (_, newValue) => newValue,
    default: () => true,
  }),
});

export type AgentStateType = typeof AgentState.State;
