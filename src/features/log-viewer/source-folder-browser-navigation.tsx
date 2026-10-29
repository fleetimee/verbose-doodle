import { ArrowUp01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Fragment, useEffect, useId, useRef } from "react";
import { ChevronLeft, ChevronRight, RefreshCw } from "@/components/hugeicons";
import { useI18n } from "@/components/i18n-provider";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

export interface FolderNavigation {
  index: number;
  paths: string[];
}

export function FolderBrowserNavigation({
  path,
  currentPath,
  rootLabel,
  absolute,
  navigation,
  disabled,
  search,
  onSearch,
  onPathChange,
  onNavigate,
}: {
  path: string;
  currentPath: string;
  rootLabel: string;
  absolute: boolean;
  navigation: FolderNavigation;
  disabled: boolean;
  search: string;
  onSearch: (value: string) => void;
  onPathChange: (value: string) => void;
  onNavigate: (path: string, historyIndex?: number) => void;
}) {
  const {
    messages: { logViewer: copy },
  } = useI18n();
  const breadcrumbViewport = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const viewport = breadcrumbViewport.current;
      if (viewport) {
        viewport.scrollLeft = viewport.scrollWidth;
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [currentPath]);
  const pathId = useId();
  const searchId = useId();
  const parts = currentPath.split("/").filter(Boolean);
  const crumbs = [
    { label: rootLabel, path: absolute ? "/" : "" },
    ...parts.map((label, index) => ({
      label,
      path: (absolute ? "/" : "") + parts.slice(0, index + 1).join("/"),
    })),
  ];
  const parent = (absolute ? "/" : "") + parts.slice(0, -1).join("/");
  return (
    <div className="flex flex-col gap-3 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          aria-label={copy.browseBack}
          disabled={disabled || navigation.index < 1}
          onClick={() =>
            onNavigate(
              navigation.paths[navigation.index - 1],
              navigation.index - 1
            )
          }
          size="icon-sm"
          title={copy.browseBack}
          type="button"
          variant="outline"
        >
          <ChevronLeft />
        </Button>
        <Button
          aria-label={copy.browseForward}
          disabled={disabled || navigation.index >= navigation.paths.length - 1}
          onClick={() =>
            onNavigate(
              navigation.paths[navigation.index + 1],
              navigation.index + 1
            )
          }
          size="icon-sm"
          title={copy.browseForward}
          type="button"
          variant="outline"
        >
          <ChevronRight />
        </Button>
        <Button
          aria-label={copy.browseParent}
          disabled={disabled || parts.length === 0}
          onClick={() => onNavigate(parent)}
          size="icon-sm"
          title={copy.browseParent}
          type="button"
          variant="outline"
        >
          <HugeiconsIcon icon={ArrowUp01Icon} />
        </Button>
        <Button
          aria-label={copy.browseRefresh}
          disabled={disabled}
          onClick={() => onNavigate(currentPath)}
          size="icon-sm"
          title={copy.browseRefresh}
          type="button"
          variant="outline"
        >
          <RefreshCw />
        </Button>
        <ScrollArea className="h-10 min-w-0 flex-1" variant="visible">
          <Breadcrumb aria-label={copy.browseBreadcrumb}>
            <BreadcrumbList className="w-max flex-nowrap">
              {crumbs.map((crumb, index) => (
                <Fragment key={crumb.path}>
                  {index > 0 && <BreadcrumbSeparator />}
                  <BreadcrumbItem className="max-w-40" variant="truncate">
                    {index === crumbs.length - 1 ? (
                      <BreadcrumbPage
                        className="min-w-0 max-w-full"
                        title={crumb.label}
                      >
                        <span className="block truncate">{crumb.label}</span>
                      </BreadcrumbPage>
                    ) : (
                      <Button
                        disabled={disabled}
                        onClick={() => onNavigate(crumb.path)}
                        size="sm"
                        title={crumb.label}
                        type="button"
                        variant="ghost"
                      >
                        <span className="truncate">{crumb.label}</span>
                      </Button>
                    )}
                  </BreadcrumbItem>
                </Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </ScrollArea>
      </div>
      <FieldGroup className="grid sm:grid-cols-2" size="compact">
        <Field>
          <FieldLabel htmlFor={pathId}>{copy.basePath}</FieldLabel>
          <div className="flex gap-2">
            <Input
              disabled={disabled}
              id={pathId}
              maxLength={2048}
              onChange={(event) => onPathChange(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  onNavigate(path);
                }
              }}
              value={path}
              variant="mono"
            />
            <Button
              disabled={disabled}
              onClick={() => onNavigate(path)}
              type="button"
              variant="outline"
            >
              {copy.browseGo}
            </Button>
          </div>
        </Field>
        <Field>
          <FieldLabel htmlFor={searchId}>{copy.browseSearch}</FieldLabel>
          <Input
            autoComplete="off"
            disabled={disabled}
            id={searchId}
            onChange={(event) => onSearch(event.target.value)}
            placeholder={copy.browseSearchPlaceholder}
            value={search}
          />
        </Field>
      </FieldGroup>
    </div>
  );
}
