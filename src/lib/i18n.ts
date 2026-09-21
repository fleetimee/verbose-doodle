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
    // SAFETY: The persisted locale is checked against localeMessages before use.
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
  // SAFETY: Every supported locale provides the complete Messages tree.
  return (localeMessages[targetLocale] ||
    localeMessages[DEFAULT_LOCALE]) as Messages;
}

type MessageNode =
  | string
  | readonly MessageNode[]
  | { readonly [key: string]: MessageNode };

function isStringProp(value: string | symbol): value is string {
  return typeof value === "string";
}

function isMessageNodeObject(
  value: MessageNode | undefined
): value is { readonly [key: string]: MessageNode } {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isMessageString(value: MessageValue): value is string {
  return typeof value === "string";
}

function isMessageObject(
  value: MessageValue
): value is Record<string, string> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNumber(value: string | number | undefined): value is number {
  return typeof value === "number";
}

function createMessageProxy<T extends object>(getTarget: () => T): T {
  // SAFETY: The proxy exposes the typed message tree through its get trap.
  return new Proxy({} as T, {
    get(_target, prop: string | symbol) {
      if (!isStringProp(prop)) {
        return;
      }
      const active = getTarget();
      // SAFETY: Proxy trap forwards property access directly to target messages tree
      const value = (
        active as { readonly [key: string]: MessageNode | undefined }
      )[prop];
      if (isMessageNodeObject(value)) {
        return createMessageProxy(() => {
          const current = getTarget();
          // SAFETY: Proxy trap forwards property access directly to target messages tree
          return (
            current as { readonly [key: string]: MessageNode | undefined }
          )[prop] as object;
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
  message: MessageValue,
  variables: MessageVariables = {}
): string {
  if (isMessageObject(message)) {
    const count = isNumber(variables.count) ? variables.count : 0;
    return formatPluralMessage(message, count, variables);
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
  if (isMessageString(message)) {
    return formatMessage(message, { count, ...variables });
  }

  const pluralRules = new Intl.PluralRules(locale ?? getActiveLocale());
  const pluralCategory = pluralRules.select(count);
  const selectedMessage = message[pluralCategory] ?? message.other;

  return formatMessage(selectedMessage, { count, ...variables });
}
