import { motion } from "motion/react";
import { DiagnosticList } from "@/features/developer-tools/tools/json-schema-validator/components/diagnostic-list";
import type {
  JsonSchemaValidationOutcome,
  JsonSchemaValidationResult,
} from "@/features/developer-tools/tools/json-schema-validator/types";
import { formatMessage, formatPluralMessage, messages } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type ValidationResultProps = {
  readonly result: JsonSchemaValidationResult;
};

type ResultDetails = {
  readonly code: string;
  readonly title: string;
  readonly description: string;
  readonly tone: string;
  readonly rule: string;
};

const outcomeCopy: Record<
  Exclude<JsonSchemaValidationOutcome, "VALIDATION_RESULT">,
  ResultDetails
> = {
  PARSE_ERROR: {
    code: messages.jsonSchemaValidator.parseCode,
    description: messages.jsonSchemaValidator.parseDescription,
    rule: "border-amber-500/40",
    title: messages.jsonSchemaValidator.parseTitle,
    tone: "text-amber-700 dark:text-amber-400",
  },
  SCHEMA_ERROR: {
    code: messages.jsonSchemaValidator.schemaErrorCode,
    description: messages.jsonSchemaValidator.schemaErrorDescription,
    rule: "border-amber-500/40",
    title: messages.jsonSchemaValidator.schemaErrorTitle,
    tone: "text-amber-700 dark:text-amber-400",
  },
  TIMEOUT: {
    code: messages.jsonSchemaValidator.timeoutCode,
    description: messages.jsonSchemaValidator.timeoutDescription,
    rule: "border-amber-500/40",
    title: messages.jsonSchemaValidator.timeoutTitle,
    tone: "text-amber-700 dark:text-amber-400",
  },
} as const;

export function ValidationResult({ result }: ValidationResultProps) {
  let details: ResultDetails;
  if (result.outcome !== "VALIDATION_RESULT") {
    details = outcomeCopy[result.outcome];
  } else if (result.valid) {
    details = {
      code: messages.jsonSchemaValidator.validCode,
      description: messages.jsonSchemaValidator.validDescription,
      rule: "border-emerald-600/40",
      title: messages.jsonSchemaValidator.validTitle,
      tone: "text-emerald-700 dark:text-emerald-400",
    };
  } else {
    details = {
      code: messages.jsonSchemaValidator.invalidCode,
      description: formatPluralMessage(
        messages.jsonSchemaValidator.invalidDescription,
        result.errorCount
      ),
      rule: "border-destructive/40",
      title: messages.jsonSchemaValidator.invalidTitle,
      tone: "text-destructive",
    };
  }

  return (
    <motion.section
      animate={{ opacity: 1, y: 0 }}
      aria-live="polite"
      className={cn("mt-8 border-t-2 border-b py-6", details.rule)}
      exit={{ opacity: 0, y: -8 }}
      initial={{ opacity: 0, y: 8 }}
      layout
      transition={{ bounce: 0.08, duration: 0.32, type: "spring" }}
    >
      <div className="grid gap-4 sm:grid-cols-[90px_minmax(0,1fr)_auto] sm:items-start">
        <span
          className={cn("font-mono text-xs tracking-[0.16em]", details.tone)}
        >
          {details.code}
        </span>
        <div>
          <h2 className="font-semibold text-lg tracking-tight">
            {details.title}
          </h2>
          <p className="mt-1 text-muted-foreground text-sm">
            {details.description}
          </p>
        </div>
        <dl className="grid grid-cols-3 gap-4 font-mono text-[10px] uppercase tracking-wider sm:text-right">
          <div>
            <dt className="text-muted-foreground">
              {messages.jsonSchemaValidator.resultDraftLabel}
            </dt>
            <dd className="mt-1">{result.resolvedDialect ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">
              {messages.jsonSchemaValidator.resultTimeLabel}
            </dt>
            <dd className="mt-1">
              {formatMessage(messages.jsonSchemaValidator.millisecondsValue, {
                duration: result.durationMs,
              })}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">
              {messages.jsonSchemaValidator.resultIssuesLabel}
            </dt>
            <dd className="mt-1">{result.errorCount}</dd>
          </div>
        </dl>
      </div>
      {result.diagnostics.length > 0 ? (
        <div className="mt-6 sm:ml-[106px]">
          <DiagnosticList
            diagnostics={result.diagnostics}
            errorCount={result.errorCount}
            truncated={result.truncated}
          />
        </div>
      ) : null}
    </motion.section>
  );
}
