import { ChatAnthropic } from "@langchain/anthropic";
import { ChatOpenAI } from "@langchain/openai";

export function createLLM(model: "claude" | "openai" = "claude") {
  if (model === "claude") {
    return new ChatAnthropic({
      modelName: "claude-sonnet-4-6",
      temperature: 0.7,
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  } else {
    return new ChatOpenAI({
      modelName: "gpt-4-turbo-preview",
      temperature: 0.7,
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
}

export const llm = createLLM("claude");
