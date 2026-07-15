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
import { Switch } from "@/components/ui/switch";
import {
  DeveloperToolTourButton,
  type DeveloperToolTourStep,
} from "@/features/developer-tools/components/developer-tool-tour-button";
import { DocumentEditor } from "@/features/developer-tools/components/document-editor";
import { ValidationResult } from "@/features/json-schema-validator/components/validation-result";
import {
  EXAMPLE_INSTANCE,
  EXAMPLE_SCHEMA,
} from "@/features/json-schema-validator/example";
import { useValidateJsonSchema } from "@/features/json-schema-validator/hooks/use-validate-json-schema";
import type {
  JsonSchemaDialect,
  JsonSchemaValidationResult,
} from "@/features/json-schema-validator/types";
import type { ApiError } from "@/lib/api";
import { messages } from "@/lib/i18n";

const dialectLabels: Record<JsonSchemaDialect, string> = {
  AUTO: messages.jsonSchemaValidator.dialectAuto,
  DRAFT_7: messages.jsonSchemaValidator.dialectDraft7,
  DRAFT_2019_09: messages.jsonSchemaValidator.dialectDraft201909,
  DRAFT_2020_12: messages.jsonSchemaValidator.dialectDraft202012,
};

const parentVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.07 },
  },
};

const childVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, duration: 0.32, bounce: 0.08 },
  },
};

const JSON_SCHEMA_TOUR_ID = "json-schema-validator-intro";
const JSON_SCHEMA_TOUR_TARGETS = {
  controls: "json-schema-validator-tour-controls",
  editors: "json-schema-validator-tour-editors",
} as const;
const JSON_SCHEMA_TOUR_STEPS: readonly DeveloperToolTourStep[] = [
  {
    selectorId: JSON_SCHEMA_TOUR_TARGETS.controls,
    position: "bottom",
    title: messages.jsonSchemaValidator.tour.controlsTitle,
    description: messages.jsonSchemaValidator.tour.controlsDescription,
  },
  {
    selectorId: JSON_SCHEMA_TOUR_TARGETS.editors,
    position: "top",
    title: messages.jsonSchemaValidator.tour.editorsTitle,
    description: messages.jsonSchemaValidator.tour.editorsDescription,
  },
];

function serviceError(error: ApiError | null) {
  if (!error) {
    return null;
  }
  if (error.status === 413) {
    return {
      title: messages.jsonSchemaValidator.inputTooLargeTitle,
      description: messages.jsonSchemaValidator.inputTooLargeDescription,
    };
  }
  return {
    title: messages.jsonSchemaValidator.serviceUnavailableTitle,
    description:
      error.status === 503
        ? messages.jsonSchemaValidator.serviceBusyDescription
        : messages.jsonSchemaValidator.serviceFailureDescription,
  };
}

export function JsonSchemaValidator() {
  const shouldReduceMotion = useReducedMotion();
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
          {messages.jsonSchemaValidator.eyebrow}
        </p>
        <h1 className="mt-4 max-w-48 font-semibold text-3xl leading-[0.96] tracking-[-0.045em]">
          {messages.jsonSchemaValidator.title}
        </h1>
        <p className="mt-5 text-muted-foreground text-sm leading-6">
          {messages.jsonSchemaValidator.description}
        </p>

        <dl className="mt-8 border-y text-xs">
          <div className="grid grid-cols-[72px_1fr] gap-3 border-b py-3">
            <dt className="text-muted-foreground">
              {messages.jsonSchemaValidator.dialectsLabel}
            </dt>
            <dd>{messages.jsonSchemaValidator.dialectsValue}</dd>
          </div>
          <div className="grid grid-cols-[72px_1fr] gap-3 border-b py-3">
            <dt className="text-muted-foreground">
              {messages.jsonSchemaValidator.limitLabel}
            </dt>
            <dd className="font-mono">
              {messages.jsonSchemaValidator.limitValue}
            </dd>
          </div>
          <div className="grid grid-cols-[72px_1fr] gap-3 py-3">
            <dt className="text-muted-foreground">
              {messages.jsonSchemaValidator.storageLabel}
            </dt>
            <dd className="flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400" />
              {messages.jsonSchemaValidator.storageValue}
            </dd>
          </div>
        </dl>

        <div className="mt-6 flex flex-wrap gap-x-4 gap-y-2 md:flex-col md:items-start">
          <DeveloperToolTourButton
            label={messages.jsonSchemaValidator.tour.startButton}
            steps={JSON_SCHEMA_TOUR_STEPS}
            storageKey="json-schema-validator-tour-seen"
            tourId={JSON_SCHEMA_TOUR_ID}
          />
          <button
            className="text-muted-foreground text-xs underline decoration-border underline-offset-4 transition-colors hover:text-foreground active:translate-y-px"
            onClick={resetExample}
            type="button"
          >
            {messages.jsonSchemaValidator.resetExample}
          </button>
          <button
            className="text-muted-foreground text-xs underline decoration-border underline-offset-4 transition-colors hover:text-foreground active:translate-y-px"
            onClick={clearEditors}
            type="button"
          >
            {messages.jsonSchemaValidator.clear}
          </button>
        </div>
      </motion.aside>

      <main className="min-w-0">
        <motion.section
          className="grid border-y md:grid-cols-[minmax(0,1fr)_auto]"
          id={JSON_SCHEMA_TOUR_TARGETS.controls}
          variants={childVariants}
        >
          <div className="grid gap-4 py-4 sm:grid-cols-2 sm:items-end sm:gap-6 md:pr-6">
            <div className="space-y-2">
              <Label className="text-xs" htmlFor="schema-dialect">
                {messages.jsonSchemaValidator.schemaDraftLabel}
              </Label>
              <Select
                onValueChange={(value) =>
                  setDialect(value as JsonSchemaDialect)
                }
                value={dialect}
              >
                <SelectTrigger
                  className="w-full rounded-md bg-background shadow-none"
                  id="schema-dialect"
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
                  className="cursor-pointer text-xs"
                  htmlFor="format-assertions"
                >
                  {messages.jsonSchemaValidator.assertFormatsLabel}
                </Label>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  {messages.jsonSchemaValidator.assertFormatsDescription}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-5 border-t py-4 md:border-t-0 md:border-l md:pl-6">
            <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
              {messages.jsonSchemaValidator.shortcutLabel}
            </span>
            <Button
              className="min-w-28 rounded-md active:translate-y-px"
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
              animate={{ opacity: 1, height: "auto" }}
              aria-live="polite"
              className="mt-8 overflow-hidden border-y py-5"
              exit={{ opacity: 0, height: 0 }}
              initial={{ opacity: 0, height: 0 }}
              role="status"
              transition={{ type: "spring", duration: 0.32, bounce: 0.08 }}
            >
              <div className="mb-3 flex items-center justify-between font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
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
              transition={{ type: "spring", duration: 0.32, bounce: 0.08 }}
            >
              <h2 className="font-semibold text-destructive text-sm">
                {error.title}
              </h2>
              <p className="text-muted-foreground text-sm">
                {error.description}
              </p>
            </motion.section>
          ) : null}
        </AnimatePresence>
        <AnimatePresence>
          {lastResult ? <ValidationResult result={lastResult} /> : null}
        </AnimatePresence>
      </main>
    </motion.div>
  );
}
