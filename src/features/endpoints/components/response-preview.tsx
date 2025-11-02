import { useMemo } from "react";
import {
  CodeBlock,
  CodeBlockBody,
  CodeBlockContent,
  CodeBlockCopyButton,
  CodeBlockHeader,
  CodeBlockItem,
} from "@/components/kibo-ui/code-block";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { EndpointResponse } from "@/features/endpoints/types";

const SUCCESS_STATUS_CODE_THRESHOLD = 300;

type ResponsePreviewProps = {
  response: EndpointResponse | null;
};

export function ResponsePreview({ response }: ResponsePreviewProps) {
  const formattedResponseJson = useMemo(() => {
    if (!response) {
      return "";
    }

    try {
      const parsed = JSON.parse(response.json);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return response.json;
    }
  }, [response]);

  return (
    <div className="flex h-full flex-col">
      <div className="border-b px-4 py-3">
        <h2 className="font-semibold text-sm">Response Preview</h2>
      </div>
      <ScrollArea className="flex-1">
        {response ? (
          <div className="p-4">
            <div className="mb-4 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">{response.name}</h3>
                {response.activated && (
                  <Badge variant="secondary">Active Response</Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-sm">
                  Status Code:
                </span>
                <Badge
                  className="font-mono"
                  variant={
                    response.statusCode < SUCCESS_STATUS_CODE_THRESHOLD
                      ? "default"
                      : "destructive"
                  }
                >
                  {response.statusCode}
                </Badge>
              </div>
            </div>

            <CodeBlock
              data={[
                {
                  language: "json",
                  filename: "response.json",
                  code: formattedResponseJson,
                },
              ]}
              defaultValue="json"
            >
              <CodeBlockHeader>
                <div className="flex-1 px-3 py-1 text-muted-foreground text-xs">
                  Response Body
                </div>
                <CodeBlockCopyButton />
              </CodeBlockHeader>
              <CodeBlockBody>
                {(item) => (
                  <CodeBlockItem key={item.language} value="json">
                    <CodeBlockContent language="json">
                      {item.code}
                    </CodeBlockContent>
                  </CodeBlockItem>
                )}
              </CodeBlockBody>
            </CodeBlock>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center p-8">
            <div className="text-center">
              <p className="text-muted-foreground">
                Select a response from the list to preview
              </p>
            </div>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
