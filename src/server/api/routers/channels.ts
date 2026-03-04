import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { channels } from "@/server/db/schema";
import { eq, desc } from "drizzle-orm";

export const channelsRouter = createTRPCRouter({
  list: publicProcedure.query(async ({ ctx }) => {
    return await ctx.db.query.channels.findMany({
      orderBy: [desc(channels.createdAt)],
    });
  }),

  getById: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.query.channels.findFirst({
        where: eq(channels.id, input.id),
      });
    }),

  getByType: publicProcedure
    .input(
      z.object({
        type: z.enum(["email", "sms", "facebook", "instagram", "twitter", "linkedin"]),
      })
    )
    .query(async ({ ctx, input }) => {
      return await ctx.db.query.channels.findMany({
        where: eq(channels.type, input.type),
      });
    }),

  create: publicProcedure
    .input(
      z.object({
        type: z.enum(["email", "sms", "facebook", "instagram", "twitter", "linkedin"]),
        name: z.string().min(1),
        configuration: z.record(z.any()),
        dailyLimit: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [channel] = await ctx.db
        .insert(channels)
        .values({
          ...input,
          isActive: true,
        })
        .returning();
      return channel;
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        name: z.string().optional(),
        configuration: z.record(z.any()).optional(),
        isActive: z.boolean().optional(),
        dailyLimit: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      const [updated] = await ctx.db
        .update(channels)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(channels.id, id))
        .returning();
      return updated;
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(channels).where(eq(channels.id, input.id));
      return { success: true };
    }),

  testConnection: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const channel = await ctx.db.query.channels.findFirst({
        where: eq(channels.id, input.id),
      });

      if (!channel) {
        throw new Error("Channel not found");
      }

      // TODO: Implement actual connection testing in Phase 5
      return { success: true, message: "Connection test not yet implemented" };
    }),
});
