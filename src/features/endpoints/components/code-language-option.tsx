import {
  Go,
  Java,
  JavaScript,
  PHP,
  Python,
  Ruby,
  RustDark,
} from "developer-icons";
import { SiAxios, SiCurl, SiGnu, SiHttpie } from "react-icons/si";
import type { CodeLanguage } from "@/features/endpoints/utils/code-generator";
import { CODE_LANGUAGE_LABELS } from "@/features/endpoints/utils/code-generator";
import { cn } from "@/lib/utils";

type CodeLanguageOptionProps = {
  readonly language: CodeLanguage;
  readonly className?: string;
};

const CODE_LANGUAGE_ICONS = {
  curl: SiCurl,
  go: Go,
  httpie: SiHttpie,
  java: Java,
  "javascript-axios": SiAxios,
  "javascript-fetch": JavaScript,
  php: PHP,
  python: Python,
  ruby: Ruby,
  rust: RustDark,
  wget: SiGnu,
} satisfies Record<CodeLanguage, unknown>;

const CODE_LANGUAGE_ICON_COLORS: Record<CodeLanguage, string> = {
  curl: "#073551",
  go: "#00add8",
  httpie: "#111827",
  java: "#5382a1",
  "javascript-axios": "#5a29e4",
  "javascript-fetch": "#f7df1e",
  php: "#777bb4",
  python: "#3776ab",
  ruby: "#cc342d",
  rust: "#dea584",
  wget: "#111827",
};

export function CodeLanguageOption({
  language,
  className,
}: CodeLanguageOptionProps) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <CodeLanguageIcon className="size-4 shrink-0" language={language} />
      <span className="truncate">{CODE_LANGUAGE_LABELS[language]}</span>
    </span>
  );
}

function CodeLanguageIcon({
  language,
  className,
}: {
  readonly language: CodeLanguage;
  readonly className?: string;
}) {
  const Icon = CODE_LANGUAGE_ICONS[language];

  return (
    <Icon
      aria-hidden="true"
      className={className}
      color={CODE_LANGUAGE_ICON_COLORS[language]}
    />
  );
}
