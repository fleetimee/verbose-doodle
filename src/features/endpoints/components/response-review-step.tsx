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
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="rounded-lg border bg-muted/30 p-6">
          <div className="mb-2 font-medium text-muted-foreground text-sm uppercase tracking-wide">
            Response Name
          </div>
          <div className="font-semibold text-2xl">{formValues.name}</div>
        </div>

        <div className="rounded-lg border bg-muted/30 p-6">
          <div className="mb-2 font-medium text-muted-foreground text-sm uppercase tracking-wide">
            Status Code
          </div>
          <div className="font-semibold text-2xl">
            {HTTP_STATUS_CODES.find(
              (code) => code.value === formValues.statusCode
            )?.label || formValues.statusCode}
          </div>
        </div>

        <div className="rounded-lg border bg-muted/30 p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="font-medium text-muted-foreground text-sm uppercase tracking-wide">
              JSON Response
            </div>
          </div>
          <CodeBlock
            data={[
              {
                language: "json",
                filename: "response.json",
                code: formValues.json,
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
                  <CodeBlockContent language="json">
                    {item.code}
                  </CodeBlockContent>
                </CodeBlockItem>
              )}
            </CodeBlockBody>
          </CodeBlock>
        </div>
      </div>
    </div>
  );
}
