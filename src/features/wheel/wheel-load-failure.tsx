import { z } from "zod";
import { RefreshCw, ServerCrash } from "@/components/hugeicons";
import { useI18n } from "@/components/i18n-provider";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";

type FailureScope = "grid" | "detail" | "shared" | "integrity";
const failureSchema = z.object({
  status: z.number().optional(),
  code: z.string().optional(),
});
function failureReason(cause?: Error | null) {
  const parsed = failureSchema.safeParse(cause);
  if (parsed.success) {
    if (parsed.data.status === 404 || parsed.data.code === "NOT_FOUND") {
      return "missing";
    }
    if (
      parsed.data.status === 401 ||
      parsed.data.status === 403 ||
      parsed.data.code === "FORBIDDEN" ||
      parsed.data.code === "UNAUTHORIZED"
    ) {
      return "access";
    }
    if (
      parsed.data.code === "TIMEOUT" ||
      parsed.data.code === "NETWORK_ERROR" ||
      parsed.data.status === 0
    ) {
      return "connection";
    }
  }
  return cause instanceof TypeError ? "connection" : "server";
}

export function WheelLoadFailure({
  cause,
  scope,
  pending,
  onRetry,
  onBack,
}: {
  cause?: Error | null;
  scope: FailureScope;
  pending: boolean;
  onRetry: () => void;
  onBack?: () => void;
}) {
  const {
    messages: { wheel: copy },
  } = useI18n();
  const reason = failureReason(cause);
  const titles = {
    grid: copy.gridLoadFailed,
    detail: copy.detailLoadFailed,
    shared: copy.shareUnavailable,
    integrity: copy.integrityFailed,
  };
  const hints = {
    grid: copy.gridLoadHint,
    detail: copy.detailLoadHint,
    shared: copy.shareUnavailableHint,
    integrity: copy.integrityFailedHint,
  };
  let title: string = titles[scope];
  let hint: string = hints[scope];
  if (scope !== "shared" && scope !== "integrity") {
    if (reason === "connection") {
      title = copy.connectionLost;
      hint = copy.connectionHint;
    }
    if (reason === "missing") {
      title = copy.wheelMissing;
      hint = copy.wheelMissingHint;
    }
    if (reason === "access") {
      title = copy.wheelAccessDenied;
      hint = copy.wheelAccessHint;
    }
  }
  return (
    <Empty
      aria-busy={pending}
      className="min-h-0 w-full"
      role="alert"
      variant="bordered"
    >
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <ServerCrash />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{hint}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Button disabled={pending} onClick={onRetry} size="sm">
            {pending ? <Spinner /> : <RefreshCw data-icon="inline-start" />}
            {pending ? copy.retrying : copy.retry}
          </Button>
          {onBack && (
            <Button onClick={onBack} size="sm" variant="ghost">
              {copy.backToSessions}
            </Button>
          )}
        </div>
      </EmptyContent>
    </Empty>
  );
}

export function WheelQueryFeedback({
  active,
  cause,
  hasData,
  pending,
  onRetry,
  onBack,
  scope,
}: {
  active: boolean;
  cause: Error | null;
  hasData: boolean;
  pending: boolean;
  onRetry: () => void;
  onBack?: () => void;
  scope: FailureScope;
}) {
  const {
    messages: { wheel: copy },
  } = useI18n();
  if (!(active && cause)) {
    return null;
  }
  if (!hasData) {
    return (
      <WheelLoadFailure
        cause={cause}
        onBack={onBack}
        onRetry={onRetry}
        pending={pending}
        scope={scope}
      />
    );
  }
  return (
    <Alert>
      <ServerCrash />
      <AlertTitle>{copy.refreshFailed}</AlertTitle>
      <AlertDescription>
        <div className="flex w-full flex-wrap items-center justify-between gap-3">
          <p>{copy.refreshFailedHint}</p>
          <Button
            disabled={pending}
            onClick={onRetry}
            size="sm"
            variant="outline"
          >
            {pending && <Spinner />}
            {copy.retry}
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}
