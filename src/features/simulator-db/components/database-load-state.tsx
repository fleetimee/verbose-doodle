import { RefreshCw } from "@/components/hugeicons";
import { useI18n } from "@/components/i18n-provider";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";

export function DatabaseGridSkeleton({ label }: { readonly label: string }) {
  return (
    <div
      aria-busy="true"
      aria-label={label}
      className="flex h-full min-h-0 flex-col overflow-hidden"
      role="status"
    >
      <span className="sr-only">{label}</span>
      <div
        aria-hidden="true"
        className="flex h-8 shrink-0 items-center gap-3 border-b px-3"
      >
        <Skeleton className="h-4 w-20" variant="table" />
        <Skeleton className="h-4 w-32" variant="table" />
      </div>
      <div aria-hidden="true" className="flex flex-col">
        {Array.from({ length: 12 }, (_, row) => (
          <div
            className="grid h-6 grid-cols-[32px_repeat(4,minmax(0,1fr))] items-center gap-3 border-b px-2"
            key={row}
          >
            <Skeleton className="h-2.5 w-4" variant="table" />
            {Array.from({ length: 4 }, (_, col) => (
              <Skeleton
                className={col % 2 === 0 ? "h-2.5 w-3/4" : "h-2.5 w-1/2"}
                key={col}
                variant="table"
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function DatabaseLoadFailure({
  error,
  onRetry,
}: {
  readonly error: string;
  readonly onRetry: () => void;
}) {
  const {
    messages: { simulatorDb: m },
  } = useI18n();
  return (
    <Empty className="h-full" size="compact">
      <EmptyHeader>
        <EmptyTitle>{m.dataLoadError}</EmptyTitle>
        <EmptyDescription>{error}</EmptyDescription>
      </EmptyHeader>
      <Button onClick={onRetry} size="sm" variant="outline">
        <RefreshCw />
        {m.retryLoad}
      </Button>
    </Empty>
  );
}

export function DatabaseRefreshError({
  error,
  onRetry,
}: {
  readonly error: string;
  readonly onRetry: () => void;
}) {
  const {
    messages: { simulatorDb: m },
  } = useI18n();
  return (
    <Alert className="shrink-0" variant="destructive">
      <AlertTitle>{m.dataLoadError}</AlertTitle>
      <AlertDescription>
        <span>{error}</span>
        <span>{m.previousResults}</span>
        <Button onClick={onRetry} size="xs" variant="outline">
          {m.retryLoad}
        </Button>
      </AlertDescription>
    </Alert>
  );
}

export function DatabaseRefreshIndicator({
  label,
}: {
  readonly label: string;
}) {
  return (
    <div
      aria-label={label}
      className="absolute inset-0 flex cursor-progress items-center justify-center bg-background/40"
      role="status"
    >
      <Badge variant="secondary">
        <RefreshCw className="size-3 animate-spin motion-reduce:animate-none" />
        {label}
      </Badge>
    </div>
  );
}

export function DatabaseGridFallback({
  isLoading,
  error,
  label,
  onRetry,
}: {
  readonly isLoading: boolean;
  readonly error: string | null;
  readonly label: string;
  readonly onRetry: () => void;
}) {
  const {
    messages: { simulatorDb: m },
  } = useI18n();
  if (isLoading) {
    return <DatabaseGridSkeleton label={label} />;
  }
  if (error) {
    return <DatabaseLoadFailure error={error} onRetry={onRetry} />;
  }
  return (
    <Empty className="h-full" size="compact">
      <EmptyHeader>
        <EmptyDescription>{m.selectTable}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
