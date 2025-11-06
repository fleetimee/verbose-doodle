import { ArrowLeft, Check, Circle, Pen, Plus, Trash2, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { useDeleteEndpoint } from "@/features/endpoints/hooks/use-delete-endpoint";
import { useGetEndpoint } from "@/features/endpoints/hooks/use-get-endpoint";
import { useUpdateEndpoint } from "@/features/endpoints/hooks/use-update-endpoint";
import type { ResponseFormData } from "@/features/endpoints/schemas/response-schema";
import type { EndpointResponse, HttpMethod } from "@/features/endpoints/types";
import {
  abbreviateMethod,
  getMethodBadgeColor,
} from "@/features/endpoints/utils/http-method-colors";
import { useDocumentMeta } from "@/hooks/use-document-meta";
import { decodeId } from "@/lib/id-encoder";

// Animation constants
const PAGE_ANIMATION_DURATION = 0.4;
const STAGGER_DELAY = 0.1;

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
  const [isEditingUrl, setIsEditingUrl] = useState(false);
  const [editedUrl, setEditedUrl] = useState("");
  const [editedMethod, setEditedMethod] = useState<HttpMethod>("GET");
  const [showDeleteEndpointDialog, setShowDeleteEndpointDialog] =
    useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: endpoint, isPending: isLoadingEndpoint } = useGetEndpoint(
    decodedId ?? ""
  );
  const { mutate: createResponse, isPending: isCreatingResponse } =
    useCreateResponse();
  const { mutate: activateResponse, isPending: isActivatingResponse } =
    useActivateResponse();
  const { mutate: deactivateResponse, isPending: isDeactivatingResponse } =
    useDeactivateResponse();
  const { mutate: updateEndpoint, isPending: isUpdatingEndpoint } =
    useUpdateEndpoint();
  const { mutate: deleteEndpoint, isPending: isDeletingEndpoint } =
    useDeleteEndpoint();

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

  const handleEditUrl = () => {
    if (!endpoint) {
      return;
    }
    setEditedUrl(endpoint.url);
    setEditedMethod(endpoint.method);
    setIsEditingUrl(true);
    // Focus input after state update
    setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    }, 0);
  };

  const handleCancelEdit = () => {
    setIsEditingUrl(false);
    setEditedUrl("");
    setEditedMethod("GET");
  };

  const handleSaveUrl = () => {
    if (!(endpoint && editedUrl.trim())) {
      return;
    }

    // Don't update if nothing changed
    if (editedUrl === endpoint.url && editedMethod === endpoint.method) {
      setIsEditingUrl(false);
      return;
    }

    // Build update payload - only include changed fields
    const updatePayload: {
      endpointId: string;
      url?: string;
      method?: string;
    } = {
      endpointId: endpoint.id,
    };

    if (editedUrl.trim() !== endpoint.url) {
      updatePayload.url = editedUrl.trim();
    }

    if (editedMethod !== endpoint.method) {
      updatePayload.method = editedMethod;
    }

    updateEndpoint(updatePayload, {
      onSuccess: () => {
        setIsEditingUrl(false);
        setEditedUrl("");
        setEditedMethod("GET");
      },
      onError: () => {
        // Error toast is handled by the hook
        // Keep editing mode open so user can correct the error
      },
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSaveUrl();
    } else if (e.key === "Escape") {
      handleCancelEdit();
    }
  };

  const handleDeleteEndpointClick = () => {
    setShowDeleteEndpointDialog(true);
  };

  const handleConfirmDeleteEndpoint = () => {
    if (!endpoint) {
      return;
    }

    deleteEndpoint(
      {
        endpointId: endpoint.id,
      },
      {
        onSuccess: () => {
          setShowDeleteEndpointDialog(false);
          // Redirect to endpoints page after deletion
          navigate("/dashboard/endpoints");
        },
      }
    );
  };

  // Show error if the ID cannot be decoded
  if (!decodedId) {
    return (
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
        initial={{ opacity: 0, y: 20 }}
        transition={{ duration: PAGE_ANIMATION_DURATION, ease: "easeOut" }}
      >
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 20 }}
          transition={{
            duration: PAGE_ANIMATION_DURATION,
            delay: STAGGER_DELAY,
            ease: "easeOut",
          }}
        >
          <Button onClick={handleBack} size="sm" variant="ghost">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Endpoints
          </Button>
        </motion.div>
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 20 }}
          transition={{
            duration: PAGE_ANIMATION_DURATION,
            delay: STAGGER_DELAY * 2,
            ease: "easeOut",
          }}
        >
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
        </motion.div>
      </motion.div>
    );
  }

  if (isLoadingEndpoint) {
    return (
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4 md:space-y-6"
        initial={{ opacity: 0, y: 20 }}
        transition={{ duration: PAGE_ANIMATION_DURATION, ease: "easeOut" }}
      >
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
          initial={{ opacity: 0, y: 20 }}
          transition={{
            duration: PAGE_ANIMATION_DURATION,
            delay: STAGGER_DELAY,
            ease: "easeOut",
          }}
        >
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
        </motion.div>

        <motion.div
          animate={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 20 }}
          transition={{
            duration: PAGE_ANIMATION_DURATION,
            delay: STAGGER_DELAY * 2,
            ease: "easeOut",
          }}
        >
          <EndpointDetailSkeleton />
        </motion.div>
      </motion.div>
    );
  }

  if (!endpoint) {
    return (
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
        initial={{ opacity: 0, y: 20 }}
        transition={{ duration: PAGE_ANIMATION_DURATION, ease: "easeOut" }}
      >
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 20 }}
          transition={{
            duration: PAGE_ANIMATION_DURATION,
            delay: STAGGER_DELAY,
            ease: "easeOut",
          }}
        >
          <Button onClick={handleBack} size="sm" variant="ghost">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Endpoints
          </Button>
        </motion.div>
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 20 }}
          transition={{
            duration: PAGE_ANIMATION_DURATION,
            delay: STAGGER_DELAY * 2,
            ease: "easeOut",
          }}
        >
          <Empty className="min-h-[60vh] border">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Circle />
              </EmptyMedia>
              <EmptyTitle>Endpoint not found</EmptyTitle>
              <EmptyDescription>
                The endpoint you're looking for doesn't exist or has been
                removed.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button onClick={handleBack}>Back to Endpoints</Button>
            </EmptyContent>
          </Empty>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4 md:space-y-6"
      initial={{ opacity: 0, y: 20 }}
      transition={{ duration: PAGE_ANIMATION_DURATION, ease: "easeOut" }}
    >
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
        initial={{ opacity: 0, y: 20 }}
        transition={{
          duration: PAGE_ANIMATION_DURATION,
          delay: STAGGER_DELAY,
          ease: "easeOut",
        }}
      >
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
              {isEditingUrl ? (
                <div className="flex w-full flex-wrap items-center gap-2">
                  <Select
                    disabled={isUpdatingEndpoint}
                    onValueChange={(value) =>
                      setEditedMethod(value as HttpMethod)
                    }
                    value={editedMethod}
                  >
                    <SelectTrigger className="h-9 w-[100px] font-mono text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GET">GET</SelectItem>
                      <SelectItem value="POST">POST</SelectItem>
                      <SelectItem value="PUT">PUT</SelectItem>
                      <SelectItem value="PATCH">PATCH</SelectItem>
                      <SelectItem value="DELETE">DELETE</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    className="flex-1 font-mono text-sm md:text-base"
                    disabled={isUpdatingEndpoint}
                    onChange={(e) => setEditedUrl(e.target.value)}
                    onKeyDown={handleKeyDown}
                    ref={inputRef}
                    value={editedUrl}
                  />
                  <div className="flex gap-1">
                    <Button
                      disabled={isUpdatingEndpoint || !editedUrl.trim()}
                      onClick={handleSaveUrl}
                      size="icon"
                      title="Save (Enter)"
                      type="button"
                      variant="ghost"
                    >
                      <Check className="h-4 w-4 text-green-600" />
                    </Button>
                    <Button
                      disabled={isUpdatingEndpoint}
                      onClick={handleCancelEdit}
                      size="icon"
                      title="Cancel (Esc)"
                      type="button"
                      variant="ghost"
                    >
                      <X className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              ) : (
                <>
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
                  <ProtectedAction ability="canEditEndpoint">
                    <div className="flex items-center gap-1">
                      <Button
                        onClick={handleEditUrl}
                        size="icon"
                        title="Edit endpoint URL and method"
                        type="button"
                        variant="ghost"
                      >
                        <Pen className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={handleDeleteEndpointClick}
                        size="icon"
                        title="Delete endpoint and all responses"
                        type="button"
                        variant="ghost"
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </ProtectedAction>
                </>
              )}
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
      </motion.div>

      <motion.div
        animate={{ opacity: 1, y: 0 }}
        initial={{ opacity: 0, y: 20 }}
        transition={{
          duration: PAGE_ANIMATION_DURATION,
          delay: STAGGER_DELAY * 2,
          ease: "easeOut",
        }}
      >
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
      </motion.div>

      <AnimatePresence>
        {isStepperOpen && (
          <ResponseStepper
            isSubmitting={isCreatingResponse}
            onCancel={() => setIsStepperOpen(false)}
            onSubmit={handleAddResponse}
          />
        )}
      </AnimatePresence>

      <AlertDialog
        onOpenChange={setShowDeleteEndpointDialog}
        open={showDeleteEndpointDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Endpoint?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this endpoint{" "}
              <span className="font-semibold">
                {endpoint?.method} {endpoint?.url}
              </span>
              ? This action cannot be undone and will permanently remove:
              <ul className="mt-2 list-inside list-disc space-y-1">
                <li>The endpoint configuration</li>
                <li>
                  All {endpoint?.responses.length || 0} response
                  {endpoint?.responses.length !== 1 ? "s" : ""} associated with
                  this endpoint
                </li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingEndpoint}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
              disabled={isDeletingEndpoint}
              onClick={handleConfirmDeleteEndpoint}
            >
              {isDeletingEndpoint ? "Deleting..." : "Delete Endpoint"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}
