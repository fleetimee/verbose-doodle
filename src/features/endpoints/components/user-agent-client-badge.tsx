import {
  Chrome,
  Insomnia,
  Java,
  JavaScript,
  Postman,
  Python,
} from "developer-icons";
import { SiAxios, SiCurl, SiHttpie, SiOpenapiinitiative } from "react-icons/si";
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

const CLIENT_ICONS = {
  axios: SiAxios,
  browser: Chrome,
  curl: SiCurl,
  fetch: JavaScript,
  httpie: SiHttpie,
  insomnia: Insomnia,
  java: Java,
  postman: Postman,
  python: Python,
  unknown: SiOpenapiinitiative,
} satisfies Record<UserAgentClient, unknown>;

const CLIENT_ICON_COLORS: Record<UserAgentClient, string> = {
  axios: "#5a29e4",
  browser: "#4285f4",
  curl: "#073551",
  fetch: "#f7df1e",
  httpie: "#111827",
  insomnia: "#4000bf",
  java: "#5382a1",
  postman: "#ff6c37",
  python: "#3776ab",
  unknown: "#6ba539",
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
  const Icon = CLIENT_ICONS[client];

  return (
    <Icon
      aria-hidden="true"
      className={className}
      color={CLIENT_ICON_COLORS[client]}
    />
  );
}
