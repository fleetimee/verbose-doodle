import { CircleHelp, Eraser, SendHorizontal } from "lucide-react";
import { useState } from "react";
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

  return (
    <section className="flex flex-col gap-3" id={tourId}>
      <div>
        <h2 className="font-semibold text-sm">Send panel</h2>
        <p className="text-muted-foreground text-xs">
          Compose payloads as ASCII, hex, or base64.
        </p>
      </div>
      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
        <Textarea
          className="h-40 min-h-40 resize-none overflow-y-auto font-mono leading-relaxed [field-sizing:fixed]"
          onChange={(event) => setData(event.target.value)}
          placeholder="Type a payload..."
          value={data}
        />
        <div className="flex flex-col gap-3 md:w-[184px]">
          <div className="flex flex-col gap-1.5">
            <span className="font-medium text-muted-foreground text-xs">
              Payload format
            </span>
            <Select
              onValueChange={(value) => setFormat(value as PayloadFormat)}
              value={format}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Encode as</SelectLabel>
                  <SelectItem value="ascii">ASCII</SelectItem>
                  <SelectItem value="hex">Hex</SelectItem>
                  <SelectItem value="base64">Base64</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {showDelimiter ? (
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-1.5">
                <span className="font-medium text-muted-foreground text-xs">
                  Line ending
                </span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      aria-label="What line ending does"
                      className="text-muted-foreground transition-colors hover:text-foreground"
                      type="button"
                    >
                      <CircleHelp data-icon="inline-start" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-64" side="top">
                    Appends CRLF, LF, or nothing after the payload. CRLF is
                    common for text protocols; None sends the payload as-is.
                  </TooltipContent>
                </Tooltip>
              </div>
              <Select
                onValueChange={(value) =>
                  setDelimiter(value as DelimiterOption)
                }
                value={delimiter}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Append after payload</SelectLabel>
                    <SelectItem value="crlf">CRLF</SelectItem>
                    <SelectItem value="lf">LF</SelectItem>
                    <SelectItem value="none">None</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          ) : null}
          <div className="grid grid-cols-2 gap-2">
            <Button
              className="h-10"
              disabled={data.length === 0}
              onClick={() => setData("")}
              type="button"
              variant="outline"
            >
              <Eraser data-icon="inline-start" />
              Clear
            </Button>
            <Button
              className="h-10"
              disabled={disabled || data.length === 0}
              onClick={() =>
                onSend(data, format, showDelimiter ? selectedDelimiter : "")
              }
              type="button"
            >
              <SendHorizontal data-icon="inline-start" />
              Send
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
