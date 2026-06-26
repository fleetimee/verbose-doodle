import { SendHorizontal } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
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
};

export function SendPanel({
  disabled = false,
  onSend,
  showDelimiter = true,
}: SendPanelProps) {
  const [data, setData] = useState("");
  const [format, setFormat] = useState<PayloadFormat>("ascii");
  const [delimiter, setDelimiter] = useState<MessageDelimiter>("\r\n");

  return (
    <section className="grid gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <div className="mr-auto">
          <h2 className="font-semibold text-sm">Send panel</h2>
          <p className="text-muted-foreground text-xs">
            Compose payloads as ASCII, hex, or base64.
          </p>
        </div>
        <Select
          onValueChange={(value) => setFormat(value as PayloadFormat)}
          value={format}
        >
          <SelectTrigger className="w-[118px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ascii">ASCII</SelectItem>
            <SelectItem value="hex">Hex</SelectItem>
            <SelectItem value="base64">Base64</SelectItem>
          </SelectContent>
        </Select>
        {showDelimiter && (
          <Select
            onValueChange={(value) => setDelimiter(value as MessageDelimiter)}
            value={delimiter}
          >
            <SelectTrigger className="w-[124px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="\r\n">CRLF</SelectItem>
              <SelectItem value="\n">LF</SelectItem>
              <SelectItem value="">None</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>
      <div className="grid gap-3 md:grid-cols-[1fr_auto]">
        <Textarea
          className="min-h-24 resize-y font-mono"
          onChange={(event) => setData(event.target.value)}
          placeholder="Type a payload..."
          value={data}
        />
        <Button
          className="h-full min-h-12 gap-2 md:w-28"
          disabled={disabled || data.length === 0}
          onClick={() => onSend(data, format, showDelimiter ? delimiter : "")}
          type="button"
        >
          <SendHorizontal className="size-4" />
          Send
        </Button>
      </div>
    </section>
  );
}
