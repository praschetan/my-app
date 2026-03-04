"use client";

import { api } from "@/lib/trpc/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default function CampaignsPage() {
  const utils = api.useContext();
  const { data: campaigns, isLoading } = api.campaigns.list.useQuery();

  const deleteCampaign = api.campaigns.delete.useMutation({
    onSuccess: () => {
      utils.campaigns.list.invalidate();
      utils.analytics.dashboardStats.invalidate();
    },
  });

  const handleDelete = (e: React.MouseEvent, id: string, name: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm(`Delete campaign "${name}"?`)) {
      deleteCampaign.mutate({ id });
    }
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <p>Loading campaigns...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Campaigns</h1>
            <p className="text-muted-foreground mt-2">
              AI-orchestrated marketing campaigns
            </p>
          </div>
          <Link href="/campaigns/new">
            <Button>Create Campaign</Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns?.map((campaign) => (
            <Link key={campaign.id} href={`/campaigns/${campaign.id}`}>
              <Card className="hover:border-primary transition-colors cursor-pointer">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">{String(campaign.name)}</CardTitle>
                    <Badge variant={getStatusVariant(campaign.status)}>
                      {String(campaign.status)}
                    </Badge>
                  </div>
                  <CardDescription className="line-clamp-2">
                    {String(campaign.goal)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Audiences:</span>
                      <span>{campaign.audiences?.length ?? 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Content:</span>
                      <span>{campaign.content?.length ?? 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Created:</span>
                      <span>
                        {new Date(campaign.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={(e) => handleDelete(e, campaign.id, campaign.name)}
                      disabled={deleteCampaign.isLoading}
                    >
                      {deleteCampaign.isLoading ? "Deleting..." : "Delete"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {campaigns?.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground mb-4">
                No campaigns yet. Create your first AI-powered campaign!
              </p>
              <Link href="/campaigns/new">
                <Button>Create Your First Campaign</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function getStatusVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "running":
      return "default";
    case "completed":
      return "secondary";
    case "failed":
      return "destructive";
    default:
      return "outline";
  }
}
