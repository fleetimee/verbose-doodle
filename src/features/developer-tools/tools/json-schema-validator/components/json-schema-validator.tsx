import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useI18n } from "@/components/i18n-provider";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  developerToolChildVariants as childVariants,
  DeveloperToolLayout,
} from "@/features/developer-tools/components/developer-tool-layout";
import {
  DeveloperToolTourButton,
  type DeveloperToolTourStep,
} from "@/features/developer-tools/components/developer-tool-tour-button";
import { DocumentEditor } from "@/features/developer-tools/components/document-editor";
import { ValidationResult } from "@/features/developer-tools/tools/json-schema-validator/components/validation-result";
import {
  EXAMPLE_INSTANCE,
  EXAMPLE_SCHEMA,
} from "@/features/developer-tools/tools/json-schema-validator/example";
import { useValidateJsonSchema } from "@/features/developer-tools/tools/json-schema-validator/hooks/use-validate-json-schema";
import type {
  JsonSchemaDialect,
  JsonSchemaValidationResult,
} from "@/features/developer-tools/tools/json-schema-validator/types";
import type { ApiError } from "@/lib/api";
import { messages } from "@/lib/i18n";

const dialectLabels: Record<JsonSchemaDialect, string> = {
  get AUTO() {
    return messages.jsonSchemaValidator.dialectAuto;
  },
  get DRAFT_7() {
    return messages.jsonSchemaValidator.dialectDraft7;
  },
  get DRAFT_2019_09() {
    return messages.jsonSchemaValidator.dialectDraft201909;
  },
  get DRAFT_2020_12() {
    return messages.jsonSchemaValidator.dialectDraft202012;
  },
};

const JSON_SCHEMA_TOUR_ID = "json-schema-validator-intro";
const JSON_SCHEMA_TOUR_TARGETS = {
  controls: "json-schema-validator-tour-controls",
  editors: "json-schema-validator-tour-editors",
} as const;
const getJsonSchemaTourSteps = (): readonly DeveloperToolTourStep[] => [
  {
    description: messages.jsonSchemaValidator.tour.controlsDescription,
    position: "bottom",
    selectorId: JSON_SCHEMA_TOUR_TARGETS.controls,
    title: messages.jsonSchemaValidator.tour.controlsTitle,
  },
  {
    description: messages.jsonSchemaValidator.tour.editorsDescription,
    position: "top",
    selectorId: JSON_SCHEMA_TOUR_TARGETS.editors,
    title: messages.jsonSchemaValidator.tour.editorsTitle,
  },
];

function serviceError(error: ApiError | null) {
  if (!error) {
    return null;
  }
  if (error.status === 413) {
    return {
      description: messages.jsonSchemaValidator.inputTooLargeDescription,
      title: messages.jsonSchemaValidator.inputTooLargeTitle,
    };
  }
  return {
    description:
      error.status === 503
        ? messages.jsonSchemaValidator.serviceBusyDescription
        : messages.jsonSchemaValidator.serviceFailureDescription,
    title: messages.jsonSchemaValidator.serviceUnavailableTitle,
  };
}

export function JsonSchemaValidator() {
  const { locale } = useI18n();
  const tourSteps = useMemo(() => getJsonSchemaTourSteps(), [locale]);
  const [schema, setSchema] = useState(EXAMPLE_SCHEMA);
  const [instance, setInstance] = useState(EXAMPLE_INSTANCE);
  const [dialect, setDialect] = useState<JsonSchemaDialect>("AUTO");
  const [formatAssertions, setFormatAssertions] = useState(true);
  const [lastResult, setLastResult] =
    useState<JsonSchemaValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const mutation = useValidateJsonSchema();

  const validate = useCallback(() => {
    if (isValidating) {
      return;
    }
    setIsValidating(true);
    mutation.mutate(
      { dialect, formatAssertions, instance, schema },
      {
        onSettled: () => setIsValidating(false),
        onSuccess: setLastResult,
      }
    );
  }, [dialect, formatAssertions, instance, isValidating, mutation, schema]);

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
        event.preventDefault();
        validate();
      }
    };
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, [validate]);

  const resetExample = () => {
    setSchema(EXAMPLE_SCHEMA);
    setInstance(EXAMPLE_INSTANCE);
    setDialect("AUTO");
    setFormatAssertions(true);
  };

  const clearEditors = () => {
    setSchema("");
    setInstance("");
  };

  const error = serviceError(mutation.error);

  return (
    <DeveloperToolLayout
      clearLabel={messages.jsonSchemaValidator.clear}
      description={messages.jsonSchemaValidator.description}
      onClear={clearEditors}
      onReset={resetExample}
      resetLabel={messages.jsonSchemaValidator.resetExample}
      title={messages.jsonSchemaValidator.title}
      tour={
        <DeveloperToolTourButton
          label={messages.jsonSchemaValidator.tour.startButton}
          steps={tourSteps}
          storageKey="json-schema-validator-tour-seen"
          tourId={JSON_SCHEMA_TOUR_ID}
        />
      }
    >
      <motion.section
        className="grid border-y md:grid-cols-[minmax(0,1fr)_auto]"
        id={JSON_SCHEMA_TOUR_TARGETS.controls}
        variants={childVariants}
      >
        <div className="grid gap-4 py-4 sm:grid-cols-2 sm:items-end sm:gap-6 md:pr-6">
          <div className="space-y-2">
            <Label htmlFor="schema-dialect" size="sm">
              {messages.jsonSchemaValidator.schemaDraftLabel}
            </Label>
            <Select
              onValueChange={(value) => setDialect(value as JsonSchemaDialect)}
              value={dialect}
            >
              <SelectTrigger
                className="w-full"
                id="schema-dialect"
                variant="surface"
              >
                <SelectValue>{dialectLabels[dialect]}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {Object.entries(dialectLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex min-h-9 items-center gap-3 pb-0.5">
            <Switch
              aria-label={messages.jsonSchemaValidator.assertFormatsLabel}
              checked={formatAssertions}
              id="format-assertions"
              onCheckedChange={setFormatAssertions}
            />
            <div>
              <Label
                className="cursor-pointer"
                htmlFor="format-assertions"
                size="sm"
              >
                {messages.jsonSchemaValidator.assertFormatsLabel}
              </Label>
              <p className="mt-0.5 text-muted-foreground text-xs">
                {messages.jsonSchemaValidator.assertFormatsDescription}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-5 border-t py-4 md:border-t-0 md:border-l md:pl-6">
          <span className="font-mono text-muted-foreground text-xs uppercase tracking-wider">
            {messages.jsonSchemaValidator.shortcutLabel}
          </span>
          <Button
            className="min-w-28 active:translate-y-px"
            disabled={isValidating}
            onClick={validate}
            type="button"
          >
            {isValidating
              ? messages.jsonSchemaValidator.validating
              : messages.jsonSchemaValidator.validate}
          </Button>
        </div>
      </motion.section>

      <motion.div
        className="mt-8 grid min-w-0 grid-cols-1 border-x border-b lg:grid-cols-2 lg:divide-x"
        id={JSON_SCHEMA_TOUR_TARGETS.editors}
        variants={childVariants}
      >
        <DocumentEditor
          byteCountMessage={messages.jsonSchemaValidator.editorByteCount}
          description={messages.jsonSchemaValidator.schemaEditorDescription}
          format="json"
          index="01"
          label={messages.jsonSchemaValidator.schemaEditorLabel}
          lineCountMessage={messages.jsonSchemaValidator.editorLineCount}
          onChange={setSchema}
          value={schema}
        />
        <DocumentEditor
          byteCountMessage={messages.jsonSchemaValidator.editorByteCount}
          description={messages.jsonSchemaValidator.instanceEditorDescription}
          format="json"
          index="02"
          label={messages.jsonSchemaValidator.instanceEditorLabel}
          lineCountMessage={messages.jsonSchemaValidator.editorLineCount}
          onChange={setInstance}
          value={instance}
        />
      </motion.div>

      <AnimatePresence>
        {isValidating ? (
          <motion.div
            animate={{ height: "auto", opacity: 1 }}
            aria-live="polite"
            className="mt-8 overflow-hidden border-y py-5"
            exit={{ height: 0, opacity: 0 }}
            initial={{ height: 0, opacity: 0 }}
            role="status"
            transition={{ bounce: 0.08, duration: 0.32, type: "spring" }}
          >
            <div className="mb-3 flex items-center justify-between font-mono text-muted-foreground text-xs uppercase tracking-wider">
              <span>{messages.jsonSchemaValidator.validationInProgress}</span>
              <span>{messages.jsonSchemaValidator.deadlineLabel}</span>
            </div>
            <div className="h-1 overflow-hidden bg-muted">
              <motion.div
                animate={{ x: ["-100%", "260%"] }}
                className="h-full w-1/3 bg-foreground/60"
                transition={{
                  duration: 1.1,
                  ease: [0.16, 1, 0.3, 1],
                  repeat: Number.POSITIVE_INFINITY,
                }}
              />
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {error ? (
          <motion.section
            animate={{ opacity: 1, y: 0 }}
            aria-live="polite"
            className="mt-8 grid gap-2 border-destructive/30 border-y py-5 sm:grid-cols-[180px_1fr]"
            exit={{ opacity: 0, y: -6 }}
            initial={{ opacity: 0, y: 6 }}
            transition={{ bounce: 0.08, duration: 0.32, type: "spring" }}
          >
            <h2 className="font-semibold text-destructive text-sm">
              {error.title}
            </h2>
            <p className="text-muted-foreground text-sm">{error.description}</p>
          </motion.section>
        ) : null}
      </AnimatePresence>
      <AnimatePresence>
        {lastResult ? <ValidationResult result={lastResult} /> : null}
      </AnimatePresence>
    </DeveloperToolLayout>
  );
}
