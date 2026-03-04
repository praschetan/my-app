import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { campaigns } from "@/server/db/schema";
import { eq, desc } from "drizzle-orm";

export const campaignsRouter = createTRPCRouter({
  list: publicProcedure.query(async ({ ctx }) => {
    return await ctx.db.query.campaigns.findMany({
      orderBy: [desc(campaigns.createdAt)],
      with: {
        audiences: true,
        content: true,
      },
    });
  }),

  getById: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.query.campaigns.findFirst({
        where: eq(campaigns.id, input.id),
        with: {
          audiences: { with: { members: true } },
          content: { with: { variants: true } },
          executions: true,
        },
      });
    }),

  create: publicProcedure
    .input(
      z.object({
        name: z.string().min(1),
        goal: z.string().min(1),
        metadata: z.record(z.any()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [campaign] = await ctx.db
        .insert(campaigns)
        .values({
          name: input.name,
          goal: input.goal,
          metadata: input.metadata,
          status: "draft",
        })
        .returning();
      return campaign;
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        name: z.string().optional(),
        goal: z.string().optional(),
        status: z.enum([
          "draft",
          "planning",
          "ready",
          "scheduled",
          "running",
          "paused",
          "completed",
          "failed",
        ]).optional(),
        aiPlan: z.record(z.any()).optional(),
        metadata: z.record(z.any()).optional(),
        scheduledAt: z.date().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      const [updated] = await ctx.db
        .update(campaigns)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(campaigns.id, id))
        .returning();
      return updated;
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(campaigns).where(eq(campaigns.id, input.id));
      return { success: true };
    }),
});
