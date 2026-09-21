import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Braces, CircleAlert, Code2, Wand2 } from "@/components/hugeicons";
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
import {
  formatJsonText,
  generateMockFromSchema,
  inferSchemaFromJson,
  validateJsonSyntax,
} from "@/features/developer-tools/tools/json-schema-validator/utils/schema-tools";
import type { ApiError } from "@/lib/api";
import { formatMessage, messages } from "@/lib/i18n";

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

  const schemaSyntax = useMemo(() => validateJsonSyntax(schema), [schema]);
  const instanceSyntax = useMemo(
    () => validateJsonSyntax(instance),
    [instance]
  );

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

  const handlePrettifySchema = () => {
    const result = formatJsonText(schema);
    if (result.formatted) {
      setSchema(result.formatted);
      toast.success(messages.jsonSchemaValidator.prettifySuccess);
    } else {
      toast.error(
        result.error ?? messages.jsonSchemaValidator.schemaSyntaxError
      );
    }
  };

  const handlePrettifyInstance = () => {
    const result = formatJsonText(instance);
    if (result.formatted) {
      setInstance(result.formatted);
      toast.success(messages.jsonSchemaValidator.prettifySuccess);
    } else {
      toast.error(
        result.error ?? messages.jsonSchemaValidator.instanceSyntaxError
      );
    }
  };

  const handleInferSchema = () => {
    const result = inferSchemaFromJson(instance);
    if (result.schema) {
      setSchema(result.schema);
      toast.success(messages.jsonSchemaValidator.inferSchemaSuccess);
    } else {
      toast.error(
        result.error ?? messages.jsonSchemaValidator.instanceSyntaxError
      );
    }
  };

  const handleGenerateMock = () => {
    const result = generateMockFromSchema(schema);
    if (result.mock) {
      setInstance(result.mock);
      toast.success(messages.jsonSchemaValidator.generateMockSuccess);
    } else {
      toast.error(
        result.error ?? messages.jsonSchemaValidator.schemaSyntaxError
      );
    }
  };

  const error = serviceError(mutation.error);

  return (
    <DeveloperToolLayout
      className="json-schema-scrollbars min-h-0 flex-1 gap-4 pb-4"
      clearLabel={messages.jsonSchemaValidator.clear}
      description={messages.jsonSchemaValidator.description}
      mainClassName="flex min-h-0 flex-1 flex-col"
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
        <div className="flex flex-wrap items-center gap-6 py-3.5 md:pr-6">
          <div className="flex items-center gap-2.5">
            <Label className="shrink-0" htmlFor="schema-dialect" size="sm">
              {messages.jsonSchemaValidator.schemaDraftLabel}
            </Label>
            <Select
              onValueChange={(value) =>
                // SAFETY: The select options are the supported JSON Schema dialects.
                setDialect(value as JsonSchemaDialect)
              }
              value={dialect}
            >
              <SelectTrigger
                className="w-38"
                id="schema-dialect"
                size="sm"
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

          <div className="flex items-center gap-2.5">
            <Switch
              aria-label={messages.jsonSchemaValidator.assertFormatsLabel}
              checked={formatAssertions}
              id="format-assertions"
              onCheckedChange={setFormatAssertions}
            />
            <div className="flex items-center gap-1.5">
              <Label
                className="cursor-pointer font-medium text-xs"
                htmlFor="format-assertions"
                size="sm"
              >
                {messages.jsonSchemaValidator.assertFormatsLabel}
              </Label>
              <span className="hidden text-muted-foreground text-xs sm:inline">
                ({messages.jsonSchemaValidator.assertFormatsDescription})
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 border-t py-3 md:border-t-0 md:border-l md:pl-6">
          <ButtonGroup>
            <ButtonGroupText className="h-8 font-mono text-[11px] text-muted-foreground uppercase tracking-wider">
              {messages.jsonSchemaValidator.shortcutLabel}
            </ButtonGroupText>
            <Button
              className="h-8 min-w-28 active:translate-y-px"
              disabled={isValidating}
              onClick={validate}
              type="button"
            >
              {isValidating
                ? messages.jsonSchemaValidator.validating
                : messages.jsonSchemaValidator.validate}
            </Button>
          </ButtonGroup>
        </div>
      </motion.section>

      <motion.div
        className="mt-4 grid min-h-[420px] min-w-0 flex-1 grid-cols-1 border-x border-b lg:min-h-0 lg:grid-cols-2 lg:divide-x"
        id={JSON_SCHEMA_TOUR_TARGETS.editors}
        variants={childVariants}
      >
        <DocumentEditor
          byteCountMessage={messages.jsonSchemaValidator.editorByteCount}
          description={messages.jsonSchemaValidator.schemaEditorDescription}
          format="json"
          headerActions={
            <div className="flex items-center gap-1.5">
              {!schemaSyntax.valid && (
                <span className="inline-flex items-center gap-1 font-mono text-[11px] text-destructive">
                  <CircleAlert className="size-3.5" />
                  <span>
                    {schemaSyntax.line
                      ? formatMessage(
                          messages.jsonSchemaValidator.diagnosticLineColumn,
                          {
                            column: schemaSyntax.column ?? 1,
                            line: schemaSyntax.line,
                          }
                        )
                      : messages.jsonSchemaValidator.syntaxError}
                  </span>
                </span>
              )}
              <ButtonGroup>
                <Button
                  aria-label={messages.jsonSchemaValidator.prettify}
                  className="h-7 px-2.5 text-muted-foreground text-xs hover:text-foreground"
                  onClick={handlePrettifySchema}
                  size="sm"
                  title={messages.jsonSchemaValidator.prettify}
                  type="button"
                  variant="outline"
                >
                  <Braces className="size-3.5" />
                  <span className="ml-1.5 hidden sm:inline">
                    {messages.jsonSchemaValidator.prettify}
                  </span>
                </Button>
                <Button
                  aria-label={messages.jsonSchemaValidator.generateMock}
                  className="h-7 px-2.5 text-muted-foreground text-xs hover:text-foreground"
                  onClick={handleGenerateMock}
                  size="sm"
                  title={messages.jsonSchemaValidator.generateMockDescription}
                  type="button"
                  variant="outline"
                >
                  <Code2 className="size-3.5" />
                  <span className="ml-1.5 hidden sm:inline">
                    {messages.jsonSchemaValidator.generateMock}
                  </span>
                </Button>
              </ButtonGroup>
            </div>
          }
          height="100%"
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
          headerActions={
            <div className="flex items-center gap-1.5">
              {!instanceSyntax.valid && (
                <span className="inline-flex items-center gap-1 font-mono text-[11px] text-destructive">
                  <CircleAlert className="size-3.5" />
                  <span>
                    {instanceSyntax.line
                      ? formatMessage(
                          messages.jsonSchemaValidator.diagnosticLineColumn,
                          {
                            column: instanceSyntax.column ?? 1,
                            line: instanceSyntax.line,
                          }
                        )
                      : messages.jsonSchemaValidator.syntaxError}
                  </span>
                </span>
              )}
              <ButtonGroup>
                <Button
                  aria-label={messages.jsonSchemaValidator.prettify}
                  className="h-7 px-2.5 text-muted-foreground text-xs hover:text-foreground"
                  onClick={handlePrettifyInstance}
                  size="sm"
                  title={messages.jsonSchemaValidator.prettify}
                  type="button"
                  variant="outline"
                >
                  <Braces className="size-3.5" />
                  <span className="ml-1.5 hidden sm:inline">
                    {messages.jsonSchemaValidator.prettify}
                  </span>
                </Button>
                <Button
                  aria-label={messages.jsonSchemaValidator.inferSchema}
                  className="h-7 px-2.5 text-muted-foreground text-xs hover:text-foreground"
                  onClick={handleInferSchema}
                  size="sm"
                  title={messages.jsonSchemaValidator.inferSchemaDescription}
                  type="button"
                  variant="outline"
                >
                  <Wand2 className="size-3.5" />
                  <span className="ml-1.5 hidden sm:inline">
                    {messages.jsonSchemaValidator.inferSchema}
                  </span>
                </Button>
              </ButtonGroup>
            </div>
          }
          height="100%"
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
            className="mt-4 overflow-hidden border-y py-4"
            exit={{ height: 0, opacity: 0 }}
            initial={{ height: 0, opacity: 0 }}
            role="status"
            transition={{ bounce: 0.08, duration: 0.32, type: "spring" }}
          >
            <div className="mb-2 flex items-center justify-between font-mono text-muted-foreground text-xs uppercase tracking-wider">
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
            className="mt-4 grid gap-2 border-destructive/30 border-y py-4 sm:grid-cols-[180px_1fr]"
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
        {lastResult ? (
          <ValidationResult className="mt-4 shrink-0" result={lastResult} />
        ) : null}
      </AnimatePresence>
    </DeveloperToolLayout>
  );
}
