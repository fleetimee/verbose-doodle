import { Eye } from "lucide-react";
import { useMemo } from "react";
import {
  CodeBlock,
  CodeBlockBody,
  CodeBlockContent,
  CodeBlockCopyButton,
  CodeBlockHeader,
  CodeBlockItem,
  CodeBlockThemeSelector,
} from "@/components/kibo-ui/code-block";
import { useTheme } from "@/components/theme-provider";
import { Badge } from "@/components/ui/badge";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { EndpointResponse } from "@/features/endpoints/types";

const SUCCESS_STATUS_CODE_THRESHOLD = 300;

type ResponsePreviewProps = {
  response: EndpointResponse | null;
};

export function ResponsePreview({ response }: ResponsePreviewProps) {
  const { theme } = useTheme();

  // Resolve the actual theme (handle "system" preference)
  const resolvedTheme = useMemo(() => {
    if (theme === "system") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }
    return theme;
  }, [theme]);

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
              storageKey="response-preview-themes"
            >
              <CodeBlockHeader>
                <div className="flex-1 px-3 py-1 text-muted-foreground text-xs">
                  Response Body
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-xs">Theme:</span>
                  <CodeBlockThemeSelector
                    mode={resolvedTheme === "dark" ? "dark" : "light"}
                  />
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
          <Empty className="min-h-[300px] border-0">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Eye />
              </EmptyMedia>
              <EmptyTitle>No response selected</EmptyTitle>
              <EmptyDescription>
                Select a response from the list to preview its details.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </ScrollArea>
    </div>
  );
}
