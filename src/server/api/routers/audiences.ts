import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { audiences, audienceMembers } from "@/server/db/schema";
import { eq, desc } from "drizzle-orm";

export const audiencesRouter = createTRPCRouter({
  list: publicProcedure.query(async ({ ctx }) => {
    return await ctx.db.query.audiences.findMany({
      orderBy: [desc(audiences.createdAt)],
      with: {
        campaign: true,
      },
    });
  }),

  getByCampaign: publicProcedure
    .input(z.object({ campaignId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.query.audiences.findMany({
        where: eq(audiences.campaignId, input.campaignId),
        with: {
          members: true,
        },
      });
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.query.audiences.findFirst({
        where: eq(audiences.id, input.id),
        with: {
          members: true,
          campaign: true,
        },
      });
    }),

  create: publicProcedure
    .input(
      z.object({
        campaignId: z.string().uuid().optional(),
        name: z.string().min(1),
        description: z.string().optional(),
        criteria: z.record(z.any()),
        aiInsights: z.record(z.any()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [audience] = await ctx.db
        .insert(audiences)
        .values(input)
        .returning();
      return audience;
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        name: z.string().optional(),
        description: z.string().optional(),
        criteria: z.record(z.any()).optional(),
        aiInsights: z.record(z.any()).optional(),
        memberCount: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      const [updated] = await ctx.db
        .update(audiences)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(audiences.id, id))
        .returning();
      return updated;
    }),

  addMember: publicProcedure
    .input(
      z.object({
        audienceId: z.string().uuid(),
        email: z.string().email(),
        phone: z.string().optional(),
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        attributes: z.record(z.any()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [member] = await ctx.db
        .insert(audienceMembers)
        .values(input)
        .returning();

      // Update member count
      const audience = await ctx.db.query.audiences.findFirst({
        where: eq(audiences.id, input.audienceId),
      });

      if (audience) {
        await ctx.db
          .update(audiences)
          .set({ memberCount: (audience.memberCount || 0) + 1 })
          .where(eq(audiences.id, input.audienceId));
      }

      return member;
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(audiences).where(eq(audiences.id, input.id));
      return { success: true };
    }),
});
