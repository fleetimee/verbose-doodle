import { useI18n } from "@/components/i18n-provider";
import { Skeleton } from "@/components/ui/skeleton";
import { MetricGauge } from "@/features/server-inventory/components/server-metric-values";
import type { ServerContainer } from "@/features/server-inventory/types";
import { cn } from "@/lib/utils";

function TransferValues({
  label,
  value,
  first,
  second,
  detailed = false,
  loading = false,
}: {
  label: string;
  value: string | null;
  first: string;
  second: string;
  detailed?: boolean;
  loading?: boolean;
}) {
  const parts = value?.split(" / ");
  return (
    <div className={cn("flex min-w-0 flex-col gap-2", detailed && "gap-4")}>
      <span className="text-muted-foreground text-xs">{label}</span>
      <dl
        className={cn(
          "flex flex-col gap-0.5 text-xs",
          detailed && "gap-2 text-sm [&_dd]:mb-2 [&_dd]:text-lg"
        )}
      >
        <dt className="text-muted-foreground">{first}</dt>
        <dd className="font-mono tabular-nums">
          {loading ? (
            <Skeleton
              aria-hidden="true"
              className={detailed ? "h-7 w-20" : "h-4 w-12"}
              variant="table"
            />
          ) : (
            parts?.[0] || "—"
          )}
        </dd>
        <dt className="text-muted-foreground">{second}</dt>
        <dd className="font-mono tabular-nums">
          {loading ? (
            <Skeleton
              aria-hidden="true"
              className={detailed ? "h-7 w-20" : "h-4 w-12"}
              variant="table"
            />
          ) : (
            parts?.[1] || "—"
          )}
        </dd>
      </dl>
    </div>
  );
}

export function ServerContainerReadings({
  item,
  detailed = false,
  loading = false,
}: {
  item?: ServerContainer;
  detailed?: boolean;
  loading?: boolean;
}) {
  const { messages } = useI18n();
  const copy = messages.servers.containers;
  const memory = item?.memoryUsage?.split(" / ");
  const cpuPercent = item?.cpuPercent ?? null;
  const cpuDetail = cpuPercent === null ? "—" : `${cpuPercent.toFixed(2)}%`;
  const memoryTotal = memory?.[1] ? `/${memory[1]}` : "—";
  return (
    <div
      className={cn(
        "grid grid-cols-4 gap-3",
        detailed &&
          "grid-cols-2 items-start gap-x-6 gap-y-8 py-4 sm:grid-cols-4 sm:gap-8"
      )}
    >
      <MetricGauge
        detail={
          loading ? (
            <Skeleton aria-hidden="true" className="h-4 w-12" variant="table" />
          ) : (
            cpuDetail
          )
        }
        label={messages.servers.metrics.cpu}
        large={detailed}
        loading={loading}
        percent={item?.cpuPercent ?? null}
      />
      <MetricGauge
        detail={
          <>
            <div>
              {loading ? (
                <Skeleton
                  aria-hidden="true"
                  className="h-4 w-16"
                  variant="table"
                />
              ) : (
                memory?.[0] || "—"
              )}
            </div>
            <div className="text-muted-foreground">
              {loading ? (
                <Skeleton
                  aria-hidden="true"
                  className="h-4 w-20"
                  variant="table"
                />
              ) : (
                memoryTotal
              )}
            </div>
          </>
        }
        label={messages.servers.metrics.memory}
        large={detailed}
        loading={loading}
        percent={item?.memoryPercent ?? null}
      />
      <TransferValues
        detailed={detailed}
        first={messages.servers.metrics.receive}
        label={copy.networkTotal}
        loading={loading}
        second={messages.servers.metrics.transmit}
        value={item?.networkIo ?? null}
      />
      <TransferValues
        detailed={detailed}
        first={messages.servers.metrics.read}
        label={copy.ioTotal}
        loading={loading}
        second={messages.servers.metrics.write}
        value={item?.blockIo ?? null}
      />
    </div>
  );
}
