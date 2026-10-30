import type { ReactNode } from "react";
import { SiDocker } from "react-icons/si";
import { useSearchParams } from "react-router";
import { Code2, FileTerminal, Info, Layers3 } from "@/components/hugeicons";
import { useI18n } from "@/components/i18n-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Empty, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ImageSortHead,
  imageSizeBytes,
} from "@/features/server-inventory/components/server-image-table";
import { metricBytes } from "@/features/server-inventory/components/server-metric-values";
import { isInspectObject } from "@/features/server-inventory/container-inspect-values";
import type {
  ContainerInspectValue,
  ServerImages,
} from "@/features/server-inventory/types";

function display(value: ContainerInspectValue | undefined): string {
  if (value === undefined || value === null || value === "") {
    return "—";
  }
  if (Array.isArray(value)) {
    return value.map(display).join("\n") || "—";
  }
  if (isInspectObject(value)) {
    return (
      Object.entries(value)
        .map(
          ([key, item]) =>
            `${key}${item === "" || isInspectObject(item) ? "" : `=${display(item)}`}`
        )
        .join("\n") || "—"
    );
  }
  return String(value);
}

function ImageGroup({
  title,
  icon,
  rows,
}: {
  title: string;
  icon: ReactNode;
  rows: [string, ContainerInspectValue | undefined][];
}) {
  return (
    <Card className="min-w-0" size="monitor" variant="monitor">
      <CardHeader size="none">
        <CardTitle size="sm" variant="inline">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent size="none">
        <dl className="divide-y divide-border/40">
          {rows.map(([label, value]) => (
            <div
              className="grid items-baseline gap-x-4 gap-y-1.5 py-3 first:pt-0 last:pb-0 sm:grid-cols-[11rem_minmax(0,1fr)]"
              key={label}
            >
              <dt className="min-w-0 break-words text-muted-foreground text-xs leading-relaxed">
                {label}
              </dt>
              <dd className="min-w-0 whitespace-pre-wrap break-all font-mono text-xs leading-relaxed">
                {display(value)}
              </dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  );
}

function ImageLayers({ history }: { history: ServerImages["history"] }) {
  const { messages } = useI18n();
  const copy = messages.servers.images;
  const [params, setParams] = useSearchParams();
  const sort = params.get("layerSort") ?? "order";
  const descending = params.get("layerDirection") === "desc";
  const sortBy = (column: string) =>
    setParams(
      (current) => {
        const next = new URLSearchParams(current);
        next.set("layerSort", column);
        next.set(
          "layerDirection",
          sort === column && !descending ? "desc" : "asc"
        );
        return next;
      },
      { replace: true }
    );
  const layers = [...history].reverse().map((layer, order) => ({
    order,
    Size: layer.Size,
    CreatedBy: layer.CreatedBy,
  }));
  layers.sort((left, right) => {
    let comparison = left.order - right.order;
    if (sort === "size") {
      comparison =
        imageSizeBytes(left.Size ?? "") - imageSizeBytes(right.Size ?? "");
    }
    if (sort === "layer") {
      comparison = (left.CreatedBy ?? "").localeCompare(right.CreatedBy ?? "");
    }
    return (descending ? -comparison : comparison) || left.order - right.order;
  });
  return (
    <Card className="min-w-0" size="monitor" variant="monitor">
      <CardHeader size="none">
        <CardTitle size="sm" variant="inline">
          <Layers3
            aria-hidden="true"
            className="size-4 text-muted-foreground"
          />
          {copy.history}
        </CardTitle>
        <p className="mt-2 text-muted-foreground text-xs">{copy.layersHint}</p>
      </CardHeader>
      <CardContent size="none">
        {layers.length ? (
          <Table>
            <TableHeader>
              <TableRow>
                {[
                  ["order", copy.order],
                  ["size", copy.size],
                  ["layer", copy.layer],
                ].map(([key, label]) => (
                  <ImageSortHead
                    active={sort === key}
                    descending={descending}
                    key={key}
                    label={label ?? ""}
                    onSort={() => sortBy(key ?? "order")}
                  />
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {layers.map((layer) => (
                <TableRow key={layer.order}>
                  <TableCell className="w-20" variant="muted">
                    {layer.order}
                  </TableCell>
                  <TableCell className="w-28">{layer.Size}</TableCell>
                  <TableCell
                    className="max-w-xl whitespace-pre-wrap break-words"
                    variant="mono"
                  >
                    {(layer.CreatedBy?.length ?? 0) > 120 ? (
                      <details className="group">
                        <summary className="cursor-pointer rounded-md py-1 leading-relaxed focus-visible:outline-2 focus-visible:outline-ring">
                          {layer.CreatedBy?.slice(0, 120)}…
                        </summary>
                        <pre className="mt-2 whitespace-pre-wrap break-words rounded-lg bg-muted/30 p-3 font-inherit leading-relaxed">
                          {layer.CreatedBy}
                        </pre>
                      </details>
                    ) : (
                      layer.CreatedBy
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <Empty size="compact">
            <EmptyHeader>
              <EmptyTitle>{copy.noLayers}</EmptyTitle>
            </EmptyHeader>
          </Empty>
        )}
      </CardContent>
    </Card>
  );
}

export function ServerImageDetail({ data }: { data: ServerImages }) {
  const { messages, locale } = useI18n();
  const copy = messages.servers.images;
  const image = data.inspect;
  if (!image) {
    return null;
  }
  const config = isInspectObject(image.Config) ? image.Config : {};
  const name =
    Array.isArray(image.RepoTags) && image.RepoTags.length
      ? display(image.RepoTags[0])
      : copy.details;
  const summary = [
    [copy.size, metricBytes(image.Size, true)],
    [
      copy.platform,
      [image.Os, image.Architecture, image.Variant]
        .filter(Boolean)
        .join(" / ") || "—",
    ],
    [copy.created, new Date(image.Created).toLocaleString(locale)],
  ];
  return (
    <div className="flex min-w-0 flex-col gap-6">
      <Card size="monitor" variant="monitor">
        <CardHeader size="none">
          <div className="flex items-center gap-3.5">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-border/60 bg-primary/10 text-primary">
              <SiDocker aria-hidden="true" className="size-7" />
            </div>
            <div className="flex min-w-0 flex-col gap-1.5">
              <h2 className="break-all font-semibold text-xl tracking-tight sm:text-2xl">
                {name}
              </h2>
              <p className="break-all font-mono text-muted-foreground text-xs">
                {display(image.Id)}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent size="none">
          <dl className="grid gap-5 sm:grid-cols-3">
            {summary.map(([label, value]) => (
              <div className="flex min-w-0 flex-col gap-1.5" key={label}>
                <dt className="text-muted-foreground text-xs">{label}</dt>
                <dd className="break-words font-medium text-sm">{value}</dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>
      <div className="grid grid-cols-1 gap-6">
        <ImageGroup
          icon={
            <Info aria-hidden="true" className="size-4 text-muted-foreground" />
          }
          rows={[
            [copy.tag, image.RepoTags],
            [copy.digests, image.RepoDigests],
          ]}
          title={copy.identity}
        />
        <ImageGroup
          icon={
            <FileTerminal
              aria-hidden="true"
              className="size-4 text-muted-foreground"
            />
          }
          rows={[
            [copy.command, config.Cmd],
            [copy.entrypoint, config.Entrypoint],
            [copy.user, config.User],
            [copy.workingDirectory, config.WorkingDir],
            [copy.ports, config.ExposedPorts],
            [copy.volumes, config.Volumes],
          ]}
          title={copy.configuration}
        />
        <ImageGroup
          icon={
            <Code2
              aria-hidden="true"
              className="size-4 text-muted-foreground"
            />
          }
          rows={
            isInspectObject(config.Labels) && Object.keys(config.Labels).length
              ? Object.entries(config.Labels)
              : [[copy.labels, undefined]]
          }
          title={copy.labels}
        />
        <ImageGroup
          icon={
            <FileTerminal
              aria-hidden="true"
              className="size-4 text-muted-foreground"
            />
          }
          rows={
            Array.isArray(config.Env) && config.Env.length
              ? config.Env.map((value, index) => {
                  const entry = display(value);
                  const separator = entry.indexOf("=");
                  return separator < 0
                    ? [String(index), entry]
                    : [entry.slice(0, separator), entry.slice(separator + 1)];
                })
              : [[copy.environment, undefined]]
          }
          title={copy.environment}
        />
      </div>
      <ImageLayers history={data.history} />
    </div>
  );
}
