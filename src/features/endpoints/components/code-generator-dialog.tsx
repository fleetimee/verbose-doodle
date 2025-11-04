import { useMemo, useState } from "react";
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
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import type { EndpointResponse } from "@/features/endpoints/types";
import {
  CODE_LANGUAGE_LABELS,
  type CodeLanguage,
  generateCode,
  getCodeLanguageForHighlight,
} from "@/features/endpoints/utils/code-generator";

type CodeGeneratorDialogProps = {
  baseUrl: string;
  path: string;
  method: string;
  response: EndpointResponse;
  token?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

const CODE_LANGUAGES: CodeLanguage[] = ["curl", "httpie", "wget"];

export function CodeGeneratorDialog({
  baseUrl,
  path,
  method,
  response,
  token,
  open: controlledOpen,
  onOpenChange,
}: CodeGeneratorDialogProps) {
  const { theme } = useTheme();
  const [selectedLanguage, setSelectedLanguage] =
    useState<CodeLanguage>("curl");
  const [internalOpen, setInternalOpen] = useState(false);

  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;

  // Resolve the actual theme (handle "system" preference)
  const resolvedTheme = useMemo(() => {
    if (theme === "system") {
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      return prefersDark ? "dark" : "light";
    }
    return theme;
  }, [theme]);

  const fullUrl = `${baseUrl}${path}`;

  const generatedCode = useMemo(
    () =>
      generateCode(selectedLanguage, {
        baseUrl,
        path,
        method,
        response,
        token,
      }),
    [selectedLanguage, baseUrl, path, method, response, token]
  );

  const highlightLanguage = getCodeLanguageForHighlight(selectedLanguage);

  return (
    <Drawer onOpenChange={setOpen} open={open}>
      <DrawerContent className="max-h-[96vh]">
        <div className="mx-auto flex h-full w-full max-w-6xl flex-col">
          <DrawerHeader className="shrink-0">
            <DrawerTitle>Generate Request Code</DrawerTitle>
            <DrawerDescription>
              Generate code snippets to test this endpoint in different
              languages and tools
            </DrawerDescription>
          </DrawerHeader>

          <div className="flex flex-1 flex-col space-y-4 overflow-hidden p-4">
            {/* URL Preview */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge className="font-mono" variant="outline">
                  {method}
                </Badge>
                <code className="flex-1 rounded-md bg-muted px-3 py-2 font-mono text-xs">
                  {fullUrl}
                </code>
              </div>
            </div>

            <Separator />

            {/* Language Selector */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <label
                  className="font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  htmlFor="language"
                >
                  Language / Tool
                </label>
                <p className="text-muted-foreground text-xs">
                  Select the code language or tool you want to use
                </p>
              </div>
              <Select
                onValueChange={(value) =>
                  setSelectedLanguage(value as CodeLanguage)
                }
                value={selectedLanguage}
              >
                <SelectTrigger className="w-[240px]" id="language">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CODE_LANGUAGES.map((lang) => (
                    <SelectItem key={lang} value={lang}>
                      {CODE_LANGUAGE_LABELS[lang]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Code Block */}
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
              <CodeBlock
                className="flex h-full flex-col"
                data={[
                  {
                    language: highlightLanguage,
                    filename: "request.sh",
                    code: generatedCode,
                  },
                ]}
                defaultValue={highlightLanguage}
                storageKey="code-generator-themes"
              >
                <CodeBlockHeader>
                  <div className="flex-1 px-3 py-1 text-muted-foreground text-xs">
                    {CODE_LANGUAGE_LABELS[selectedLanguage]}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground text-xs">
                      Theme:
                    </span>
                    <CodeBlockThemeSelector
                      mode={resolvedTheme === "dark" ? "dark" : "light"}
                    />
                  </div>
                  <CodeBlockCopyButton />
                </CodeBlockHeader>
                <CodeBlockBody className="flex-1">
                  {(item) => (
                    <CodeBlockItem
                      className="h-full"
                      key={item.language}
                      value={highlightLanguage}
                    >
                      <ScrollArea className="h-full">
                        <CodeBlockContent language={highlightLanguage as never}>
                          {item.code}
                        </CodeBlockContent>
                      </ScrollArea>
                    </CodeBlockItem>
                  )}
                </CodeBlockBody>
              </CodeBlock>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
