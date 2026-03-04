import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { agentRuns, agentActions, campaigns } from "@/server/db/schema";
import { eq, desc } from "drizzle-orm";
import { observable } from "@trpc/server/observable";
import { executeAgentWorkflow } from "@/server/agents/graph";

export const agentsRouter = createTRPCRouter({
  listRuns: publicProcedure
    .input(
      z.object({
        campaignId: z.string().uuid().optional(),
        limit: z.number().default(50),
      })
    )
    .query(async ({ ctx, input }) => {
      const where = input.campaignId
        ? eq(agentRuns.campaignId, input.campaignId)
        : undefined;

      return await ctx.db.query.agentRuns.findMany({
        where,
        orderBy: [desc(agentRuns.createdAt)],
        limit: input.limit,
        with: {
          campaign: true,
          actions: {
            orderBy: [desc(agentActions.timestamp)],
          },
        },
      });
    }),

  getRunById: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.query.agentRuns.findFirst({
        where: eq(agentRuns.id, input.id),
        with: {
          campaign: true,
          actions: {
            orderBy: [desc(agentActions.timestamp)],
          },
        },
      });
    }),

  getRunByThread: publicProcedure
    .input(z.object({ threadId: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.query.agentRuns.findFirst({
        where: eq(agentRuns.threadId, input.threadId),
        with: {
          campaign: true,
          actions: {
            orderBy: [desc(agentActions.timestamp)],
          },
        },
      });
    }),

  triggerWorkflow: publicProcedure
    .input(
      z.object({
        campaignId: z.string().uuid(),
        input: z.record(z.any()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Get campaign details
      const campaign = await ctx.db.query.campaigns.findFirst({
        where: eq(campaigns.id, input.campaignId),
      });

      if (!campaign) {
        throw new Error("Campaign not found");
      }

      // Create agent run record
      const threadId = `thread_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      const [run] = await ctx.db
        .insert(agentRuns)
        .values({
          campaignId: input.campaignId,
          threadId,
          status: "pending",
          input: input.input || {},
        })
        .returning();

      // Trigger LangGraph workflow asynchronously
      executeAgentWorkflow({
        campaignId: campaign.id,
        campaignGoal: campaign.goal,
        agentRanId: run.id,
        threadId,
      }).catch((error) => {
        console.error("Agent workflow failed:", error);
      });

      return run;
    }),

  onRunUpdate: publicProcedure
    .input(z.object({ runId: z.string().uuid() }))
    .subscription(({ input }) => {
      return observable<{ status: string; currentAgent?: string }>((emit) => {
        // TODO: Implement real-time updates in Phase 3
        // For now, this is a placeholder
        const interval = setInterval(async () => {
          emit.next({
            status: "pending",
          });
        }, 1000);

        return () => {
          clearInterval(interval);
        };
      });
    }),
});
