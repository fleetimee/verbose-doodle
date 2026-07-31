import {
  AnimatePresence,
  LayoutGroup,
  motion,
  useReducedMotion,
} from "motion/react";
import { useId, useMemo } from "react";
import { ListX } from "@/components/hugeicons";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ResponseListItem } from "@/features/endpoints/components/response-list-item";
import type { EndpointResponse } from "@/features/endpoints/types";
import { messages } from "@/lib/i18n";
import { MOTION_DURATION, MOTION_EASE } from "@/lib/motion";
import { cn } from "@/lib/utils";

type ResponseListProps = {
  endpointId: string;
  endpointSlug: string;
  responses: EndpointResponse[];
  selectedResponseId: string | null;
  isActivating: boolean;
  isDeactivating: boolean;
  onSelectResponse: (id: string) => void;
  onActivateResponse: (response: EndpointResponse) => void;
  onCloneResponse: (response: EndpointResponse) => void;
  onDeactivateResponse: (response: EndpointResponse) => void;
  onEditResponseDirtyChange?: (isDirty: boolean) => void;
};

type ResponseSectionHeaderProps = {
  readonly count: number;
  readonly isActive: boolean;
  readonly label: string;
};

type AnimatedResponseListItemProps = Parameters<typeof ResponseListItem>[0];

function AnimatedResponseListItem({
  layoutNamespace,
  ...props
}: AnimatedResponseListItemProps & { readonly layoutNamespace: string }) {
  const shouldReduceMotion = useReducedMotion() ?? false;
  const motionState = shouldReduceMotion
    ? {
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        initial: { opacity: 0 },
      }
    : {
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.97 },
        initial: { opacity: 0, scale: 0.97 },
      };

  return (
    <motion.div
      layout={!shouldReduceMotion}
      layoutId={
        shouldReduceMotion
          ? undefined
          : `${layoutNamespace}-response-${props.response.id}`
      }
      transition={{
        duration: MOTION_DURATION.fast,
        ease: MOTION_EASE.out,
        layout: {
          duration: MOTION_DURATION.standard,
          ease: MOTION_EASE.out,
        },
      }}
      {...motionState}
    >
      <ResponseListItem {...props} />
    </motion.div>
  );
}

function ResponseSectionHeader({
  count,
  isActive,
  label,
}: ResponseSectionHeaderProps) {
  return (
    <div className="flex items-center gap-3 px-2 py-2">
      <Separator className="flex-1" />
      <span
        className={cn(
          "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 font-medium text-[10px] uppercase tracking-[0.12em]",
          isActive
            ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-700 dark:text-emerald-300"
            : "border-border/70 bg-muted/35 text-muted-foreground"
        )}
      >
        <span
          className={cn(
            "size-1.5 rounded-full",
            isActive ? "bg-emerald-500" : "bg-muted-foreground/45"
          )}
        />
        <span>{label}</span>
        <span className="font-mono text-[10px] opacity-70">{count}</span>
      </span>
      <Separator className="flex-1" />
    </div>
  );
}

export function ResponseList({
  endpointId,
  endpointSlug,
  responses,
  selectedResponseId,
  isActivating,
  isDeactivating,
  onSelectResponse,
  onActivateResponse,
  onCloneResponse,
  onDeactivateResponse,
  onEditResponseDirtyChange,
}: ResponseListProps) {
  const layoutNamespace = useId();
  // Group responses by active/inactive status
  const { activeResponses, inactiveResponses } = useMemo(() => {
    const active = responses.filter((r) => r.activated);
    const inactive = responses.filter((r) => !r.activated);
    return { activeResponses: active, inactiveResponses: inactive };
  }, [responses]);

  return (
    <div className="flex h-full flex-col">
      <div className="border-b px-4 py-3">
        <h2 className="font-semibold text-sm">Responses</h2>
      </div>
      <ScrollArea className="flex-1">
        {responses.length === 0 ? (
          <Empty className="min-h-[300px] border-0">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <ListX />
              </EmptyMedia>
              <EmptyTitle>No responses configured yet</EmptyTitle>
              <EmptyDescription>
                Add a response using the button above to get started.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <LayoutGroup id={layoutNamespace}>
            <div className="p-2">
              {/* Active Responses Section */}
              {activeResponses.length > 0 && (
                <div className="space-y-1">
                  <AnimatePresence initial={false} mode="popLayout">
                    {activeResponses.map((response) => (
                      <AnimatedResponseListItem
                        endpointId={endpointId}
                        endpointSlug={endpointSlug}
                        isActivating={isActivating}
                        isDeactivating={isDeactivating}
                        isSelected={selectedResponseId === response.id}
                        key={response.id}
                        layoutNamespace={layoutNamespace}
                        onActivate={onActivateResponse}
                        onClone={onCloneResponse}
                        onDeactivate={onDeactivateResponse}
                        onEditDirtyChange={onEditResponseDirtyChange}
                        onSelect={onSelectResponse}
                        response={response}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              )}

              {/* Inactive Responses Section */}
              {inactiveResponses.length > 0 && (
                <div className="space-y-1">
                  {/* Show label only when no active responses */}
                  {activeResponses.length === 0 && (
                    <div className="mb-3 rounded-md border border-amber-500/20 bg-amber-500/5 p-3 text-sm shadow-xs dark:border-amber-500/30">
                      <div className="flex gap-3">
                        <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md bg-amber-500/10 text-amber-600 shadow-xs dark:text-amber-400">
                          <span className="relative flex h-2 w-2">
                            <span className="absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75 motion-safe:animate-ping" />
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
                          </span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <p className="font-semibold text-amber-800 dark:text-amber-200">
                            {messages.endpoints.noActiveResponseTitle}
                          </p>
                          <p className="text-amber-700/80 text-xs leading-relaxed dark:text-amber-300/80">
                            {messages.endpoints.noActiveResponseDescription}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeResponses.length > 0 && (
                    <ResponseSectionHeader
                      count={inactiveResponses.length}
                      isActive={false}
                      label={messages.endpoints.inactiveResponsesLabel}
                    />
                  )}

                  <AnimatePresence initial={false} mode="popLayout">
                    {inactiveResponses.map((response) => (
                      <AnimatedResponseListItem
                        endpointId={endpointId}
                        endpointSlug={endpointSlug}
                        isActivating={isActivating}
                        isDeactivating={isDeactivating}
                        isSelected={selectedResponseId === response.id}
                        key={response.id}
                        layoutNamespace={layoutNamespace}
                        onActivate={onActivateResponse}
                        onClone={onCloneResponse}
                        onDeactivate={onDeactivateResponse}
                        onEditDirtyChange={onEditResponseDirtyChange}
                        onSelect={onSelectResponse}
                        response={response}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </LayoutGroup>
        )}
      </ScrollArea>
    </div>
  );
}
