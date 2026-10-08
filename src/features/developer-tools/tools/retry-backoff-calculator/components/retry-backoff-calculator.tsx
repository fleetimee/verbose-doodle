import { useState } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { toast } from "sonner";
import { ClipboardCopy } from "@/components/hugeicons";
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
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { DeveloperToolLayout } from "@/features/developer-tools/components/developer-tool-layout";
import {
  type BackoffStrategy,
  calculateBackoff,
  type JitterMode,
} from "@/features/developer-tools/tools/retry-backoff-calculator/calculate-backoff";
import { copyToClipboard } from "@/lib/clipboard";

const DEFAULT_INPUT = {
  retries: "5",
  delay: "1",
  multiplier: "2",
  cap: "30",
  timeout: "2",
  budget: "60",
};
type NumericField = keyof typeof DEFAULT_INPUT;

function validateInput(input: typeof DEFAULT_INPUT, strategy: BackoffStrategy) {
  const invalidFields = new Set<NumericField>();
  const numericFields: NumericField[] = [
    "retries",
    "delay",
    "multiplier",
    "cap",
    "timeout",
    "budget",
  ];
  for (const key of numericFields) {
    if (
      (key === "budget" && input.budget.trim() === "") ||
      (key === "multiplier" && strategy === "fixed")
    ) {
      continue;
    }
    const value = Number(input[key]);
    const maximums = {
      retries: 100,
      multiplier: 10,
      delay: 86_400,
      cap: 86_400,
      timeout: 86_400,
      budget: 86_400,
    };
    const max = maximums[key];
    const min = key === "multiplier" ? 1 : 0;
    if (
      input[key].trim() === "" ||
      !Number.isFinite(value) ||
      value < min ||
      value > max ||
      (key === "retries" && !Number.isInteger(value)) ||
      ((key === "delay" || key === "cap") && value === 0)
    ) {
      invalidFields.add(key);
    }
  }
  return invalidFields;
}

export function RetryBackoffCalculator() {
  const { messages, locale } = useI18n();
  const copy = messages.retryBackoffCalculator;
  const [input, setInput] = useState(DEFAULT_INPUT);
  const [strategy, setStrategy] = useState<BackoffStrategy>("exponential");
  const [jitter, setJitter] = useState<JitterMode>("none");
  const policy = {
    strategy,
    jitter,
    retries: Number(input.retries),
    delay: Number(input.delay),
    multiplier: strategy === "fixed" ? 1 : Number(input.multiplier),
    cap: Number(input.cap),
    timeout: Number(input.timeout),
    budget: input.budget.trim() === "" ? null : Number(input.budget),
  };
  const invalidFields = validateInput(input, strategy);
  const result = invalidFields.size === 0 ? calculateBackoff(policy) : null;
  const numberFormat = new Intl.NumberFormat(locale, {
    maximumFractionDigits: 3,
  });
  const duration = (seconds: number) => `${numberFormat.format(seconds)} s`;
  const fields: { key: NumericField; label: string; help?: string }[] = [
    { key: "retries", label: copy.retries, help: copy.retriesHelp },
    { key: "delay", label: copy.delay },
    { key: "multiplier", label: copy.multiplier },
    { key: "cap", label: copy.cap },
    { key: "timeout", label: copy.timeout, help: copy.timeoutHelp },
    { key: "budget", label: copy.budget, help: copy.budgetHelp },
  ];
  async function handleCopy() {
    if (!result) {
      return;
    }
    try {
      const copied = await copyToClipboard(
        JSON.stringify({ unit: "seconds", policy, ...result }, null, 2)
      );
      if (copied) {
        toast.success(copy.copied);
      } else {
        toast.error(copy.copyFailed);
      }
    } catch {
      toast.error(copy.copyFailed);
    }
  }
  return (
    <DeveloperToolLayout
      className="min-h-0 flex-1 gap-4 pb-4 [&>header]:border-b-0 [&>header]:pb-2"
      description={copy.description}
      extraActions={
        <Button
          disabled={!result}
          onClick={handleCopy}
          size="sm"
          variant="tool-action"
        >
          <ClipboardCopy data-icon="inline-start" />
          {copy.copy}
        </Button>
      }
      mainClassName="flex min-h-0 flex-1 flex-col"
      onReset={() => {
        setInput(DEFAULT_INPUT);
        setStrategy("exponential");
        setJitter("none");
      }}
      resetLabel={copy.reset}
      title={copy.title}
    >
      <div className="grid min-h-0 flex-1 gap-3 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.4fr)]">
        <Card
          className="min-h-0 min-w-0 overflow-hidden"
          size="none"
          variant="outline"
        >
          <CardHeader size="sm" variant="subtle">
            <CardTitle size="sm">{copy.policy}</CardTitle>
            <CardDescription className="sr-only" size="xs">
              {copy.policyDescription}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex min-h-0 flex-1 flex-col" size="none">
            <ScrollArea
              className="min-h-0 flex-1"
              contentSize="stack"
              variant="fit"
            >
              <FieldGroup size="sm">
                <FieldGroup className="flex-row flex-wrap" size="sm">
                  <Field className="w-auto" size="sm">
                    <FieldLabel id="retry-strategy-label">
                      {copy.strategy}
                    </FieldLabel>
                    <ToggleGroup
                      aria-labelledby="retry-strategy-label"
                      className="w-fit!"
                      onValueChange={(values) => {
                        if (
                          values[0] === "fixed" ||
                          values[0] === "exponential"
                        ) {
                          setStrategy(values[0]);
                        }
                      }}
                      size="sm"
                      value={[strategy]}
                      variant="outline"
                    >
                      <ToggleGroupItem value="fixed">
                        {copy.fixed}
                      </ToggleGroupItem>
                      <ToggleGroupItem value="exponential">
                        {copy.exponential}
                      </ToggleGroupItem>
                    </ToggleGroup>
                  </Field>
                  <Field className="w-auto" size="sm">
                    <FieldLabel id="retry-jitter-label">
                      {copy.jitter}
                    </FieldLabel>
                    <ToggleGroup
                      aria-labelledby="retry-jitter-label"
                      className="w-fit!"
                      onValueChange={(values) => {
                        if (
                          values[0] === "none" ||
                          values[0] === "full" ||
                          values[0] === "equal"
                        ) {
                          setJitter(values[0]);
                        }
                      }}
                      size="sm"
                      value={[jitter]}
                      variant="outline"
                    >
                      <ToggleGroupItem value="none">
                        {copy.none}
                      </ToggleGroupItem>
                      <ToggleGroupItem value="full">
                        {copy.full}
                      </ToggleGroupItem>
                      <ToggleGroupItem value="equal">
                        {copy.equal}
                      </ToggleGroupItem>
                    </ToggleGroup>
                    <FieldDescription className="sr-only">
                      {copy.jitterDescription}
                    </FieldDescription>
                  </Field>
                </FieldGroup>
                <FieldGroup className="grid grid-cols-2" size="sm">
                  {fields.map(({ key, label, help }) => (
                    <Field
                      data-disabled={
                        key === "multiplier" && strategy === "fixed"
                      }
                      data-invalid={invalidFields.has(key)}
                      key={key}
                      size="sm"
                    >
                      <FieldLabel htmlFor={`retry-${key}`}>{label}</FieldLabel>
                      <Input
                        aria-describedby={
                          help ? `retry-${key}-help` : undefined
                        }
                        aria-invalid={invalidFields.has(key)}
                        disabled={key === "multiplier" && strategy === "fixed"}
                        id={`retry-${key}`}
                        inputMode={key === "retries" ? "numeric" : "decimal"}
                        onChange={(event) =>
                          setInput({ ...input, [key]: event.target.value })
                        }
                        placeholder={
                          key === "budget" ? copy.budgetPlaceholder : undefined
                        }
                        size="sm"
                        value={input[key]}
                        variant="mono"
                      />
                      {help && (
                        <FieldDescription
                          className="sr-only"
                          id={`retry-${key}-help`}
                        >
                          {help}
                        </FieldDescription>
                      )}
                    </Field>
                  ))}
                </FieldGroup>
              </FieldGroup>
              <details className="border-t pt-3 text-xs">
                <summary className="cursor-pointer rounded-sm font-medium focus-visible:outline-2 focus-visible:outline-ring">
                  {copy.assumptions}
                </summary>
                <p className="mt-2 text-muted-foreground leading-relaxed">
                  {copy.assumptionsDescription}
                </p>
                <p className="mt-2 text-muted-foreground leading-relaxed">
                  {copy.jitterDescription}
                </p>
                {fields.map((field) =>
                  field.help ? (
                    <p
                      className="mt-2 text-muted-foreground leading-relaxed"
                      key={field.key}
                    >
                      <span className="font-medium text-foreground">
                        {field.label}:{" "}
                      </span>
                      {field.help}
                    </p>
                  ) : null
                )}
              </details>
            </ScrollArea>
          </CardContent>
        </Card>
        <Card
          className="min-h-0 min-w-0 overflow-hidden"
          size="none"
          variant="outline"
        >
          <CardHeader size="sm" variant="subtle">
            <CardTitle size="sm">{copy.timeline}</CardTitle>
            <CardDescription className="sr-only" size="xs">
              {copy.timelineDescription}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex min-h-0 flex-1 flex-col" size="none">
            <ScrollArea
              className="min-h-0 flex-1"
              contentSize="stack"
              variant="fit"
            >
              {result ? (
                <>
                  <dl
                    aria-live="polite"
                    className="grid grid-cols-1 gap-2 border-b pb-3 sm:grid-cols-3"
                  >
                    {[
                      {
                        label: copy.expectedTotal,
                        value: duration(result.expectedTotal),
                      },
                      {
                        label: copy.maximumTotal,
                        value: duration(result.maximumTotal),
                      },
                      {
                        label: copy.fitting,
                        value: `${result.fittingAttempts} / ${result.rows.length}`,
                      },
                    ].map(({ label, value }) => (
                      <div key={label}>
                        <dt className="text-muted-foreground text-xs">
                          {label}
                        </dt>
                        <dd className="mt-1 font-mono font-semibold text-lg tabular-nums">
                          {value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                  {result.fittingAttempts < result.rows.length && (
                    <Alert>
                      <AlertTitle>{copy.budgetExceeded}</AlertTitle>
                      <AlertDescription>
                        {copy.budgetExceededDescription}
                      </AlertDescription>
                    </Alert>
                  )}
                  {policy.retries > 0 && (
                    <section
                      aria-label={copy.preview}
                      className="flex flex-col gap-1.5"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h2 className="font-semibold text-sm">
                          {copy.preview}
                        </h2>
                        <span className="text-muted-foreground text-xs">
                          {copy.seconds}
                        </span>
                      </div>
                      <p className="sr-only">{copy.previewDescription}</p>
                      <ChartContainer
                        aria-label={copy.preview}
                        className="h-[120px] w-full"
                        config={{
                          expectedDelay: {
                            label: copy.expected,
                            color: "var(--primary)",
                          },
                          maximumDelay: {
                            label: copy.maximum,
                            color: "var(--chart-3)",
                          },
                        }}
                      >
                        <BarChart
                          accessibilityLayer
                          data={result.rows.slice(1).map((row) => ({
                            ...row,
                            retry: String(row.attempt - 1),
                          }))}
                          margin={{ left: -20, right: 8 }}
                        >
                          <CartesianGrid vertical={false} />
                          <XAxis
                            axisLine={false}
                            dataKey="retry"
                            tickLine={false}
                          />
                          <YAxis axisLine={false} tickLine={false} />
                          <ChartTooltip
                            content={
                              <ChartTooltipContent
                                formatter={(value, name) => (
                                  <span className="font-mono">
                                    {name === "expectedDelay"
                                      ? copy.expected
                                      : copy.maximum}
                                    : {duration(Number(value))}
                                  </span>
                                )}
                                labelFormatter={(value) =>
                                  `${copy.retry} ${value}`
                                }
                              />
                            }
                          />
                          <Bar
                            dataKey="expectedDelay"
                            fill="var(--color-expectedDelay)"
                            isAnimationActive={false}
                            radius={[3, 3, 0, 0]}
                          />
                          <Bar
                            dataKey="maximumDelay"
                            fill="var(--color-maximumDelay)"
                            isAnimationActive={false}
                            radius={[3, 3, 0, 0]}
                          />
                        </BarChart>
                      </ChartContainer>
                      <div
                        aria-hidden="true"
                        className="flex flex-wrap gap-4 text-muted-foreground text-xs"
                      >
                        <span className="flex items-center gap-2">
                          <span className="size-2 rounded-sm bg-primary" />
                          {copy.expected}
                        </span>
                        <span className="flex items-center gap-2">
                          <span className="size-2 rounded-sm bg-chart-3" />
                          {copy.maximum}
                        </span>
                      </div>
                    </section>
                  )}
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="h-8">{copy.attempt}</TableHead>
                        <TableHead className="h-8">{copy.wait}</TableHead>
                        <TableHead className="h-8">
                          {copy.expectedStart}
                        </TableHead>
                        <TableHead className="h-8">
                          {copy.maximumFinish}
                        </TableHead>
                        <TableHead className="h-8">{copy.status}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {result.rows.map((row) => (
                        <TableRow key={row.attempt}>
                          <TableCell size="compact">
                            <span className="font-mono">{row.attempt}</span>
                            {row.attempt === 1 && (
                              <span className="ml-2 text-muted-foreground text-xs">
                                {copy.initial}
                              </span>
                            )}
                          </TableCell>
                          <TableCell size="compact" variant="mono">
                            {row.minimumDelay === row.maximumDelay
                              ? duration(row.maximumDelay)
                              : `${duration(row.minimumDelay)} – ${duration(row.maximumDelay)}`}
                          </TableCell>
                          <TableCell size="compact" variant="mono">
                            {duration(row.expectedStart)}
                          </TableCell>
                          <TableCell size="compact" variant="mono">
                            {duration(row.maximumFinish)}
                          </TableCell>
                          <TableCell size="compact">
                            {policy.budget === null ? (
                              <span className="text-muted-foreground">—</span>
                            ) : (
                              <Badge
                                variant={row.fits ? "secondary" : "outline"}
                              >
                                {row.fits ? copy.within : copy.over}
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </>
              ) : (
                <Alert variant="destructive">
                  <AlertTitle>{copy.invalid}</AlertTitle>
                  <AlertDescription>{copy.invalidDescription}</AlertDescription>
                </Alert>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </DeveloperToolLayout>
  );
}
