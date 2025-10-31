import { ArrowLeft, Circle } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import {
  CodeBlock,
  CodeBlockBody,
  CodeBlockContent,
  CodeBlockCopyButton,
  CodeBlockHeader,
  CodeBlockItem,
} from "@/components/kibo-ui/code-block";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { AddResponseDialog } from "@/features/endpoints/components/add-response-dialog";
import { ResponseListItem } from "@/features/endpoints/components/response-list-item";
import { useActivateResponse } from "@/features/endpoints/hooks/use-activate-response";
import { useCreateResponse } from "@/features/endpoints/hooks/use-create-response";
import { useGetEndpoint } from "@/features/endpoints/hooks/use-get-endpoint";
import type { ResponseFormData } from "@/features/endpoints/schemas/response-schema";
import type { EndpointResponse } from "@/features/endpoints/types";
import {
  abbreviateMethod,
  getMethodBadgeColor,
} from "@/features/endpoints/utils/http-method-colors";
import { useDocumentMeta } from "@/hooks/use-document-meta";

const SUCCESS_STATUS_CODE_THRESHOLD = 300;

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

  const formattedResponseJson = useMemo(() => {
    if (!selectedResponse) {
      return "";
    }

    try {
      const parsed = JSON.parse(selectedResponse.json);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return selectedResponse.json;
    }
  }, [selectedResponse]);

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

  if (isLoadingEndpoint) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
        </div>
        <Skeleton className="h-[600px] w-full" />
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

      <Card className="overflow-hidden">
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel defaultSize={35} minSize={25}>
            <div className="flex h-full flex-col">
              <div className="border-b px-4 py-3">
                <h2 className="font-semibold text-sm">Responses</h2>
              </div>
              <ScrollArea className="flex-1">
                {endpoint.responses.length === 0 ? (
                  <div className="p-8 text-center">
                    <p className="text-muted-foreground text-sm">
                      No responses configured yet.
                    </p>
                    <Button
                      className="mt-4"
                      onClick={() => setIsAddDialogOpen(true)}
                      size="sm"
                      variant="outline"
                    >
                      Add First Response
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-1 p-2">
                    {endpoint.responses.map((response) => (
                      <ResponseListItem
                        isActivating={isActivatingResponse}
                        isSelected={selectedResponseId === response.id}
                        key={response.id}
                        onActivate={handleActivateResponse}
                        onSelect={setSelectedResponseId}
                        response={response}
                      />
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          <ResizablePanel defaultSize={65} minSize={35}>
            <div className="flex h-full flex-col">
              <div className="border-b px-4 py-3">
                <h2 className="font-semibold text-sm">Response Preview</h2>
              </div>
              <ScrollArea className="flex-1">
                {selectedResponse ? (
                  <div className="p-4">
                    <div className="mb-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-lg">
                          {selectedResponse.name}
                        </h3>
                        {selectedResponse.activated && (
                          <Badge variant="secondary">Active Response</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground text-sm">
                          Status Code:
                        </span>
                        <Badge
                          className="font-mono"
                          variant={
                            selectedResponse.statusCode <
                            SUCCESS_STATUS_CODE_THRESHOLD
                              ? "default"
                              : "destructive"
                          }
                        >
                          {selectedResponse.statusCode}
                        </Badge>
                      </div>
                    </div>

                    <CodeBlock
                      data={[
                        {
                          language: "json",
                          filename: "response.json",
                          code: formattedResponseJson,
                        },
                      ]}
                      defaultValue="json"
                    >
                      <CodeBlockHeader>
                        <div className="flex-1 px-3 py-1 text-muted-foreground text-xs">
                          Response Body
                        </div>
                        <CodeBlockCopyButton />
                      </CodeBlockHeader>
                      <CodeBlockBody>
                        {(item) => (
                          <CodeBlockItem key={item.language} value="json">
                            <CodeBlockContent language="json">
                              {item.code}
                            </CodeBlockContent>
                          </CodeBlockItem>
                        )}
                      </CodeBlockBody>
                    </CodeBlock>
                  </div>
                ) : (
                  <div className="flex h-full items-center justify-center p-8">
                    <div className="text-center">
                      <p className="text-muted-foreground">
                        Select a response from the list to preview
                      </p>
                    </div>
                  </div>
                )}
              </ScrollArea>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </Card>
    </div>
  );
}
