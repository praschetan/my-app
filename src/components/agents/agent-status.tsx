"use client";

import { api } from "@/lib/trpc/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface AgentStatusProps {
  runId: string;
}

export function AgentStatus({ runId }: AgentStatusProps) {
  const isActive = (status: string) => status === "pending" || status === "running";

  const { data: run, isLoading } = api.agents.getRunById.useQuery(
    { id: runId },
    {
      refetchInterval: (query) => {
        const status = query.state.data?.status;
        if (status && !isActive(status)) return false;
        return 2000;
      },
    }
  );

  if (isLoading) {
    return <div>Loading agent status...</div>;
  }

  if (!run) {
    return <div>Agent run not found</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Agent Workflow</CardTitle>
            <CardDescription>Thread: {run.threadId}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {isActive(run.status) && (
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary" />
              </span>
            )}
            <Badge variant={getStatusVariant(run.status)}>{run.status}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isActive(run.status) && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {run.currentAgent ? (
                <span>{run.currentAgent} running...</span>
              ) : (
                <span>Running...</span>
              )}
            </div>
          )}

          {run.currentAgent && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Current Agent:</span>
              <Badge variant="outline">{run.currentAgent}</Badge>
            </div>
          )}

          {run.actions && run.actions.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-2">Agent Actions</h3>
              <div className="space-y-2">
                {run.actions.map((action) => (
                  <div
                    key={action.id}
                    className="text-sm border-l-2 border-primary pl-3 py-1"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{action.agent}:</span>
                      <span className="text-muted-foreground">{action.action}</span>
                    </div>
                    {action.reasoning && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {action.reasoning}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {run.error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive p-3 rounded-md text-sm">
              <span className="font-bold">Error:</span> {run.error}
            </div>
          )}

          {run.output ? (
            <div>
              <h3 className="text-sm font-medium mb-2">Workflow Output</h3>
              <pre className="bg-muted p-3 rounded-md overflow-auto text-xs">
                {JSON.stringify(run.output as Record<string, unknown>, null, 2)}
              </pre>
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
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
