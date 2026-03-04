"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/trpc/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function NewCampaignClient() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [goal, setGoal] = useState("");

  const createCampaign = api.campaigns.create.useMutation({
    onSuccess: (data) => {
      router.push(`/campaigns/${data.id}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createCampaign.mutate({ name, goal });
  };

  return (
    <div className="p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Create New Campaign</h1>

        <Card>
          <CardHeader>
            <CardTitle>Campaign Details</CardTitle>
            <CardDescription>
              Provide a name and business goal. AI agents will plan the rest.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Campaign Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Q1 Product Launch"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="goal">Business Goal</Label>
                <textarea
                  id="goal"
                  placeholder="e.g., Launch our new SaaS product to generate 1000 sign-ups in the first month, targeting SMB decision makers in North America"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  required
                  className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
                <p className="text-xs text-muted-foreground">
                  Be specific about target metrics, audience, and timeline. The AI will use this to plan your campaign.
                </p>
              </div>

              <div className="flex gap-4">
                <Button
                  type="submit"
                  disabled={createCampaign.isPending}
                  className="flex-1"
                >
                  {createCampaign.isPending ? "Creating..." : "Create Campaign"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/campaigns")}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
