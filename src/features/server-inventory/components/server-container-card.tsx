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
import { Skeleton } from "@/components/ui/skeleton";
import { ServerContainerReadings } from "@/features/server-inventory/components/server-container-readings";
import { containerVariant } from "@/features/server-inventory/components/server-container-status";
import type { ServerContainer } from "@/features/server-inventory/types";
import { formatMessage } from "@/lib/i18n";

export function ServerContainerCardSkeleton() {
  return (
    <Card
      aria-hidden="true"
      className="min-w-0"
      size="monitor"
      variant="monitor"
    >
      <CardHeader size="none">
        <div className="flex min-w-0 items-center gap-2">
          <Skeleton className="size-4 shrink-0" variant="table" />
          <Skeleton className="h-5 w-28 max-w-full" variant="table" />
        </div>
        <CardAction>
          <Skeleton className="h-4 w-16" variant="table" />
        </CardAction>
      </CardHeader>
      <Separator />
      <CardContent size="none">
        <div className="grid grid-cols-4 gap-3">
          {["cpu", "memory"].map((metric) => (
            <div
              className="flex min-w-0 flex-col items-center gap-1.5"
              key={metric}
            >
              <Skeleton className="h-4 w-10 max-w-full" variant="table" />
              <div className="relative size-10">
                <svg
                  aria-hidden="true"
                  className="size-full animate-pulse motion-reduce:animate-none"
                  viewBox="0 0 64 64"
                >
                  <circle
                    className="stroke-accent"
                    cx="32"
                    cy="32"
                    fill="none"
                    r="27"
                    strokeWidth="5"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Skeleton className="h-3 w-4" variant="table" />
                </div>
              </div>
              <div className="flex max-w-full flex-col items-center gap-0.5">
                <Skeleton className="h-4 w-12 max-w-full" variant="table" />
                {metric === "memory" && (
                  <Skeleton className="h-4 w-14 max-w-full" variant="table" />
                )}
              </div>
            </div>
          ))}
          {["network", "io"].map((metric) => (
            <div className="flex min-w-0 flex-col gap-2" key={metric}>
              <Skeleton className="h-4 w-12 max-w-full" variant="table" />
              <div className="flex flex-col gap-0.5">
                <Skeleton className="h-4 w-10 max-w-full" variant="table" />
                <Skeleton className="h-4 w-12 max-w-full" variant="table" />
                <Skeleton className="h-4 w-8 max-w-full" variant="table" />
                <Skeleton className="h-4 w-12 max-w-full" variant="table" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter size="none">
        <div className="flex min-w-0 flex-1 flex-wrap items-center justify-between gap-2">
          <Skeleton className="h-4 w-40 max-w-full" variant="table" />
          <Skeleton className="h-5 w-16" variant="table" />
          <div className="w-full">
            <Skeleton className="h-4 w-24" variant="table" />
          </div>
        </div>
      </CardFooter>
    </Card>
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
        <ServerContainerReadings item={item} />
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
