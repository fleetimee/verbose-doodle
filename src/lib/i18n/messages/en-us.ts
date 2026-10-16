import { aboutMessages } from "@/lib/i18n/messages/en-us/about";
import { authMessages } from "@/lib/i18n/messages/en-us/auth";
import { billersMessages } from "@/lib/i18n/messages/en-us/billers";
import { commonMessages } from "@/lib/i18n/messages/en-us/common";
import { cronParserMessages } from "@/lib/i18n/messages/en-us/cron-parser";
import { dateConverterMessages } from "@/lib/i18n/messages/en-us/date-converter";
import { developerToolsMessages } from "@/lib/i18n/messages/en-us/developer-tools";
import { employeesMessages } from "@/lib/i18n/messages/en-us/employees";
import { endpointsMessages } from "@/lib/i18n/messages/en-us/endpoints";
import { errorsMessages } from "@/lib/i18n/messages/en-us/errors";
import { hmacGeneratorMessages } from "@/lib/i18n/messages/en-us/hmac-generator";
import { iso8583GeneratorMessages } from "@/lib/i18n/messages/en-us/iso8583-generator";
import { iso8583ParserMessages } from "@/lib/i18n/messages/en-us/iso8583-parser";
import { jsonSchemaValidatorMessages } from "@/lib/i18n/messages/en-us/json-schema-validator";
import { jsonTextDiffMessages } from "@/lib/i18n/messages/en-us/json-text-diff";
import { jsonYamlConverterMessages } from "@/lib/i18n/messages/en-us/json-yaml-converter";
import { jwtInspectorMessages } from "@/lib/i18n/messages/en-us/jwt-inspector";
import { numberBaseConverterMessages } from "@/lib/i18n/messages/en-us/number-base-converter";
import { overviewMessages } from "@/lib/i18n/messages/en-us/overview";
import { retryBackoffCalculatorMessages } from "@/lib/i18n/messages/en-us/retry-backoff-calculator";
import { scheduleOverlapCheckerMessages } from "@/lib/i18n/messages/en-us/schedule-overlap-checker";
import { serversMessages } from "@/lib/i18n/messages/en-us/servers";
import { simulatorDbMessages } from "@/lib/i18n/messages/en-us/simulator-db";
import { socketTesterMessages } from "@/lib/i18n/messages/en-us/socket-tester";
import { socksRelayMessages } from "@/lib/i18n/messages/en-us/socks-relay";
import { themeMessages } from "@/lib/i18n/messages/en-us/theme";
import { usersMessages } from "@/lib/i18n/messages/en-us/users";

export const enUsMessages = {
  simulatorDb: simulatorDbMessages,
  hmacGenerator: hmacGeneratorMessages,
  jsonTextDiff: jsonTextDiffMessages,
  scheduleOverlapChecker: scheduleOverlapCheckerMessages,
  retryBackoffCalculator: retryBackoffCalculatorMessages,
  about: aboutMessages,
  auth: authMessages,
  billers: billersMessages,
  common: commonMessages,
  cronParser: cronParserMessages,
  dateConverter: dateConverterMessages,
  dashboardActivity: {
    visitDismissLabel: "Dismiss dashboard visit",
    visitIpFallback: "an unknown IP",
    visitMessages: [
      "Hi, {ip} is here.",
      "Psst—{ip} just dropped in.",
      "Knock knock—{ip} is at the door.",
      "Plot twist: {ip} joined the dashboard.",
      "Incoming! {ip} is on the scene.",
      "The dashboard has company: {ip}.",
    ],
  },
  developerTools: developerToolsMessages,
  employees: employeesMessages,
  endpoints: endpointsMessages,
  errors: errorsMessages,
  iso8583Generator: iso8583GeneratorMessages,
  iso8583Parser: iso8583ParserMessages,
  jsonSchemaValidator: jsonSchemaValidatorMessages,
  jsonYamlConverter: jsonYamlConverterMessages,
  jwtInspector: jwtInspectorMessages,
  numberBaseConverter: numberBaseConverterMessages,
  overview: overviewMessages,
  socketTester: socketTesterMessages,
  servers: serversMessages,
  socksRelay: socksRelayMessages,
  theme: themeMessages,
  users: usersMessages,
} as const;
