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
import { logViewerMessages } from "@/lib/i18n/messages/en-us/log-viewer";
import { numberBaseConverterMessages } from "@/lib/i18n/messages/en-us/number-base-converter";
import { overviewMessages } from "@/lib/i18n/messages/en-us/overview";
import { qrisTapReaderMessages } from "@/lib/i18n/messages/en-us/qris-tap-reader";
import { retryBackoffCalculatorMessages } from "@/lib/i18n/messages/en-us/retry-backoff-calculator";
import { scheduleOverlapCheckerMessages } from "@/lib/i18n/messages/en-us/schedule-overlap-checker";
import { serversMessages } from "@/lib/i18n/messages/en-us/servers";
import { simulatorDbMessages } from "@/lib/i18n/messages/en-us/simulator-db";
import { socketTesterMessages } from "@/lib/i18n/messages/en-us/socket-tester";
import { socksRelayMessages } from "@/lib/i18n/messages/en-us/socks-relay";
import { tempFilesMessages } from "@/lib/i18n/messages/en-us/temp-files";
import { textCryptoMessages } from "@/lib/i18n/messages/en-us/text-crypto";
import { themeMessages } from "@/lib/i18n/messages/en-us/theme";
import { usersMessages } from "@/lib/i18n/messages/en-us/users";
import { wheelMessages } from "@/lib/i18n/messages/en-us/wheel";

export const enUsMessages = {
  tempFiles: tempFilesMessages,
  textCrypto: textCryptoMessages,
  qrisTapReader: qrisTapReaderMessages,
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
    leftMessages: [
      "{ip} has left the workspace.",
      "{ip} signed off. Catch you later!",
      "And… {ip} has left the building.",
      "{ip} called it a day.",
      "{ip} stepped out of the workspace.",
      "See you next time, {ip}.",
      "{ip} went offline. Until next time!",
      "One less tab in the workspace: {ip} is offline.",
    ],
    sleepingMessages: [
      "{ip} locked their screen.",
      "{ip} is taking a screen break.",
      "Screen locked. {ip} will be back.",
      "{ip} put their workspace on pause.",
      "A little downtime for {ip}: screen locked.",
      "{ip} stepped away with their screen locked.",
      "{ip} hit pause. The screen is locked.",
      "The workspace can wait: {ip} locked their screen.",
    ],
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
    presence: {
      stickers: {
        open: "Send a mascot sticker",
        title: "Stickers",
        labels: {
          hello: "Hello",
          bye: "Goodbye",
          thanks: "Thank you",
          ok: "OK",
          yes: "Yes",
          nope: "No",
          lol: "Laughing",
          love: "Love it",
          wow: "Wow",
          confused: "Confused",
          thinking: "Thinking",
        },
      },
      triggerLabel: "Online visitors ({count})",
      title: "Chat",
      description:
        "IP addresses currently visiting the workspace, their live page activity, and recent history.",
      onlineSection: "Currently online",
      recentSection: "Last online",
      onlineBadge: "Online",
      sleepingBadge: "Sleeping",
      offlineBadge: "Offline",
      youBadge: "You",
      activeSessions: "{count} active sessions",
      activeSessionSingle: "1 active session",
      lastOnlineLabel: "Last online {time}",
      activeNowLabel: "Active now",
      sleepingNowLabel: "Screen locked",
      emptyOnline: "No active visitors detected right now.",
      emptyRecent: "No previous visitor history recorded yet.",
      currentIpLabel: "Your IP",
      chartTitle: "Activity",
      peakOnlineLabel: "Peak",
      onlineNowLabel: "Now",
      chartHoverLabel: "{count} online at {time}",
      viewingPageLabel: "Viewing {page}",
      playingGameLabel: "Playing {page}",
      sleepingPageLabel: "Away on {page}",
      lastVisitedPageLabel: "Last visited {page}",
      chatActionLabel: "Chat",
      chatBackLabel: "All visitors",
      chatWithTitle: "Chat with {ip}",
      chatInputPlaceholder: "Message {ip}…",
      chatInputHint: "Enter to send · Shift + Enter for a new line",
      chatMessageInfo: "Message info",
      chatDeleteMessage: "Delete message",
      chatClearAll: "Clear chat",
      chatMessageInfoDescription: "Message participants and delivery details.",
      chatDeleteWarning:
        "Permanently delete this message for both people? This cannot be undone.",
      chatClearWarning:
        "Permanently delete all messages in this chat for both people? This cannot be undone.",
      chatSender: "Sender",
      chatRecipient: "Recipient",
      chatSentAt: "Sent",
      chatReadAt: "Read",
      chatNotRead: "Not read yet",
      chatDeleting: "Deleting…",
      chatConfirmDelete: "Delete for both people",
      chatToday: "Today",
      chatYesterday: "Yesterday",
      chatEncryptionNotice: "Stored messages are encrypted on the server.",
      chatSendLabel: "Send",
      chatEmptyState:
        "No messages with {ip} yet. Messages are saved so they'll be notified even if they visit later.",
      chatOfflineHint:
        "{ip} is currently offline — your message will be saved and delivered when they visit.",
      chatIncomingBubble: "{ip} sent a message: “{message}”",
      chatUnreadVisitBubbleSingle:
        "You have 1 unread message from {ip} while you were away.",
      chatUnreadVisitBubblePlural:
        "You have {count} unread messages from {ip}.",
      chatOpenReplyLabel: "Reply",
      chatToastIncomingTitle: "New message from {ip}",
      chatPreviewYouPrefix: "You: ",
      chatReceiptPendingLabel: "Sending…",
      chatReceiptSentLabel: "Sent",
      chatReceiptReadLabel: "Read",
      chatRedactionToggleLabel: "Toggle privacy blur for this chat partner",
      chatRedactionActiveHint:
        "Privacy mode is on — hover or tap message to reveal",
    },
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
  logViewer: logViewerMessages,
  wheel: wheelMessages,
  servers: serversMessages,
  socksRelay: socksRelayMessages,
  theme: themeMessages,
  users: usersMessages,
} as const;
