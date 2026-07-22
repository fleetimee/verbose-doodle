import { ArrowLeftRight, Copy } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DeveloperToolTourButton,
  type DeveloperToolTourStep,
} from "@/features/developer-tools/components/developer-tool-tour-button";
import { DocumentEditor } from "@/features/developer-tools/components/document-editor";
import {
  ConversionError,
  convertDocument,
} from "@/features/developer-tools/tools/json-yaml-converter/conversion";
import { EXAMPLE_JSON } from "@/features/developer-tools/tools/json-yaml-converter/example";
import type { DocumentFormat } from "@/features/developer-tools/types";
import { copyToClipboard } from "@/lib/clipboard";
import { formatMessage, messages } from "@/lib/i18n";

const parentVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

const childVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, duration: 0.32, bounce: 0.08 },
  },
};

const JSON_YAML_TOUR_ID = "json-yaml-converter-intro";
const JSON_YAML_TOUR_TARGETS = {
  controls: "json-yaml-converter-tour-controls",
  editors: "json-yaml-converter-tour-editors",
  output: "json-yaml-converter-tour-output",
} as const;
const JSON_YAML_TOUR_STEPS: readonly DeveloperToolTourStep[] = [
  {
    selectorId: JSON_YAML_TOUR_TARGETS.controls,
    position: "bottom",
    title: messages.jsonYamlConverter.tour.controlsTitle,
    description: messages.jsonYamlConverter.tour.controlsDescription,
  },
  {
    selectorId: JSON_YAML_TOUR_TARGETS.editors,
    position: "top",
    title: messages.jsonYamlConverter.tour.editorsTitle,
    description: messages.jsonYamlConverter.tour.editorsDescription,
  },
  {
    selectorId: JSON_YAML_TOUR_TARGETS.output,
    position: "top",
    title: messages.jsonYamlConverter.tour.outputTitle,
    description: messages.jsonYamlConverter.tour.outputDescription,
  },
];

function oppositeFormat(format: DocumentFormat): DocumentFormat {
  return format === "json" ? "yaml" : "json";
}

function formatLabel(format: DocumentFormat) {
  return format === "json"
    ? messages.jsonYamlConverter.jsonFormat
    : messages.jsonYamlConverter.yamlFormat;
}

export function JsonYamlConverter() {
  const shouldReduceMotion = useReducedMotion();
  const [sourceFormat, setSourceFormat] = useState<DocumentFormat>("json");
  const [source, setSource] = useState(EXAMPLE_JSON);
  const [output, setOutput] = useState("");
  const [error, setError] = useState<ConversionError | null>(null);
  const [canSwap, setCanSwap] = useState(false);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">(
    "idle"
  );
  const outputFormat = oppositeFormat(sourceFormat);

  const resetResult = () => {
    setOutput("");
    setError(null);
    setCanSwap(false);
    setCopyState("idle");
  };

  const convert = useCallback(() => {
    try {
      const result = convertDocument(source, sourceFormat);
      setOutput(result.output);
      setError(null);
      setCanSwap(true);
      setCopyState("idle");
    } catch (conversionError) {
      setError(
        conversionError instanceof ConversionError
          ? conversionError
          : new ConversionError(messages.jsonYamlConverter.errorTitle)
      );
      setCanSwap(false);
      setCopyState("idle");
    }
  }, [source, sourceFormat]);

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
        event.preventDefault();
        convert();
      }
    };
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, [convert]);

  const changeFormat = (value: string) => {
    setSourceFormat(value as DocumentFormat);
    resetResult();
  };

  const swap = () => {
    if (!canSwap) {
      return;
    }
    setSource(output);
    setSourceFormat(outputFormat);
    resetResult();
  };

  const copyOutput = async () => {
    try {
      const copied = await copyToClipboard(output);
      setCopyState(copied ? "copied" : "error");
    } catch {
      setCopyState("error");
    }
  };

  const clear = () => {
    setSource("");
    resetResult();
  };

  const resetExample = () => {
    setSourceFormat("json");
    setSource(EXAMPLE_JSON);
    resetResult();
  };

  const sourceFormatLabel = formatLabel(sourceFormat);
  const outputFormatLabel = formatLabel(outputFormat);

  return (
    <motion.div
      animate="visible"
      className="mx-auto grid w-full max-w-[1400px] grid-cols-1 gap-8 pb-10 md:grid-cols-[210px_minmax(0,1fr)] md:gap-10 xl:grid-cols-[240px_minmax(0,1fr)] xl:gap-14"
      initial={shouldReduceMotion ? "visible" : "hidden"}
      variants={parentVariants}
    >
      <motion.aside
        className="md:sticky md:top-6 md:self-start"
        variants={childVariants}
      >
        <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.24em]">
          {messages.jsonYamlConverter.eyebrow}
        </p>
        <h1 className="mt-4 max-w-52 font-semibold text-3xl leading-[0.96] tracking-[-0.045em]">
          {messages.jsonYamlConverter.title}
        </h1>
        <p className="mt-5 text-muted-foreground text-sm leading-6">
          {messages.jsonYamlConverter.description}
        </p>

        <dl className="mt-8 border-y text-xs">
          <div className="grid grid-cols-[72px_1fr] gap-3 border-b py-3">
            <dt className="text-muted-foreground">
              {messages.jsonYamlConverter.formatsLabel}
            </dt>
            <dd>{messages.jsonYamlConverter.formatsValue}</dd>
          </div>
          <div className="grid grid-cols-[72px_1fr] gap-3 border-b py-3">
            <dt className="text-muted-foreground">
              {messages.jsonYamlConverter.limitLabel}
            </dt>
            <dd className="font-mono">
              {messages.jsonYamlConverter.limitValue}
            </dd>
          </div>
          <div className="grid grid-cols-[72px_1fr] gap-3 py-3">
            <dt className="text-muted-foreground">
              {messages.jsonYamlConverter.storageLabel}
            </dt>
            <dd className="flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400" />
              {messages.jsonYamlConverter.storageValue}
            </dd>
          </div>
        </dl>

        <div className="mt-6 flex flex-wrap gap-x-4 gap-y-2 md:flex-col md:items-start">
          <DeveloperToolTourButton
            label={messages.jsonYamlConverter.tour.startButton}
            steps={JSON_YAML_TOUR_STEPS}
            storageKey="json-yaml-converter-tour-seen"
            tourId={JSON_YAML_TOUR_ID}
          />
          <button
            className="text-muted-foreground text-xs underline decoration-border underline-offset-4 transition-colors hover:text-foreground active:translate-y-px"
            onClick={resetExample}
            type="button"
          >
            {messages.jsonYamlConverter.resetExample}
          </button>
          <button
            className="text-muted-foreground text-xs underline decoration-border underline-offset-4 transition-colors hover:text-foreground active:translate-y-px"
            onClick={clear}
            type="button"
          >
            {messages.jsonYamlConverter.clear}
          </button>
        </div>
      </motion.aside>

      <main className="min-w-0">
        <motion.section
          className="grid border-y lg:grid-cols-[minmax(0,1fr)_auto]"
          id={JSON_YAML_TOUR_TARGETS.controls}
          variants={childVariants}
        >
          <div className="grid gap-4 py-4 sm:grid-cols-[minmax(0,220px)_1fr] sm:items-end sm:gap-6 lg:pr-6">
            <div className="space-y-2">
              <Label className="text-xs" htmlFor="source-format">
                {messages.jsonYamlConverter.sourceFormatLabel}
              </Label>
              <Select onValueChange={changeFormat} value={sourceFormat}>
                <SelectTrigger
                  className="w-full rounded-md bg-background shadow-none"
                  id="source-format"
                >
                  <SelectValue>{sourceFormatLabel}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="json">
                    {messages.jsonYamlConverter.jsonFormat}
                  </SelectItem>
                  <SelectItem value="yaml">
                    {messages.jsonYamlConverter.yamlFormat}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <p className="pb-2 text-[11px] text-muted-foreground leading-5">
              {messages.jsonYamlConverter.preservationNote}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t py-4 lg:border-t-0 lg:border-l lg:pl-6">
            <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
              {messages.jsonYamlConverter.shortcutLabel}
            </span>
            <div className="flex items-center gap-2">
              <Button
                aria-label={messages.jsonYamlConverter.swap}
                className="rounded-md active:translate-y-px"
                disabled={!canSwap}
                onClick={swap}
                size="icon"
                type="button"
                variant="outline"
              >
                <ArrowLeftRight />
              </Button>
              <Button
                className="min-w-28 rounded-md active:translate-y-px"
                onClick={convert}
                type="button"
              >
                {messages.jsonYamlConverter.convert}
              </Button>
            </div>
          </div>
        </motion.section>

        <motion.div
          className="mt-8 grid min-w-0 grid-cols-1 border-x border-b lg:grid-cols-2 lg:divide-x"
          id={JSON_YAML_TOUR_TARGETS.editors}
          variants={childVariants}
        >
          <DocumentEditor
            byteCountMessage={messages.jsonYamlConverter.editorByteCount}
            description={formatMessage(
              messages.jsonYamlConverter.sourceDescription,
              { format: sourceFormatLabel }
            )}
            format={sourceFormat}
            index="01"
            label={formatMessage(messages.jsonYamlConverter.sourceLabel, {
              format: sourceFormatLabel,
            })}
            lineCountMessage={messages.jsonYamlConverter.editorLineCount}
            onChange={setSource}
            value={source}
          />
          <DocumentEditor
            byteCountMessage={messages.jsonYamlConverter.editorByteCount}
            description={formatMessage(
              messages.jsonYamlConverter.outputDescription,
              { format: outputFormatLabel }
            )}
            format={outputFormat}
            index="02"
            label={formatMessage(messages.jsonYamlConverter.outputLabel, {
              format: outputFormatLabel,
            })}
            lineCountMessage={messages.jsonYamlConverter.editorLineCount}
            readOnly
            value={output}
          />
        </motion.div>

        <motion.section
          className="mt-5 flex min-h-10 flex-wrap items-center justify-between gap-3 border-y py-3"
          id={JSON_YAML_TOUR_TARGETS.output}
          variants={childVariants}
        >
          <p className="text-[11px] text-muted-foreground">
            {messages.jsonYamlConverter.preservationNote}
          </p>
          <Button
            disabled={output.length === 0}
            onClick={copyOutput}
            size="sm"
            type="button"
            variant="outline"
          >
            <Copy />
            {copyState === "copied"
              ? messages.jsonYamlConverter.copied
              : messages.jsonYamlConverter.copyOutput}
          </Button>
        </motion.section>

        <AnimatePresence>
          {error || copyState === "error" ? (
            <motion.section
              animate={{ opacity: 1, y: 0 }}
              aria-live="polite"
              className="mt-6 grid gap-2 border-destructive/30 border-y py-5 sm:grid-cols-[180px_1fr]"
              exit={{ opacity: 0, y: -6 }}
              initial={{ opacity: 0, y: 6 }}
              role="alert"
              transition={{ type: "spring", duration: 0.32, bounce: 0.08 }}
            >
              <h2 className="font-semibold text-destructive text-sm">
                {messages.jsonYamlConverter.errorTitle}
              </h2>
              <div className="text-muted-foreground text-sm">
                <p>
                  {copyState === "error"
                    ? messages.jsonYamlConverter.copyError
                    : error?.message}
                </p>
                {error?.line && error.column ? (
                  <p className="mt-1 font-mono text-[11px]">
                    {formatMessage(messages.jsonYamlConverter.errorLocation, {
                      line: error.line,
                      column: error.column,
                    })}
                  </p>
                ) : null}
              </div>
            </motion.section>
          ) : null}
        </AnimatePresence>
      </main>
    </motion.div>
  );
}
