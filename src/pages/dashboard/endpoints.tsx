import { Plug, Plus, Search } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
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
import { useCreateEndpointGroup } from "@/features/endpoints/hooks/use-create-endpoint-group";
import type { EndpointGroup } from "@/features/endpoints/types";

export function EndpointsPage() {
  // TODO: Replace with useQuery when implementing data fetching
  const [endpointGroups, setEndpointGroups] = useState<EndpointGroup[]>([]);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const { mutate: createEndpointGroup, isPending } = useCreateEndpointGroup();

  const handleCreateEndpoint = () => {
    setIsSheetOpen(true);
  };

  const handleAddEndpointGroup = (data: { name: string }) => {
    createEndpointGroup(data, {
      onSuccess: (response) => {
        // Add to local state (temporary until we implement useQuery)
        setEndpointGroups((prev) => [...prev, response.data]);
        setIsSheetOpen(false);
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-3xl tracking-tight">Endpoints</h1>
          <p className="text-muted-foreground">
            Manage your API endpoint groups and integrations
          </p>
        </div>
        <AddEndpointSheet
          isSubmitting={isPending}
          onOpenChange={setIsSheetOpen}
          onSubmit={handleAddEndpointGroup}
          open={isSheetOpen}
        />
      </div>

      {/* Search and Filters */}
      {endpointGroups.length > 0 && (
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search endpoints..." />
          </div>
        </div>
      )}

      {/* Empty State */}
      {endpointGroups.length === 0 ? (
        <Empty className="min-h-[60vh] border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Plug />
            </EmptyMedia>
            <EmptyTitle>No endpoint groups yet</EmptyTitle>
            <EmptyDescription>
              Get started by creating your first endpoint group. Organize your
              API endpoints by service, feature, or any other category that
              makes sense for your application.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button onClick={handleCreateEndpoint}>
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Endpoint Group
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <div className="grid gap-4">
          {endpointGroups.map((group) => (
            <Card key={group.id}>
              <CardHeader>
                <CardTitle>{group.name}</CardTitle>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
