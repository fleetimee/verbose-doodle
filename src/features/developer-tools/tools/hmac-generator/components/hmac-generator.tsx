import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useI18n } from "@/components/i18n-provider";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { DeveloperToolLayout } from "@/features/developer-tools/components/developer-tool-layout";
import {
  decodeInput,
  decodeSignature,
  EXAMPLE_KEY,
  EXAMPLE_MESSAGE,
  EXAMPLE_SIGNATURE,
  encodeSignature,
  generateHmac,
  HmacError,
  type InputEncoding,
  type SignatureEncoding,
} from "@/features/developer-tools/tools/hmac-generator/hmac";
import { copyToClipboard } from "@/lib/clipboard";
import { formatMessage, messages } from "@/lib/i18n";

type SigningInput = {
  message: string;
  key: string;
  messageEncoding: InputEncoding;
  keyEncoding: InputEncoding;
};
const DEFAULT_INPUT: SigningInput = {
  message: EXAMPLE_MESSAGE,
  key: EXAMPLE_KEY,
  messageEncoding: "utf8",
  keyEncoding: "utf8",
};
type ParsedInput =
  | {
      message: Uint8Array<ArrayBuffer>;
      key: Uint8Array<ArrayBuffer>;
      error?: never;
      field?: never;
    }
  | {
      error: HmacError;
      field: "message" | "key";
      message?: never;
      key?: never;
    };

function parseInput(input: SigningInput): ParsedInput {
  let field: "message" | "key" = "message";
  try {
    const message = decodeInput(input.message, input.messageEncoding);
    field = "key";
    const key = decodeInput(input.key, input.keyEncoding);
    if (key.length === 0) {
      throw new HmacError("key");
    }
    return { message, key };
  } catch (error) {
    if (!(error instanceof HmacError)) {
      throw error;
    }
    return { error, field };
  }
}

function errorText(error: Error) {
  const copy = messages.hmacGenerator;
  if (!(error instanceof HmacError)) {
    return copy.failed;
  }
  return {
    hex: copy.hexError,
    unicode: copy.unicodeError,
    size: copy.sizeError,
    key: copy.keyError,
    signature: copy.signatureError,
  }[error.code];
}

function EncodingToggle({
  id,
  label,
  value,
  onChange,
  signature = false,
}: {
  readonly id: string;
  readonly label: string;
  readonly value: InputEncoding | SignatureEncoding;
  readonly onChange: (value: InputEncoding | SignatureEncoding) => void;
  readonly signature?: boolean;
}) {
  const copy = messages.hmacGenerator;
  return (
    <Field className="w-auto" orientation="horizontal" size="sm">
      <FieldLabel id={id}>{label}</FieldLabel>
      <ToggleGroup
        aria-labelledby={id}
        onValueChange={(values) => {
          const selected = values[0];
          if (
            selected === "hex" ||
            selected === (signature ? "base64" : "utf8")
          ) {
            onChange(selected);
          }
        }}
        size="sm"
        value={[value]}
        variant="outline"
      >
        <ToggleGroupItem value={signature ? "hex" : "utf8"}>
          {signature ? copy.hex : copy.utf8}
        </ToggleGroupItem>
        <ToggleGroupItem value={signature ? "base64" : "hex"}>
          {signature ? copy.base64 : copy.hex}
        </ToggleGroupItem>
      </ToggleGroup>
    </Field>
  );
}

function compareSignature(
  expected: string,
  encoding: SignatureEncoding,
  signature?: Uint8Array
) {
  if (expected === "") {
    return { error: null, matches: null };
  }
  try {
    const expectedBytes = decodeSignature(expected, encoding);
    const matches = signature
      ? signature.length === expectedBytes.length &&
        signature.every((byte, index) => byte === expectedBytes[index])
      : null;
    return { error: null, matches };
  } catch {
    return { error: messages.hmacGenerator.signatureError, matches: null };
  }
}

function signatureSummary(
  parsed: ParsedInput,
  signature?: Uint8Array,
  error?: Error
) {
  const copy = messages.hmacGenerator;
  if (parsed.error) {
    return parsed.error.code === "key" ? copy.empty : copy.invalid;
  }
  if (signature) {
    return formatMessage(copy.bytes, {
      message: parsed.message.length,
      key: parsed.key.length,
    });
  }
  return error ? "" : copy.pending;
}

function useHmacSignature(input: SigningInput, parsed: ParsedInput) {
  const [generated, setGenerated] = useState<{
    input: SigningInput;
    signature?: Uint8Array;
    error?: Error;
  } | null>(null);

  useEffect(() => {
    if (parsed.error) {
      return;
    }
    let active = true;
    generateHmac(parsed.message, parsed.key)
      .then((signature) => {
        if (active) {
          setGenerated({ input, signature });
        }
      })
      .catch((error) => {
        if (active) {
          setGenerated({
            input,
            error: error instanceof Error ? error : new Error("HMAC failed"),
          });
        }
      });
    return () => {
      active = false;
    };
  }, [input, parsed]);

  const current =
    !parsed.error && generated?.input === input ? generated : null;
  return current;
}

export function HmacGenerator() {
  useI18n();
  const copy = messages.hmacGenerator;
  const [input, setInput] = useState(DEFAULT_INPUT);
  const [outputEncoding, setOutputEncoding] =
    useState<SignatureEncoding>("hex");
  const [expectedEncoding, setExpectedEncoding] =
    useState<SignatureEncoding>("hex");
  const [expected, setExpected] = useState(EXAMPLE_SIGNATURE);
  const parsed = useMemo(() => parseInput(input), [input]);
  const current = useHmacSignature(input, parsed);
  const signature = current?.signature;
  const signatureText = signature
    ? encodeSignature(signature, outputEncoding)
    : "";
  const { error: expectedError, matches } = compareSignature(
    expected,
    expectedEncoding,
    signature
  );
  const summary = signatureSummary(parsed, signature, current?.error);

  const updateInput = (patch: Partial<SigningInput>) =>
    setInput((previous) => ({ ...previous, ...patch }));
  const reset = () => {
    setInput({ ...DEFAULT_INPUT });
    setOutputEncoding("hex");
    setExpectedEncoding("hex");
    setExpected(EXAMPLE_SIGNATURE);
  };
  const handleCopy = async () => {
    try {
      if (await copyToClipboard(signatureText)) {
        toast.success(copy.copied);
      } else {
        toast.error(copy.copyError);
      }
    } catch {
      toast.error(copy.copyError);
    }
  };

  return (
    <DeveloperToolLayout
      className="min-h-0 flex-1 gap-3 pb-4 [&>header]:border-b-0 [&>header]:pb-2"
      clearLabel={copy.clear}
      description={copy.description}
      extraActions={
        <Button
          disabled={!signature}
          onClick={handleCopy}
          size="sm"
          variant="tool-action"
        >
          {copy.copy}
        </Button>
      }
      mainClassName="flex min-h-0 flex-1 flex-col"
      onClear={() => {
        updateInput({ message: "", key: "" });
        setExpected("");
      }}
      onReset={reset}
      resetLabel={copy.reset}
      title={copy.title}
    >
      <div className="grid min-h-0 flex-1 gap-3 lg:grid-cols-2">
        <Card
          className="min-h-0 min-w-0 overflow-hidden"
          size="none"
          variant="outline"
        >
          <CardHeader size="sm" variant="subtle">
            <CardTitle size="sm">{copy.inputs}</CardTitle>
            <CardDescription size="xs">HMAC-SHA-256</CardDescription>
          </CardHeader>
          <CardContent className="flex min-h-0 flex-1 flex-col" size="none">
            <ScrollArea
              className="min-h-0 flex-1"
              contentSize="padded"
              variant="fit"
            >
              <FieldGroup size="sm">
                <FieldGroup className="flex-row flex-wrap" size="sm">
                  <EncodingToggle
                    id="hmac-message-encoding"
                    label={copy.messageEncoding}
                    onChange={(value) => {
                      if (value !== "base64") {
                        updateInput({ messageEncoding: value });
                      }
                    }}
                    value={input.messageEncoding}
                  />
                  <EncodingToggle
                    id="hmac-key-encoding"
                    label={copy.keyEncoding}
                    onChange={(value) => {
                      if (value !== "base64") {
                        updateInput({ keyEncoding: value });
                      }
                    }}
                    value={input.keyEncoding}
                  />
                </FieldGroup>
                <Field data-invalid={parsed.field === "message"} size="sm">
                  <FieldLabel htmlFor="hmac-message">{copy.message}</FieldLabel>
                  <Textarea
                    aria-describedby="hmac-message-error hmac-note"
                    aria-invalid={parsed.field === "message"}
                    autoCapitalize="off"
                    autoComplete="off"
                    className="h-32 resize-none [field-sizing:fixed]"
                    id="hmac-message"
                    onChange={(event) =>
                      updateInput({ message: event.target.value })
                    }
                    spellCheck={false}
                    value={input.message}
                    variant="mono"
                  />
                  <FieldError id="hmac-message-error">
                    {parsed.field === "message"
                      ? errorText(parsed.error)
                      : null}
                  </FieldError>
                </Field>
                <Field
                  data-invalid={parsed.field === "key" && input.key !== ""}
                  size="sm"
                >
                  <FieldLabel htmlFor="hmac-key">{copy.key}</FieldLabel>
                  <Textarea
                    aria-describedby="hmac-key-error"
                    aria-invalid={parsed.field === "key" && input.key !== ""}
                    autoCapitalize="off"
                    autoComplete="off"
                    className="h-16 resize-none [field-sizing:fixed]"
                    id="hmac-key"
                    onChange={(event) =>
                      updateInput({ key: event.target.value })
                    }
                    spellCheck={false}
                    value={input.key}
                    variant="mono"
                  />
                  <FieldError id="hmac-key-error">
                    {parsed.field === "key" && input.key !== ""
                      ? errorText(parsed.error)
                      : null}
                  </FieldError>
                </Field>
                <FieldDescription id="hmac-note">{copy.note}</FieldDescription>
                <FieldDescription>{copy.privacy}</FieldDescription>
                <FieldDescription>{copy.example}</FieldDescription>
              </FieldGroup>
            </ScrollArea>
          </CardContent>
        </Card>
        <Card
          className="min-h-0 min-w-0 overflow-hidden"
          size="none"
          variant="outline"
        >
          <CardHeader size="sm" variant="subtle">
            <CardTitle size="sm">{copy.results}</CardTitle>
          </CardHeader>
          <CardContent className="flex min-h-0 flex-1 flex-col" size="none">
            <ScrollArea
              className="min-h-0 flex-1"
              contentSize="padded"
              variant="fit"
            >
              <FieldGroup size="sm">
                <EncodingToggle
                  id="hmac-output-encoding"
                  label={copy.outputEncoding}
                  onChange={(value) => {
                    if (value !== "utf8") {
                      setOutputEncoding(value);
                    }
                  }}
                  signature
                  value={outputEncoding}
                />
                <Field size="sm">
                  <FieldLabel htmlFor="hmac-signature">
                    {copy.signature}
                  </FieldLabel>
                  <Textarea
                    className="h-16 resize-none [field-sizing:fixed]"
                    id="hmac-signature"
                    readOnly
                    value={signatureText}
                    variant="mono"
                  />
                  <FieldDescription aria-live="polite">
                    {summary}
                  </FieldDescription>
                </Field>
                {current?.error ? (
                  <Alert variant="destructive">
                    <AlertTitle>{copy.invalid}</AlertTitle>
                    <AlertDescription>
                      {errorText(current.error)}
                    </AlertDescription>
                  </Alert>
                ) : null}
                <Field data-invalid={Boolean(expectedError)} size="sm">
                  <FieldLabel htmlFor="hmac-expected">
                    {copy.expected}
                  </FieldLabel>
                  <Textarea
                    aria-describedby="hmac-expected-hint hmac-expected-error"
                    aria-invalid={Boolean(expectedError)}
                    autoCapitalize="off"
                    autoComplete="off"
                    className="h-16 resize-none [field-sizing:fixed]"
                    id="hmac-expected"
                    onChange={(event) => setExpected(event.target.value)}
                    spellCheck={false}
                    value={expected}
                    variant="mono"
                  />
                  <FieldError id="hmac-expected-error">
                    {expectedError}
                  </FieldError>
                </Field>
                <FieldGroup
                  className="flex-row flex-wrap items-end justify-between"
                  size="sm"
                >
                  <EncodingToggle
                    id="hmac-expected-encoding"
                    label={copy.expectedEncoding}
                    onChange={(value) => {
                      if (value !== "utf8") {
                        setExpectedEncoding(value);
                      }
                    }}
                    signature
                    value={expectedEncoding}
                  />
                  <p aria-live="polite">
                    {matches === null ? null : (
                      <Badge variant={matches ? "secondary" : "destructive"}>
                        {matches ? copy.match : copy.mismatch}
                      </Badge>
                    )}
                  </p>
                </FieldGroup>
                <FieldDescription className="sr-only" id="hmac-expected-hint">
                  {copy.expectedHint}
                </FieldDescription>
                {expected === "" ? (
                  <FieldDescription>{copy.noExpected}</FieldDescription>
                ) : null}
                <Field size="sm">
                  <FieldLabel htmlFor="hmac-bytes">{copy.preview}</FieldLabel>
                  <Textarea
                    aria-describedby="hmac-bytes-hint"
                    className="h-20 resize-none [field-sizing:fixed]"
                    id="hmac-bytes"
                    readOnly
                    value={
                      parsed.error
                        ? ""
                        : (encodeSignature(parsed.message, "hex")
                            .match(/.{1,2}/g)
                            ?.join(" ") ?? copy.emptyBytes)
                    }
                    variant="mono"
                  />
                  <FieldDescription className="sr-only" id="hmac-bytes-hint">
                    {copy.previewHint}
                  </FieldDescription>
                </Field>
              </FieldGroup>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </DeveloperToolLayout>
  );
}
