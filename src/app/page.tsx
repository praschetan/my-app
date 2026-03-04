"use client";

import { api } from "@/lib/trpc/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  const { data: dashboardStats } = api.analytics.dashboardStats.useQuery();
  const { data: campaigns } = api.campaigns.list.useQuery();
  const { data: channels } = api.channels.list.useQuery();

  const stats = [
    {
      label: "Total Campaigns",
      value: dashboardStats?.campaigns.total || 0,
      description: "Active marketing campaigns",
      href: "/campaigns",
    },
    {
      label: "Audiences",
      value: dashboardStats?.audiences.total || 0,
      description: "Segmented audience groups",
      href: "/audiences",
    },
    {
      label: "Content Pieces",
      value: dashboardStats?.content.total || 0,
      description: "AI-generated content",
      href: "/content",
    },
    {
      label: "Active Channels",
      value: channels?.filter((c) => c.isActive).length || 0,
      description: "Configured delivery channels",
      href: "/channels",
    },
  ];

  const activeCampaigns = campaigns?.filter(
    (c) => c.status === "running" || c.status === "scheduled"
  );

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground text-lg">
            AI agents autonomously plan, create, and optimize your marketing campaigns
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <Link key={stat.label} href={stat.href}>
              <Card className="hover:border-primary transition-colors cursor-pointer">
                <CardHeader className="pb-2">
                  <CardDescription>{stat.label}</CardDescription>
                  <CardTitle className="text-3xl">{stat.value}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Get started with AI-powered campaigns</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/campaigns/new" className="block">
                <Button className="w-full">Create New Campaign</Button>
              </Link>
              <Link href="/campaigns" className="block">
                <Button variant="outline" className="w-full">
                  View All Campaigns
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Active Campaigns</CardTitle>
              <CardDescription>
                {activeCampaigns?.length || 0} campaigns running
              </CardDescription>
            </CardHeader>
            <CardContent>
              {activeCampaigns && activeCampaigns.length > 0 ? (
                <ul className="space-y-2">
                  {activeCampaigns.slice(0, 5).map((campaign) => (
                    <li key={campaign.id}>
                      <Link
                        href={`/campaigns/${campaign.id}`}
                        className="flex justify-between items-center text-sm hover:text-primary"
                      >
                        <span>{campaign.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {campaign.status}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No active campaigns. Create one to get started.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
