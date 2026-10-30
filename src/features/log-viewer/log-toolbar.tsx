import {
  ArrowDownToLineIcon,
  ArrowShrink01Icon,
  ArrowUp01Icon,
  Cancel01Icon,
  Download01Icon,
  FullScreenIcon,
  LiveStreaming02Icon,
  MaximizeScreenIcon,
  MinimizeScreenIcon,
  Search01Icon,
  TextWrapIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { RefObject } from "react";
import { toast } from "sonner";
import { ChevronDown, FileClock } from "@/components/hugeicons";
import { useI18n } from "@/components/i18n-provider";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Checkbox } from "@/components/ui/checkbox";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Toggle } from "@/components/ui/toggle";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatMessage } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function LogToolbar({
  loading,
  canExport,
  canLoadOlder,
  onExport,
  onOlder,
  onLatest,
  fontSize,
  onFontSize,
  wordWrap,
  onWordWrap,
  follow,
  onFollow,
  search,
  fullscreen,
  fullscreenSupported,
  maximized,
  onFullscreen,
  onMaximize,
}: {
  fullscreen: boolean;
  fullscreenSupported: boolean;
  maximized: boolean;
  onFullscreen: () => void;
  onMaximize: () => void;
  loading: boolean;
  canExport: boolean;
  canLoadOlder: boolean;
  onExport: () => void;
  onOlder: () => void;
  onLatest: () => void;
  fontSize: number;
  onFontSize: (size: number) => void;
  wordWrap: boolean;
  onWordWrap: (value: boolean) => void;
  follow: boolean;
  onFollow: (value: boolean) => void;
  search: {
    query: string;
    filterMatches: boolean;
    onChange: (query: string) => void;
    onFilterMatchesChange: (value: boolean) => void;
    count: number;
    active: number;
    limited: boolean;
    supported: boolean;
    navigate: (direction: number) => void;
    inputRef: RefObject<HTMLInputElement | null>;
  };
}) {
  const {
    messages: { logViewer: copy },
  } = useI18n();
  const expandLabel = maximized ? copy.restoreViewer : copy.expandViewer;
  const exportLabel =
    search.filterMatches && search.query
      ? copy.exportFilteredTxt
      : copy.exportTxt;
  const fullscreenLabel = fullscreen
    ? copy.exitFullscreen
    : copy.enterFullscreen;
  return (
    <fieldset
      aria-label={copy.toolbar}
      className="flex min-w-0 shrink-0 flex-wrap items-center gap-1.5 px-2.5 py-1"
    >
      <ButtonGroup>
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                aria-label={copy.older}
                className="[&_svg:not([class*='size-'])]:size-3.5"
                disabled={loading || !canLoadOlder}
                focusableWhenDisabled
                onClick={onOlder}
                size="icon-7"
                variant="ghost"
              />
            }
          >
            <FileClock />
          </TooltipTrigger>
          <TooltipContent>{copy.older}</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                aria-label={copy.latest}
                className="[&_svg:not([class*='size-'])]:size-3.5"
                disabled={loading}
                focusableWhenDisabled
                onClick={onLatest}
                size="icon-7"
                variant="ghost"
              />
            }
          >
            <HugeiconsIcon icon={ArrowDownToLineIcon} />
          </TooltipTrigger>
          <TooltipContent>{copy.latest}</TooltipContent>
        </Tooltip>
      </ButtonGroup>
      <div className="flex min-w-52 flex-1 items-center gap-1.5 sm:max-w-lg">
        <InputGroup className="flex-1" size="compact">
          <InputGroupAddon className="[&>svg:not([class*='size-'])]:size-3.5">
            <HugeiconsIcon icon={Search01Icon} />
          </InputGroupAddon>
          <InputGroupInput
            aria-label={copy.searchLogs}
            className="h-full"
            onChange={(event) => search.onChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                search.navigate(event.shiftKey ? -1 : 1);
              }
              if (event.key === "Escape" && search.query) {
                event.preventDefault();
                search.onChange("");
              }
            }}
            placeholder={copy.searchLogs}
            ref={search.inputRef}
            value={search.query}
          />
          <InputGroupAddon align="inline-end">
            {search.query ? (
              <Tooltip>
                <TooltipTrigger
                  render={
                    <InputGroupText
                      aria-live="polite"
                      className="cursor-help"
                    />
                  }
                >
                  {`${search.active}/${search.count}${search.limited ? "+" : ""}`}
                </TooltipTrigger>
                <TooltipContent>
                  {search.limited ? copy.searchLimited : copy.searchScope}
                </TooltipContent>
              </Tooltip>
            ) : (
              <InputGroupText aria-live="polite" />
            )}
            <Tooltip>
              <TooltipTrigger
                render={
                  <InputGroupButton
                    aria-label={copy.previousMatch}
                    className="size-5 [&_svg:not([class*='size-'])]:size-3"
                    disabled={!search.count}
                    focusableWhenDisabled
                    onClick={() => search.navigate(-1)}
                    size="icon-xs"
                  />
                }
              >
                <HugeiconsIcon icon={ArrowUp01Icon} />
              </TooltipTrigger>
              <TooltipContent>{copy.previousMatch}</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger
                render={
                  <InputGroupButton
                    aria-label={copy.nextMatch}
                    className="size-5 [&_svg:not([class*='size-'])]:size-3"
                    disabled={!search.count}
                    focusableWhenDisabled
                    onClick={() => search.navigate(1)}
                    size="icon-xs"
                  />
                }
              >
                <ChevronDown />
              </TooltipTrigger>
              <TooltipContent>{copy.nextMatch}</TooltipContent>
            </Tooltip>
            {search.query && (
              <Tooltip>
                <TooltipTrigger
                  render={
                    <InputGroupButton
                      aria-label={copy.clearSearch}
                      className="size-5 [&_svg:not([class*='size-'])]:size-3"
                      onClick={() => {
                        search.onChange("");
                        search.inputRef.current?.focus();
                      }}
                      size="icon-xs"
                    />
                  }
                >
                  <HugeiconsIcon icon={Cancel01Icon} />
                </TooltipTrigger>
                <TooltipContent>{copy.clearSearch}</TooltipContent>
              </Tooltip>
            )}
          </InputGroupAddon>
        </InputGroup>
        <Tooltip>
          <TooltipTrigger
            render={
              <Label
                htmlFor="log-search-filter-matches"
                size="sm"
                variant="control"
              />
            }
          >
            <Checkbox
              checked={search.filterMatches}
              className="size-3.5 cursor-pointer"
              id="log-search-filter-matches"
              onCheckedChange={(checked) =>
                search.onFilterMatchesChange(Boolean(checked))
              }
            />
            <span>{copy.filterMatches}</span>
          </TooltipTrigger>
          <TooltipContent>{copy.filterMatchesHint}</TooltipContent>
        </Tooltip>
      </div>
      <div className="ml-auto flex items-center gap-1">
        <ButtonGroup aria-label={copy.fontSize}>
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  aria-label={copy.decreaseFont}
                  className="h-7"
                  disabled={fontSize <= 9}
                  focusableWhenDisabled
                  onClick={() => {
                    const next = Math.max(9, fontSize - 1);
                    onFontSize(next);
                    toast.info(
                      formatMessage(copy.fontSizeChanged, { size: next }),
                      {
                        id: "log-viewer-font-size",
                        duration: 1500,
                      }
                    );
                  }}
                  size="xs"
                  variant="ghost"
                />
              }
            >
              A−
            </TooltipTrigger>
            <TooltipContent>{copy.decreaseFont}</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  aria-label={copy.resetFont}
                  className="h-7"
                  onClick={() => {
                    onFontSize(10);
                    toast.info(
                      formatMessage(copy.fontSizeReset, { size: 10 }),
                      {
                        id: "log-viewer-font-size",
                        duration: 1500,
                      }
                    );
                  }}
                  size="xs"
                  variant="ghost"
                />
              }
            >
              {fontSize}px
            </TooltipTrigger>
            <TooltipContent>{copy.resetFont}</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  aria-label={copy.increaseFont}
                  className="h-7"
                  disabled={fontSize >= 18}
                  focusableWhenDisabled
                  onClick={() => {
                    const next = Math.min(18, fontSize + 1);
                    onFontSize(next);
                    toast.info(
                      formatMessage(copy.fontSizeChanged, { size: next }),
                      {
                        id: "log-viewer-font-size",
                        duration: 1500,
                      }
                    );
                  }}
                  size="xs"
                  variant="ghost"
                />
              }
            >
              A+
            </TooltipTrigger>
            <TooltipContent>{copy.increaseFont}</TooltipContent>
          </Tooltip>
        </ButtonGroup>
        <Tooltip>
          <TooltipTrigger
            render={
              <Toggle
                aria-label={copy.wordWrap}
                className="size-7 [&_svg:not([class*='size-'])]:size-3.5"
                onPressedChange={onWordWrap}
                pressed={wordWrap}
                size="icon-xs"
              />
            }
          >
            <HugeiconsIcon icon={TextWrapIcon} />
          </TooltipTrigger>
          <TooltipContent>{copy.wordWrap}</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger
            render={
              <Toggle
                aria-label={copy.follow}
                onPressedChange={onFollow}
                pressed={follow}
                size="xs"
              />
            }
          >
            <HugeiconsIcon
              className={cn("size-3.5", follow && "text-success")}
              icon={LiveStreaming02Icon}
            />
            {copy.live}
          </TooltipTrigger>
          <TooltipContent>{copy.follow}</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                aria-label={exportLabel}
                className="[&_svg:not([class*='size-'])]:size-3.5"
                disabled={!canExport}
                focusableWhenDisabled
                onClick={onExport}
                size="icon-7"
                variant="ghost"
              />
            }
          >
            <HugeiconsIcon icon={Download01Icon} />
          </TooltipTrigger>
          <TooltipContent>{exportLabel}</TooltipContent>
        </Tooltip>
        <ButtonGroup>
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  aria-label={expandLabel}
                  aria-pressed={maximized}
                  className="[&_svg:not([class*='size-'])]:size-3.5"
                  onClick={onMaximize}
                  size="icon-7"
                  variant="ghost"
                />
              }
            >
              <HugeiconsIcon
                icon={maximized ? MinimizeScreenIcon : MaximizeScreenIcon}
              />
            </TooltipTrigger>
            <TooltipContent>{expandLabel}</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  aria-label={fullscreenLabel}
                  aria-pressed={fullscreen}
                  className="[&_svg:not([class*='size-'])]:size-3.5"
                  disabled={!fullscreenSupported}
                  focusableWhenDisabled
                  onClick={onFullscreen}
                  size="icon-7"
                  variant="ghost"
                />
              }
            >
              <HugeiconsIcon
                icon={fullscreen ? ArrowShrink01Icon : FullScreenIcon}
              />
            </TooltipTrigger>
            <TooltipContent>{fullscreenLabel}</TooltipContent>
          </Tooltip>
        </ButtonGroup>
        {loading && <Spinner aria-label={copy.loading} />}
      </div>
      {!search.supported && search.query && (
        <p className="w-full text-muted-foreground text-xs">
          {copy.searchUnsupported}
        </p>
      )}
    </fieldset>
  );
}
