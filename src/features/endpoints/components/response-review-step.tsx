import { CheckmarkCircle02Icon, File01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Code2, Hash } from "@/components/hugeicons";
import {
  CodeBlock,
  CodeBlockBody,
  CodeBlockContent,
  CodeBlockCopyButton,
  CodeBlockHeader,
  CodeBlockItem,
} from "@/components/kibo-ui/code-block";
import { HTTP_STATUS_CODES } from "@/features/endpoints/constants/http-status-codes";
import type { ResponseFormData } from "@/features/endpoints/schemas/response-schema";

type ResponseReviewStepProps = {
  formValues: ResponseFormData;
};

export function ResponseReviewStep({ formValues }: ResponseReviewStepProps) {
  const statusLabel =
    HTTP_STATUS_CODES.find((code) => code.value === formValues.statusCode)
      ?.label || String(formValues.statusCode);

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 shadow-xs">
        <div className="flex items-start gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500 text-white shadow-xs">
            <HugeiconsIcon
              className="size-4"
              icon={CheckmarkCircle02Icon}
              strokeWidth={2}
            />
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-base text-emerald-950 dark:text-emerald-100">
              Ready to create
            </div>
            <p className="mt-0.5 text-emerald-800/80 text-xs leading-relaxed dark:text-emerald-300/80">
              Check the response contract before adding it to the endpoint.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-xl border border-border/70 bg-card p-4 shadow-xs">
          <div className="flex items-center gap-2 font-medium text-muted-foreground text-xs uppercase tracking-wider">
            <HugeiconsIcon
              className="size-3.5"
              icon={File01Icon}
              strokeWidth={2}
            />
            Response Name
          </div>
          <div className="mt-2 truncate font-bold font-mono text-lg">
            {formValues.name}
          </div>
        </div>

        <div className="rounded-xl border border-border/70 bg-card p-4 shadow-xs">
          <div className="flex items-center gap-2 font-medium text-muted-foreground text-xs uppercase tracking-wider">
            <Hash className="size-3.5" />
            Status Code
          </div>
          <div className="mt-2 flex min-w-0 items-center gap-2">
            <span className="inline-flex select-none items-center rounded-lg border border-border/70 bg-muted/60 px-2.5 py-0.5 font-bold font-mono text-xs">
              {formValues.statusCode}
            </span>
            <span className="truncate font-semibold text-lg">
              {statusLabel.replace(`${formValues.statusCode} `, "")}
            </span>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border/70 bg-card p-4 shadow-xs">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-medium text-muted-foreground text-xs uppercase tracking-wider">
            <Code2 className="size-3.5" />
            JSON Response
          </div>
          <span className="inline-flex select-none items-center rounded-xl border-2 border-border/80 border-b-[3px] bg-muted/60 px-2.5 py-0.5 font-bold font-mono text-xs">
            response.json
          </span>
        </div>
        <CodeBlock
          data={[
            {
              code: formValues.json,
              filename: "response.json",
              language: "json",
            },
          ]}
          defaultValue="json"
        >
          <CodeBlockHeader>
            <div className="ml-auto">
              <CodeBlockCopyButton type="button" />
            </div>
          </CodeBlockHeader>
          <CodeBlockBody>
            {(item) => (
              <CodeBlockItem
                key={item.language}
                lineNumbers={false}
                value={item.language}
              >
                <CodeBlockContent language="json">{item.code}</CodeBlockContent>
              </CodeBlockItem>
            )}
          </CodeBlockBody>
        </CodeBlock>
      </div>
    </div>
  );
}
