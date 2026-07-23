import type { ComponentType } from "react";
import {
  Binary,
  Braces,
  CalendarClock,
  CalendarDays,
  FileJson,
  Fingerprint,
  RefreshCw,
  ShieldCheck,
  Timer,
} from "@/components/hugeicons";
import { messages } from "@/lib/i18n";

export type DeveloperToolCategoryId =
  | "conversion"
  | "scheduling"
  | "validation";

export type DeveloperToolDocumentMeta = {
  readonly description: string;
  readonly keywords: readonly string[];
  readonly title: string;
};

export type DeveloperToolLoader = () => Promise<{
  readonly default: ComponentType;
}>;

export type DeveloperToolDefinition = {
  readonly categoryId: DeveloperToolCategoryId;
  readonly description: string;
  readonly document: DeveloperToolDocumentMeta;
  readonly icon: typeof ShieldCheck;
  readonly id: string;
  readonly limit: string;
  readonly load: DeveloperToolLoader;
  readonly name: string;
  readonly path: string;
  readonly runtime: string;
  readonly tags: readonly string[];
};

export type DeveloperToolCategory = {
  readonly icon: typeof ShieldCheck;
  readonly id: DeveloperToolCategoryId;
  readonly name: string;
  readonly tools: readonly DeveloperToolDefinition[];
};

type DeveloperToolIdentity = Pick<DeveloperToolDefinition, "id" | "path">;

export function assertDeveloperToolRegistry(
  tools: readonly DeveloperToolIdentity[]
): void {
  const ids = new Set<string>();
  const paths = new Set<string>();

  for (const tool of tools) {
    if (ids.has(tool.id)) {
      throw new Error(`Duplicate developer tool ID: ${tool.id}`);
    }
    if (paths.has(tool.path)) {
      throw new Error(`Duplicate developer tool path: ${tool.path}`);
    }
    ids.add(tool.id);
    paths.add(tool.path);
  }
}

export function getDeveloperToolHref(
  tool: Pick<DeveloperToolDefinition, "path">
) {
  return `/dashboard/${tool.path}`;
}

const CATEGORY_METADATA: readonly Omit<DeveloperToolCategory, "tools">[] = [
  {
    id: "validation",
    name: messages.developerTools.validationCategory,
    icon: ShieldCheck,
  },
  {
    id: "conversion",
    name: messages.developerTools.conversionCategory,
    icon: RefreshCw,
  },
  {
    id: "scheduling",
    name: messages.developerTools.schedulingCategory,
    icon: CalendarClock,
  },
];

const loadJsonSchemaValidator: DeveloperToolLoader = () =>
  import("@/pages/dashboard/json-schema-validator").then(
    ({ JsonSchemaValidatorPage }) => ({ default: JsonSchemaValidatorPage })
  );

const loadJwtInspector: DeveloperToolLoader = () =>
  import("@/pages/dashboard/jwt-inspector").then(({ JwtInspectorPage }) => ({
    default: JwtInspectorPage,
  }));

const loadDateConverter: DeveloperToolLoader = () =>
  import("@/pages/dashboard/date-converter").then(({ DateConverterPage }) => ({
    default: DateConverterPage,
  }));

const loadJsonYamlConverter: DeveloperToolLoader = () =>
  import("@/pages/dashboard/json-yaml-converter").then(
    ({ JsonYamlConverterPage }) => ({ default: JsonYamlConverterPage })
  );

const loadNumberBaseConverter: DeveloperToolLoader = () =>
  import("@/pages/dashboard/number-base-converter").then(
    ({ NumberBaseConverterPage }) => ({ default: NumberBaseConverterPage })
  );

const loadCronParser: DeveloperToolLoader = () =>
  import("@/pages/dashboard/cron-parser").then(({ CronParserPage }) => ({
    default: CronParserPage,
  }));

export const DEVELOPER_TOOLS: readonly DeveloperToolDefinition[] = [
  {
    categoryId: "validation",
    name: messages.jsonSchemaValidator.title,
    description: messages.developerTools.schemaValidatorDescription,
    document: {
      title: messages.jsonSchemaValidator.pageTitle,
      description: messages.jsonSchemaValidator.pageDescription,
      keywords: messages.jsonSchemaValidator.pageKeywords,
    },
    icon: Braces,
    id: "json-schema-validator",
    path: "developer-tools/json-schema-validator",
    load: loadJsonSchemaValidator,
    runtime: messages.developerTools.schemaValidatorRuntime,
    limit: messages.developerTools.schemaValidatorLimit,
    tags: messages.developerTools.schemaValidatorTags,
  },
  {
    categoryId: "validation",
    name: messages.jwtInspector.title,
    description: messages.developerTools.jwtInspectorDescription,
    document: {
      title: messages.jwtInspector.pageTitle,
      description: messages.jwtInspector.pageDescription,
      keywords: messages.jwtInspector.pageKeywords,
    },
    icon: Fingerprint,
    id: "jwt-inspector",
    path: "developer-tools/jwt-inspector",
    load: loadJwtInspector,
    runtime: messages.developerTools.jwtInspectorRuntime,
    limit: messages.developerTools.jwtInspectorLimit,
    tags: messages.developerTools.jwtInspectorTags,
  },
  {
    categoryId: "conversion",
    name: messages.dateConverter.title,
    description: messages.developerTools.dateConverterDescription,
    document: {
      title: messages.dateConverter.pageTitle,
      description: messages.dateConverter.pageDescription,
      keywords: messages.dateConverter.pageKeywords,
    },
    icon: CalendarDays,
    id: "date-converter",
    path: "developer-tools/date-converter",
    load: loadDateConverter,
    runtime: messages.developerTools.dateConverterRuntime,
    limit: messages.developerTools.dateConverterLimit,
    tags: messages.developerTools.dateConverterTags,
  },
  {
    categoryId: "conversion",
    name: messages.jsonYamlConverter.title,
    description: messages.developerTools.converterDescription,
    document: {
      title: messages.jsonYamlConverter.pageTitle,
      description: messages.jsonYamlConverter.pageDescription,
      keywords: messages.jsonYamlConverter.pageKeywords,
    },
    icon: FileJson,
    id: "json-yaml-converter",
    path: "developer-tools/json-yaml-converter",
    load: loadJsonYamlConverter,
    runtime: messages.developerTools.converterRuntime,
    limit: messages.developerTools.converterLimit,
    tags: messages.developerTools.converterTags,
  },
  {
    categoryId: "conversion",
    name: messages.numberBaseConverter.title,
    description: messages.developerTools.numberBaseConverterDescription,
    document: {
      title: messages.numberBaseConverter.pageTitle,
      description: messages.numberBaseConverter.pageDescription,
      keywords: messages.numberBaseConverter.pageKeywords,
    },
    icon: Binary,
    id: "number-base-converter",
    path: "developer-tools/number-base-converter",
    load: loadNumberBaseConverter,
    runtime: messages.developerTools.numberBaseConverterRuntime,
    limit: messages.developerTools.numberBaseConverterLimit,
    tags: messages.developerTools.numberBaseConverterTags,
  },
  {
    categoryId: "scheduling",
    name: messages.cronParser.title,
    description: messages.developerTools.cronParserDescription,
    document: {
      title: messages.cronParser.pageTitle,
      description: messages.cronParser.pageDescription,
      keywords: messages.cronParser.pageKeywords,
    },
    icon: Timer,
    id: "cron-parser",
    path: "developer-tools/cron-parser",
    load: loadCronParser,
    runtime: messages.developerTools.cronParserRuntime,
    limit: messages.developerTools.cronParserLimit,
    tags: messages.developerTools.cronParserTags,
  },
];

assertDeveloperToolRegistry(DEVELOPER_TOOLS);

export const DEVELOPER_TOOL_CATEGORIES: readonly DeveloperToolCategory[] =
  CATEGORY_METADATA.map((category) => ({
    ...category,
    tools: DEVELOPER_TOOLS.filter((tool) => tool.categoryId === category.id),
  }));

export const DEVELOPER_TOOL_COUNT = DEVELOPER_TOOLS.length;
