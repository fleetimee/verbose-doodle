import { Plug, Plus, Search } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { AddEndpointSheet } from "@/features/endpoints/components/add-endpoint-sheet";
import { useCreateEndpoint } from "@/features/endpoints/hooks/use-create-endpoint";
import type { EndpointFormData } from "@/features/endpoints/schemas/endpoint-schema";
import type { Endpoint, EndpointGroup } from "@/features/endpoints/types";

export function EndpointsPage() {
  // TODO: Replace with useQuery when implementing data fetching
  const [endpointGroups, setEndpointGroups] = useState<EndpointGroup[]>([]);
  const [endpoints, setEndpoints] = useState<Endpoint[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { mutate: createEndpoint, isPending } = useCreateEndpoint();

  const handleCreateEndpoint = () => {
    setIsDialogOpen(true);
  };

  const handleAddEndpoint = (data: EndpointFormData) => {
    // If creating a new group, add it to the state first
    let targetGroupId = data.groupId;

    if (data.groupId === "new" && data.newGroupName) {
      const newGroup: EndpointGroup = {
        id: crypto.randomUUID(),
        name: data.newGroupName,
      };
      setEndpointGroups((prev) => [...prev, newGroup]);
      targetGroupId = newGroup.id;
    }

    // Create endpoint with the correct groupId
    createEndpoint(
      { ...data, groupId: targetGroupId },
      {
        onSuccess: (response) => {
          // Add to local state (temporary until we implement useQuery)
          setEndpoints((prev) => [...prev, response.data]);
          setIsDialogOpen(false);
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-3xl tracking-tight">Endpoints</h1>
          <p className="text-muted-foreground">
            Manage your API endpoints and integrations
          </p>
        </div>
        <AddEndpointSheet
          endpointGroups={endpointGroups}
          isSubmitting={isPending}
          onOpenChange={setIsDialogOpen}
          onSubmit={handleAddEndpoint}
          open={isDialogOpen}
          showTrigger={endpoints.length > 0}
        />
      </div>

      {/* Search and Filters */}
      {endpoints.length > 0 && (
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search endpoints..." />
          </div>
        </div>
      )}

      {/* Empty State */}
      {endpoints.length === 0 ? (
        <Empty className="min-h-[60vh] border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Plug />
            </EmptyMedia>
            <EmptyTitle>No endpoints yet</EmptyTitle>
            <EmptyDescription>
              Get started by creating your first API endpoint. You can organize
              endpoints by creating groups on the fly.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button onClick={handleCreateEndpoint}>
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Endpoint
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <div className="space-y-6">
          {endpointGroups.map((group) => {
            const groupEndpoints = endpoints.filter(
              (endpoint) => endpoint.groupId === group.id
            );
            if (groupEndpoints.length === 0) {
              return null;
            }

            return (
              <div className="space-y-3" key={group.id}>
                <h3 className="font-semibold text-lg">{group.name}</h3>
                <div className="grid gap-3">
                  {groupEndpoints.map((endpoint) => (
                    <Card key={endpoint.id}>
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <span className="rounded bg-primary/10 px-2 py-1 font-mono font-semibold text-primary text-xs">
                            {endpoint.method}
                          </span>
                          <span className="font-mono text-sm">
                            {endpoint.url}
                          </span>
                          <span className="text-muted-foreground text-xs">
                            {endpoint.responses.length} response
                            {endpoint.responses.length !== 1 ? "s" : ""}
                          </span>
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
