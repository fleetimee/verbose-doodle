import { enUsMessages } from "@/lib/i18n/messages/en-us";

export const DEFAULT_LOCALE = "en-US";

export const localeMessages = {
  "en-US": enUsMessages,
} as const;

export type AppLocale = keyof typeof localeMessages;
export type Messages = (typeof localeMessages)[AppLocale];

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
