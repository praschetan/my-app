"use client";

import { api } from "@/lib/trpc/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function AudiencesPage() {
  const { data: audiences, isLoading } = api.audiences.list.useQuery();

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <p>Loading audiences...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Audiences</h1>
          <p className="text-muted-foreground mt-2">
            AI-segmented audience insights
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {audiences?.map((audience) => (
            <Card key={audience.id}>
              <CardHeader>
                <CardTitle>{audience.name}</CardTitle>
                <CardDescription>{audience.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Members:</span>
                    <span className="font-medium">{audience.memberCount}</span>
                  </div>
                  {audience.campaign && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Campaign:</span>
                      <Link
                        href={`/campaigns/${audience.campaign.id}`}
                        className="text-primary hover:underline"
                      >
                        {audience.campaign.name}
                      </Link>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {audiences?.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">
                No audiences yet. AI agents will create audience segments when you plan a campaign.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
