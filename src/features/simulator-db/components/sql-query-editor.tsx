import {
  acceptCompletion,
  type CompletionContext,
  startCompletion,
} from "@codemirror/autocomplete";
import {
  SQLite,
  type SQLNamespace,
  schemaCompletionSource,
  sql,
} from "@codemirror/lang-sql";
import { EditorView, keymap, tooltips } from "@codemirror/view";
import { useQueryClient } from "@tanstack/react-query";
import CodeMirror from "@uiw/react-codemirror";
import { useEffect, useMemo, useRef, useState } from "react";
import { useI18n } from "@/components/i18n-provider";
import { fetchColumns } from "@/features/simulator-db/api";
import type { TableMetadata } from "@/features/simulator-db/types";

const basicSetup = {
  autocompletion: true,
  bracketMatching: true,
  closeBrackets: true,
  lineNumbers: true,
  foldGutter: false,
  highlightActiveLine: true,
};
const editorTheme = EditorView.theme({
  "&": {
    height: "100%",
    backgroundColor: "var(--background)",
    color: "var(--foreground)",
    fontSize: "13px",
  },
  "&.cm-focused": { outline: "none" },
  ".cm-scroller": {
    overflow: "auto",
    fontFamily: "var(--font-mono)",
    scrollbarColor: "var(--border) transparent",
    scrollbarWidth: "thin",
  },
  ".cm-content": { fontFamily: "var(--font-mono)" },
  ".cm-gutters": {
    backgroundColor: "var(--background)",
    color: "var(--muted-foreground)",
    borderRightColor: "var(--border)",
  },
  ".cm-activeLine, .cm-activeLineGutter": { backgroundColor: "var(--muted)" },
  ".cm-tooltip": {
    backgroundColor: "var(--popover)",
    color: "var(--popover-foreground)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius)",
    fontSize: "12px",
  },
  ".cm-tooltip-autocomplete ul li[aria-selected]": {
    backgroundColor: "var(--accent)",
    color: "var(--accent-foreground)",
  },
});

type SqlQueryEditorProps = {
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly onExecute: () => void;
  readonly selectedTable: string | null;
  readonly tables: readonly TableMetadata[];
};

export function SqlQueryEditor({
  value,
  onChange,
  onExecute,
  selectedTable,
  tables,
}: SqlQueryEditorProps) {
  const {
    messages: { simulatorDb: m },
  } = useI18n();
  const queryClient = useQueryClient();
  const executeRef = useRef(onExecute);
  useEffect(() => {
    executeRef.current = onExecute;
  }, [onExecute]);
  const [theme, setTheme] = useState<"dark" | "light">(() =>
    document.documentElement.classList.contains("dark") ? "dark" : "light"
  );
  useEffect(() => {
    const update = () =>
      setTheme(
        document.documentElement.classList.contains("dark") ? "dark" : "light"
      );
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  const extensions = useMemo(() => {
    const baseSchema: SQLNamespace = Object.fromEntries(
      tables.map((table) => [table.name, []])
    );
    const completeSchema = async (context: CompletionContext) => {
      const documentSql = context.state.doc.toString().toLowerCase();
      const referenced = tables.filter(
        (table) =>
          table.name === selectedTable ||
          documentSql.includes(table.name.toLowerCase())
      );
      try {
        const details = await Promise.all(
          referenced.map(async (table) => {
            const columns = await queryClient.fetchQuery({
              queryKey: ["simulator-db-schema", "columns", table.name],
              queryFn: () => fetchColumns(table.name),
              staleTime: 60_000,
              gcTime: 60_000,
              retry: false,
            });
            return [
              table.name,
              columns.map((column) => ({
                label: column.name,
                type: "property",
                detail: column.type,
              })),
            ] as const;
          })
        );
        if (context.aborted) {
          return null;
        }
        return schemaCompletionSource({
          dialect: SQLite,
          schema: { ...baseSchema, ...Object.fromEntries(details) },
          defaultTable: selectedTable ?? undefined,
        })(context);
      } catch {
        if (context.aborted) {
          return null;
        }
        return schemaCompletionSource({ dialect: SQLite, schema: baseSchema })(
          context
        );
      }
    };
    return [
      sql({ dialect: SQLite, upperCaseKeywords: true }),
      SQLite.language.data.of({ autocomplete: completeSchema }),
      keymap.of([
        {
          key: "Mod-Enter",
          run: () => {
            executeRef.current();
            return true;
          },
        },
        { key: "Ctrl-Space", run: startCompletion },
        { key: "Tab", run: acceptCompletion },
      ]),
      tooltips({ position: "fixed", parent: document.body }),
      EditorView.contentAttributes.of({
        "aria-label": m.sqlEditor,
        spellcheck: "false",
      }),
      editorTheme,
    ];
  }, [tables, selectedTable, queryClient, m.sqlEditor]);

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col">
      <div className="mb-2 flex items-center justify-between gap-2 text-muted-foreground text-xs">
        <span>SQL</span>
        <span>{m.sqlCompletionHint}</span>
      </div>
      <CodeMirror
        basicSetup={basicSetup}
        className="h-full min-h-0 flex-1 overflow-hidden"
        extensions={extensions}
        height="100%"
        indentWithTab={false}
        onChange={onChange}
        theme={theme}
        value={value}
      />
    </div>
  );
}
