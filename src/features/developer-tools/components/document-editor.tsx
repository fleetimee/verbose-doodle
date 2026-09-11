import { json } from "@codemirror/lang-json";
import { yaml } from "@codemirror/lang-yaml";
import { EditorView } from "@codemirror/view";
import CodeMirror from "@uiw/react-codemirror";
import { type ReactNode, useEffect, useState } from "react";
import type { DocumentFormat } from "@/features/developer-tools/types";
import { formatMessage } from "@/lib/i18n";

type DocumentEditorProps = {
  readonly headerActions?: ReactNode;
  readonly height?: string;
  readonly compact?: boolean;
  readonly label: string;
  readonly index: string;
  readonly description: string;
  readonly value: string;
  readonly format: DocumentFormat;
  readonly lineCountMessage: string;
  readonly byteCountMessage: string;
  readonly onChange?: (value: string) => void;
  readonly readOnly?: boolean;
};

const editorTheme = EditorView.theme({
  ".cm-activeLine": { backgroundColor: "hsl(var(--muted) / 0.35)" },
  ".cm-activeLineGutter": { backgroundColor: "hsl(var(--muted) / 0.35)" },
  ".cm-content": { fontFamily: "Geist Mono, monospace", padding: "16px 0" },
  ".cm-cursor": { borderLeftColor: "hsl(var(--foreground))" },
  ".cm-gutters": {
    backgroundColor: "transparent",
    borderRight: "1px solid hsl(var(--border) / 0.55)",
    color: "hsl(var(--muted-foreground) / 0.65)",
  },
  ".cm-scroller": { minHeight: "400px" },
  "&": { backgroundColor: "transparent", fontSize: "13px" },
});

export function DocumentEditor({
  headerActions,
  height,
  compact = false,
  byteCountMessage,
  description,
  format,
  index,
  label,
  lineCountMessage,
  onChange,
  readOnly = false,
  value,
}: DocumentEditorProps) {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const updateTheme = () => {
      setTheme(
        document.documentElement.classList.contains("dark") ? "dark" : "light"
      );
    };
    updateTheme();
    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, {
      attributeFilter: ["class"],
      attributes: true,
    });
    return () => observer.disconnect();
  }, []);

  const byteCount = new TextEncoder().encode(value).length;
  const lineCount = value.length === 0 ? 0 : value.split("\n").length;
  const language = format === "json" ? json() : yaml();
  const extensions = readOnly
    ? [language, editorTheme, EditorView.editable.of(false)]
    : [language, editorTheme];
  if (compact) {
    extensions.push(EditorView.theme({ ".cm-scroller": { minHeight: "0" } }));
  }

  return (
    <section className="min-w-0 border-t bg-background transition-colors focus-within:bg-muted/10">
      {compact ? (
        <header className="flex items-center justify-between gap-2 border-b px-4 py-2">
          <h2 className="font-medium text-sm">{label}</h2>
          {headerActions}
        </header>
      ) : (
        <header className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3 sm:grid sm:min-h-16 sm:grid-cols-[auto_1fr_auto] sm:gap-3 sm:py-0">
          <span className="font-mono text-[10px] text-muted-foreground tracking-[0.18em]">
            {index}
          </span>
          <div className="min-w-0 flex-1 sm:flex-initial">
            <h2 className="font-semibold text-sm">{label}</h2>
            <p className="text-[11px] text-muted-foreground">{description}</p>
          </div>
          <div className="flex items-center gap-2 font-mono text-[9px] text-muted-foreground uppercase tracking-wider">
            <span>{formatMessage(lineCountMessage, { count: lineCount })}</span>
            <span aria-hidden="true">/</span>
            <span>
              {formatMessage(byteCountMessage, {
                count: byteCount.toLocaleString(),
              })}
            </span>
          </div>
        </header>
      )}
      <CodeMirror
        aria-label={label}
        basicSetup={{
          autocompletion: !readOnly,
          bracketMatching: true,
          closeBrackets: !readOnly,
          foldGutter: true,
          highlightActiveLine: true,
          lineNumbers: true,
        }}
        editable={!readOnly}
        extensions={extensions}
        height={height ?? (compact ? "220px" : "440px")}
        onChange={readOnly ? undefined : onChange}
        theme={theme}
        value={value}
      />
    </section>
  );
}
