import { useI18n } from "@/components/i18n-provider";
import { MetricGauge } from "@/features/server-inventory/components/server-metric-values";
import type { ServerContainer } from "@/features/server-inventory/types";

function TransferValues({
  label,
  value,
  first,
  second,
}: {
  label: string;
  value: string | null;
  first: string;
  second: string;
}) {
  const parts = value?.split(" / ");
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <span className="text-muted-foreground text-xs">{label}</span>
      <dl className="flex flex-col gap-0.5 text-xs">
        <dt className="text-muted-foreground">{first}</dt>
        <dd className="font-mono tabular-nums">{parts?.[0] || "—"}</dd>
        <dt className="text-muted-foreground">{second}</dt>
        <dd className="font-mono tabular-nums">{parts?.[1] || "—"}</dd>
      </dl>
    </div>
  );
}

export function ServerContainerReadings({ item }: { item: ServerContainer }) {
  const { messages } = useI18n();
  const copy = messages.servers.containers;
  const memory = item.memoryUsage?.split(" / ");
  return (
    <div className="grid grid-cols-4 gap-3">
      <MetricGauge
        detail={
          item.cpuPercent === null ? "—" : `${item.cpuPercent.toFixed(2)}%`
        }
        label={messages.servers.metrics.cpu}
        percent={item.cpuPercent}
      />
      <MetricGauge
        detail={
          <>
            <span>{memory?.[0] || "—"}</span>
            <span className="text-muted-foreground">
              {memory?.[1] ? `/${memory[1]}` : "—"}
            </span>
          </>
        }
        label={messages.servers.metrics.memory}
        percent={item.memoryPercent}
      />
      <TransferValues
        first={messages.servers.metrics.receive}
        label={copy.networkTotal}
        second={messages.servers.metrics.transmit}
        value={item.networkIo}
      />
      <TransferValues
        first={messages.servers.metrics.read}
        label={copy.ioTotal}
        second={messages.servers.metrics.write}
        value={item.blockIo}
      />
    </div>
  );
}
