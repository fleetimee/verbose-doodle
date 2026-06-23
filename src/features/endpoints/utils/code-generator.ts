import type { EndpointResponse } from "@/features/endpoints/types";

export type CodeLanguage =
  | "curl"
  | "httpie"
  | "wget"
  | "javascript-fetch"
  | "javascript-axios"
  | "python"
  | "ruby"
  | "php"
  | "go"
  | "java"
  | "rust";

type GenerateCodeOptions = {
  baseUrl: string;
  path: string;
  method: string;
  response: EndpointResponse;
  token?: string;
};

const escapeShellArg = (arg: string): string =>
  `'${arg.replace(/'/g, "'\\''")}'`;

const METHODS_WITH_BODY = ["POST", "PUT", "PATCH"];

const hasRequestBody = (method: string): boolean =>
  METHODS_WITH_BODY.includes(method.toUpperCase());

const formatJsonBody = (response: EndpointResponse): string => {
  try {
    return JSON.stringify(JSON.parse(response.json), null, 2);
  } catch {
    return response.json;
  }
};

const asJsonLiteral = (value: string): string => JSON.stringify(value);

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

  if (hasRequestBody(method)) {
    lines.push(`  --data ${escapeShellArg(formatJsonBody(response))}`);
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

  if (hasRequestBody(method)) {
    const jsonLines = formatJsonBody(response).split("\n");
    lines.push("  \\");
    for (const jsonLine of jsonLines) {
      lines.push(`  ${jsonLine}`);
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

  if (hasRequestBody(method)) {
    lines.push(`  --body-data=${escapeShellArg(formatJsonBody(response))} \\`);
  }

  lines.push(`  ${escapeShellArg(url)}`);

  return lines.join("\n");
};

const generateJavascriptFetch = ({
  baseUrl,
  path,
  method,
  response,
  token,
}: GenerateCodeOptions): string => {
  const url = `${baseUrl}${path}`;
  const lines = [
    `const response = await fetch(${asJsonLiteral(url)}, {`,
    `  method: ${asJsonLiteral(method.toUpperCase())},`,
    "  headers: {",
    '    "content-type": "application/json",',
  ];

  if (token) {
    lines.push(`    authorization: ${asJsonLiteral(`Bearer ${token}`)},`);
  }

  lines.push("  },");

  if (hasRequestBody(method)) {
    lines.push(`  body: JSON.stringify(${formatJsonBody(response)}),`);
  }

  lines.push(
    "});",
    "",
    "const data = await response.json();",
    "console.log(data);"
  );

  return lines.join("\n");
};

const generateJavascriptAxios = ({
  baseUrl,
  path,
  method,
  response,
  token,
}: GenerateCodeOptions): string => {
  const url = `${baseUrl}${path}`;
  const lines = [
    'import axios from "axios";',
    "",
    "const { data } = await axios({",
    `  method: ${asJsonLiteral(method.toLowerCase())},`,
    `  url: ${asJsonLiteral(url)},`,
    "  headers: {",
    '    "content-type": "application/json",',
  ];

  if (token) {
    lines.push(`    authorization: ${asJsonLiteral(`Bearer ${token}`)},`);
  }

  lines.push("  },");

  if (hasRequestBody(method)) {
    lines.push(`  data: ${formatJsonBody(response)},`);
  }

  lines.push("});", "", "console.log(data);");

  return lines.join("\n");
};

const generatePython = ({
  baseUrl,
  path,
  method,
  response,
  token,
}: GenerateCodeOptions): string => {
  const url = `${baseUrl}${path}`;
  const lines = [
    "import requests",
    "",
    `url = ${asJsonLiteral(url)}`,
    'headers = {"content-type": "application/json"}',
  ];

  if (token) {
    lines.push(
      `headers["authorization"] = ${asJsonLiteral(`Bearer ${token}`)}`
    );
  }

  if (hasRequestBody(method)) {
    lines.push("", `payload = ${formatJsonBody(response)}`);
    lines.push(
      "",
      `response = requests.${method.toLowerCase()}(url, json=payload, headers=headers)`
    );
  } else {
    lines.push(
      "",
      `response = requests.${method.toLowerCase()}(url, headers=headers)`
    );
  }

  lines.push("print(response.json())");

  return lines.join("\n");
};

const generateRuby = ({
  baseUrl,
  path,
  method,
  response,
  token,
}: GenerateCodeOptions): string => {
  const url = `${baseUrl}${path}`;
  const lines = [
    'require "net/http"',
    'require "json"',
    "",
    `uri = URI(${asJsonLiteral(url)})`,
    `request = Net::HTTP::${method[0].toUpperCase()}${method.slice(1).toLowerCase()}.new(uri)`,
    'request["content-type"] = "application/json"',
  ];

  if (token) {
    lines.push(
      `request["authorization"] = ${asJsonLiteral(`Bearer ${token}`)}`
    );
  }

  if (hasRequestBody(method)) {
    lines.push(`request.body = ${asJsonLiteral(formatJsonBody(response))}`);
  }

  lines.push(
    "",
    'response = Net::HTTP.start(uri.hostname, uri.port, use_ssl: uri.scheme == "https") do |http|',
    "  http.request(request)",
    "end",
    "",
    "puts response.body"
  );

  return lines.join("\n");
};

const generatePhp = ({
  baseUrl,
  path,
  method,
  response,
  token,
}: GenerateCodeOptions): string => {
  const url = `${baseUrl}${path}`;
  const headers = ['"content-type: application/json"'];

  if (token) {
    headers.push(asJsonLiteral(`authorization: Bearer ${token}`));
  }

  const lines = [
    "<?php",
    `$curl = curl_init(${asJsonLiteral(url)});`,
    "",
    "curl_setopt_array($curl, [",
    "  CURLOPT_RETURNTRANSFER => true,",
    `  CURLOPT_CUSTOMREQUEST => ${asJsonLiteral(method.toUpperCase())},`,
    `  CURLOPT_HTTPHEADER => [${headers.join(", ")}],`,
  ];

  if (hasRequestBody(method)) {
    lines.push(
      `  CURLOPT_POSTFIELDS => ${asJsonLiteral(formatJsonBody(response))},`
    );
  }

  lines.push(
    "]);",
    "",
    "$response = curl_exec($curl);",
    "curl_close($curl);",
    "",
    "echo $response;"
  );

  return lines.join("\n");
};

const generateGo = ({
  baseUrl,
  path,
  method,
  response,
  token,
}: GenerateCodeOptions): string => {
  const url = `${baseUrl}${path}`;
  const body = hasRequestBody(method) ? formatJsonBody(response) : "";
  const reader = hasRequestBody(method) ? "strings.NewReader(payload)" : "nil";
  const lines = [
    "package main",
    "",
    "import (",
    '  "fmt"',
    '  "io"',
    '  "net/http"',
  ];

  if (hasRequestBody(method)) {
    lines.push('  "strings"');
  }

  lines.push(")", "", "func main() {");

  if (hasRequestBody(method)) {
    lines.push(`  payload := ${asJsonLiteral(body)}`);
  }

  lines.push(
    `  req, err := http.NewRequest(${asJsonLiteral(method.toUpperCase())}, ${asJsonLiteral(url)}, ${reader})`,
    "  if err != nil { panic(err) }",
    '  req.Header.Set("content-type", "application/json")'
  );

  if (token) {
    lines.push(
      `  req.Header.Set("authorization", ${asJsonLiteral(`Bearer ${token}`)})`
    );
  }

  lines.push(
    "",
    "  res, err := http.DefaultClient.Do(req)",
    "  if err != nil { panic(err) }",
    "  defer res.Body.Close()",
    "",
    "  body, err := io.ReadAll(res.Body)",
    "  if err != nil { panic(err) }",
    "  fmt.Println(string(body))",
    "}"
  );

  return lines.filter((line): line is string => line !== null).join("\n");
};

const generateJava = ({
  baseUrl,
  path,
  method,
  response,
  token,
}: GenerateCodeOptions): string => {
  const url = `${baseUrl}${path}`;
  const hasBody = hasRequestBody(method);
  const lines = ["OkHttpClient client = new OkHttpClient();", ""];

  if (hasBody) {
    lines.push(
      `RequestBody body = RequestBody.create(${asJsonLiteral(formatJsonBody(response))}, MediaType.parse("application/json"));`,
      ""
    );
  }

  lines.push(
    "Request request = new Request.Builder()",
    `  .url(${asJsonLiteral(url)})`,
    `  .method(${asJsonLiteral(method.toUpperCase())}, ${hasBody ? "body" : "null"})`,
    '  .addHeader("content-type", "application/json")'
  );

  if (token) {
    lines.push(
      `  .addHeader("authorization", ${asJsonLiteral(`Bearer ${token}`)})`
    );
  }

  lines.push(
    "  .build();",
    "",
    "try (Response response = client.newCall(request).execute()) {",
    "  System.out.println(response.body().string());",
    "}"
  );

  return lines.join("\n");
};

const generateRust = ({
  baseUrl,
  path,
  method,
  response,
  token,
}: GenerateCodeOptions): string => {
  const url = `${baseUrl}${path}`;
  const hasBody = hasRequestBody(method);
  const lines = [
    "use reqwest::Client;",
    "",
    "#[tokio::main]",
    "async fn main() -> Result<(), reqwest::Error> {",
    "  let client = Client::new();",
    `  let request = client.request(reqwest::Method::${method.toUpperCase()}, ${asJsonLiteral(url)})`,
    '    .header("content-type", "application/json")',
  ];

  if (token) {
    lines.push(
      `    .header("authorization", ${asJsonLiteral(`Bearer ${token}`)})`
    );
  }

  if (hasBody) {
    lines.push(`    .body(r#"${formatJsonBody(response)}"#)`);
  }

  lines.push(
    "    .send()",
    "    .await?;",
    "",
    "  let body = request.text().await?;",
    '  println!("{body}");',
    "",
    "  Ok(())",
    "}"
  );

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
    case "javascript-fetch":
      return generateJavascriptFetch(options);
    case "javascript-axios":
      return generateJavascriptAxios(options);
    case "python":
      return generatePython(options);
    case "ruby":
      return generateRuby(options);
    case "php":
      return generatePhp(options);
    case "go":
      return generateGo(options);
    case "java":
      return generateJava(options);
    case "rust":
      return generateRust(options);
    default:
      return "";
  }
};

export const CODE_LANGUAGE_LABELS: Record<CodeLanguage, string> = {
  curl: "cURL",
  httpie: "HTTPie",
  wget: "Wget",
  "javascript-fetch": "JavaScript Fetch",
  "javascript-axios": "JavaScript Axios",
  python: "Python Requests",
  ruby: "Ruby Net::HTTP",
  php: "PHP cURL",
  go: "Go net/http",
  java: "Java OkHttp",
  rust: "Rust reqwest",
};

export const getCodeLanguageForHighlight = (
  language?: CodeLanguage
): string => {
  switch (language) {
    case "javascript-fetch":
    case "javascript-axios":
      return "javascript";
    case "python":
      return "python";
    case "ruby":
      return "ruby";
    case "php":
      return "php";
    case "go":
      return "go";
    case "java":
      return "java";
    case "rust":
      return "rust";
    default:
      return "shell";
  }
};
