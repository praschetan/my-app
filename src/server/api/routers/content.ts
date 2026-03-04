import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { content, contentVariants } from "@/server/db/schema";
import { eq, desc, and } from "drizzle-orm";

export const contentRouter = createTRPCRouter({
  list: publicProcedure.query(async ({ ctx }) => {
    return await ctx.db.query.content.findMany({
      orderBy: [desc(content.createdAt)],
      where: eq(content.isActive, true),
      with: {
        campaign: true,
        variants: true,
      },
    });
  }),

  getByCampaign: publicProcedure
    .input(z.object({ campaignId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.query.content.findMany({
        where: and(
          eq(content.campaignId, input.campaignId),
          eq(content.isActive, true)
        ),
        with: {
          variants: true,
        },
      });
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.query.content.findFirst({
        where: eq(content.id, input.id),
        with: {
          campaign: true,
          variants: true,
        },
      });
    }),

  create: publicProcedure
    .input(
      z.object({
        campaignId: z.string().uuid().optional(),
        type: z.enum(["email", "sms", "social_post", "landing_page", "ad_copy"]),
        title: z.string().min(1),
        body: z.string().min(1),
        subject: z.string().optional(),
        metadata: z.record(z.any()).optional(),
        aiGenerationPrompt: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [contentItem] = await ctx.db
        .insert(content)
        .values(input)
        .returning();
      return contentItem;
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        title: z.string().optional(),
        body: z.string().optional(),
        subject: z.string().optional(),
        metadata: z.record(z.any()).optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      const [updated] = await ctx.db
        .update(content)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(content.id, id))
        .returning();
      return updated;
    }),

  createVariant: publicProcedure
    .input(
      z.object({
        contentId: z.string().uuid(),
        name: z.string().min(1),
        body: z.string().min(1),
        subject: z.string().optional(),
        metadata: z.record(z.any()).optional(),
        trafficPercentage: z.number().min(0).max(100).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [variant] = await ctx.db
        .insert(contentVariants)
        .values(input)
        .returning();
      return variant;
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      // Soft delete by setting isActive to false
      await ctx.db
        .update(content)
        .set({ isActive: false })
        .where(eq(content.id, input.id));
      return { success: true };
    }),
});
