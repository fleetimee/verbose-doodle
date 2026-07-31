import type { ComponentType } from "react";
import {
  Binary,
  Braces,
  CalendarClock,
  CalendarDays,
  FileJson,
  Fingerprint,
  RadioReceiver,
  RefreshCw,
  ShieldCheck,
  Timer,
} from "@/components/hugeicons";
import { messages } from "@/lib/i18n";

export type DeveloperToolCategoryId =
  | "conversion"
  | "inspection"
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
    icon: ShieldCheck,
    id: "validation",
    name: messages.developerTools.validationCategory,
  },
  {
    icon: RefreshCw,
    id: "conversion",
    name: messages.developerTools.conversionCategory,
  },
  {
    icon: CalendarClock,
    id: "scheduling",
    name: messages.developerTools.schedulingCategory,
  },
  {
    icon: RadioReceiver,
    id: "inspection",
    name: messages.developerTools.inspectionCategory,
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

const loadNfcReaderInspector: DeveloperToolLoader = () =>
  import("@/pages/dashboard/nfc-reader-inspector").then(
    ({ NfcReaderInspectorPage }) => ({ default: NfcReaderInspectorPage })
  );

export const DEVELOPER_TOOLS: readonly DeveloperToolDefinition[] = [
  {
    categoryId: "validation",
    description: messages.developerTools.schemaValidatorDescription,
    document: {
      description: messages.jsonSchemaValidator.pageDescription,
      keywords: messages.jsonSchemaValidator.pageKeywords,
      title: messages.jsonSchemaValidator.pageTitle,
    },
    icon: Braces,
    id: "json-schema-validator",
    limit: messages.developerTools.schemaValidatorLimit,
    load: loadJsonSchemaValidator,
    name: messages.jsonSchemaValidator.title,
    path: "developer-tools/json-schema-validator",
    runtime: messages.developerTools.schemaValidatorRuntime,
    tags: messages.developerTools.schemaValidatorTags,
  },
  {
    categoryId: "validation",
    description: messages.developerTools.jwtInspectorDescription,
    document: {
      description: messages.jwtInspector.pageDescription,
      keywords: messages.jwtInspector.pageKeywords,
      title: messages.jwtInspector.pageTitle,
    },
    icon: Fingerprint,
    id: "jwt-inspector",
    limit: messages.developerTools.jwtInspectorLimit,
    load: loadJwtInspector,
    name: messages.jwtInspector.title,
    path: "developer-tools/jwt-inspector",
    runtime: messages.developerTools.jwtInspectorRuntime,
    tags: messages.developerTools.jwtInspectorTags,
  },
  {
    categoryId: "conversion",
    description: messages.developerTools.dateConverterDescription,
    document: {
      description: messages.dateConverter.pageDescription,
      keywords: messages.dateConverter.pageKeywords,
      title: messages.dateConverter.pageTitle,
    },
    icon: CalendarDays,
    id: "date-converter",
    limit: messages.developerTools.dateConverterLimit,
    load: loadDateConverter,
    name: messages.dateConverter.title,
    path: "developer-tools/date-converter",
    runtime: messages.developerTools.dateConverterRuntime,
    tags: messages.developerTools.dateConverterTags,
  },
  {
    categoryId: "conversion",
    description: messages.developerTools.converterDescription,
    document: {
      description: messages.jsonYamlConverter.pageDescription,
      keywords: messages.jsonYamlConverter.pageKeywords,
      title: messages.jsonYamlConverter.pageTitle,
    },
    icon: FileJson,
    id: "json-yaml-converter",
    limit: messages.developerTools.converterLimit,
    load: loadJsonYamlConverter,
    name: messages.jsonYamlConverter.title,
    path: "developer-tools/json-yaml-converter",
    runtime: messages.developerTools.converterRuntime,
    tags: messages.developerTools.converterTags,
  },
  {
    categoryId: "conversion",
    description: messages.developerTools.numberBaseConverterDescription,
    document: {
      description: messages.numberBaseConverter.pageDescription,
      keywords: messages.numberBaseConverter.pageKeywords,
      title: messages.numberBaseConverter.pageTitle,
    },
    icon: Binary,
    id: "number-base-converter",
    limit: messages.developerTools.numberBaseConverterLimit,
    load: loadNumberBaseConverter,
    name: messages.numberBaseConverter.title,
    path: "developer-tools/number-base-converter",
    runtime: messages.developerTools.numberBaseConverterRuntime,
    tags: messages.developerTools.numberBaseConverterTags,
  },
  {
    categoryId: "scheduling",
    description: messages.developerTools.cronParserDescription,
    document: {
      description: messages.cronParser.pageDescription,
      keywords: messages.cronParser.pageKeywords,
      title: messages.cronParser.pageTitle,
    },
    icon: Timer,
    id: "cron-parser",
    limit: messages.developerTools.cronParserLimit,
    load: loadCronParser,
    name: messages.cronParser.title,
    path: "developer-tools/cron-parser",
    runtime: messages.developerTools.cronParserRuntime,
    tags: messages.developerTools.cronParserTags,
  },
  {
    categoryId: "inspection",
    description: messages.developerTools.nfcReaderCatalogDescription,
    document: {
      description: messages.developerTools.nfcReaderDocumentDescription,
      keywords: messages.developerTools.nfcReaderDocumentKeywords,
      title: messages.developerTools.nfcReaderDocumentTitle,
    },
    icon: RadioReceiver,
    id: "nfc-reader-inspector",
    limit: messages.developerTools.nfcReaderLimit,
    load: loadNfcReaderInspector,
    name: messages.developerTools.nfcReaderName,
    path: "developer-tools/nfc-reader-inspector",
    runtime: messages.developerTools.nfcReaderRuntime,
    tags: messages.developerTools.nfcReaderTags,
  },
];

assertDeveloperToolRegistry(DEVELOPER_TOOLS);

export const DEVELOPER_TOOL_CATEGORIES: readonly DeveloperToolCategory[] =
  CATEGORY_METADATA.map((category) => ({
    ...category,
    tools: DEVELOPER_TOOLS.filter((tool) => tool.categoryId === category.id),
  }));

export const DEVELOPER_TOOL_COUNT = DEVELOPER_TOOLS.length;
