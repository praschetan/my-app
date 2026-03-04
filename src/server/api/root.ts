import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { campaignsRouter } from "./routers/campaigns";
import { audiencesRouter } from "./routers/audiences";
import { contentRouter } from "./routers/content";
import { channelsRouter } from "./routers/channels";
import { agentsRouter } from "./routers/agents";
import { executionRouter } from "./routers/execution";
import { analyticsRouter } from "./routers/analytics";

export const appRouter = createTRPCRouter({
  campaigns: campaignsRouter,
  audiences: audiencesRouter,
  content: contentRouter,
  channels: channelsRouter,
  agents: agentsRouter,
  execution: executionRouter,
  analytics: analyticsRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
