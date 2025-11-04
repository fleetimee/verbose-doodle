import { ArrowLeft, Circle, Plus } from "lucide-react";
import { AnimatePresence } from "motion/react";
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
import { ProtectedAction } from "@/features/auth/components/protected-action";
import { useAuth } from "@/features/auth/context";
import { usePermissions } from "@/features/auth/hooks/use-permissions";
import { EndpointDetailLayout } from "@/features/endpoints/components/endpoint-detail-layout";
import { EndpointDetailSkeleton } from "@/features/endpoints/components/endpoint-detail-skeleton";
import { ResponseStepper } from "@/features/endpoints/components/response-stepper";
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
import { decodeId } from "@/lib/id-encoder";

export function EndpointDetailPage() {
  const { id: encodedId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { authState } = useAuth();
  const { can } = usePermissions({ role: authState.user?.role });
  const canAddResponse = can("canAddResponse");

  // Decode the ID from the URL
  const decodedId = useMemo(() => {
    if (!encodedId) {
      return null;
    }
    return decodeId(encodedId);
  }, [encodedId]);

  const [selectedResponseId, setSelectedResponseId] = useState<string | null>(
    null
  );
  const [isStepperOpen, setIsStepperOpen] = useState(false);

  const { data: endpoint, isPending: isLoadingEndpoint } = useGetEndpoint(
    decodedId ?? ""
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
          setIsStepperOpen(false);
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

  // Show error if the ID cannot be decoded
  if (!decodedId) {
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
            <EmptyTitle>Invalid endpoint ID</EmptyTitle>
            <EmptyDescription>
              The endpoint URL is invalid or has been tampered with.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button onClick={handleBack}>Back to Endpoints</Button>
          </EmptyContent>
        </Empty>
      </div>
    );
  }

  if (isLoadingEndpoint) {
    return (
      <div className="space-y-4 md:space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3 md:items-center md:gap-4">
            <Skeleton className="h-10 w-10 shrink-0 rounded-md" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-2 md:gap-3">
                <Skeleton className="h-6 w-16 shrink-0 rounded-md" />
                <Skeleton className="h-6 w-48 rounded-md md:h-8 md:w-64" />
              </div>
              <Skeleton className="h-4 w-full max-w-sm rounded-md" />
            </div>
          </div>
          {canAddResponse && (
            <Skeleton className="h-10 w-32 shrink-0 rounded-md" />
          )}
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
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-3 md:items-center md:gap-4">
          <Button
            className="mt-1 md:mt-0"
            onClick={handleBack}
            size="icon"
            variant="ghost"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 md:gap-3">
              <span
                className={`shrink-0 rounded-md px-2 py-1 font-mono font-semibold text-xs ${getMethodBadgeColor(
                  endpoint.method
                )}`}
              >
                {abbreviateMethod(endpoint.method)}
              </span>
              <h1 className="break-all font-bold font-mono text-xl tracking-tight md:text-2xl">
                {endpoint.url}
              </h1>
            </div>
            <p className="mt-1 text-muted-foreground text-sm">
              Biller ID: {endpoint.billerId} • {endpoint.responses.length}{" "}
              response{endpoint.responses.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <ProtectedAction ability="canAddResponse">
          <Button onClick={() => setIsStepperOpen(true)} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Response
          </Button>
        </ProtectedAction>
      </div>

      <EndpointDetailLayout
        endpointMethod={endpoint.method}
        endpointUrl={endpoint.url}
        isActivating={isActivatingResponse}
        isDeactivating={isDeactivatingResponse}
        onActivateResponse={handleActivateResponse}
        onDeactivateResponse={handleDeactivateResponse}
        onSelectResponse={setSelectedResponseId}
        responses={endpoint.responses}
        selectedResponse={selectedResponse}
        selectedResponseId={selectedResponseId}
      />

      <AnimatePresence>
        {isStepperOpen && (
          <ResponseStepper
            isSubmitting={isCreatingResponse}
            onCancel={() => setIsStepperOpen(false)}
            onSubmit={handleAddResponse}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
