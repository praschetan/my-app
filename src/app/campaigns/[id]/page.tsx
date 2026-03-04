"use client";

import { use, useState } from "react";
import { api } from "@/lib/trpc/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AgentStatus } from "@/components/agents/agent-status";
import Link from "next/link";

export default function CampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [activeRunId, setActiveRunId] = useState<string | null>(null);
  const { data: campaign, isLoading, refetch } = api.campaigns.getById.useQuery({ id });
  const { data: agentRuns } = api.agents.listRuns.useQuery({
    campaignId: id,
    limit: 10,
  });

  const triggerWorkflow = api.agents.triggerWorkflow.useMutation({
    onSuccess: (run) => {
      setActiveRunId(run.id);
      refetch();
    },
  });

  const handleStartPlanning = () => {
    triggerWorkflow.mutate({
      campaignId: id,
      input: {},
    });
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <p>Loading campaign...</p>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <p>Campaign not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-start mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">{campaign.name}</h1>
              <Badge>{campaign.status}</Badge>
            </div>
            <p className="text-muted-foreground">{campaign.goal}</p>
          </div>
          <div className="flex gap-2">
            {campaign.status === "draft" && (
              <Button
                onClick={handleStartPlanning}
                disabled={triggerWorkflow.isPending}
              >
                {triggerWorkflow.isPending ? "Starting..." : "Start AI Planning"}
              </Button>
            )}
            <Link href="/campaigns">
              <Button variant="outline">Back to Campaigns</Button>
            </Link>
          </div>
        </div>

        {(activeRunId || (agentRuns && agentRuns.length > 0)) && (
          <div className="mb-6">
            <AgentStatus runId={activeRunId || agentRuns![0].id} />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Audiences</CardTitle>
              <CardDescription>
                {campaign.audiences?.length || 0} audience segments
              </CardDescription>
            </CardHeader>
            <CardContent>
              {campaign.audiences && campaign.audiences.length > 0 ? (
                <ul className="space-y-2">
                  {campaign.audiences.map((audience) => (
                    <li key={audience.id} className="flex justify-between">
                      <span>{audience.name}</span>
                      <span className="text-muted-foreground">
                        {audience.memberCount} members
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No audiences yet. AI will create them during planning.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Content</CardTitle>
              <CardDescription>
                {campaign.content?.length || 0} content pieces
              </CardDescription>
            </CardHeader>
            <CardContent>
              {campaign.content && campaign.content.length > 0 ? (
                <ul className="space-y-2">
                  {campaign.content.map((item) => (
                    <li key={item.id} className="flex justify-between">
                      <span>{item.title}</span>
                      <Badge variant="outline">{item.type}</Badge>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No content yet. AI will generate content during planning.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {campaign.aiPlan && (
          <Card>
            <CardHeader>
              <CardTitle>AI-Generated Plan</CardTitle>
              <CardDescription>Campaign strategy created by AI agents</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-md overflow-auto text-sm">
                {JSON.stringify(campaign.aiPlan, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
