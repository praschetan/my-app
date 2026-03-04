"use client";

import { api } from "@/lib/trpc/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ContentPage() {
  const { data: contentItems, isLoading } = api.content.list.useQuery();

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <p>Loading content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Content</h1>
          <p className="text-muted-foreground mt-2">
            AI-generated marketing content
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {contentItems?.map((item) => (
            <Card key={item.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle>{item.title}</CardTitle>
                  <Badge variant="outline">{item.type}</Badge>
                </div>
                {item.subject && (
                  <CardDescription>{item.subject}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                  {item.body}
                </p>
                <div className="flex gap-2 text-xs text-muted-foreground">
                  {item.variants && item.variants.length > 0 && (
                    <span>{item.variants.length} variants</span>
                  )}
                  <span>v{item.version}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {contentItems?.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">
                No content yet. AI agents will generate content when you plan a campaign.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
