import type { SVGProps } from "react";
import { Postman } from "@/components/ui/svgs/postman";
import type { CodeLanguage } from "@/features/endpoints/utils/code-generator";
import { CODE_LANGUAGE_LABELS } from "@/features/endpoints/utils/code-generator";
import { cn } from "@/lib/utils";

type CodeLanguageOptionProps = {
  readonly language: CodeLanguage;
  readonly className?: string;
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
  switch (language) {
    case "curl":
      return <CurlIcon className={className} />;
    case "httpie":
      return <HttpieIcon className={className} />;
    case "wget":
      return <WgetIcon className={className} />;
    case "javascript-fetch":
      return <FetchIcon className={className} />;
    case "javascript-axios":
      return <AxiosIcon className={className} />;
    case "python":
      return <PythonIcon className={className} />;
    case "ruby":
      return <RubyIcon className={className} />;
    case "php":
      return <PhpIcon className={className} />;
    case "go":
      return <GoIcon className={className} />;
    case "java":
      return <JavaIcon className={className} />;
    case "rust":
      return <RustIcon className={className} />;
    default:
      return <Postman aria-hidden="true" className={className} />;
  }
}

function CurlIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" {...props} fill="none" viewBox="0 0 24 24">
      <rect fill="#1F2937" height="20" rx="5" width="20" x="2" y="2" />
      <path
        d="m7 9 3 3-3 3M11.5 15h5"
        stroke="#F9FAFB"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.7"
      />
    </svg>
  );
}

function HttpieIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" {...props} fill="none" viewBox="0 0 24 24">
      <rect fill="#111827" height="20" rx="5" width="20" x="2" y="2" />
      <path
        d="M7 8.5h10M7 12h7M7 15.5h10"
        stroke="#7DD3FC"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function WgetIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" {...props} fill="none" viewBox="0 0 24 24">
      <rect fill="#ECFCCB" height="20" rx="5" width="20" x="2" y="2" />
      <path
        d="M6.8 8.5 9 15.5l2-5 2 5 2.2-7"
        stroke="#4D7C0F"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.7"
      />
    </svg>
  );
}

function FetchIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" {...props} fill="none" viewBox="0 0 24 24">
      <rect fill="#ECFEFF" height="20" rx="5" width="20" x="2" y="2" />
      <path
        d="M7 13.5c2.5-3.5 7.5-3.5 10 0M9 16c1.5-1.7 4.5-1.7 6 0M10.5 9h3"
        stroke="#0891B2"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function AxiosIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" {...props} fill="none" viewBox="0 0 24 24">
      <rect fill="#EEF2FF" height="20" rx="5" width="20" x="2" y="2" />
      <path
        d="m8 16 4-8 4 8M9.5 13h5"
        stroke="#4F46E5"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function PythonIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" {...props} fill="none" viewBox="0 0 24 24">
      <path
        d="M12 3h3.5A3.5 3.5 0 0 1 19 6.5V10h-7.5A2.5 2.5 0 0 0 9 12.5V14H5V8.5A3.5 3.5 0 0 1 8.5 5H12V3Z"
        fill="#2563EB"
      />
      <path
        d="M12 21H8.5A3.5 3.5 0 0 1 5 17.5V14h7.5A2.5 2.5 0 0 0 15 11.5V10h4v5.5a3.5 3.5 0 0 1-3.5 3.5H12v2Z"
        fill="#FACC15"
      />
      <circle cx="9" cy="8" fill="white" r="1" />
      <circle cx="15" cy="16" fill="#1F2937" r="1" />
    </svg>
  );
}

function RubyIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" {...props} fill="none" viewBox="0 0 24 24">
      <path d="m12 3 7 5-2.5 9H7.5L5 8l7-5Z" fill="#F87171" />
      <path d="m12 3 4.5 5H7.5L12 3Z" fill="#FCA5A5" />
      <path d="m9 17 3-9 3 9H9Z" fill="#B91C1C" />
    </svg>
  );
}

function PhpIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" {...props} fill="none" viewBox="0 0 24 24">
      <ellipse cx="12" cy="12" fill="#E0E7FF" rx="9" ry="6.5" />
      <path
        d="M7.5 12h1.8a1.7 1.7 0 1 0 0-3.4H7.5V15M12 8.6V15M12 11.6h2a1.7 1.7 0 1 0 0-3.4H12"
        stroke="#4338CA"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.3"
      />
    </svg>
  );
}

function GoIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" {...props} fill="none" viewBox="0 0 24 24">
      <rect fill="#ECFEFF" height="20" rx="5" width="20" x="2" y="2" />
      <path
        d="M7 12h6.5M14.5 12h2.5M8 9.2h7.5M8 14.8h7.5"
        stroke="#0891B2"
        strokeLinecap="round"
        strokeWidth="1.6"
      />
      <circle cx="17.5" cy="9.2" fill="#0891B2" r="0.9" />
      <circle cx="17.5" cy="14.8" fill="#0891B2" r="0.9" />
    </svg>
  );
}

function JavaIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" {...props} fill="none" viewBox="0 0 24 24">
      <rect fill="#FEF2F2" height="20" rx="5" width="20" x="2" y="2" />
      <path
        d="M12.5 6.5c2 1.7-2 2.4 0 4.2M9 17h6M8 14h8"
        stroke="#DC2626"
        strokeLinecap="round"
        strokeWidth="1.6"
      />
      <path
        d="M9 11h6v1.2a2.8 2.8 0 0 1-2.8 2.8h-.4A2.8 2.8 0 0 1 9 12.2V11Z"
        fill="#F97316"
      />
    </svg>
  );
}

function RustIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" {...props} fill="none" viewBox="0 0 24 24">
      <circle cx="12" cy="12" fill="#1F2937" r="9" />
      <circle cx="12" cy="12" fill="#F97316" r="3.2" />
      <path
        d="M12 6.2v1.3M16.1 7.9l-.9 1M17.8 12h-1.3M16.1 16.1l-.9-.9M12 17.8v-1.3M7.9 16.1l.9-.9M6.2 12h1.3M7.9 7.9l.9 1"
        stroke="#E5E7EB"
        strokeLinecap="round"
        strokeWidth="1.2"
      />
    </svg>
  );
}
