import { enUsMessages } from "@/lib/i18n/messages/en-us";
import { idIdMessages } from "@/lib/i18n/messages/id-id";

export const DEFAULT_LOCALE = "en-US";

export const localeMessages = {
  "en-US": enUsMessages,
  "id-ID": idIdMessages,
} as const;

export type AppLocale = keyof typeof localeMessages;

type StringifyLeaf<T> = T extends string
  ? string
  : T extends readonly (infer U)[]
    ? readonly StringifyLeaf<U>[]
    : T extends object
      ? { [K in keyof T]: StringifyLeaf<T[K]> }
      : T;

export type Messages = StringifyLeaf<(typeof localeMessages)["en-US"]>;

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
    if (typeof document !== "undefined") {
      document.documentElement.lang = locale;
    }
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("app-locale-change", { detail: locale })
      );
    }
  }
}

export function getMessages(locale?: AppLocale): Messages {
  const targetLocale = locale || getActiveLocale();
  return (localeMessages[targetLocale] ||
    localeMessages[DEFAULT_LOCALE]) as Messages;
}

function createMessageProxy<T extends object>(getTarget: () => T): T {
  return new Proxy({} as T, {
    get(_target, prop: string | symbol) {
      const active = getTarget();
      const value = (active as Record<string | symbol, unknown>)[prop];
      if (
        typeof value === "object" &&
        value !== null &&
        !Array.isArray(value)
      ) {
        return createMessageProxy(() => {
          const current = getTarget();
          return (current as Record<string | symbol, unknown>)[prop] as object;
        });
      }
      return value;
    },
    getOwnPropertyDescriptor(_target, prop) {
      return Reflect.getOwnPropertyDescriptor(getTarget(), prop);
    },
    ownKeys() {
      return Reflect.ownKeys(getTarget());
    },
  });
}

export const messages: Messages = createMessageProxy(() => getMessages());

type MessageValue = string | Record<string, string>;
type MessageVariables = Record<string, string | number>;

export function formatMessage(
  message: unknown,
  variables: MessageVariables = {}
): string {
  if (typeof message === "object" && message !== null) {
    const count = typeof variables.count === "number" ? variables.count : 0;
    return formatPluralMessage(message as MessageValue, count, variables);
  }
  if (typeof message !== "string") {
    return String(message ?? "");
  }
  return Object.entries(variables).reduce(
    (formattedMessage, [key, value]) =>
      formattedMessage.replaceAll(`{${key}}`, String(value)),
    message
  );
}

export function formatPluralMessage(
  message: MessageValue,
  count: number,
  variables: MessageVariables = {},
  locale?: AppLocale
): string {
  if (typeof message === "string") {
    return formatMessage(message, { count, ...variables });
  }

  const pluralRules = new Intl.PluralRules(locale ?? getActiveLocale());
  const pluralCategory = pluralRules.select(count);
  const selectedMessage = message[pluralCategory] ?? message.other;

  return formatMessage(selectedMessage, { count, ...variables });
}
