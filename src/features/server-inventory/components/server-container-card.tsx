import { Link } from "react-router";
import { Layers3 } from "@/components/hugeicons";
import { useI18n } from "@/components/i18n-provider";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { containerVariant } from "@/features/server-inventory/components/server-container-status";
import { MetricGauge } from "@/features/server-inventory/components/server-metric-values";
import type { ServerContainer } from "@/features/server-inventory/types";
import { formatMessage } from "@/lib/i18n";

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

export function ServerContainerCard({
  item,
  to,
}: {
  item: ServerContainer;
  to: string;
}) {
  const { messages } = useI18n();
  const copy = messages.servers.containers;
  const states: Record<string, string> = copy.states;
  const memory = item.memoryUsage?.split(" / ");
  return (
    <Card className="relative isolate min-w-0" size="monitor" variant="monitor">
      <Link
        aria-label={formatMessage(copy.openContainer, { name: item.name })}
        className="absolute inset-0 rounded-2xl outline-none transition-colors hover:bg-muted/10 focus-visible:ring-2 focus-visible:ring-ring active:bg-muted/20 motion-reduce:transition-none"
        id={`container-${item.id}`}
        to={to}
      />
      <CardHeader size="none">
        <CardTitle size="sm">
          <span className="flex min-w-0 items-center gap-2">
            <Layers3
              aria-hidden="true"
              className="size-4 shrink-0 text-primary"
            />
            <span className="truncate" title={item.name}>
              {item.name}
            </span>
          </span>
        </CardTitle>
        <CardAction>
          <span
            className="font-mono text-muted-foreground text-xs"
            title={item.id}
          >
            #{item.id.slice(0, 8)}
          </span>
        </CardAction>
      </CardHeader>
      <Separator />
      <CardContent size="none">
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
      </CardContent>
      <CardFooter size="none">
        <div className="flex min-w-0 flex-1 flex-wrap items-center justify-between gap-2">
          <CardDescription size="xs">
            <span
              className="block max-w-48 truncate font-mono"
              title={item.image}
            >
              {item.image}
            </span>
          </CardDescription>
          <Badge variant={containerVariant(item.state, item.status)}>
            {states[item.state] ?? item.state}
          </Badge>
          <span
            className="w-full truncate text-muted-foreground text-xs"
            title={item.status}
          >
            {item.status}
          </span>
        </div>
      </CardFooter>
    </Card>
  );
}
