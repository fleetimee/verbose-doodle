import type { LucideIcon } from "lucide-react";
import {
  Binary,
  Braces,
  CalendarClock,
  CalendarDays,
  FileJson,
  RefreshCw,
  ShieldCheck,
  Timer,
} from "lucide-react";
import { messages } from "@/lib/i18n";

export type DeveloperToolDefinition = {
  readonly description: string;
  readonly href: string;
  readonly icon: LucideIcon;
  readonly limit: string;
  readonly name: string;
  readonly runtime: string;
  readonly tags: readonly string[];
};

export type DeveloperToolCategory = {
  readonly id: "conversion" | "scheduling" | "validation";
  readonly icon: LucideIcon;
  readonly name: string;
  readonly tools: readonly DeveloperToolDefinition[];
};

export const DEVELOPER_TOOL_CATEGORIES: readonly DeveloperToolCategory[] = [
  {
    id: "validation",
    name: messages.developerTools.validationCategory,
    icon: ShieldCheck,
    tools: [
      {
        name: messages.jsonSchemaValidator.title,
        description: messages.developerTools.schemaValidatorDescription,
        href: "/dashboard/developer-tools/json-schema-validator",
        icon: Braces,
        runtime: messages.developerTools.schemaValidatorRuntime,
        limit: messages.developerTools.schemaValidatorLimit,
        tags: messages.developerTools.schemaValidatorTags,
      },
    ],
  },
  {
    id: "conversion",
    name: messages.developerTools.conversionCategory,
    icon: RefreshCw,
    tools: [
      {
        name: messages.dateConverter.title,
        description: messages.developerTools.dateConverterDescription,
        href: "/dashboard/developer-tools/date-converter",
        icon: CalendarDays,
        runtime: messages.developerTools.dateConverterRuntime,
        limit: messages.developerTools.dateConverterLimit,
        tags: messages.developerTools.dateConverterTags,
      },
      {
        name: messages.jsonYamlConverter.title,
        description: messages.developerTools.converterDescription,
        href: "/dashboard/developer-tools/json-yaml-converter",
        icon: FileJson,
        runtime: messages.developerTools.converterRuntime,
        limit: messages.developerTools.converterLimit,
        tags: messages.developerTools.converterTags,
      },
      {
        name: messages.numberBaseConverter.title,
        description: messages.developerTools.numberBaseConverterDescription,
        href: "/dashboard/developer-tools/number-base-converter",
        icon: Binary,
        runtime: messages.developerTools.numberBaseConverterRuntime,
        limit: messages.developerTools.numberBaseConverterLimit,
        tags: messages.developerTools.numberBaseConverterTags,
      },
    ],
  },
  {
    id: "scheduling",
    name: messages.developerTools.schedulingCategory,
    icon: CalendarClock,
    tools: [
      {
        name: messages.cronParser.title,
        description: messages.developerTools.cronParserDescription,
        href: "/dashboard/developer-tools/cron-parser",
        icon: Timer,
        runtime: messages.developerTools.cronParserRuntime,
        limit: messages.developerTools.cronParserLimit,
        tags: messages.developerTools.cronParserTags,
      },
    ],
  },
];

export const DEVELOPER_TOOL_COUNT = DEVELOPER_TOOL_CATEGORIES.reduce(
  (count, category) => count + category.tools.length,
  0
);
