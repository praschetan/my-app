"use client";

import { api } from "@/lib/trpc/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ChannelsClient() {
  const { data: channels, isLoading } = api.channels.list.useQuery();

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <p>Loading channels...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Channels</h1>
          <p className="text-muted-foreground mt-2">
            Configure delivery channels for your campaigns
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {channels?.map((channel) => (
            <Card key={channel.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="capitalize">{channel.name}</CardTitle>
                  <Badge variant={channel.isActive ? "default" : "secondary"}>
                    {channel.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <CardDescription className="capitalize">
                  {channel.type} channel
                </CardDescription>
              </CardHeader>
              <CardContent>
                {channel.dailyLimit && (
                  <div className="text-sm text-muted-foreground">
                    Daily limit: {channel.dailyLimit}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {channels?.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground mb-4">
                No channels configured. Add channels to start sending campaigns.
              </p>
              <p className="text-sm text-muted-foreground">
                Channel integrations will be added in Phase 5
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
