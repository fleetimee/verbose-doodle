import { HelpCircleIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";
import { Eraser, SendHorizontal } from "@/components/hugeicons";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type {
  MessageDelimiter,
  PayloadFormat,
} from "@/features/socket-tester/types";
import { messages } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type SendPanelProps = {
  readonly disabled?: boolean;
  readonly onSend: (
    data: string,
    format: PayloadFormat,
    delimiter: MessageDelimiter
  ) => void;
  readonly showDelimiter?: boolean;
  readonly tourId?: string;
};

type DelimiterOption = "crlf" | "lf" | "none";

const delimiterByOption: Record<DelimiterOption, MessageDelimiter> = {
  crlf: "\r\n",
  lf: "\n",
  none: "",
};

export function SendPanel({
  disabled = false,
  onSend,
  showDelimiter = true,
  tourId,
}: SendPanelProps) {
  const [data, setData] = useState("");
  const [format, setFormat] = useState<PayloadFormat>("ascii");
  const [delimiter, setDelimiter] = useState<DelimiterOption>("crlf");
  const selectedDelimiter = delimiterByOption[delimiter];
  const socketMessages = messages.socketTester;

  const formatLabels: Record<PayloadFormat, string> = {
    ascii: socketMessages.asciiFormatLabel,
    hex: socketMessages.hexFormatLabel,
    base64: socketMessages.base64FormatLabel,
  };
  const delimiterLabels: Record<DelimiterOption, string> = {
    crlf: socketMessages.crlfDelimiterLabel,
    lf: socketMessages.lfDelimiterLabel,
    none: socketMessages.noneDelimiterLabel,
  };

  return (
    <section className="flex flex-col gap-4" id={tourId}>
      <div>
        <h2 className="font-semibold text-sm">
          {socketMessages.sendPanelTitle}
        </h2>
      </div>
      <div className="grid gap-4">
        <Textarea
          aria-label={socketMessages.rawPayloadTitle}
          className="h-36 min-h-36 resize-y overflow-y-auto [field-sizing:fixed]"
          onChange={(event) => setData(event.target.value)}
          placeholder={socketMessages.payloadPlaceholder}
          value={data}
          variant="mono"
        />
        <div className={cn("grid gap-4", showDelimiter && "grid-cols-2")}>
          <div className="flex flex-col gap-1.5">
            <label
              className="flex h-5 items-center font-medium text-muted-foreground text-xs"
              htmlFor="socket-payload-format"
            >
              {socketMessages.payloadFormatLabel}
            </label>
            <Select
              onValueChange={(value) =>
                // SAFETY: The select options are the supported payload formats.
                setFormat(value as PayloadFormat)
              }
              value={format}
            >
              <SelectTrigger
                className="w-full"
                id="socket-payload-format"
                variant="surface"
              >
                <SelectValue>{formatLabels[format]}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>{socketMessages.encodeAsLabel}</SelectLabel>
                  <SelectItem value="ascii">
                    {socketMessages.asciiFormatLabel}
                  </SelectItem>
                  <SelectItem value="hex">
                    {socketMessages.hexFormatLabel}
                  </SelectItem>
                  <SelectItem value="base64">
                    {socketMessages.base64FormatLabel}
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {showDelimiter ? (
            <div className="flex flex-col gap-1.5">
              <div className="flex h-5 items-center gap-1.5">
                <label
                  className="font-medium text-muted-foreground text-xs"
                  htmlFor="socket-line-ending"
                >
                  {socketMessages.lineEndingLabel}
                </label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      aria-label={socketMessages.lineEndingHelpAriaLabel}
                      className="inline-flex size-5 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      type="button"
                    >
                      <HugeiconsIcon
                        className="size-3.5"
                        icon={HelpCircleIcon}
                        strokeWidth={2}
                      />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-64" side="top">
                    {socketMessages.lineEndingDescription}
                  </TooltipContent>
                </Tooltip>
              </div>
              <Select
                onValueChange={(value) =>
                  // SAFETY: The select options are the supported delimiter values.
                  setDelimiter(value as DelimiterOption)
                }
                value={delimiter}
              >
                <SelectTrigger
                  className="w-full"
                  id="socket-line-ending"
                  variant="surface"
                >
                  <SelectValue>{delimiterLabels[delimiter]}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>
                      {socketMessages.appendAfterPayloadLabel}
                    </SelectLabel>
                    <SelectItem value="crlf">
                      {socketMessages.crlfDelimiterLabel}
                    </SelectItem>
                    <SelectItem value="lf">
                      {socketMessages.lfDelimiterLabel}
                    </SelectItem>
                    <SelectItem value="none">
                      {socketMessages.noneDelimiterLabel}
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          ) : null}
          <div className="col-span-full flex items-center justify-end gap-2 border-border/70 border-t pt-3">
            <Button
              disabled={data.length === 0}
              onClick={() => setData("")}
              size="sm"
              type="button"
              variant="ghost"
            >
              <Eraser data-icon="inline-start" />
              {socketMessages.clearButton}
            </Button>
            <Button
              className="min-w-32"
              disabled={disabled || data.length === 0}
              onClick={() =>
                onSend(data, format, showDelimiter ? selectedDelimiter : "")
              }
              size="sm"
              type="button"
            >
              <SendHorizontal data-icon="inline-start" />
              {socketMessages.sendButton}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
