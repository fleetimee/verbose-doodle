import { enUsMessages } from "@/lib/i18n/messages/en-us";
import { aboutMessages as idAboutMessages } from "@/lib/i18n/messages/id-id/about";
import { authMessages as idAuthMessages } from "@/lib/i18n/messages/id-id/auth";
import { billersMessages as idBillersMessages } from "@/lib/i18n/messages/id-id/billers";
import { commonMessages as idCommonMessages } from "@/lib/i18n/messages/id-id/common";
import { cronParserMessages as idCronParserMessages } from "@/lib/i18n/messages/id-id/cron-parser";
import { dateConverterMessages as idDateConverterMessages } from "@/lib/i18n/messages/id-id/date-converter";
import { developerToolsMessages as idDeveloperToolsMessages } from "@/lib/i18n/messages/id-id/developer-tools";
import { employeesMessages as idEmployeesMessages } from "@/lib/i18n/messages/id-id/employees";
import { endpointsMessages as idEndpointsMessages } from "@/lib/i18n/messages/id-id/endpoints";
import { errorsMessages as idErrorsMessages } from "@/lib/i18n/messages/id-id/errors";
import { hmacGeneratorMessages } from "@/lib/i18n/messages/id-id/hmac-generator";
import { iso8583GeneratorMessages as idIso8583GeneratorMessages } from "@/lib/i18n/messages/id-id/iso8583-generator";
import { iso8583ParserMessages as idIso8583ParserMessages } from "@/lib/i18n/messages/id-id/iso8583-parser";
import { jsonSchemaValidatorMessages as idJsonSchemaValidatorMessages } from "@/lib/i18n/messages/id-id/json-schema-validator";
import { jsonTextDiffMessages } from "@/lib/i18n/messages/id-id/json-text-diff";
import { jsonYamlConverterMessages as idJsonYamlConverterMessages } from "@/lib/i18n/messages/id-id/json-yaml-converter";
import { jwtInspectorMessages as idJwtInspectorMessages } from "@/lib/i18n/messages/id-id/jwt-inspector";
import { numberBaseConverterMessages as idNumberBaseConverterMessages } from "@/lib/i18n/messages/id-id/number-base-converter";
import { overviewMessages as idOverviewMessages } from "@/lib/i18n/messages/id-id/overview";
import { retryBackoffCalculatorMessages } from "@/lib/i18n/messages/id-id/retry-backoff-calculator";
import { scheduleOverlapCheckerMessages } from "@/lib/i18n/messages/id-id/schedule-overlap-checker";
import { serversMessages as idServersMessages } from "@/lib/i18n/messages/id-id/servers";
import { socketTesterMessages as idSocketTesterMessages } from "@/lib/i18n/messages/id-id/socket-tester";
import { socksRelayMessages as idSocksRelayMessages } from "@/lib/i18n/messages/id-id/socks-relay";
import { themeMessages as idThemeMessages } from "@/lib/i18n/messages/id-id/theme";
import { usersMessages as idUsersMessages } from "@/lib/i18n/messages/id-id/users";

export const idIdMessages = {
  ...enUsMessages,
  employees: idEmployeesMessages,
  hmacGenerator: hmacGeneratorMessages,
  jsonTextDiff: jsonTextDiffMessages,
  scheduleOverlapChecker: scheduleOverlapCheckerMessages,
  retryBackoffCalculator: retryBackoffCalculatorMessages,
  about: idAboutMessages,
  auth: idAuthMessages,
  billers: idBillersMessages,
  common: idCommonMessages,
  cronParser: idCronParserMessages,
  dashboardActivity: {
    visitDismissLabel: "Tutup notifikasi kunjungan dashboard",
    visitIpFallback: "IP tidak dikenal",
    visitMessages: [
      "Hai, {ip} sedang berkunjung.",
      "Psst—{ip} baru saja masuk.",
      "Knock knock—{ip} ada di dashboard.",
      "Plot twist: {ip} bergabung ke dashboard.",
      "Incoming! {ip} sedang aktif.",
      "Dashboard sedang dikunjungi oleh {ip}.",
    ],
  },
  dateConverter: idDateConverterMessages,
  developerTools: idDeveloperToolsMessages,
  endpoints: idEndpointsMessages,
  errors: idErrorsMessages,
  iso8583Generator: idIso8583GeneratorMessages,
  iso8583Parser: idIso8583ParserMessages,
  jsonSchemaValidator: idJsonSchemaValidatorMessages,
  jsonYamlConverter: idJsonYamlConverterMessages,
  jwtInspector: idJwtInspectorMessages,
  numberBaseConverter: idNumberBaseConverterMessages,
  overview: idOverviewMessages,
  socketTester: idSocketTesterMessages,
  servers: idServersMessages,
  socksRelay: idSocksRelayMessages,
  theme: idThemeMessages,
  users: idUsersMessages,
} as const;
