import { Code2, Copy, Eye, Play } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  CodeBlock,
  CodeBlockBody,
  CodeBlockContent,
  CodeBlockCopyButton,
  CodeBlockHeader,
  CodeBlockItem,
  CodeBlockThemeSelector,
} from "@/components/kibo-ui/code-block";
import { useTheme } from "@/components/theme-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CodeGeneratorDialog } from "@/features/endpoints/components/code-generator-dialog";
import { RequestSimulatorSheet } from "@/features/endpoints/components/request-simulator-sheet";
import { ResponseSimulationAlert } from "@/features/endpoints/components/response-simulation-alert";
import { ServerSettlingLayer } from "@/features/endpoints/components/server-settling-layer";
import type { EndpointResponse, HttpMethod } from "@/features/endpoints/types";
import { copyToClipboard } from "@/lib/clipboard";
import { messages } from "@/lib/i18n";

const SUCCESS_STATUS_CODE_THRESHOLD = 300;

// Animation constants
const RESPONSE_ANIMATION_DURATION = 0.3;
const STAGGER_DELAY = 0.05;
const ALERT_STAGGER_MULTIPLIER = 3;

type ResponsePreviewProps = {
  response: EndpointResponse | null;
  endpointUrl?: string;
  endpointMethod?: HttpMethod;
};

export function ResponsePreview({
  response,
  endpointUrl,
  endpointMethod,
}: ResponsePreviewProps) {
  const { theme } = useTheme();
  const [isCodeDialogOpen, setIsCodeDialogOpen] = useState(false);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [isServerSettling, setIsServerSettling] = useState(false);

  // Track previous simulation settings to detect changes
  const prevSimulationRef = useRef<{
    responseId: string;
    delayMs?: number | null;
    simulateTimeout?: boolean;
  } | null>(null);

  // Get the base URL from environment variable
  const baseUrl = import.meta.env.VITE_ENDPOINT_URL || "";
  const token = import.meta.env.VITE_API_TOKEN;

  // Detect when simulation settings change for the SAME response
  useEffect(() => {
    if (!response) {
      prevSimulationRef.current = null;
      return;
    }

    const currentSimulation = {
      responseId: response.id,
      delayMs: response.delayMs,
      simulateTimeout: response.simulateTimeout,
    };

    // Check if this is the same response and settings have changed
    if (prevSimulationRef.current !== null) {
      const prevSettings = prevSimulationRef.current;

      // Only show settling screen if it's the SAME response with CHANGED settings
      const isSameResponse =
        prevSettings.responseId === currentSimulation.responseId;
      const hasSimulationChanged =
        prevSettings.delayMs !== currentSimulation.delayMs ||
        prevSettings.simulateTimeout !== currentSimulation.simulateTimeout;

      if (isSameResponse && hasSimulationChanged) {
        setIsServerSettling(true);
      }
    }

    prevSimulationRef.current = currentSimulation;
  }, [response]);

  const handleSettlingComplete = () => {
    setIsServerSettling(false);
  };

  const fullUrl = useMemo(() => {
    if (!(baseUrl && endpointUrl)) {
      return "";
    }
    return `${baseUrl}${endpointUrl}`;
  }, [endpointUrl]);

  const handleCopyUrl = async () => {
    if (!fullUrl) {
      return;
    }

    try {
      const copied = await copyToClipboard(fullUrl);
      if (!copied) {
        toast.error(messages.endpoints.responseCopyUrlFailed);
        return;
      }
      toast.success(messages.endpoints.responseCopyUrlSuccess);
    } catch {
      toast.error(messages.endpoints.responseCopyUrlFailed);
    }
  };

  // Resolve the actual theme (handle "system" preference)
  const resolvedTheme = useMemo(() => {
    if (theme === "system") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }
    return theme;
  }, [theme]);

  const formattedResponseJson = useMemo(() => {
    if (!response) {
      return "";
    }

    try {
      const parsed = JSON.parse(response.json);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return response.json;
    }
  }, [response]);

  const endpointMessages = messages.endpoints;

  return (
    <div className="flex h-full flex-col">
      <div className="border-b px-4 py-3">
        <h2 className="font-semibold text-sm">
          {endpointMessages.responsePreviewTitle}
        </h2>
      </div>
      <ScrollArea className="relative flex-1">
        {/* Server Settling Layer */}
        <AnimatePresence>
          {isServerSettling && (
            <ServerSettlingLayer onComplete={handleSettlingComplete} />
          )}
        </AnimatePresence>
        <AnimatePresence mode="wait">
          {response ? (
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className="p-4"
              exit={{ opacity: 0, y: -10 }}
              initial={{ opacity: 0, y: 10 }}
              key={response.id}
              transition={{
                duration: RESPONSE_ANIMATION_DURATION,
                ease: "easeOut",
              }}
            >
              <motion.div
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 space-y-3"
                initial={{ opacity: 0, y: 10 }}
                transition={{
                  duration: RESPONSE_ANIMATION_DURATION,
                  delay: STAGGER_DELAY,
                  ease: "easeOut",
                }}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">{response.name}</h3>
                  {response.activated ? (
                    <Badge
                      className="flex items-center gap-1.5"
                      variant="secondary"
                    >
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      </span>
                      {endpointMessages.responseActiveBadge}
                    </Badge>
                  ) : (
                    <Badge
                      className="flex items-center gap-1.5 text-muted-foreground"
                      variant="outline"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50" />
                      {endpointMessages.responseInactiveBadge}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-sm">
                    {endpointMessages.responseStatusCodeLabel}
                  </span>
                  <Badge
                    className="font-mono"
                    variant={
                      response.statusCode < SUCCESS_STATUS_CODE_THRESHOLD
                        ? "default"
                        : "destructive"
                    }
                  >
                    {response.statusCode}
                  </Badge>
                </div>

                {/* URL Preview and Actions */}
                {endpointUrl && endpointMethod && baseUrl && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="shrink-0 text-muted-foreground text-sm">
                        {endpointMessages.responseEndpointUrlLabel}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <input
                        className="flex-1 rounded-md border border-input bg-background px-3 py-2 font-mono text-xs ring-offset-background file:border-0 file:bg-transparent file:font-medium file:text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        readOnly
                        type="text"
                        value={fullUrl}
                      />
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              onClick={() => setIsCodeDialogOpen(true)}
                              size="icon"
                              variant="outline"
                            >
                              <Code2 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>
                              {endpointMessages.responseGenerateCodeTooltip}
                            </p>
                          </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              onClick={handleCopyUrl}
                              size="icon"
                              variant="outline"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{endpointMessages.responseCopyUrlTooltip}</p>
                          </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              onClick={() => setIsSimulatorOpen(true)}
                              size="icon"
                              variant="outline"
                            >
                              <Play className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>
                              {endpointMessages.responseSimulateRequestTooltip}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>

                    <CodeGeneratorDialog
                      baseUrl={baseUrl}
                      method={endpointMethod}
                      onOpenChange={setIsCodeDialogOpen}
                      open={isCodeDialogOpen}
                      path={endpointUrl}
                      response={response}
                      token={token}
                    />
                    <RequestSimulatorSheet
                      baseUrl={baseUrl}
                      endpointUrl={endpointUrl}
                      method={endpointMethod}
                      onOpenChange={setIsSimulatorOpen}
                      open={isSimulatorOpen}
                      response={response}
                      token={token}
                    />
                  </div>
                )}
              </motion.div>

              {/* Simulation Explanation Alert */}
              <motion.div
                animate={{ opacity: 1, y: 0 }}
                className="mb-4"
                initial={{ opacity: 0, y: 10 }}
                transition={{
                  duration: RESPONSE_ANIMATION_DURATION,
                  delay: STAGGER_DELAY * 2,
                  ease: "easeOut",
                }}
              >
                <ResponseSimulationAlert response={response} />
              </motion.div>

              <motion.div
                animate={{ opacity: 1, y: 0 }}
                initial={{ opacity: 0, y: 10 }}
                transition={{
                  duration: RESPONSE_ANIMATION_DURATION,
                  delay: STAGGER_DELAY * ALERT_STAGGER_MULTIPLIER,
                  ease: "easeOut",
                }}
              >
                <CodeBlock
                  className="max-w-full"
                  data={[
                    {
                      language: "json",
                      filename: "response.json",
                      code: formattedResponseJson,
                    },
                  ]}
                  defaultValue="json"
                  storageKey="response-preview-themes"
                >
                  <CodeBlockHeader>
                    <div className="flex-1 px-3 py-1 text-muted-foreground text-xs">
                      {endpointMessages.responseBodyTitle}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground text-xs">
                        {endpointMessages.responseThemeLabel}
                      </span>
                      <CodeBlockThemeSelector
                        mode={resolvedTheme === "dark" ? "dark" : "light"}
                      />
                    </div>
                    <CodeBlockCopyButton />
                  </CodeBlockHeader>
                  <CodeBlockBody>
                    {(item) => (
                      <CodeBlockItem key={item.language} value="json">
                        <CodeBlockContent
                          className="[&_.line]:max-w-full [&_.line]:break-all [&_code]:max-w-full [&_code]:whitespace-pre-wrap [&_pre]:max-w-full [&_pre]:whitespace-pre-wrap"
                          language="json"
                        >
                          {item.code}
                        </CodeBlockContent>
                      </CodeBlockItem>
                    )}
                  </CodeBlockBody>
                </CodeBlock>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              initial={{ opacity: 0, y: 10 }}
              key="empty"
              transition={{
                duration: RESPONSE_ANIMATION_DURATION,
                ease: "easeOut",
              }}
            >
              <Empty className="min-h-[300px] border-0">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Eye />
                  </EmptyMedia>
                  <EmptyTitle>{endpointMessages.responseEmptyTitle}</EmptyTitle>
                  <EmptyDescription>
                    {endpointMessages.responseEmptyDescription}
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            </motion.div>
          )}
        </AnimatePresence>
      </ScrollArea>
    </div>
  );
}
