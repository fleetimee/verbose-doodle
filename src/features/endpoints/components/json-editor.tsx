import { json } from "@codemirror/lang-json";
import type { Extension } from "@codemirror/state";
import { placeholder as placeholderExtension } from "@codemirror/view";
import CodeMirror from "@uiw/react-codemirror";
import { Wand2 } from "lucide-react";
import { forwardRef, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type JsonEditorProps = {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  className?: string;
  id?: string;
  autoFocus?: boolean;
  "aria-invalid"?: boolean;
};

export const JsonEditor = forwardRef<HTMLDivElement, JsonEditorProps>(
  (
    {
      value,
      onChange,
      onBlur,
      placeholder,
      className,
      id,
      autoFocus,
      "aria-invalid": ariaInvalid,
    },
    ref
  ) => {
    const [theme, setTheme] = useState<"light" | "dark">("light");

    useEffect(() => {
      // Detect theme
      const isDark = document.documentElement.classList.contains("dark");
      setTheme(isDark ? "dark" : "light");

      // Watch for theme changes
      const observer = new MutationObserver(() => {
        const isDarkMode = document.documentElement.classList.contains("dark");
        setTheme(isDarkMode ? "dark" : "light");
      });

      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["class"],
      });

      return () => observer.disconnect();
    }, []);

    const formatJson = (jsonString: string): string => {
      try {
        const parsed = JSON.parse(jsonString);
        return JSON.stringify(parsed, null, 2);
      } catch {
        // If parsing fails, return original
        return jsonString;
      }
    };

    const handleFormat = () => {
      const formatted = formatJson(value);
      onChange(formatted);
    };

    const handleChange = (val: string) => {
      onChange(val);
    };

    const isValidJson = () => {
      try {
        JSON.parse(value);
        return true;
      } catch {
        return false;
      }
    };

    const canFormat = value.trim().length > 0 && isValidJson();

    const extensions = useMemo(() => {
      const exts: Extension[] = [json()];
      if (placeholder) {
        exts.push(placeholderExtension(placeholder));
      }
      return exts;
    }, [placeholder]);

    return (
      <div className={cn("relative", className)} id={id} ref={ref}>
        <div
          aria-invalid={ariaInvalid}
          className={cn(
            "overflow-hidden rounded-md border",
            ariaInvalid && "border-destructive"
          )}
        >
          <CodeMirror
            autoFocus={autoFocus}
            basicSetup={{
              lineNumbers: true,
              highlightActiveLineGutter: true,
              highlightActiveLine: true,
              foldGutter: true,
              bracketMatching: true,
              closeBrackets: true,
              autocompletion: true,
              highlightSelectionMatches: true,
            }}
            extensions={extensions}
            height="400px"
            onBlur={onBlur}
            onChange={handleChange}
            theme={theme}
            value={value}
          />
        </div>
        <Button
          className="absolute top-2 right-2 z-10"
          disabled={!canFormat}
          onClick={handleFormat}
          size="sm"
          title="Format JSON"
          type="button"
          variant="secondary"
        >
          <Wand2 className="h-4 w-4" />
        </Button>
      </div>
    );
  }
);

JsonEditor.displayName = "JsonEditor";
