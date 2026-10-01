import { useMemo, useState } from "react";
import { Label, Pie, PieChart } from "recharts";
import { Check, ClipboardCopy } from "@/components/hugeicons";
import { useI18n } from "@/components/i18n-provider";
import { Button } from "@/components/ui/button";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DeveloperToolLayout } from "@/features/developer-tools/components/developer-tool-layout";
import {
  calculateQrisMdr,
  DEFAULT_MDR_INPUT,
  formatRupiah,
  MDR_PRESETS,
  type QrisMdrInput,
} from "@/features/developer-tools/tools/qris-mdr-calculator/mdr-calculator";
import { copyToClipboard } from "@/lib/clipboard";
import { formatMessage, messages } from "@/lib/i18n";

const EMPTY_INPUT: QrisMdrInput = {
  transactionAmount: "",
  mdrRate: "",
  switchShare: "24",
  issuerShare: "31",
  acquirerShare: "45",
};

export function QrisMdrCalculator() {
  useI18n();
  const copy = messages.developerTools.qrisMdr;
  const [input, setInput] = useState<QrisMdrInput>({ ...DEFAULT_MDR_INPUT });
  const [useRounding, setUseRounding] = useState(true);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => calculateQrisMdr(input), [input]);

  const chartConfig = useMemo(
    () =>
      ({
        share: {
          label: "Share (%)",
        },
        switch: {
          color: "var(--chart-1)",
          label: copy.switchFee,
        },
        issuer: {
          color: "var(--chart-2)",
          label: copy.issuerFee,
        },
        acquirer: {
          color: "var(--chart-3)",
          label: copy.acquirerFee,
        },
      }) satisfies ChartConfig,
    [copy.switchFee, copy.issuerFee, copy.acquirerFee]
  );

  const chartData = useMemo(
    () => [
      {
        amount: result.switchAmount,
        entity: "switch",
        fill: "var(--color-switch)",
        name: copy.switchFee,
        share: result.switchSharePercent,
      },
      {
        amount: result.issuerAmount,
        entity: "issuer",
        fill: "var(--color-issuer)",
        name: copy.issuerFee,
        share: result.issuerSharePercent,
      },
      {
        amount: result.acquirerAmount,
        entity: "acquirer",
        fill: "var(--color-acquirer)",
        name: copy.acquirerFee,
        share: result.acquirerSharePercent,
      },
    ],
    [
      result.switchAmount,
      result.switchSharePercent,
      result.issuerAmount,
      result.issuerSharePercent,
      result.acquirerAmount,
      result.acquirerSharePercent,
      copy.switchFee,
      copy.issuerFee,
      copy.acquirerFee,
    ]
  );

  function handleFieldChange(key: keyof QrisMdrInput, value: string) {
    setInput((prev) => ({ ...prev, [key]: value }));
    setCopied(false);
  }

  function applyPreset(rate: string) {
    setInput((prev) => ({ ...prev, mdrRate: rate }));
    setCopied(false);
  }

  async function handleCopy() {
    const summaryText = [
      "QRIS MDR Calculation Summary",
      "---------------------------------",
      `Nilai Transaksi : ${formatRupiah(result.transactionAmount, useRounding)}`,
      `MDR Rate        : ${result.mdrRate}% (${formatRupiah(result.totalMdr, useRounding)})`,
      `Nilai Bersih    : ${formatRupiah(result.netMerchantAmount, useRounding)}`,
      "",
      `Distribusi Bagi Hasil (${result.totalSharePercent}%):`,
      `- Switch (${result.switchSharePercent}%)   : ${formatRupiah(result.switchAmount, useRounding)}`,
      `- Issuer (${result.issuerSharePercent}%)   : ${formatRupiah(result.issuerAmount, useRounding)}`,
      `- Acquirer (${result.acquirerSharePercent}%) : ${formatRupiah(result.acquirerAmount, useRounding)}`,
    ].join("\n");

    const success = await copyToClipboard(summaryText);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <DeveloperToolLayout
      className="min-h-0 flex-1 gap-4 pb-4 [&>header]:border-b-0 [&>header]:pb-2"
      clearLabel={copy.clear}
      description={copy.description}
      extraActions={
        <Button
          onClick={() => {
            setInput({ ...DEFAULT_MDR_INPUT });
            setCopied(false);
          }}
          size="sm"
          variant="tool-action"
        >
          {copy.sample}
        </Button>
      }
      mainClassName="flex min-h-0 flex-1 flex-col"
      onClear={() => {
        setInput({ ...EMPTY_INPUT });
        setCopied(false);
      }}
      title={copy.title}
    >
      <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        {/* Left Column: Input Form */}
        <section
          aria-label={copy.title}
          className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-xl border border-border/70 bg-card"
        >
          <ScrollArea
            className="min-h-0 flex-1"
            contentClassName="space-y-4 p-4"
            variant="fit"
          >
            <FieldGroup className="space-y-4">
              {/* Transaction Amount */}
              <Field size="sm">
                <FieldLabel htmlFor="mdr-amount">
                  {copy.transactionAmount}
                </FieldLabel>
                <div className="relative">
                  <Input
                    className="font-mono font-semibold text-base"
                    id="mdr-amount"
                    inputMode="numeric"
                    onChange={(e) =>
                      handleFieldChange("transactionAmount", e.target.value)
                    }
                    placeholder={copy.transactionAmountPlaceholder}
                    size="sm"
                    value={input.transactionAmount}
                  />
                </div>
                {result.transactionAmount > 0 && (
                  <p className="font-mono text-muted-foreground text-xs">
                    {formatRupiah(result.transactionAmount, useRounding)}
                  </p>
                )}
              </Field>

              {/* MDR Rate */}
              <Field size="sm">
                <div className="flex items-center justify-between">
                  <FieldLabel htmlFor="mdr-rate">{copy.mdrRate}</FieldLabel>
                </div>
                <Input
                  className="font-mono"
                  id="mdr-rate"
                  inputMode="decimal"
                  onChange={(e) => handleFieldChange("mdrRate", e.target.value)}
                  placeholder={copy.mdrRatePlaceholder}
                  size="sm"
                  value={input.mdrRate}
                />
                <div className="space-y-1.5 pt-1">
                  <span className="text-muted-foreground text-xs">
                    {copy.presets}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {MDR_PRESETS.map((preset) => {
                      const isActive = input.mdrRate === preset.rate;
                      return (
                        <Button
                          aria-pressed={isActive}
                          className="h-7 text-xs"
                          key={preset.id}
                          onClick={() => applyPreset(preset.rate)}
                          size="xs"
                          title={preset.description}
                          variant={isActive ? "default" : "outline"}
                        >
                          {preset.label}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              </Field>

              {/* Revenue Sharing Split */}
              <div className="rounded-lg border bg-muted/20 p-3">
                <div className="mb-2.5 flex items-center justify-between">
                  <span className="font-semibold text-xs">
                    {copy.sharingDistribution}
                  </span>
                  <span
                    className={
                      result.isShareValid
                        ? "font-medium text-primary text-xs"
                        : "font-medium text-destructive text-xs"
                    }
                  >
                    {result.isShareValid
                      ? copy.shareTotalValid
                      : formatMessage(copy.shareTotalWarning, {
                          total: result.totalSharePercent,
                        })}
                  </span>
                </div>
                <p className="mb-3 text-muted-foreground text-xs leading-relaxed">
                  {copy.sharingHelp}
                </p>
                <div className="grid grid-cols-3 gap-2.5">
                  <Field size="sm">
                    <FieldLabel htmlFor="mdr-switch">
                      {copy.switchShare}
                    </FieldLabel>
                    <Input
                      className="font-mono text-xs"
                      id="mdr-switch"
                      inputMode="decimal"
                      onChange={(e) =>
                        handleFieldChange("switchShare", e.target.value)
                      }
                      size="sm"
                      value={input.switchShare}
                    />
                  </Field>
                  <Field size="sm">
                    <FieldLabel htmlFor="mdr-issuer">
                      {copy.issuerShare}
                    </FieldLabel>
                    <Input
                      className="font-mono text-xs"
                      id="mdr-issuer"
                      inputMode="decimal"
                      onChange={(e) =>
                        handleFieldChange("issuerShare", e.target.value)
                      }
                      size="sm"
                      value={input.issuerShare}
                    />
                  </Field>
                  <Field size="sm">
                    <FieldLabel htmlFor="mdr-acquirer">
                      {copy.acquirerShare}
                    </FieldLabel>
                    <Input
                      className="font-mono text-xs"
                      id="mdr-acquirer"
                      inputMode="decimal"
                      onChange={(e) =>
                        handleFieldChange("acquirerShare", e.target.value)
                      }
                      size="sm"
                      value={input.acquirerShare}
                    />
                  </Field>
                </div>
              </div>
            </FieldGroup>

            {/* How It Works Explainer */}
            <details className="border-t pt-3 text-sm">
              <summary className="cursor-pointer rounded-sm font-medium focus-visible:outline-2 focus-visible:outline-ring">
                {copy.how}
              </summary>
              <p className="mt-2 text-muted-foreground text-xs leading-relaxed">
                {copy.explanation}
              </p>
            </details>
          </ScrollArea>
        </section>

        {/* Right Column: Calculation Results & Breakdown */}
        <section
          aria-label={copy.sharingDistribution}
          className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-xl border border-border/70 bg-card"
        >
          <div className="flex shrink-0 items-center justify-between border-b px-4 py-3">
            <h2 className="font-semibold text-sm">
              {copy.sharingDistribution}
            </h2>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setUseRounding((r) => !r)}
                size="xs"
                variant="outline"
              >
                {useRounding ? copy.roundedValues : copy.exactValues}
              </Button>
              <Button
                disabled={result.transactionAmount <= 0}
                onClick={handleCopy}
                size="xs"
                variant="tool-action"
              >
                {copied ? (
                  <Check className="size-3.5 text-primary" />
                ) : (
                  <ClipboardCopy className="size-3.5" />
                )}
                {copied ? copy.copied : copy.copySummary}
              </Button>
            </div>
          </div>

          <ScrollArea
            className="min-h-0 flex-1"
            contentClassName="space-y-4 p-4"
            variant="fit"
          >
            {/* Top Stat Cards */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {/* Net Settlement */}
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                <span className="text-muted-foreground text-xs">
                  {copy.netAmount}
                </span>
                <p className="mt-1 font-bold font-mono text-foreground text-xl sm:text-2xl">
                  {formatRupiah(result.netMerchantAmount, useRounding)}
                </p>
                <p className="mt-1 text-muted-foreground text-xs">
                  {result.transactionAmount > 0
                    ? `${((result.netMerchantAmount / result.transactionAmount) * 100).toFixed(2)}% of transaction`
                    : "—"}
                </p>
              </div>

              {/* Total MDR */}
              <div className="rounded-xl border border-border/80 bg-muted/30 p-4">
                <span className="text-muted-foreground text-xs">
                  {copy.totalMdr} ({result.mdrRate}%)
                </span>
                <p className="mt-1 font-bold font-mono text-foreground text-xl sm:text-2xl">
                  {formatRupiah(result.totalMdr, useRounding)}
                </p>
                <p className="mt-1 text-muted-foreground text-xs">
                  Deducted by payment network
                </p>
              </div>
            </div>

            {/* Pie Chart Revenue Sharing Proportion */}
            {result.totalMdr > 0 && result.isShareValid && (
              <div className="flex flex-col items-center justify-around gap-4 rounded-xl border border-border/80 bg-muted/20 p-4 sm:flex-row">
                <ChartContainer
                  className="mx-auto aspect-square h-[170px] w-full max-w-[170px]"
                  config={chartConfig}
                >
                  <PieChart>
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          formatter={(_value, _name, item) => (
                            <div className="flex w-full items-center justify-between gap-3 font-medium text-xs">
                              <span className="text-muted-foreground">
                                {item.payload.name}
                              </span>
                              <span className="font-bold font-mono text-foreground">
                                {formatRupiah(item.payload.amount, useRounding)}{" "}
                                ({item.payload.share}%)
                              </span>
                            </div>
                          )}
                          hideLabel
                        />
                      }
                    />
                    <Pie
                      data={chartData}
                      dataKey="share"
                      innerRadius={46}
                      nameKey="name"
                      outerRadius={68}
                      stroke="var(--background)"
                      strokeWidth={2}
                    >
                      <Label
                        content={({ viewBox }) => {
                          if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                            return (
                              <text
                                dominantBaseline="middle"
                                textAnchor="middle"
                                x={viewBox.cx}
                                y={viewBox.cy}
                              >
                                <tspan
                                  className="fill-foreground font-bold font-mono text-base"
                                  x={viewBox.cx}
                                  y={viewBox.cy}
                                >
                                  {result.mdrRate}%
                                </tspan>
                                <tspan
                                  className="fill-muted-foreground text-[10px]"
                                  x={viewBox.cx}
                                  y={(viewBox.cy ?? 0) + 14}
                                >
                                  MDR
                                </tspan>
                              </text>
                            );
                          }
                          return null;
                        }}
                      />
                    </Pie>
                  </PieChart>
                </ChartContainer>

                {/* Legend badges */}
                <div className="flex w-full flex-col justify-center gap-2.5 sm:w-auto sm:min-w-[180px]">
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="size-2.5 shrink-0 rounded-full bg-[var(--chart-1)]" />
                      <span className="text-muted-foreground">
                        {copy.switchFee}
                      </span>
                    </div>
                    <span className="font-bold font-mono">
                      {result.switchSharePercent}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="size-2.5 shrink-0 rounded-full bg-[var(--chart-2)]" />
                      <span className="text-muted-foreground">
                        {copy.issuerFee}
                      </span>
                    </div>
                    <span className="font-bold font-mono">
                      {result.issuerSharePercent}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="size-2.5 shrink-0 rounded-full bg-[var(--chart-3)]" />
                      <span className="text-muted-foreground">
                        {copy.acquirerFee}
                      </span>
                    </div>
                    <span className="font-bold font-mono">
                      {result.acquirerSharePercent}%
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Detailed Distribution Breakdown Table */}
            <div className="overflow-hidden rounded-lg border">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/30 text-muted-foreground">
                  <tr>
                    <th className="px-3.5 py-2.5 font-medium">Entity</th>
                    <th className="px-3.5 py-2.5 text-right font-medium">
                      Share (%)
                    </th>
                    <th className="px-3.5 py-2.5 text-right font-medium">
                      Amount (IDR)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr>
                    <td className="flex items-center gap-2 px-3.5 py-2.5 font-medium">
                      <span className="size-2 rounded-full bg-[var(--chart-1)]" />
                      {copy.switchFee}
                    </td>
                    <td className="px-3.5 py-2.5 text-right font-mono">
                      {result.switchSharePercent}%
                    </td>
                    <td className="px-3.5 py-2.5 text-right font-bold font-mono">
                      {formatRupiah(result.switchAmount, useRounding)}
                    </td>
                  </tr>
                  <tr>
                    <td className="flex items-center gap-2 px-3.5 py-2.5 font-medium">
                      <span className="size-2 rounded-full bg-[var(--chart-2)]" />
                      {copy.issuerFee}
                    </td>
                    <td className="px-3.5 py-2.5 text-right font-mono">
                      {result.issuerSharePercent}%
                    </td>
                    <td className="px-3.5 py-2.5 text-right font-bold font-mono">
                      {formatRupiah(result.issuerAmount, useRounding)}
                    </td>
                  </tr>
                  <tr>
                    <td className="flex items-center gap-2 px-3.5 py-2.5 font-medium">
                      <span className="size-2 rounded-full bg-[var(--chart-3)]" />
                      {copy.acquirerFee}
                    </td>
                    <td className="px-3.5 py-2.5 text-right font-mono">
                      {result.acquirerSharePercent}%
                    </td>
                    <td className="px-3.5 py-2.5 text-right font-bold font-mono">
                      {formatRupiah(result.acquirerAmount, useRounding)}
                    </td>
                  </tr>
                </tbody>
                <tfoot className="border-t bg-muted/20 font-semibold">
                  <tr>
                    <td className="px-3.5 py-2.5">Total MDR</td>
                    <td
                      className={`px-3.5 py-2.5 text-right font-mono ${
                        result.isShareValid
                          ? "text-foreground"
                          : "text-destructive"
                      }`}
                    >
                      {result.totalSharePercent}%
                    </td>
                    <td className="px-3.5 py-2.5 text-right font-mono">
                      {formatRupiah(result.totalMdr, useRounding)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <p className="text-muted-foreground text-xs leading-relaxed">
              {copy.roundedNotice}
            </p>
          </ScrollArea>
        </section>
      </div>
    </DeveloperToolLayout>
  );
}
