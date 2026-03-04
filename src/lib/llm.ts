import { ChatAnthropic } from "@langchain/anthropic";
import { ChatOpenAI } from "@langchain/openai";

export function createLLM(model: "claude" | "openai" = "claude") {
  if (model === "claude") {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error(
        "ANTHROPIC_API_KEY environment variable is required. " +
        "Please set it in your Railway dashboard under Settings > Variables."
      );
    }
    return new ChatAnthropic({
      modelName: "claude-sonnet-4-6",
      temperature: 0.7,
      apiKey,
    });
  } else {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY environment variable is required.");
    }
    return new ChatOpenAI({
      modelName: "gpt-4-turbo-preview",
      temperature: 0.7,
      apiKey,
    });
  }
}

// Lazy initialization - only create LLM when first accessed at runtime
let _llm: ChatAnthropic | ChatOpenAI | null = null;
export function getLLM() {
  if (!_llm) {
    _llm = createLLM("claude");
  }
  return _llm;
}
