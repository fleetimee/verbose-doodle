import type { SVGProps } from "react";
import { Postman } from "@/components/ui/svgs/postman";
import { cn } from "@/lib/utils";

type UserAgentClient =
  | "axios"
  | "browser"
  | "curl"
  | "fetch"
  | "httpie"
  | "insomnia"
  | "java"
  | "postman"
  | "python"
  | "unknown";

type UserAgentClientBadgeProps = {
  readonly userAgent: string | null;
  readonly className?: string;
};

const CLIENT_LABELS: Record<UserAgentClient, string> = {
  axios: "Axios",
  browser: "Browser",
  curl: "cURL",
  fetch: "Fetch",
  httpie: "HTTPie",
  insomnia: "Insomnia",
  java: "Java",
  postman: "Postman",
  python: "Python",
  unknown: "Client",
};

function getUserAgentClient(userAgent: string | null): UserAgentClient {
  const normalized = userAgent?.toLowerCase() ?? "";

  if (normalized.includes("postman")) {
    return "postman";
  }
  if (normalized.includes("curl")) {
    return "curl";
  }
  if (normalized.includes("httpie")) {
    return "httpie";
  }
  if (normalized.includes("insomnia")) {
    return "insomnia";
  }
  if (normalized.includes("axios")) {
    return "axios";
  }
  if (normalized.includes("node-fetch") || normalized.includes("undici")) {
    return "fetch";
  }
  if (
    normalized.includes("python-requests") ||
    normalized.includes("aiohttp")
  ) {
    return "python";
  }
  if (normalized.includes("java") || normalized.includes("okhttp")) {
    return "java";
  }
  if (
    normalized.includes("mozilla") ||
    normalized.includes("chrome") ||
    normalized.includes("safari") ||
    normalized.includes("firefox") ||
    normalized.includes("edg/")
  ) {
    return "browser";
  }

  return "unknown";
}

export function UserAgentClientBadge({
  userAgent,
  className,
}: UserAgentClientBadgeProps) {
  const client = getUserAgentClient(userAgent);
  const label = CLIENT_LABELS[client];

  return (
    <span
      className={cn(
        "inline-flex min-w-0 items-center gap-2 rounded-md border border-slate-300 bg-white/80 px-2 py-1 font-medium text-slate-700 text-xs shadow-xs dark:border-[#344156] dark:bg-[#0b1020]/70 dark:text-slate-200",
        className
      )}
      title={userAgent ?? undefined}
    >
      <UserAgentIcon className="size-4 shrink-0" client={client} />
      <span className="truncate">{label}</span>
    </span>
  );
}

function UserAgentIcon({
  client,
  className,
}: {
  readonly client: UserAgentClient;
  readonly className?: string;
}) {
  switch (client) {
    case "postman":
      return <Postman aria-hidden="true" className={className} />;
    case "curl":
      return <CurlIcon className={className} />;
    case "httpie":
      return <HttpieIcon className={className} />;
    case "insomnia":
      return <InsomniaIcon className={className} />;
    case "axios":
      return <AxiosIcon className={className} />;
    case "fetch":
      return <FetchIcon className={className} />;
    case "python":
      return <PythonIcon className={className} />;
    case "java":
      return <JavaIcon className={className} />;
    case "browser":
      return <BrowserIcon className={className} />;
    case "unknown":
      return <ApiClientIcon className={className} />;
    default:
      return <ApiClientIcon className={className} />;
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

function InsomniaIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" {...props} fill="none" viewBox="0 0 24 24">
      <circle cx="12" cy="12" fill="#5B21B6" r="10" />
      <path
        d="M16.8 13.4A4.7 4.7 0 0 1 8 10.8 4.7 4.7 0 1 0 16.8 13.4Z"
        fill="#DDD6FE"
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

function BrowserIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" {...props} fill="none" viewBox="0 0 24 24">
      <rect fill="#F8FAFC" height="18" rx="4" width="20" x="2" y="3" />
      <path d="M2 8h20" stroke="#CBD5E1" strokeWidth="1.5" />
      <circle cx="6" cy="5.8" fill="#EF4444" r="1" />
      <circle cx="9" cy="5.8" fill="#F59E0B" r="1" />
      <circle cx="12" cy="5.8" fill="#22C55E" r="1" />
      <path
        d="M8 14h8M10 17h4"
        stroke="#334155"
        strokeLinecap="round"
        strokeWidth="1.6"
      />
    </svg>
  );
}

function ApiClientIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" {...props} fill="none" viewBox="0 0 24 24">
      <rect fill="#E2E8F0" height="20" rx="5" width="20" x="2" y="2" />
      <path
        d="M8 9h8M8 12h5M8 15h8"
        stroke="#475569"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}
