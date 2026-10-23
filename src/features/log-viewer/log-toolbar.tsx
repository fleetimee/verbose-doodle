import {
  ArrowUp01Icon,
  Cancel01Icon,
  MaximizeScreenIcon,
  MinimizeScreenIcon,
  Search01Icon,
  TextWrapIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { RefObject } from "react";
import { ChevronDown, FileClock, Radio } from "@/components/hugeicons";
import { useI18n } from "@/components/i18n-provider";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import { Toggle } from "@/components/ui/toggle";

export function LogToolbar({
  loading,
  canLoadOlder,
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
  onFullscreen,
}: {
  fullscreen: boolean;
  fullscreenSupported: boolean;
  onFullscreen: () => void;
  loading: boolean;
  canLoadOlder: boolean;
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
    onChange: (query: string) => void;
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
  return (
    <fieldset
      aria-label={copy.toolbar}
      className="flex min-w-0 shrink-0 flex-wrap items-center gap-2 px-3 py-1.5"
    >
      <ButtonGroup>
        <Button
          aria-label={copy.older}
          disabled={loading || !canLoadOlder}
          onClick={onOlder}
          size="icon-xs"
          title={copy.older}
          variant="ghost"
        >
          <FileClock />
        </Button>
        <Button
          aria-label={copy.latest}
          disabled={loading}
          onClick={onLatest}
          size="icon-xs"
          title={copy.latest}
          variant="ghost"
        >
          <ChevronDown />
        </Button>
      </ButtonGroup>
      <div className="min-w-56 flex-1 sm:max-w-md">
        <InputGroup>
          <InputGroupAddon>
            <HugeiconsIcon icon={Search01Icon} />
          </InputGroupAddon>
          <InputGroupInput
            aria-label={copy.searchLogs}
            onChange={(event) => search.onChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                search.navigate(event.shiftKey ? -1 : 1);
              }
              if (event.key === "Escape") {
                event.preventDefault();
                search.onChange("");
              }
            }}
            placeholder={copy.searchLogs}
            ref={search.inputRef}
            value={search.query}
          />
          <InputGroupAddon align="inline-end">
            <InputGroupText
              aria-live="polite"
              title={search.limited ? copy.searchLimited : copy.searchScope}
            >
              {search.query
                ? `${search.active}/${search.count}${search.limited ? "+" : ""}`
                : ""}
            </InputGroupText>
            <InputGroupButton
              aria-label={copy.previousMatch}
              disabled={!search.count}
              onClick={() => search.navigate(-1)}
              size="icon-xs"
              title={copy.previousMatch}
            >
              <HugeiconsIcon icon={ArrowUp01Icon} />
            </InputGroupButton>
            <InputGroupButton
              aria-label={copy.nextMatch}
              disabled={!search.count}
              onClick={() => search.navigate(1)}
              size="icon-xs"
              title={copy.nextMatch}
            >
              <ChevronDown />
            </InputGroupButton>
            {search.query && (
              <InputGroupButton
                aria-label={copy.clearSearch}
                onClick={() => {
                  search.onChange("");
                  search.inputRef.current?.focus();
                }}
                size="icon-xs"
                title={copy.clearSearch}
              >
                <HugeiconsIcon icon={Cancel01Icon} />
              </InputGroupButton>
            )}
          </InputGroupAddon>
        </InputGroup>
      </div>
      <div className="ml-auto flex items-center gap-1">
        <ButtonGroup aria-label={copy.fontSize}>
          <Button
            aria-label={copy.decreaseFont}
            disabled={fontSize <= 9}
            onClick={() => onFontSize(Math.max(9, fontSize - 1))}
            size="xs"
            title={copy.decreaseFont}
            variant="ghost"
          >
            A−
          </Button>
          <Button
            aria-label={copy.resetFont}
            onClick={() => onFontSize(10)}
            size="xs"
            title={copy.resetFont}
            variant="ghost"
          >
            {fontSize}px
          </Button>
          <Button
            aria-label={copy.increaseFont}
            disabled={fontSize >= 18}
            onClick={() => onFontSize(Math.min(18, fontSize + 1))}
            size="xs"
            title={copy.increaseFont}
            variant="ghost"
          >
            A+
          </Button>
        </ButtonGroup>
        <Toggle
          aria-label={copy.wordWrap}
          onPressedChange={onWordWrap}
          pressed={wordWrap}
          size="icon-xs"
          title={copy.wordWrap}
        >
          <HugeiconsIcon icon={TextWrapIcon} />
        </Toggle>
        <Toggle
          aria-label={copy.follow}
          onPressedChange={onFollow}
          pressed={follow}
          size="sm"
          title={copy.follow}
        >
          <Radio />
          {copy.live}
        </Toggle>
        <Button
          aria-label={fullscreen ? copy.exitFullscreen : copy.enterFullscreen}
          disabled={!fullscreenSupported}
          onClick={onFullscreen}
          size="icon-xs"
          title={fullscreen ? copy.exitFullscreen : copy.enterFullscreen}
          variant="ghost"
        >
          <HugeiconsIcon
            icon={fullscreen ? MinimizeScreenIcon : MaximizeScreenIcon}
          />
        </Button>
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
