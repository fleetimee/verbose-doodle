import {
  ArrowDataTransferHorizontalIcon,
  Copy01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useI18n } from "@/components/i18n-provider";
import { Button } from "@/components/ui/button";
import { ButtonGroup, ButtonGroupText } from "@/components/ui/button-group";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  developerToolChildVariants as childVariants,
  DeveloperToolLayout,
} from "@/features/developer-tools/components/developer-tool-layout";
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

const JSON_YAML_TOUR_ID = "json-yaml-converter-intro";
const JSON_YAML_TOUR_TARGETS = {
  controls: "json-yaml-converter-tour-controls",
  editors: "json-yaml-converter-tour-editors",
  output: "json-yaml-converter-tour-output",
} as const;
const getJsonYamlTourSteps = (): readonly DeveloperToolTourStep[] => [
  {
    description: messages.jsonYamlConverter.tour.controlsDescription,
    position: "bottom",
    selectorId: JSON_YAML_TOUR_TARGETS.controls,
    title: messages.jsonYamlConverter.tour.controlsTitle,
  },
  {
    description: messages.jsonYamlConverter.tour.editorsDescription,
    position: "top",
    selectorId: JSON_YAML_TOUR_TARGETS.editors,
    title: messages.jsonYamlConverter.tour.editorsTitle,
  },
  {
    description: messages.jsonYamlConverter.tour.outputDescription,
    position: "top",
    selectorId: JSON_YAML_TOUR_TARGETS.output,
    title: messages.jsonYamlConverter.tour.outputTitle,
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
  const { locale } = useI18n();
  const tourSteps = useMemo(() => getJsonYamlTourSteps(), [locale]);
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
          : new ConversionError(
              messages.jsonYamlConverter.conversionFailedDescription
            )
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
    // SAFETY: Select component options match DocumentFormat values
    setSourceFormat(value as DocumentFormat);
    resetResult();
  };

  const swapFormats = () => {
    if (!(canSwap && output)) {
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
    <DeveloperToolLayout
      className="min-h-0 flex-1 gap-4 pb-4 [&>header]:border-b-0 [&>header]:pb-2"
      clearLabel={messages.jsonYamlConverter.clear}
      description={messages.jsonYamlConverter.description}
      mainClassName="flex min-h-0 flex-1 flex-col"
      onClear={clear}
      onReset={resetExample}
      resetLabel={messages.jsonYamlConverter.resetExample}
      title={messages.jsonYamlConverter.title}
      tour={
        <DeveloperToolTourButton
          label={messages.jsonYamlConverter.tour.startButton}
          steps={tourSteps}
          storageKey="json-yaml-converter-tour-seen"
          tourId={JSON_YAML_TOUR_ID}
        />
      }
    >
      <motion.section
        className="grid rounded-lg bg-muted/15 px-4 md:grid-cols-[minmax(0,1fr)_auto] md:px-5"
        id={JSON_YAML_TOUR_TARGETS.controls}
        variants={childVariants}
      >
        <div className="flex flex-wrap items-center gap-6 py-3.5 md:pr-6">
          <div className="flex items-center gap-2.5">
            <Label className="shrink-0" htmlFor="source-format" size="sm">
              {messages.jsonYamlConverter.sourceFormatLabel}
            </Label>
            <Select onValueChange={changeFormat} value={sourceFormat}>
              <SelectTrigger
                className="w-32"
                id="source-format"
                size="sm"
                variant="surface"
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
          <p className="text-muted-foreground text-xs leading-5">
            {messages.jsonYamlConverter.preservationNote}
          </p>
        </div>

        <div className="flex items-center justify-between gap-4 pb-3 md:py-3 md:pl-6">
          <ButtonGroup>
            <ButtonGroupText className="h-8" size="sm">
              {messages.jsonYamlConverter.shortcutLabel}
            </ButtonGroupText>
            <Button
              aria-label={messages.jsonYamlConverter.swap}
              className="active:translate-y-px"
              disabled={!canSwap}
              onClick={swapFormats}
              size="icon-sm"
              type="button"
              variant="outline-muted"
            >
              <HugeiconsIcon
                className="size-3.5"
                icon={ArrowDataTransferHorizontalIcon}
                strokeWidth={2}
              />
            </Button>
            <Button
              className="min-w-28 active:translate-y-px"
              onClick={convert}
              size="sm"
              type="button"
            >
              {messages.jsonYamlConverter.convert}
            </Button>
          </ButtonGroup>
        </div>
      </motion.section>

      <motion.div
        className="mt-4 grid min-h-[420px] min-w-0 flex-1 grid-cols-1 overflow-hidden rounded-xl border border-border/70 lg:min-h-0 lg:grid-cols-2"
        id={JSON_YAML_TOUR_TARGETS.editors}
        variants={childVariants}
      >
        <DocumentEditor
          byteCountMessage={messages.jsonYamlConverter.editorByteCount}
          className="border-t-0"
          description={formatMessage(
            messages.jsonYamlConverter.sourceDescription,
            { format: sourceFormatLabel }
          )}
          format={sourceFormat}
          height="100%"
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
          className="border-border/60 lg:border-t-0 lg:border-l"
          description={formatMessage(
            messages.jsonYamlConverter.outputDescription,
            { format: outputFormatLabel }
          )}
          format={outputFormat}
          headerActions={
            <div id={JSON_YAML_TOUR_TARGETS.output}>
              <Button
                disabled={output.length === 0}
                onClick={copyOutput}
                size="sm"
                type="button"
                variant="outline-muted"
              >
                <HugeiconsIcon icon={Copy01Icon} strokeWidth={2} />
                {copyState === "copied"
                  ? messages.jsonYamlConverter.copied
                  : messages.jsonYamlConverter.copyOutput}
              </Button>
            </div>
          }
          height="100%"
          index="02"
          label={formatMessage(messages.jsonYamlConverter.outputLabel, {
            format: outputFormatLabel,
          })}
          lineCountMessage={messages.jsonYamlConverter.editorLineCount}
          readOnly
          value={output}
        />
      </motion.div>

      <AnimatePresence>
        {error || copyState === "error" ? (
          <motion.section
            animate={{ opacity: 1, y: 0 }}
            aria-live="polite"
            className="mt-4 grid gap-2 border-destructive/30 border-y py-4 sm:grid-cols-[180px_1fr]"
            exit={{ opacity: 0, y: -6 }}
            initial={{ opacity: 0, y: 6 }}
            role="alert"
            transition={{ bounce: 0.08, duration: 0.32, type: "spring" }}
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
                <p className="mt-1 font-mono text-xs">
                  {formatMessage(messages.jsonYamlConverter.errorLocation, {
                    column: error.column,
                    line: error.line,
                  })}
                </p>
              ) : null}
            </div>
          </motion.section>
        ) : null}
      </AnimatePresence>
    </DeveloperToolLayout>
  );
}
