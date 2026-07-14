import { aboutMessages } from "@/lib/i18n/messages/en-us/about";
import { authMessages } from "@/lib/i18n/messages/en-us/auth";
import { commonMessages } from "@/lib/i18n/messages/en-us/common";
import { cronParserMessages } from "@/lib/i18n/messages/en-us/cron-parser";
import { developerToolsMessages } from "@/lib/i18n/messages/en-us/developer-tools";
import { endpointsMessages } from "@/lib/i18n/messages/en-us/endpoints";
import { errorsMessages } from "@/lib/i18n/messages/en-us/errors";
import { jsonSchemaValidatorMessages } from "@/lib/i18n/messages/en-us/json-schema-validator";
import { jsonYamlConverterMessages } from "@/lib/i18n/messages/en-us/json-yaml-converter";
import { overviewMessages } from "@/lib/i18n/messages/en-us/overview";
import { socketTesterMessages } from "@/lib/i18n/messages/en-us/socket-tester";
import { socksRelayMessages } from "@/lib/i18n/messages/en-us/socks-relay";
import { themeMessages } from "@/lib/i18n/messages/en-us/theme";
import { usersMessages } from "@/lib/i18n/messages/en-us/users";

export const enUsMessages = {
  common: commonMessages,
  cronParser: cronParserMessages,
  developerTools: developerToolsMessages,
  about: aboutMessages,
  errors: errorsMessages,
  auth: authMessages,
  theme: themeMessages,
  users: usersMessages,
  overview: overviewMessages,
  endpoints: endpointsMessages,
  jsonSchemaValidator: jsonSchemaValidatorMessages,
  jsonYamlConverter: jsonYamlConverterMessages,
  socketTester: socketTesterMessages,
  socksRelay: socksRelayMessages,
} as const;
