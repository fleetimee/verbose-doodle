import {
  ChevronRight,
  LayoutGrid,
  List,
  Plug,
  Plus,
  Search,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
} from "@/components/ui/item";
import { AddEndpointSheet } from "@/features/endpoints/components/add-endpoint-sheet";
import { useCreateEndpoint } from "@/features/endpoints/hooks/use-create-endpoint";
import type { EndpointFormData } from "@/features/endpoints/schemas/endpoint-schema";
import type { Endpoint, EndpointGroup } from "@/features/endpoints/types";
import {
  abbreviateMethod,
  getMethodBadgeColor,
} from "@/features/endpoints/utils/http-method-colors";
import { useDocumentMeta } from "@/hooks/use-document-meta";

// Mock data for demonstration
const mockGroups: EndpointGroup[] = [
  {
    id: "group-1",
    name: "Payment Gateway",
  },
  {
    id: "group-2",
    name: "User Service",
  },
];

const mockEndpoints: Endpoint[] = [
  {
    id: "endpoint-1",
    method: "POST",
    url: "/api/payment/process",
    groupId: "group-1",
    responses: [
      {
        id: "resp-1",
        name: "Success Response",
        json: '{"status": "success", "transaction_id": "TXN123"}',
        statusCode: 200,
        activated: true,
      },
      {
        id: "resp-2",
        name: "Insufficient Funds",
        json: '{"status": "error", "message": "Insufficient funds"}',
        statusCode: 400,
        activated: false,
      },
      {
        id: "resp-3",
        name: "Server Error",
        json: '{"status": "error", "message": "Internal server error"}',
        statusCode: 500,
        activated: false,
      },
    ],
  },
  {
    id: "endpoint-2",
    method: "GET",
    url: "/api/payment/status/{id}",
    groupId: "group-1",
    responses: [
      {
        id: "resp-4",
        name: "Payment Found",
        json: '{"status": "completed", "amount": 1000}',
        statusCode: 200,
        activated: true,
      },
      {
        id: "resp-5",
        name: "Payment Not Found",
        json: '{"status": "error", "message": "Payment not found"}',
        statusCode: 404,
        activated: false,
      },
    ],
  },
  {
    id: "endpoint-3",
    method: "DELETE",
    url: "/api/payment/cancel/{id}",
    groupId: "group-1",
    responses: [
      {
        id: "resp-6",
        name: "Cancelled Successfully",
        json: '{"status": "cancelled"}',
        statusCode: 200,
        activated: true,
      },
    ],
  },
  {
    id: "endpoint-4",
    method: "POST",
    url: "/api/users/register",
    groupId: "group-2",
    responses: [
      {
        id: "resp-7",
        name: "User Created",
        json: '{"user_id": "USR123", "username": "john_doe"}',
        statusCode: 201,
        activated: true,
      },
      {
        id: "resp-8",
        name: "User Already Exists",
        json: '{"error": "Username already taken"}',
        statusCode: 409,
        activated: false,
      },
    ],
  },
  {
    id: "endpoint-5",
    method: "GET",
    url: "/api/users/{id}",
    groupId: "group-2",
    responses: [
      {
        id: "resp-9",
        name: "User Details",
        json: '{"user_id": "USR123", "username": "john_doe", "email": "john@example.com"}',
        statusCode: 200,
        activated: true,
      },
    ],
  },
  {
    id: "endpoint-6",
    method: "PATCH",
    url: "/api/users/{id}",
    groupId: "group-2",
    responses: [
      {
        id: "resp-10",
        name: "Update Success",
        json: '{"status": "updated"}',
        statusCode: 200,
        activated: true,
      },
      {
        id: "resp-11",
        name: "Validation Error",
        json: '{"error": "Invalid email format"}',
        statusCode: 422,
        activated: false,
      },
    ],
  },
  {
    id: "endpoint-7",
    method: "PUT",
    url: "/api/users/{id}/profile",
    groupId: "group-2",
    responses: [],
  },
];

export function EndpointsPage() {
  useDocumentMeta({
    title: "Endpoint",
    description: "Kelola endpoint API dan integrasi untuk simulasi billing",
    keywords: ["api endpoints", "integrations", "api management", "endpoints"],
  });
  // TODO: Replace with useQuery when implementing data fetching
  const [endpointGroups, setEndpointGroups] =
    useState<EndpointGroup[]>(mockGroups);
  const [endpoints, setEndpoints] = useState<Endpoint[]>(mockEndpoints);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grouped" | "ungrouped">("grouped");

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

  // Render individual endpoint item for grid view
  const renderEndpointCard = (endpoint: Endpoint) => (
    <Item
      asChild
      className="cursor-pointer rounded-lg border bg-card shadow-sm transition-shadow hover:shadow-md"
      key={endpoint.id}
      size="default"
      variant="default"
    >
      <button type="button">
        <ItemMedia variant="default">
          <span
            className={`rounded-md px-2 py-1 font-mono font-semibold text-xs ${getMethodBadgeColor(
              endpoint.method
            )}`}
          >
            {abbreviateMethod(endpoint.method)}
          </span>
        </ItemMedia>
        <ItemContent>
          <ItemTitle>
            <span className="font-mono text-base">{endpoint.url}</span>
          </ItemTitle>
          <ItemDescription className="text-left">
            {endpoint.responses.length > 0 ? (
              <div className="flex flex-col gap-0.5">
                <span>{endpoint.responses.length} respon terkonfigurasi</span>
                {endpoint.responses.some((r) => r.activated) && (
                  <span>Respon aktif tersedia</span>
                )}
              </div>
            ) : (
              "Belum ada respon terkonfigurasi"
            )}
          </ItemDescription>
        </ItemContent>
        <ItemActions>
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </ItemActions>
      </button>
    </Item>
  );

  // Render individual endpoint item for list view
  const renderEndpointListItem = (endpoint: Endpoint) => (
    <Item
      asChild
      className="cursor-pointer hover:bg-accent/50"
      key={endpoint.id}
      size="default"
      variant="default"
    >
      <button type="button">
        <ItemMedia variant="default">
          <span
            className={`rounded-md px-2 py-1 font-mono font-semibold text-xs ${getMethodBadgeColor(
              endpoint.method
            )}`}
          >
            {abbreviateMethod(endpoint.method)}
          </span>
        </ItemMedia>
        <ItemContent>
          <ItemTitle>
            <span className="font-mono text-base">{endpoint.url}</span>
          </ItemTitle>
          <ItemDescription className="text-left">
            {endpoint.responses.length > 0 ? (
              <div className="flex flex-col gap-0.5">
                <span>{endpoint.responses.length} respon terkonfigurasi</span>
                {endpoint.responses.some((r) => r.activated) && (
                  <span>Respon aktif tersedia</span>
                )}
              </div>
            ) : (
              "Belum ada respon terkonfigurasi"
            )}
          </ItemDescription>
        </ItemContent>
        <ItemActions>
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </ItemActions>
      </button>
    </Item>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-3xl tracking-tight">Endpoint</h1>
          <p className="text-muted-foreground">
            Kelola endpoint API dan integrasi Anda
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
            <Input className="pl-9" placeholder="Cari endpoint..." />
          </div>
          <ButtonGroup>
            <Button
              onClick={() => setViewMode("grouped")}
              size="icon"
              variant={viewMode === "grouped" ? "default" : "outline"}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              onClick={() => setViewMode("ungrouped")}
              size="icon"
              variant={viewMode === "ungrouped" ? "default" : "outline"}
            >
              <List className="h-4 w-4" />
            </Button>
          </ButtonGroup>
        </div>
      )}

      {/* Empty State */}
      {endpoints.length === 0 && (
        <Empty className="min-h-[60vh] border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Plug />
            </EmptyMedia>
            <EmptyTitle>Belum ada endpoint</EmptyTitle>
            <EmptyDescription>
              Mulai dengan membuat endpoint API pertama Anda. Anda dapat
              mengatur endpoint dengan membuat grup secara langsung.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button onClick={handleCreateEndpoint}>
              <Plus className="mr-2 h-4 w-4" />
              Buat Endpoint Pertama
            </Button>
          </EmptyContent>
        </Empty>
      )}

      {/* Grouped View */}
      {endpoints.length > 0 && viewMode === "grouped" && (
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
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {groupEndpoints.map((endpoint) =>
                    renderEndpointCard(endpoint)
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Ungrouped View - List */}
      {endpoints.length > 0 && viewMode === "ungrouped" && (
        <ItemGroup className="rounded-lg border">
          {endpoints.map((endpoint, index) => (
            <div key={endpoint.id}>
              {renderEndpointListItem(endpoint)}
              {index < endpoints.length - 1 && <ItemSeparator />}
            </div>
          ))}
        </ItemGroup>
      )}
    </div>
  );
}
