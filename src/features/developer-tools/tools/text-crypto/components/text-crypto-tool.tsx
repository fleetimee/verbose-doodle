import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Binary,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleAlert,
  ClipboardCopy,
  FileTerminal,
  Fingerprint,
  Hash,
  KeyRound,
  Play,
  RefreshCw,
  ShieldCheck,
  UnlockIcon,
} from "@/components/hugeicons";
import { useI18n } from "@/components/i18n-provider";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  developerToolChildVariants as childVariants,
  DeveloperToolLayout,
} from "@/features/developer-tools/components/developer-tool-layout";
import {
  DeveloperToolTourButton,
  type DeveloperToolTourStep,
} from "@/features/developer-tools/components/developer-tool-tour-button";
import { useProcessTextCrypto } from "@/features/developer-tools/tools/text-crypto/hooks/use-process-text-crypto";
import type {
  TextCryptoAlgorithm,
  TextCryptoOperation,
  TextCryptoResult,
} from "@/features/developer-tools/tools/text-crypto/types";
import type { ApiError } from "@/lib/api";
import { copyToClipboard } from "@/lib/clipboard";
import { formatMessage, messages } from "@/lib/i18n";
import { MOTION_DURATION, MOTION_EASE, MOTION_SPRING } from "@/lib/motion";

const EXAMPLE_INPUTS: Readonly<Record<TextCryptoAlgorithm, string>> = {
  BASE64: "BPDDIY-BILLER-SIMULATOR:2026",
  MD5: "The quick brown fox jumps over the lazy dog",
  BCRYPT: "admin123",
  ARGON2: "admin123",
};

const EXAMPLE_DECODE_BASE64 = "QlBERElZLUJJTExFUi1TSU1VTEFUT1I6MjAyNg==";

const TEXT_CRYPTO_TOUR_ID = "text-crypto-intro";
const TEXT_CRYPTO_TOUR_TARGETS = {
  controls: "text-crypto-tour-controls",
  results: "text-crypto-tour-results",
} as const;

const getTextCryptoTourSteps = (): readonly DeveloperToolTourStep[] => [
  {
    description: messages.textCrypto.tour.controlsDescription,
    position: "bottom",
    selectorId: TEXT_CRYPTO_TOUR_TARGETS.controls,
    title: messages.textCrypto.tour.controlsTitle,
  },
  {
    description: messages.textCrypto.tour.resultsDescription,
    position: "top",
    selectorId: TEXT_CRYPTO_TOUR_TARGETS.results,
    title: messages.textCrypto.tour.resultsTitle,
  },
];

type CryptoOptions = {
  urlSafe: boolean;
  withoutPadding: boolean;
  uppercaseHex: boolean;
  bcryptCost: number;
  argon2MemoryKb: string;
  argon2Iterations: string;
  argon2Parallelism: string;
};

const DEFAULT_OPTIONS: CryptoOptions = {
  urlSafe: false,
  withoutPadding: false,
  uppercaseHex: false,
  bcryptCost: 10,
  argon2MemoryKb: "16384",
  argon2Iterations: "2",
  argon2Parallelism: "1",
};

type BreakdownRow = {
  readonly label: string;
  readonly value: string;
};

function isTextCryptoAlgorithm(value: unknown): value is TextCryptoAlgorithm {
  return (
    value === "BASE64" ||
    value === "MD5" ||
    value === "BCRYPT" ||
    value === "ARGON2"
  );
}

function isTextCryptoOperation(value: unknown): value is TextCryptoOperation {
  return value === "CONVERT" || value === "DECODE" || value === "VERIFY";
}

function parseOutputBreakdown(result: TextCryptoResult): BreakdownRow[] {
  const copy = messages.textCrypto;
  const output = result.output;

  if (result.algorithm === "BCRYPT") {
    const parts = output.split("$");
    if (parts.length >= 4) {
      const version = `$${parts[1]}$`;
      const cost = parts[2] ?? "";
      const payload = parts[3] ?? "";
      const salt = payload.slice(0, 22);
      const digest = payload.slice(22);
      const rounds = 2 ** (Number.parseInt(cost, 10) || 10);
      return [
        { label: copy.propAlgorithm, value: "BCrypt (Blowfish)" },
        { label: copy.propVariant, value: version },
        {
          label: copy.propParameters,
          value: `cost=${cost} (${rounds} rounds)`,
        },
        { label: copy.propSalt, value: salt || "—" },
        { label: copy.propDigest, value: digest || "—" },
      ];
    }
  }

  if (result.algorithm === "ARGON2") {
    const parts = output.split("$");
    if (parts.length >= 6) {
      return [
        { label: copy.propAlgorithm, value: parts[1] ?? "argon2id" },
        { label: copy.propVariant, value: parts[2] ?? "v=19" },
        { label: copy.propParameters, value: parts[3] ?? "—" },
        { label: copy.propSalt, value: parts[4] ?? "—" },
        { label: copy.propDigest, value: parts[5] ?? "—" },
      ];
    }
  }

  if (result.algorithm === "MD5") {
    return [
      { label: copy.propAlgorithm, value: "MD5 (RFC 1321)" },
      { label: copy.propVariant, value: "128-bit (16 bytes)" },
      { label: copy.propDigest, value: output },
    ];
  }

  return [
    { label: copy.propAlgorithm, value: "Base64 (RFC 4648)" },
    { label: copy.propVariant, value: result.summary },
    { label: copy.propDigest, value: output },
  ];
}

function encodeUtf8HexPreview(value: string) {
  const bytes = new TextEncoder().encode(value);
  const hex = Array.from(bytes.slice(0, 512), (byte) =>
    byte.toString(16).padStart(2, "0")
  ).join(" ");
  return {
    byteLength: bytes.length,
    hex: bytes.length > 512 ? `${hex} …` : hex,
  };
}

function AlgorithmOptionsFields({
  algorithm,
  operation,
  options,
  onChange,
}: {
  readonly algorithm: TextCryptoAlgorithm;
  readonly operation: TextCryptoOperation;
  readonly options: CryptoOptions;
  readonly onChange: (patch: Partial<CryptoOptions>) => void;
}) {
  const copy = messages.textCrypto;

  if (algorithm === "BASE64") {
    return (
      <FieldGroup size="sm">
        <Field orientation="horizontal" size="sm" variant="card">
          <FieldContent>
            <FieldLabel htmlFor="crypto-base64-urlsafe">
              {copy.urlSafe}
            </FieldLabel>
            <FieldDescription>{copy.urlSafeDescription}</FieldDescription>
          </FieldContent>
          <Switch
            checked={options.urlSafe}
            id="crypto-base64-urlsafe"
            onCheckedChange={(checked) =>
              onChange({ urlSafe: Boolean(checked) })
            }
          />
        </Field>
        {operation === "DECODE" ? null : (
          <Field orientation="horizontal" size="sm" variant="card">
            <FieldContent>
              <FieldLabel htmlFor="crypto-base64-nopad">
                {copy.withoutPadding}
              </FieldLabel>
              <FieldDescription>
                {copy.withoutPaddingDescription}
              </FieldDescription>
            </FieldContent>
            <Switch
              checked={options.withoutPadding}
              id="crypto-base64-nopad"
              onCheckedChange={(checked) =>
                onChange({ withoutPadding: Boolean(checked) })
              }
            />
          </Field>
        )}
      </FieldGroup>
    );
  }

  if (algorithm === "MD5") {
    return (
      <Field orientation="horizontal" size="sm" variant="card">
        <FieldContent>
          <FieldLabel htmlFor="crypto-md5-upper">
            {copy.uppercaseHex}
          </FieldLabel>
          <FieldDescription>{copy.uppercaseHexDescription}</FieldDescription>
        </FieldContent>
        <Switch
          checked={options.uppercaseHex}
          id="crypto-md5-upper"
          onCheckedChange={(checked) =>
            onChange({ uppercaseHex: Boolean(checked) })
          }
        />
      </Field>
    );
  }

  if (algorithm === "BCRYPT") {
    const iterations = (2 ** options.bcryptCost).toLocaleString();
    return (
      <Field data-disabled={operation === "VERIFY"} size="sm" variant="card">
        <div className="flex items-center justify-between">
          <FieldLabel htmlFor="crypto-bcrypt-cost">
            {copy.bcryptCost}
          </FieldLabel>
          <span className="font-mono text-muted-foreground text-xs tabular-nums">
            2^{options.bcryptCost} ={" "}
            {formatMessage(copy.bcryptIterations, { iterations })}
          </span>
        </div>
        <Slider
          disabled={operation === "VERIFY"}
          id="crypto-bcrypt-cost"
          max={14}
          min={4}
          onValueChange={(val) => {
            const nextCost = Array.isArray(val) ? val[0] : val;
            if (nextCost !== undefined) {
              onChange({ bcryptCost: nextCost });
            }
          }}
          step={1}
          value={options.bcryptCost}
        />
      </Field>
    );
  }

  return (
    <FieldGroup size="sm">
      <div className="inline-flex w-fit items-center gap-1 rounded-xl border border-border/70 bg-muted/40 p-1">
        {[
          {
            label: copy.argon2PresetInteractive,
            mem: "16384",
            iter: "2",
            par: "1",
          },
          {
            label: copy.argon2PresetModerate,
            mem: "32768",
            iter: "3",
            par: "1",
          },
          {
            label: copy.argon2PresetSensitive,
            mem: "65536",
            iter: "4",
            par: "2",
          },
        ].map((preset) => {
          const isActive =
            options.argon2MemoryKb === preset.mem &&
            options.argon2Iterations === preset.iter &&
            options.argon2Parallelism === preset.par;
          return (
            <Button
              aria-pressed={isActive}
              disabled={operation === "VERIFY"}
              key={preset.label}
              onClick={() =>
                onChange({
                  argon2MemoryKb: preset.mem,
                  argon2Iterations: preset.iter,
                  argon2Parallelism: preset.par,
                })
              }
              size="xs"
              type="button"
              variant={isActive ? "segment-active" : "ghost-muted"}
            >
              {preset.label}
            </Button>
          );
        })}
      </div>
      <FieldGroup className="grid grid-cols-3" size="sm">
        <Field data-disabled={operation === "VERIFY"} size="sm">
          <FieldLabel htmlFor="crypto-argon-mem">
            {copy.argon2MemoryKb}
          </FieldLabel>
          <Input
            disabled={operation === "VERIFY"}
            id="crypto-argon-mem"
            inputMode="numeric"
            max={65_536}
            min={1024}
            onChange={(event) =>
              onChange({ argon2MemoryKb: event.target.value })
            }
            size="sm"
            step={1024}
            type="number"
            value={options.argon2MemoryKb}
            variant="mono"
          />
        </Field>
        <Field data-disabled={operation === "VERIFY"} size="sm">
          <FieldLabel htmlFor="crypto-argon-iter">
            {copy.argon2Iterations}
          </FieldLabel>
          <Input
            disabled={operation === "VERIFY"}
            id="crypto-argon-iter"
            inputMode="numeric"
            max={10}
            min={1}
            onChange={(event) =>
              onChange({ argon2Iterations: event.target.value })
            }
            size="sm"
            type="number"
            value={options.argon2Iterations}
            variant="mono"
          />
        </Field>
        <Field data-disabled={operation === "VERIFY"} size="sm">
          <FieldLabel htmlFor="crypto-argon-par">
            {copy.argon2Parallelism}
          </FieldLabel>
          <Input
            disabled={operation === "VERIFY"}
            id="crypto-argon-par"
            inputMode="numeric"
            max={4}
            min={1}
            onChange={(event) =>
              onChange({ argon2Parallelism: event.target.value })
            }
            size="sm"
            type="number"
            value={options.argon2Parallelism}
            variant="mono"
          />
        </Field>
      </FieldGroup>
    </FieldGroup>
  );
}

function algorithmNote(algorithm: TextCryptoAlgorithm) {
  const copy = messages.textCrypto;
  if (algorithm === "BASE64") {
    return copy.base64Note;
  }
  if (algorithm === "MD5") {
    return copy.md5Note;
  }
  if (algorithm === "BCRYPT") {
    return copy.bcryptLimitNote;
  }
  return copy.argon2Note;
}

function SelectionIndicator({
  layoutId,
  selected,
  shouldReduceMotion,
}: {
  readonly layoutId: string;
  readonly selected: boolean;
  readonly shouldReduceMotion: boolean;
}) {
  if (!selected) {
    return null;
  }
  return (
    <motion.span
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 rounded-lg bg-background shadow-xs ring-1 ring-border/60 dark:bg-card"
      layoutId={shouldReduceMotion ? undefined : layoutId}
      transition={
        shouldReduceMotion
          ? { duration: MOTION_DURATION.instant }
          : MOTION_SPRING.snappy
      }
    />
  );
}

function AnimatedCopyIcon({
  copied,
  shouldReduceMotion,
}: {
  readonly copied: boolean;
  readonly shouldReduceMotion: boolean;
}) {
  const CopyIcon = copied ? Check : ClipboardCopy;
  return (
    <span className="relative size-3.5" data-icon="inline-start">
      <AnimatePresence initial={false} mode="sync">
        <motion.span
          animate={{ opacity: 1, transform: "scale(1)" }}
          className="absolute inset-0 flex items-center justify-center"
          exit={{
            opacity: 0,
            transform: shouldReduceMotion ? "none" : "scale(0.92)",
          }}
          initial={{
            opacity: 0,
            transform: shouldReduceMotion ? "none" : "scale(0.92)",
          }}
          key={copied ? "copied" : "idle"}
          transition={{
            duration: shouldReduceMotion
              ? MOTION_DURATION.instant
              : MOTION_DURATION.fast,
            ease: MOTION_EASE.out,
          }}
        >
          <CopyIcon />
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

function VerificationStatusItem({
  shouldReduceMotion,
  verified,
}: {
  readonly shouldReduceMotion: boolean;
  readonly verified: boolean;
}) {
  const copy = messages.textCrypto;
  return (
    <motion.div
      animate={{ opacity: 1, transform: "translateY(0)" }}
      initial={
        shouldReduceMotion
          ? false
          : { opacity: 0, transform: "translateY(4px)" }
      }
      transition={{
        duration: shouldReduceMotion
          ? MOTION_DURATION.instant
          : MOTION_DURATION.standard,
        ease: MOTION_EASE.out,
      }}
    >
      <Item size="sm" variant="outline">
        <ItemMedia variant="icon">
          {verified ? <CheckCircle2 /> : <CircleAlert />}
        </ItemMedia>
        <ItemContent>
          <ItemTitle>{verified ? copy.match : copy.mismatch}</ItemTitle>
          <ItemDescription>
            {verified ? copy.matchDescription : copy.mismatchDescription}
          </ItemDescription>
        </ItemContent>
        <ItemActions>
          <Badge variant={verified ? "success" : "destructive"}>
            {verified ? copy.match : copy.mismatch}
          </Badge>
        </ItemActions>
      </Item>
    </motion.div>
  );
}

function TextCryptoResultsCard({
  apiError,
  breakdownRows,
  copied,
  hexPreview,
  onCopy,
  onUseOutputForVerify,
  operation,
  result,
  shouldReduceMotion,
}: {
  readonly apiError: ApiError | null;
  readonly breakdownRows: readonly BreakdownRow[];
  readonly copied: boolean;
  readonly hexPreview: string;
  readonly onCopy: () => void;
  readonly onUseOutputForVerify: () => void;
  readonly operation: TextCryptoOperation;
  readonly result: TextCryptoResult | null;
  readonly shouldReduceMotion: boolean;
}) {
  const copy = messages.textCrypto;
  const [activeTab, setActiveTab] = useState<"output" | "hex">("output");

  return (
    <motion.div
      className="flex min-h-0 min-w-0 flex-col"
      variants={childVariants}
    >
      <Card
        className="min-h-0 min-w-0 flex-1 overflow-hidden"
        id={TEXT_CRYPTO_TOUR_TARGETS.results}
        size="none"
        variant="overview-card"
      >
        <CardHeader size="sm" variant="panel">
          <CardTitle size="sm">{copy.results}</CardTitle>
          <CardDescription size="xs">
            {result ? result.summary : copy.resultsDescription}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex min-h-0 flex-1 flex-col" size="none">
          {apiError ? (
            <div className="p-4 pb-0">
              <Alert variant="destructive">
                <CircleAlert />
                <AlertTitle>{copy.requestFailed}</AlertTitle>
                <AlertDescription>{apiError.message}</AlertDescription>
              </Alert>
            </div>
          ) : null}

          {result ? (
            <ScrollArea
              className="min-h-0 flex-1"
              contentSize="stack"
              variant="fit"
            >
              <dl aria-live="polite" className="grid grid-cols-3 gap-2.5">
                <div className="rounded-xl border border-border/60 bg-muted/25 px-3 py-2.5">
                  <dt className="text-muted-foreground text-xs">
                    {copy.metricInputBytes}
                  </dt>
                  <dd className="mt-0.5 font-mono font-semibold text-base tabular-nums tracking-tight">
                    {formatMessage(copy.bytesUnit, {
                      count: result.inputBytes,
                    })}
                  </dd>
                </div>
                <div className="rounded-xl border border-border/60 bg-muted/25 px-3 py-2.5">
                  <dt className="text-muted-foreground text-xs">
                    {copy.metricOutputLength}
                  </dt>
                  <dd className="mt-0.5 font-mono font-semibold text-base tabular-nums tracking-tight">
                    {formatMessage(copy.charsUnit, {
                      count: result.outputLength,
                    })}
                  </dd>
                </div>
                <div className="rounded-xl border border-border/60 bg-muted/25 px-3 py-2.5">
                  <dt className="text-muted-foreground text-xs">
                    {copy.metricDuration}
                  </dt>
                  <dd className="mt-0.5 font-mono font-semibold text-base tabular-nums tracking-tight">
                    {formatMessage(copy.msUnit, { count: result.durationMs })}
                  </dd>
                </div>
              </dl>

              {result.verified === null ? null : (
                <VerificationStatusItem
                  shouldReduceMotion={shouldReduceMotion}
                  verified={result.verified}
                />
              )}

              <Tabs
                onValueChange={(value) =>
                  setActiveTab(value === "hex" ? "hex" : "output")
                }
                value={activeTab}
              >
                <TabsList size="sm" variant="subtle">
                  <TabsTrigger size="sm" value="output">
                    <FileTerminal />
                    <span>{copy.tabOutput}</span>
                  </TabsTrigger>
                  <TabsTrigger size="sm" value="hex">
                    <Binary />
                    <span>{copy.tabHex}</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="output">
                  <motion.div
                    animate={{ opacity: 1, transform: "translateY(0)" }}
                    initial={
                      shouldReduceMotion
                        ? false
                        : { opacity: 0, transform: "translateY(4px)" }
                    }
                    key={`${result.algorithm}-${result.operation}`}
                    transition={
                      shouldReduceMotion
                        ? { duration: MOTION_DURATION.instant }
                        : MOTION_SPRING.gentle
                    }
                  >
                    <FieldGroup size="sm">
                      <Field size="sm">
                        <FieldLabel htmlFor="text-crypto-output">
                          {copy.output}
                        </FieldLabel>
                        <InputGroup>
                          <InputGroupAddon
                            align="block-start"
                            className="justify-between"
                          >
                            <InputGroupText>
                              <Hash />
                              <span>
                                {result.algorithm} · {result.operation}
                              </span>
                            </InputGroupText>
                            <div className="flex items-center gap-1">
                              {operation === "VERIFY" ? null : (
                                <InputGroupButton
                                  onClick={onUseOutputForVerify}
                                  size="xs"
                                  variant="ghost"
                                >
                                  <ShieldCheck data-icon="inline-start" />
                                  <span>{copy.useOutputAsTarget}</span>
                                </InputGroupButton>
                              )}
                              <InputGroupButton
                                onClick={onCopy}
                                size="xs"
                                variant="ghost"
                              >
                                <AnimatedCopyIcon
                                  copied={copied}
                                  shouldReduceMotion={shouldReduceMotion}
                                />
                                <span>{copy.copy}</span>
                              </InputGroupButton>
                            </div>
                          </InputGroupAddon>
                          <InputGroupTextarea
                            className="h-24 [field-sizing:fixed]"
                            id="text-crypto-output"
                            placeholder={copy.outputPlaceholder}
                            readOnly
                            value={result.output}
                          />
                        </InputGroup>
                      </Field>

                      <div className="overflow-hidden rounded-xl border border-border/60 bg-muted/15">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="h-8">
                                {copy.fieldProperty}
                              </TableHead>
                              <TableHead className="h-8">
                                {copy.fieldValue}
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {breakdownRows.map((row) => (
                              <TableRow key={row.label}>
                                <TableCell size="compact" variant="medium">
                                  {row.label}
                                </TableCell>
                                <TableCell
                                  className="max-w-[20rem] whitespace-normal break-all"
                                  size="compact"
                                  variant="mono"
                                >
                                  {row.value}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </FieldGroup>
                  </motion.div>
                </TabsContent>

                <TabsContent value="hex">
                  <motion.div
                    animate={{ opacity: 1, transform: "translateY(0)" }}
                    initial={
                      shouldReduceMotion
                        ? false
                        : { opacity: 0, transform: "translateY(4px)" }
                    }
                    key="hex-panel"
                    transition={
                      shouldReduceMotion
                        ? { duration: MOTION_DURATION.instant }
                        : MOTION_SPRING.gentle
                    }
                  >
                    <Field size="sm">
                      <FieldLabel htmlFor="text-crypto-hex">
                        {copy.tabHex}
                      </FieldLabel>
                      <Textarea
                        className="h-44 resize-none [field-sizing:fixed]"
                        id="text-crypto-hex"
                        readOnly
                        value={hexPreview || copy.emptyHex}
                        variant="mono-muted"
                      />
                    </Field>
                  </motion.div>
                </TabsContent>
              </Tabs>
            </ScrollArea>
          ) : (
            <Empty size="compact" variant="plain">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Hash />
                </EmptyMedia>
                <EmptyTitle>{copy.emptyTitle}</EmptyTitle>
                <EmptyDescription>{copy.emptyDescription}</EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function TextCryptoTool() {
  const { locale } = useI18n();
  const shouldReduceMotion = useReducedMotion() ?? false;
  const copy = messages.textCrypto;
  const tourSteps = useMemo(() => getTextCryptoTourSteps(), [locale]);
  const [algorithm, setAlgorithm] = useState<TextCryptoAlgorithm>("BASE64");
  const [operation, setOperation] = useState<TextCryptoOperation>("CONVERT");
  const [input, setInput] = useState(EXAMPLE_INPUTS.BASE64);
  const [targetHash, setTargetHash] = useState("");
  const [options, setOptions] = useState<CryptoOptions>(DEFAULT_OPTIONS);
  const [result, setResult] = useState<TextCryptoResult | null>(null);
  const [copied, setCopied] = useState(false);

  const mutation = useProcessTextCrypto();
  const apiError = mutation.error;

  const utf8Preview = useMemo(() => encodeUtf8HexPreview(input), [input]);
  const bcryptOverLimit = algorithm === "BCRYPT" && utf8Preview.byteLength > 72;
  const breakdownRows = useMemo(
    () => (result ? parseOutputBreakdown(result) : []),
    [result]
  );

  const updateOptions = (patch: Partial<CryptoOptions>) =>
    setOptions((previous) => ({ ...previous, ...patch }));

  const runProcess = useCallback(
    (override?: {
      algorithm?: TextCryptoAlgorithm;
      operation?: TextCryptoOperation;
      input?: string;
      targetHash?: string;
      options?: CryptoOptions;
    }) => {
      const nextAlgorithm = override?.algorithm ?? algorithm;
      const nextOperation = override?.operation ?? operation;
      const nextInput = override?.input ?? input;
      const nextTarget = override?.targetHash ?? targetHash;
      const nextOptions = override?.options ?? options;

      setCopied(false);
      mutation.mutate(
        {
          algorithm: nextAlgorithm,
          operation: nextOperation,
          input: nextInput,
          targetHash: nextOperation === "VERIFY" ? nextTarget : undefined,
          urlSafe: nextOptions.urlSafe,
          withoutPadding: nextOptions.withoutPadding,
          uppercaseHex: nextOptions.uppercaseHex,
          bcryptCost: nextOptions.bcryptCost,
          argon2MemoryKb:
            Number.parseInt(nextOptions.argon2MemoryKb, 10) || 16_384,
          argon2Iterations:
            Number.parseInt(nextOptions.argon2Iterations, 10) || 2,
          argon2Parallelism:
            Number.parseInt(nextOptions.argon2Parallelism, 10) || 1,
        },
        {
          onSuccess: (data) => {
            setResult(data);
          },
        }
      );
    },
    [algorithm, input, mutation, operation, options, targetHash]
  );

  useEffect(() => {
    runProcess({
      algorithm: "BASE64",
      operation: "CONVERT",
      input: EXAMPLE_INPUTS.BASE64,
      options: DEFAULT_OPTIONS,
    });
  }, []);

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
        event.preventDefault();
        runProcess();
      }
    };
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, [runProcess]);

  const handleAlgorithmChange = (values: readonly unknown[]) => {
    const next = values[0];
    if (!isTextCryptoAlgorithm(next)) {
      return;
    }
    const nextOperation =
      next !== "BASE64" && operation === "DECODE" ? "CONVERT" : operation;
    const nextInput = EXAMPLE_INPUTS[next];
    setAlgorithm(next);
    setOperation(nextOperation);
    setInput(nextInput);
    setTargetHash("");
    setResult(null);
    if (nextOperation === "CONVERT") {
      runProcess({
        algorithm: next,
        operation: nextOperation,
        input: nextInput,
      });
    }
  };

  const handleOperationChange = (values: readonly unknown[]) => {
    const next = values[0];
    if (!isTextCryptoOperation(next)) {
      return;
    }
    setOperation(next);
    if (next === "DECODE" && algorithm === "BASE64") {
      const decodeInput = result?.output || EXAMPLE_DECODE_BASE64;
      setInput(decodeInput);
      runProcess({ operation: "DECODE", input: decodeInput });
    } else if (next === "VERIFY" && result?.output) {
      setTargetHash(result.output);
      runProcess({ operation: "VERIFY", targetHash: result.output });
    } else if (next === "CONVERT") {
      const convertInput =
        algorithm === "BASE64" && input === EXAMPLE_DECODE_BASE64
          ? EXAMPLE_INPUTS.BASE64
          : input;
      setInput(convertInput);
      runProcess({ operation: "CONVERT", input: convertInput });
    }
  };

  const handleCopy = async () => {
    if (!result?.output) {
      return;
    }
    try {
      if (await copyToClipboard(result.output)) {
        setCopied(true);
        toast.success(copy.copied);
      } else {
        toast.error(copy.copyError);
      }
    } catch {
      toast.error(copy.copyError);
    }
  };

  const handleUseOutputForVerify = () => {
    if (!result?.output) {
      return;
    }
    setOperation("VERIFY");
    setTargetHash(result.output);
    runProcess({ operation: "VERIFY", targetHash: result.output });
  };

  const resetExample = () => {
    const exampleInput = EXAMPLE_INPUTS[algorithm];
    setOperation("CONVERT");
    setInput(exampleInput);
    setTargetHash("");
    setOptions(DEFAULT_OPTIONS);
    runProcess({
      algorithm,
      operation: "CONVERT",
      input: exampleInput,
      targetHash: "",
      options: DEFAULT_OPTIONS,
    });
  };

  const clearInputs = () => {
    setInput("");
    setTargetHash("");
    setResult(null);
    mutation.reset();
  };

  return (
    <DeveloperToolLayout
      className="min-h-0 flex-1 gap-3 pb-4 lg:overflow-hidden [&>header]:shrink-0 [&>header]:border-b-0 [&>header]:pb-2"
      clearLabel={copy.clear}
      description={copy.description}
      extraActions={
        <Button
          disabled={!result?.output}
          onClick={handleCopy}
          size="sm"
          variant="tool-action"
        >
          <AnimatedCopyIcon
            copied={copied}
            shouldReduceMotion={shouldReduceMotion}
          />
          <span>{copy.copy}</span>
        </Button>
      }
      mainClassName="flex min-h-0 flex-1 flex-col"
      onClear={clearInputs}
      onReset={resetExample}
      resetLabel={copy.reset}
      title={copy.title}
      tour={
        <DeveloperToolTourButton
          label={copy.tour.startButton}
          steps={tourSteps}
          storageKey="text-crypto-tour-seen"
          tourId={TEXT_CRYPTO_TOUR_ID}
        />
      }
    >
      <div className="grid min-h-0 flex-1 gap-3 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:grid-rows-[minmax(0,1fr)]">
        <motion.div
          className="flex min-h-0 min-w-0 flex-col"
          variants={childVariants}
        >
          <Card
            className="min-h-0 min-w-0 flex-1 overflow-hidden"
            id={TEXT_CRYPTO_TOUR_TARGETS.controls}
            size="none"
            variant="overview-card"
          >
            <CardHeader size="sm" variant="panel">
              <CardTitle size="sm">{copy.inputs}</CardTitle>
              <CardDescription size="xs">
                {copy.inputsDescription}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex min-h-0 flex-1 flex-col" size="none">
              <ScrollArea
                className="min-h-0 flex-1"
                contentSize="stack"
                variant="fit"
              >
                <FieldGroup size="sm">
                  <FieldGroup
                    className="flex-row flex-wrap items-end justify-between"
                    size="sm"
                  >
                    <Field className="w-auto" size="sm">
                      <FieldLabel id="text-crypto-algorithm-label">
                        {copy.algorithm}
                      </FieldLabel>
                      <ToggleGroup
                        aria-labelledby="text-crypto-algorithm-label"
                        onValueChange={handleAlgorithmChange}
                        size="xs"
                        spacing={1}
                        value={[algorithm]}
                        variant="subtle"
                      >
                        <ToggleGroupItem
                          className="relative isolate overflow-hidden"
                          value="BASE64"
                        >
                          <SelectionIndicator
                            layoutId="text-crypto-algorithm-pill"
                            selected={algorithm === "BASE64"}
                            shouldReduceMotion={shouldReduceMotion}
                          />
                          <Binary className="relative z-10" />
                          <span className="relative z-10">{copy.base64}</span>
                        </ToggleGroupItem>
                        <ToggleGroupItem
                          className="relative isolate overflow-hidden"
                          value="MD5"
                        >
                          <SelectionIndicator
                            layoutId="text-crypto-algorithm-pill"
                            selected={algorithm === "MD5"}
                            shouldReduceMotion={shouldReduceMotion}
                          />
                          <Hash className="relative z-10" />
                          <span className="relative z-10">{copy.md5}</span>
                        </ToggleGroupItem>
                        <ToggleGroupItem
                          className="relative isolate overflow-hidden"
                          value="BCRYPT"
                        >
                          <SelectionIndicator
                            layoutId="text-crypto-algorithm-pill"
                            selected={algorithm === "BCRYPT"}
                            shouldReduceMotion={shouldReduceMotion}
                          />
                          <KeyRound className="relative z-10" />
                          <span className="relative z-10">{copy.bcrypt}</span>
                        </ToggleGroupItem>
                        <ToggleGroupItem
                          className="relative isolate overflow-hidden"
                          value="ARGON2"
                        >
                          <SelectionIndicator
                            layoutId="text-crypto-algorithm-pill"
                            selected={algorithm === "ARGON2"}
                            shouldReduceMotion={shouldReduceMotion}
                          />
                          <Fingerprint className="relative z-10" />
                          <span className="relative z-10">{copy.argon2}</span>
                        </ToggleGroupItem>
                      </ToggleGroup>
                    </Field>

                    <Field className="w-auto" size="sm">
                      <FieldLabel id="text-crypto-operation-label">
                        {copy.operation}
                      </FieldLabel>
                      <ToggleGroup
                        aria-labelledby="text-crypto-operation-label"
                        onValueChange={handleOperationChange}
                        size="xs"
                        spacing={1}
                        value={[operation]}
                        variant="subtle"
                      >
                        <ToggleGroupItem
                          className="relative isolate overflow-hidden"
                          value="CONVERT"
                        >
                          <SelectionIndicator
                            layoutId="text-crypto-operation-pill"
                            selected={operation === "CONVERT"}
                            shouldReduceMotion={shouldReduceMotion}
                          />
                          <RefreshCw className="relative z-10" />
                          <span className="relative z-10">{copy.convert}</span>
                        </ToggleGroupItem>
                        {algorithm === "BASE64" ? (
                          <ToggleGroupItem
                            className="relative isolate overflow-hidden"
                            value="DECODE"
                          >
                            <SelectionIndicator
                              layoutId="text-crypto-operation-pill"
                              selected={operation === "DECODE"}
                              shouldReduceMotion={shouldReduceMotion}
                            />
                            <UnlockIcon className="relative z-10" />
                            <span className="relative z-10">{copy.decode}</span>
                          </ToggleGroupItem>
                        ) : null}
                        <ToggleGroupItem
                          className="relative isolate overflow-hidden"
                          value="VERIFY"
                        >
                          <SelectionIndicator
                            layoutId="text-crypto-operation-pill"
                            selected={operation === "VERIFY"}
                            shouldReduceMotion={shouldReduceMotion}
                          />
                          <ShieldCheck className="relative z-10" />
                          <span className="relative z-10">{copy.verify}</span>
                        </ToggleGroupItem>
                      </ToggleGroup>
                    </Field>
                  </FieldGroup>

                  <motion.div
                    animate={{ opacity: 1, transform: "translateY(0)" }}
                    initial={
                      shouldReduceMotion
                        ? false
                        : { opacity: 0, transform: "translateY(4px)" }
                    }
                    key={algorithm}
                    transition={
                      shouldReduceMotion
                        ? { duration: MOTION_DURATION.instant }
                        : MOTION_SPRING.gentle
                    }
                  >
                    <AlgorithmOptionsFields
                      algorithm={algorithm}
                      onChange={updateOptions}
                      operation={operation}
                      options={options}
                    />
                  </motion.div>

                  <Field data-invalid={bcryptOverLimit} size="sm">
                    <div className="flex items-center justify-between">
                      <FieldLabel htmlFor="text-crypto-input">
                        {operation === "DECODE"
                          ? copy.base64Input
                          : copy.plainText}
                      </FieldLabel>
                      <span
                        className={
                          bcryptOverLimit
                            ? "font-mono text-destructive text-xs tabular-nums"
                            : "font-mono text-muted-foreground text-xs tabular-nums"
                        }
                      >
                        {formatMessage(copy.bytesUnit, {
                          count: utf8Preview.byteLength,
                        })}
                      </span>
                    </div>
                    <Textarea
                      aria-invalid={bcryptOverLimit}
                      autoCapitalize="off"
                      autoComplete="off"
                      className="h-24 resize-none [field-sizing:fixed]"
                      id="text-crypto-input"
                      onChange={(event) => setInput(event.target.value)}
                      spellCheck={false}
                      value={input}
                      variant="mono"
                    />
                    {bcryptOverLimit ? (
                      <FieldError>
                        {formatMessage(copy.bcryptTruncateWarning, {
                          count: utf8Preview.byteLength,
                        })}
                      </FieldError>
                    ) : null}
                  </Field>

                  {operation === "VERIFY" ? (
                    <motion.div
                      animate={{ opacity: 1, transform: "translateY(0)" }}
                      initial={
                        shouldReduceMotion
                          ? false
                          : { opacity: 0, transform: "translateY(4px)" }
                      }
                      transition={
                        shouldReduceMotion
                          ? { duration: MOTION_DURATION.instant }
                          : MOTION_SPRING.gentle
                      }
                    >
                      <Field size="sm">
                        <FieldLabel htmlFor="text-crypto-target">
                          {copy.targetHash}
                        </FieldLabel>
                        <Textarea
                          autoCapitalize="off"
                          autoComplete="off"
                          className="h-16 resize-none [field-sizing:fixed]"
                          id="text-crypto-target"
                          onChange={(event) =>
                            setTargetHash(event.target.value)
                          }
                          placeholder={copy.targetHashPlaceholder}
                          spellCheck={false}
                          value={targetHash}
                          variant="mono"
                        />
                      </Field>
                    </motion.div>
                  ) : null}
                </FieldGroup>

                <Separator />

                <Collapsible>
                  <CollapsibleTrigger
                    render={
                      <Button
                        className="w-full justify-between data-panel-open:[&>svg]:rotate-180"
                        size="sm"
                        variant="ghost"
                      />
                    }
                  >
                    {copy.assumptions}
                    <ChevronDown data-icon="inline-end" />
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="flex flex-col gap-1.5 pt-2 text-muted-foreground text-xs leading-relaxed">
                      <p>{algorithmNote(algorithm)}</p>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </ScrollArea>
            </CardContent>
            <Separator />
            <CardFooter className="shrink-0 justify-between">
              <KbdGroup className="hidden sm:inline-flex">
                <Kbd>⌘</Kbd>
                <Kbd>↵</Kbd>
              </KbdGroup>
              <Button
                className="my-3 w-full sm:w-auto"
                disabled={mutation.isPending || bcryptOverLimit}
                onClick={() => runProcess()}
                size="sm"
                type="button"
              >
                {mutation.isPending ? (
                  <Spinner data-icon="inline-start" size="sm" />
                ) : (
                  <Play data-icon="inline-start" />
                )}
                <span>{mutation.isPending ? copy.running : copy.run}</span>
              </Button>
            </CardFooter>
          </Card>
        </motion.div>

        <TextCryptoResultsCard
          apiError={apiError}
          breakdownRows={breakdownRows}
          copied={copied}
          hexPreview={utf8Preview.hex}
          onCopy={handleCopy}
          onUseOutputForVerify={handleUseOutputForVerify}
          operation={operation}
          result={result}
          shouldReduceMotion={shouldReduceMotion}
        />
      </div>
    </DeveloperToolLayout>
  );
}
