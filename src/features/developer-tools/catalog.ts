import type { ComponentType } from "react";
import {
  Binary,
  Braces,
  CalendarClock,
  CalendarDays,
  Code2,
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
  readonly searchDescription: string;
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

const CATEGORY_METADATA = [
  {
    icon: ShieldCheck,
    id: "validation" as const,
    get name() {
      return messages.developerTools.validationCategory;
    },
  },
  {
    icon: RefreshCw,
    id: "conversion" as const,
    get name() {
      return messages.developerTools.conversionCategory;
    },
  },
  {
    icon: CalendarClock,
    id: "scheduling" as const,
    get name() {
      return messages.developerTools.schedulingCategory;
    },
  },
  {
    icon: RadioReceiver,
    id: "inspection" as const,
    get name() {
      return messages.developerTools.inspectionCategory;
    },
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

const loadIso8583Generator: DeveloperToolLoader = () =>
  import("@/pages/dashboard/iso8583-generator").then(
    ({ Iso8583GeneratorPage }) => ({ default: Iso8583GeneratorPage })
  );

const loadIso8583Parser: DeveloperToolLoader = () =>
  import("@/pages/dashboard/iso8583-parser").then(({ Iso8583ParserPage }) => ({
    default: Iso8583ParserPage,
  }));

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
    get description() {
      return messages.developerTools.schemaValidatorDescription;
    },
    get document() {
      return {
        description: messages.jsonSchemaValidator.pageDescription,
        keywords: messages.jsonSchemaValidator.pageKeywords,
        title: messages.jsonSchemaValidator.pageTitle,
      };
    },
    icon: Braces,
    id: "json-schema-validator",
    get searchDescription() {
      return messages.developerTools.schemaValidatorSearchDescription;
    },
    get limit() {
      return messages.developerTools.schemaValidatorLimit;
    },
    load: loadJsonSchemaValidator,
    get name() {
      return messages.jsonSchemaValidator.title;
    },
    path: "developer-tools/json-schema-validator",
    get runtime() {
      return messages.developerTools.schemaValidatorRuntime;
    },
    get tags() {
      return messages.developerTools.schemaValidatorTags;
    },
  },
  {
    categoryId: "validation",
    get description() {
      return messages.developerTools.jwtInspectorDescription;
    },
    get document() {
      return {
        description: messages.jwtInspector.pageDescription,
        keywords: messages.jwtInspector.pageKeywords,
        title: messages.jwtInspector.pageTitle,
      };
    },
    icon: Fingerprint,
    id: "jwt-inspector",
    get searchDescription() {
      return messages.developerTools.jwtInspectorSearchDescription;
    },
    get limit() {
      return messages.developerTools.jwtInspectorLimit;
    },
    load: loadJwtInspector,
    get name() {
      return messages.jwtInspector.title;
    },
    path: "developer-tools/jwt-inspector",
    get runtime() {
      return messages.developerTools.jwtInspectorRuntime;
    },
    get tags() {
      return messages.developerTools.jwtInspectorTags;
    },
  },
  {
    categoryId: "conversion",
    get description() {
      return messages.developerTools.dateConverterDescription;
    },
    get document() {
      return {
        description: messages.dateConverter.pageDescription,
        keywords: messages.dateConverter.pageKeywords,
        title: messages.dateConverter.pageTitle,
      };
    },
    icon: CalendarDays,
    id: "date-converter",
    get searchDescription() {
      return messages.developerTools.dateConverterSearchDescription;
    },
    get limit() {
      return messages.developerTools.dateConverterLimit;
    },
    load: loadDateConverter,
    get name() {
      return messages.dateConverter.title;
    },
    path: "developer-tools/date-converter",
    get runtime() {
      return messages.developerTools.dateConverterRuntime;
    },
    get tags() {
      return messages.developerTools.dateConverterTags;
    },
  },
  {
    categoryId: "conversion",
    get description() {
      return messages.developerTools.iso8583GeneratorDescription;
    },
    get document() {
      return {
        description: messages.iso8583Generator.documentDescription,
        keywords: messages.iso8583Generator.documentKeywords,
        title: messages.iso8583Generator.title,
      };
    },
    icon: Code2,
    id: "iso8583-generator",
    get searchDescription() {
      return messages.developerTools.iso8583GeneratorSearchDescription;
    },
    get limit() {
      return messages.developerTools.iso8583GeneratorLimit;
    },
    load: loadIso8583Generator,
    get name() {
      return messages.iso8583Generator.title;
    },
    path: "developer-tools/iso8583-generator",
    get runtime() {
      return messages.developerTools.iso8583GeneratorRuntime;
    },
    get tags() {
      return messages.developerTools.iso8583GeneratorTags;
    },
  },
  {
    categoryId: "conversion",
    get description() {
      return messages.developerTools.converterDescription;
    },
    get document() {
      return {
        description: messages.jsonYamlConverter.pageDescription,
        keywords: messages.jsonYamlConverter.pageKeywords,
        title: messages.jsonYamlConverter.pageTitle,
      };
    },
    icon: FileJson,
    id: "json-yaml-converter",
    get searchDescription() {
      return messages.developerTools.converterSearchDescription;
    },
    get limit() {
      return messages.developerTools.converterLimit;
    },
    load: loadJsonYamlConverter,
    get name() {
      return messages.jsonYamlConverter.title;
    },
    path: "developer-tools/json-yaml-converter",
    get runtime() {
      return messages.developerTools.converterRuntime;
    },
    get tags() {
      return messages.developerTools.converterTags;
    },
  },
  {
    categoryId: "conversion",
    get description() {
      return messages.developerTools.numberBaseConverterDescription;
    },
    get document() {
      return {
        description: messages.numberBaseConverter.pageDescription,
        keywords: messages.numberBaseConverter.pageKeywords,
        title: messages.numberBaseConverter.pageTitle,
      };
    },
    icon: Binary,
    id: "number-base-converter",
    get searchDescription() {
      return messages.developerTools.numberBaseConverterSearchDescription;
    },
    get limit() {
      return messages.developerTools.numberBaseConverterLimit;
    },
    load: loadNumberBaseConverter,
    get name() {
      return messages.numberBaseConverter.title;
    },
    path: "developer-tools/number-base-converter",
    get runtime() {
      return messages.developerTools.numberBaseConverterRuntime;
    },
    get tags() {
      return messages.developerTools.numberBaseConverterTags;
    },
  },
  {
    categoryId: "scheduling",
    get description() {
      return messages.developerTools.cronParserDescription;
    },
    get document() {
      return {
        description: messages.cronParser.pageDescription,
        keywords: messages.cronParser.pageKeywords,
        title: messages.cronParser.pageTitle,
      };
    },
    icon: Timer,
    id: "cron-parser",
    get searchDescription() {
      return messages.developerTools.cronParserSearchDescription;
    },
    get limit() {
      return messages.developerTools.cronParserLimit;
    },
    load: loadCronParser,
    get name() {
      return messages.cronParser.title;
    },
    path: "developer-tools/cron-parser",
    get runtime() {
      return messages.developerTools.cronParserRuntime;
    },
    get tags() {
      return messages.developerTools.cronParserTags;
    },
  },
  {
    categoryId: "inspection",
    get description() {
      return messages.developerTools.nfcReaderCatalogDescription;
    },
    get document() {
      return {
        description: messages.developerTools.nfcReaderDocumentDescription,
        keywords: messages.developerTools.nfcReaderDocumentKeywords,
        title: messages.developerTools.nfcReaderDocumentTitle,
      };
    },
    icon: RadioReceiver,
    id: "nfc-reader-inspector",
    get searchDescription() {
      return messages.developerTools.nfcReaderSearchDescription;
    },
    get limit() {
      return messages.developerTools.nfcReaderLimit;
    },
    load: loadNfcReaderInspector,
    get name() {
      return messages.developerTools.nfcReaderName;
    },
    path: "developer-tools/nfc-reader-inspector",
    get runtime() {
      return messages.developerTools.nfcReaderRuntime;
    },
    get tags() {
      return messages.developerTools.nfcReaderTags;
    },
  },
  {
    categoryId: "inspection",
    get description() {
      return messages.developerTools.iso8583ParserDescription;
    },
    get document() {
      return {
        description: messages.iso8583Parser.documentDescription,
        keywords: messages.iso8583Parser.documentKeywords,
        title: messages.iso8583Parser.documentTitle,
      };
    },
    icon: Binary,
    id: "iso8583-parser",
    get limit() {
      return messages.developerTools.iso8583ParserLimit;
    },
    load: loadIso8583Parser,
    get name() {
      return messages.iso8583Parser.title;
    },
    path: "developer-tools/iso8583-parser",
    get runtime() {
      return messages.developerTools.iso8583ParserRuntime;
    },
    get searchDescription() {
      return messages.developerTools.iso8583ParserSearchDescription;
    },
    get tags() {
      return messages.developerTools.iso8583ParserTags;
    },
  },
];

assertDeveloperToolRegistry(DEVELOPER_TOOLS);

export const DEVELOPER_TOOL_CATEGORIES: readonly DeveloperToolCategory[] =
  CATEGORY_METADATA.map((category) => ({
    icon: category.icon,
    id: category.id,
    get name() {
      return category.name;
    },
    tools: DEVELOPER_TOOLS.filter((tool) => tool.categoryId === category.id),
  }));

export const DEVELOPER_TOOL_COUNT = DEVELOPER_TOOLS.length;
