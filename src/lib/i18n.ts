import { enUsMessages } from "@/lib/i18n/messages/en-us";
import { idIdMessages } from "@/lib/i18n/messages/id-id";

export const DEFAULT_LOCALE = "en-US";

export const localeMessages = {
  "en-US": enUsMessages,
  "id-ID": idIdMessages,
} as const;

export type AppLocale = keyof typeof localeMessages;
export type Messages = (typeof localeMessages)["en-US"];

let currentLocale: AppLocale = DEFAULT_LOCALE;

export function getActiveLocale(): AppLocale {
  if (typeof localStorage !== "undefined") {
    const saved = localStorage.getItem("app-locale") as AppLocale;
    if (saved && localeMessages[saved]) {
      return saved;
    }
  }
  return currentLocale;
}

export function setActiveLocale(locale: AppLocale): void {
  if (localeMessages[locale]) {
    currentLocale = locale;
    if (typeof localStorage !== "undefined") {
      localStorage.setItem("app-locale", locale);
    }
  }
}

export function getMessages(locale?: AppLocale) {
  const targetLocale = locale || getActiveLocale();
  return localeMessages[targetLocale] || localeMessages[DEFAULT_LOCALE];
}

export const messages = localeMessages[DEFAULT_LOCALE];

type MessageValue = string | Record<string, string>;
type MessageVariables = Record<string, string | number>;

const pluralRules = new Intl.PluralRules(DEFAULT_LOCALE);

export function formatMessage(
  message: string,
  variables: MessageVariables = {}
) {
  return Object.entries(variables).reduce(
    (formattedMessage, [key, value]) =>
      formattedMessage.replaceAll(`{${key}}`, String(value)),
    message
  );
}

export function formatPluralMessage(
  message: MessageValue,
  count: number,
  variables: MessageVariables = {}
) {
  if (typeof message === "string") {
    return formatMessage(message, { count, ...variables });
  }

  const pluralCategory = pluralRules.select(count);
  const selectedMessage = message[pluralCategory] ?? message.other;

  return formatMessage(selectedMessage, { count, ...variables });
}
