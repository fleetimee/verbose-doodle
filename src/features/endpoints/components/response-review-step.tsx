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
import { Badge } from "@/components/ui/badge";
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
    <div className="flex flex-col gap-5">
      <div className="rounded-lg border bg-primary/5 p-5">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <HugeiconsIcon
              className="size-5"
              icon={CheckmarkCircle02Icon}
              strokeWidth={2}
            />
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-lg">Ready to create</div>
            <p className="mt-1 text-muted-foreground text-sm">
              Check the response contract before adding it to the endpoint.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-lg border bg-background p-4 shadow-xs">
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <HugeiconsIcon
              className="size-4"
              icon={File01Icon}
              strokeWidth={2}
            />
            Response Name
          </div>
          <div className="mt-3 truncate font-mono font-semibold text-xl">
            {formValues.name}
          </div>
        </div>

        <div className="rounded-lg border bg-background p-4 shadow-xs">
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Hash className="size-4" />
            Status Code
          </div>
          <div className="mt-3 flex min-w-0 items-center gap-2">
            <Badge variant="secondary">{formValues.statusCode}</Badge>
            <span className="truncate font-semibold text-xl">
              {statusLabel.replace(`${formValues.statusCode} `, "")}
            </span>
          </div>
        </div>
      </div>

      <div className="rounded-lg border bg-background p-4 shadow-xs">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Code2 className="size-4" />
            JSON Response
          </div>
          <Badge variant="outline">response.json</Badge>
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
