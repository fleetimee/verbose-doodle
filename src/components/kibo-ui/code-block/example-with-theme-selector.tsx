import type { BundledLanguage } from "./index";
import {
  CodeBlock,
  CodeBlockBody,
  CodeBlockContent,
  CodeBlockCopyButton,
  CodeBlockFilename,
  CodeBlockFiles,
  CodeBlockHeader,
  CodeBlockItem,
  CodeBlockThemeSelector,
} from "./index";

const exampleCode = `function greet(name: string) {
  console.log(\`Hello, \${name}!\`);
}

greet("World");`;

export function CodeBlockWithThemeSelector() {
  return (
    <CodeBlock
      data={[
        {
          language: "typescript",
          filename: "example.ts",
          code: exampleCode,
        },
      ]}
      defaultDarkTheme="github-dark-default"
      defaultLightTheme="github-light-default"
      defaultValue="typescript"
    >
      <CodeBlockHeader>
        <CodeBlockFiles>
          {(item) => (
            <CodeBlockFilename key={item.language} value={item.language}>
              {item.filename}
            </CodeBlockFilename>
          )}
        </CodeBlockFiles>

        {/* Theme Selectors */}
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-xs">Light:</span>
          <CodeBlockThemeSelector mode="light" />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-xs">Dark:</span>
          <CodeBlockThemeSelector mode="dark" />
        </div>

        <CodeBlockCopyButton />
      </CodeBlockHeader>

      <CodeBlockBody>
        {(item) => (
          <CodeBlockItem key={item.language} value={item.language}>
            <CodeBlockContent language={item.language as BundledLanguage}>
              {item.code}
            </CodeBlockContent>
          </CodeBlockItem>
        )}
      </CodeBlockBody>
    </CodeBlock>
  );
}
