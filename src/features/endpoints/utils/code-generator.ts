import type { EndpointResponse } from "@/features/endpoints/types";

export type CodeLanguage = "curl" | "httpie" | "wget";

type GenerateCodeOptions = {
  baseUrl: string;
  path: string;
  method: string;
  response: EndpointResponse;
  token?: string;
};

const escapeShellArg = (arg: string): string =>
  `'${arg.replace(/'/g, "'\\''")}'`;

const generateCurl = ({
  baseUrl,
  path,
  method,
  response,
  token,
}: GenerateCodeOptions): string => {
  const url = `${baseUrl}${path}`;
  const lines: string[] = [`curl --request ${method} \\`];
  lines.push(`  --url ${escapeShellArg(url)} \\`);

  if (token) {
    lines.push(
      `  --header ${escapeShellArg(`authorization: Bearer ${token}`)} \\`
    );
  }

  lines.push("  --header 'content-type: application/json' \\");

  // Add request body for POST, PUT, PATCH methods
  if (["POST", "PUT", "PATCH"].includes(method.toUpperCase())) {
    try {
      const parsed = JSON.parse(response.json);
      const jsonString = JSON.stringify(parsed, null, 2);
      lines.push(`  --data ${escapeShellArg(jsonString)}`);
    } catch {
      lines.push(`  --data ${escapeShellArg(response.json)}`);
    }
  } else {
    // Remove trailing backslash from last line if no data
    const lastLine = lines.at(-1);
    if (lastLine) {
      lines[lines.length - 1] = lastLine.replace(" \\", "");
    }
  }

  return lines.join("\n");
};

const generateHttpie = ({
  baseUrl,
  path,
  method,
  response,
  token,
}: GenerateCodeOptions): string => {
  const url = `${baseUrl}${path}`;
  const lines: string[] = [`http ${method} ${escapeShellArg(url)}`];

  if (token) {
    lines.push(`  "authorization: Bearer ${token}"`);
  }

  lines.push('  "content-type: application/json"');

  // Add request body for POST, PUT, PATCH methods
  if (["POST", "PUT", "PATCH"].includes(method.toUpperCase())) {
    try {
      const parsed = JSON.parse(response.json);
      const jsonLines = JSON.stringify(parsed, null, 2).split("\n");
      lines.push("  \\");
      for (const jsonLine of jsonLines) {
        lines.push(`  ${jsonLine}`);
      }
    } catch {
      lines.push("  \\");
      lines.push(`  ${response.json}`);
    }
  }

  return lines.join("\n");
};

const generateWget = ({
  baseUrl,
  path,
  method,
  response,
  token,
}: GenerateCodeOptions): string => {
  const url = `${baseUrl}${path}`;
  const lines: string[] = [`wget --method=${method} \\`];

  if (token) {
    lines.push(
      `  --header=${escapeShellArg(`authorization: Bearer ${token}`)} \\`
    );
  }

  lines.push("  --header='content-type: application/json' \\");

  // Add request body for POST, PUT, PATCH methods
  if (["POST", "PUT", "PATCH"].includes(method.toUpperCase())) {
    try {
      const parsed = JSON.parse(response.json);
      const jsonString = JSON.stringify(parsed, null, 2);
      lines.push(`  --body-data=${escapeShellArg(jsonString)} \\`);
    } catch {
      lines.push(`  --body-data=${escapeShellArg(response.json)} \\`);
    }
  }

  lines.push(`  ${escapeShellArg(url)}`);

  return lines.join("\n");
};

export const generateCode = (
  language: CodeLanguage,
  options: GenerateCodeOptions
): string => {
  switch (language) {
    case "curl":
      return generateCurl(options);
    case "httpie":
      return generateHttpie(options);
    case "wget":
      return generateWget(options);
    default:
      return "";
  }
};

export const CODE_LANGUAGE_LABELS: Record<CodeLanguage, string> = {
  curl: "cURL",
  httpie: "HTTPie",
  wget: "Wget",
};

export const getCodeLanguageForHighlight = (_language?: CodeLanguage): string => "shell";
