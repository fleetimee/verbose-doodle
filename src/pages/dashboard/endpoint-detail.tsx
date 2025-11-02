import { ArrowLeft, Circle } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { AddResponseDialog } from "@/features/endpoints/components/add-response-dialog";
import { EndpointDetailLayout } from "@/features/endpoints/components/endpoint-detail-layout";
import { EndpointDetailSkeleton } from "@/features/endpoints/components/endpoint-detail-skeleton";
import { useActivateResponse } from "@/features/endpoints/hooks/use-activate-response";
import { useCreateResponse } from "@/features/endpoints/hooks/use-create-response";
import { useDeactivateResponse } from "@/features/endpoints/hooks/use-deactivate-response";
import { useGetEndpoint } from "@/features/endpoints/hooks/use-get-endpoint";
import type { ResponseFormData } from "@/features/endpoints/schemas/response-schema";
import type { EndpointResponse } from "@/features/endpoints/types";
import {
  abbreviateMethod,
  getMethodBadgeColor,
} from "@/features/endpoints/utils/http-method-colors";
import { useDocumentMeta } from "@/hooks/use-document-meta";

export function EndpointDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedResponseId, setSelectedResponseId] = useState<string | null>(
    null
  );
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const { data: endpoint, isPending: isLoadingEndpoint } = useGetEndpoint(
    id ?? ""
  );
  const { mutate: createResponse, isPending: isCreatingResponse } =
    useCreateResponse();
  const { mutate: activateResponse, isPending: isActivatingResponse } =
    useActivateResponse();
  const { mutate: deactivateResponse, isPending: isDeactivatingResponse } =
    useDeactivateResponse();

  useDocumentMeta({
    title: endpoint ? `${endpoint.method} ${endpoint.url}` : "Endpoint Detail",
    description: "View and manage endpoint responses",
  });

  const selectedResponse = useMemo(() => {
    if (!(endpoint && selectedResponseId)) {
      return null;
    }
    return endpoint.responses.find((r) => r.id === selectedResponseId) ?? null;
  }, [endpoint, selectedResponseId]);

  const handleBack = () => {
    navigate("/dashboard/endpoints");
  };

  const handleAddResponse = (data: ResponseFormData) => {
    if (!endpoint) {
      return;
    }

    createResponse(
      {
        endpointId: endpoint.id,
        ...data,
      },
      {
        onSuccess: () => {
          toast.success("Response created successfully");
          setIsAddDialogOpen(false);
        },
        onError: () => {
          toast.error("Failed to create response");
        },
      }
    );
  };

  const handleActivateResponse = (response: EndpointResponse) => {
    if (!endpoint) {
      return;
    }

    activateResponse(
      {
        endpointId: endpoint.id,
        responseId: response.id,
      },
      {
        onSuccess: () => {
          toast.success(`Response "${response.name}" activated`);
        },
        onError: () => {
          toast.error("Failed to activate response");
        },
      }
    );
  };

  const handleDeactivateResponse = (response: EndpointResponse) => {
    if (!endpoint) {
      return;
    }

    deactivateResponse(
      {
        endpointId: endpoint.id,
        responseId: response.id,
      },
      {
        onSuccess: () => {
          toast.success(`Response "${response.name}" deactivated`);
        },
        onError: () => {
          toast.error("Failed to deactivate response");
        },
      }
    );
  };

  if (isLoadingEndpoint) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-md" />
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Skeleton className="h-6 w-16 rounded-md" />
                <Skeleton className="h-8 w-64" />
              </div>
              <Skeleton className="h-4 w-96" />
            </div>
          </div>
          <Skeleton className="h-10 w-32 rounded-md" />
        </div>

        <EndpointDetailSkeleton />
      </div>
    );
  }

  if (!endpoint) {
    return (
      <div className="space-y-6">
        <Button onClick={handleBack} size="sm" variant="ghost">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Endpoints
        </Button>
        <Empty className="min-h-[60vh] border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Circle />
            </EmptyMedia>
            <EmptyTitle>Endpoint not found</EmptyTitle>
            <EmptyDescription>
              The endpoint you're looking for doesn't exist or has been removed.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button onClick={handleBack}>Back to Endpoints</Button>
          </EmptyContent>
        </Empty>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button onClick={handleBack} size="icon" variant="ghost">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <span
                className={`rounded-md px-2 py-1 font-mono font-semibold text-xs ${getMethodBadgeColor(
                  endpoint.method
                )}`}
              >
                {abbreviateMethod(endpoint.method)}
              </span>
              <h1 className="font-bold font-mono text-2xl tracking-tight">
                {endpoint.url}
              </h1>
            </div>
            <p className="mt-1 text-muted-foreground text-sm">
              Biller ID: {endpoint.billerId} • {endpoint.responses.length}{" "}
              response{endpoint.responses.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <AddResponseDialog
          isSubmitting={isCreatingResponse}
          onOpenChange={setIsAddDialogOpen}
          onSubmit={handleAddResponse}
          open={isAddDialogOpen}
        />
      </div>

      <EndpointDetailLayout
        isActivating={isActivatingResponse}
        isDeactivating={isDeactivatingResponse}
        onActivateResponse={handleActivateResponse}
        onAddResponse={() => setIsAddDialogOpen(true)}
        onDeactivateResponse={handleDeactivateResponse}
        onSelectResponse={setSelectedResponseId}
        responses={endpoint.responses}
        selectedResponse={selectedResponse}
        selectedResponseId={selectedResponseId}
      />
    </div>
  );
}
