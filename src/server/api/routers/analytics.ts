import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { events, campaignExecutions, campaigns, content } from "@/server/db/schema";
import { eq, and, gte, count, sql } from "drizzle-orm";

export const analyticsRouter = createTRPCRouter({
  campaignMetrics: publicProcedure
    .input(z.object({ campaignId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      // Get campaign details
      const campaign = await ctx.db.query.campaigns.findFirst({
        where: eq(campaigns.id, input.campaignId),
      });

      // Get execution stats
      const executions = await ctx.db.query.campaignExecutions.findMany({
        where: eq(campaignExecutions.campaignId, input.campaignId),
      });

      const totalSent = executions.reduce((sum, e) => sum + (e.sentCount || 0), 0);
      const totalDelivered = executions.reduce((sum, e) => sum + (e.deliveredCount || 0), 0);
      const totalOpened = executions.reduce((sum, e) => sum + (e.openedCount || 0), 0);
      const totalClicked = executions.reduce((sum, e) => sum + (e.clickedCount || 0), 0);
      const totalConverted = executions.reduce((sum, e) => sum + (e.convertedCount || 0), 0);

      // Calculate rates
      const deliveryRate = totalSent > 0 ? (totalDelivered / totalSent) * 100 : 0;
      const openRate = totalDelivered > 0 ? (totalOpened / totalDelivered) * 100 : 0;
      const clickRate = totalOpened > 0 ? (totalClicked / totalOpened) * 100 : 0;
      const conversionRate = totalClicked > 0 ? (totalConverted / totalClicked) * 100 : 0;

      // Get event breakdown
      const eventBreakdown = await ctx.db
        .select({
          eventType: events.eventType,
          count: count(),
        })
        .from(events)
        .where(eq(events.campaignId, input.campaignId))
        .groupBy(events.eventType);

      return {
        campaign,
        totals: {
          sent: totalSent,
          delivered: totalDelivered,
          opened: totalOpened,
          clicked: totalClicked,
          converted: totalConverted,
        },
        rates: {
          delivery: deliveryRate,
          open: openRate,
          click: clickRate,
          conversion: conversionRate,
        },
        eventBreakdown,
        executions: executions.length,
      };
    }),

  dashboardStats: publicProcedure.query(async ({ ctx }) => {
    // Get all campaigns
    const allCampaigns = await ctx.db.query.campaigns.findMany();

    // Count by status
    const campaignsByStatus = allCampaigns.reduce(
      (acc, campaign) => {
        acc[campaign.status] = (acc[campaign.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    // Get total audience members
    const totalAudiences = await ctx.db.query.audiences.findMany();
    const totalMembers = totalAudiences.reduce(
      (sum, a) => sum + (a.memberCount || 0),
      0
    );

    // Get total content
    const totalContent = await ctx.db.query.content.findMany({
      where: eq(content.isActive, true),
    });

    // Get recent events (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentEvents = await ctx.db
      .select({
        eventType: events.eventType,
        count: count(),
      })
      .from(events)
      .where(gte(events.timestamp, sevenDaysAgo))
      .groupBy(events.eventType);

    return {
      campaigns: {
        total: allCampaigns.length,
        byStatus: campaignsByStatus,
      },
      audiences: {
        total: totalAudiences.length,
        totalMembers,
      },
      content: {
        total: totalContent.length,
      },
      recentActivity: recentEvents,
    };
  }),

  eventTimeline: publicProcedure
    .input(
      z.object({
        campaignId: z.string().uuid(),
        days: z.number().default(7),
      })
    )
    .query(async ({ ctx, input }) => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - input.days);

      const timeline = await ctx.db
        .select({
          date: sql<string>`DATE(${events.timestamp})`,
          eventType: events.eventType,
          count: count(),
        })
        .from(events)
        .where(
          and(
            eq(events.campaignId, input.campaignId),
            gte(events.timestamp, startDate)
          )
        )
        .groupBy(sql`DATE(${events.timestamp})`, events.eventType)
        .orderBy(sql`DATE(${events.timestamp})`);

      return timeline;
    }),
});
