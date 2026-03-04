import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { campaignExecutions, campaigns, channels, content, events } from "@/server/db/schema";
import { eq, desc, and, gte } from "drizzle-orm";

export const executionRouter = createTRPCRouter({
  list: publicProcedure
    .input(
      z.object({
        campaignId: z.string().uuid().optional(),
        limit: z.number().default(50),
      })
    )
    .query(async ({ ctx, input }) => {
      const where = input.campaignId
        ? eq(campaignExecutions.campaignId, input.campaignId)
        : undefined;

      return await ctx.db.query.campaignExecutions.findMany({
        where,
        orderBy: [desc(campaignExecutions.createdAt)],
        limit: input.limit,
        with: {
          campaign: true,
          channel: true,
          content: true,
        },
      });
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.query.campaignExecutions.findFirst({
        where: eq(campaignExecutions.id, input.id),
        with: {
          campaign: true,
          channel: true,
          content: true,
        },
      });
    }),

  create: publicProcedure
    .input(
      z.object({
        campaignId: z.string().uuid(),
        channelId: z.string().uuid(),
        contentId: z.string().uuid(),
        targetAudienceSize: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [execution] = await ctx.db
        .insert(campaignExecutions)
        .values({
          ...input,
          status: "scheduled",
        })
        .returning();
      return execution;
    }),

  execute: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const execution = await ctx.db.query.campaignExecutions.findFirst({
        where: eq(campaignExecutions.id, input.id),
        with: {
          campaign: true,
          channel: true,
          content: true,
        },
      });

      if (!execution) {
        throw new Error("Execution not found");
      }

      // TODO: Implement actual execution logic in Phase 5
      // For now, simulate execution
      const [updated] = await ctx.db
        .update(campaignExecutions)
        .set({
          status: "running",
          startedAt: new Date(),
        })
        .where(eq(campaignExecutions.id, input.id))
        .returning();

      // Simulate completion after a moment
      setTimeout(async () => {
        await ctx.db
          .update(campaignExecutions)
          .set({
            status: "completed",
            completedAt: new Date(),
            sentCount: execution.targetAudienceSize || 100,
          })
          .where(eq(campaignExecutions.id, input.id));
      }, 2000);

      return updated;
    }),

  trackEvent: publicProcedure
    .input(
      z.object({
        campaignId: z.string().uuid(),
        executionId: z.string().uuid().optional(),
        audienceMemberId: z.string().uuid().optional(),
        eventType: z.enum([
          "sent",
          "delivered",
          "opened",
          "clicked",
          "converted",
          "bounced",
          "unsubscribed",
        ]),
        channelType: z.enum(["email", "sms", "facebook", "instagram", "twitter", "linkedin"]),
        metadata: z.record(z.any()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [event] = await ctx.db
        .insert(events)
        .values(input)
        .returning();

      // Update execution counts
      if (input.executionId) {
        const execution = await ctx.db.query.campaignExecutions.findFirst({
          where: eq(campaignExecutions.id, input.executionId),
        });

        if (execution) {
          const updates: any = {};

          switch (input.eventType) {
            case "delivered":
              updates.deliveredCount = (execution.deliveredCount || 0) + 1;
              break;
            case "opened":
              updates.openedCount = (execution.openedCount || 0) + 1;
              break;
            case "clicked":
              updates.clickedCount = (execution.clickedCount || 0) + 1;
              break;
            case "converted":
              updates.convertedCount = (execution.convertedCount || 0) + 1;
              break;
            case "bounced":
              updates.failedCount = (execution.failedCount || 0) + 1;
              break;
          }

          if (Object.keys(updates).length > 0) {
            await ctx.db
              .update(campaignExecutions)
              .set(updates)
              .where(eq(campaignExecutions.id, input.executionId));
          }
        }
      }

      return event;
    }),
});
