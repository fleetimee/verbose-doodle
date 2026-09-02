import {
  MaximizeScreenIcon,
  MinimizeScreenIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { AnimatePresence, motion } from "motion/react";
import {
  type ChangeEvent,
  type FormEvent,
  type KeyboardEvent,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  Activity,
  Binary,
  Braces,
  Building2,
  CalendarDays,
  Code2,
  Compass,
  FileJson,
  Fingerprint,
  MessageSquareText,
  Network,
  Plug,
  RadioReceiver,
  RefreshCw,
  SendHorizontal,
  ShieldAlert,
  ShieldCheck,
  Timer,
  Users,
} from "@/components/hugeicons";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { messages } from "@/lib/i18n";
import { MOTION_DURATION, MOTION_EASE } from "@/lib/motion";
import { cn } from "@/lib/utils";

type SlashCommand = {
  command: string;
  description: string;
  icon: typeof Activity;
  id: string;
  label: string;
};

type OverviewChatComposerProps = {
  hasConversation: boolean;
  isSubmitting: boolean;
  onClear: () => void;
  onQuery: (value: string) => void;
};

const suggestedQuestions = [
  { icon: Activity, question: "Show me a simulator snapshot" },
  { icon: ShieldAlert, question: "Which endpoints need responses?" },
  { icon: Plug, question: "Show recent endpoints" },
];

const slashCommands: SlashCommand[] = [
  {
    command: "/snapshot",
    description: "Read overall simulator health, coverage & counts",
    icon: Activity,
    id: "snapshot",
    label: "Show simulator snapshot",
  },
  {
    command: "/refresh",
    description: "Fetch the latest live data from simulator API",
    icon: RefreshCw,
    id: "refresh",
    label: "Refresh overview",
  },
  {
    command: "/endpoints",
    description: "Review configured endpoints, HTTP methods & paths",
    icon: Plug,
    id: "endpoints",
    label: "Endpoint catalog",
  },
  {
    command: "/billers",
    description: "Inspect billers and endpoint coverage distribution",
    icon: Building2,
    id: "billers",
    label: "Biller breakdown",
  },
  {
    command: "/missing",
    description: "Find endpoints without active response templates",
    icon: ShieldAlert,
    id: "missing",
    label: "Missing responses",
  },
  {
    command: "/tools",
    description: "Open the integration developer toolbox",
    icon: FileJson,
    id: "tools",
    label: "Developer tools",
  },
  {
    command: "/jwt",
    description: "Decode, inspect and verify JSON Web Tokens",
    icon: Fingerprint,
    id: "jwt",
    label: "JWT inspector",
  },
  {
    command: "/iso8583",
    description: "Build and inspect ISO 8583 financial messages",
    icon: Code2,
    id: "iso8583",
    label: "ISO 8583 generator",
  },
  {
    command: "/json-yaml",
    description: "Bidirectional JSON and YAML format conversion",
    icon: FileJson,
    id: "json-yaml",
    label: "JSON ↔ YAML",
  },
  {
    command: "/schema",
    description: "Validate payloads against JSON Schema specifications",
    icon: Braces,
    id: "schema",
    label: "Schema validator",
  },
  {
    command: "/cron",
    description: "Parse cron expressions and preview upcoming runs",
    icon: Timer,
    id: "cron",
    label: "Cron parser",
  },
  {
    command: "/base",
    description: "Convert between binary, octal, decimal, hex, and base64",
    icon: Binary,
    id: "base",
    label: "Number base converter",
  },
  {
    command: "/date",
    description: "Convert Unix timestamps, ISO 8601, and timezones",
    icon: CalendarDays,
    id: "date",
    label: "Date & timezone",
  },
  {
    command: "/nfc",
    description: "Inspect and decode raw NFC tag payloads",
    icon: RadioReceiver,
    id: "nfc",
    label: "NFC inspector",
  },
  {
    command: "/sockets",
    description: "Test TCP client/server and UDP datagram flows",
    icon: Network,
    id: "sockets",
    label: "Socket tester",
  },
  {
    command: "/socks-relay",
    description: "Inspect SOCKS5 proxy relay for REST and ISO 8583",
    icon: ShieldCheck,
    id: "socks-relay",
    label: "SOCKS relay",
  },
  {
    command: "/users",
    description: "View user count and administrator activity stats",
    icon: Users,
    id: "users",
    label: "User accounts",
  },
  {
    command: "/help",
    description: "Browse available questions, commands, and shortcuts",
    icon: Compass,
    id: "help",
    label: "Help & cheat sheet",
  },
  {
    command: "/clear",
    description: "Start a fresh conversation and reset session",
    icon: MessageSquareText,
    id: "clear",
    label: "Clear chat",
  },
];

const slashCommandQueryPattern = /^\/(\S*)$/i;

const overviewChatEntryTransition = {
  duration: MOTION_DURATION.chat,
  ease: MOTION_EASE.apple,
} as const;


function getFilteredSlashCommands(draft: string) {
  const query = slashCommandQueryPattern.exec(draft)?.[1].toLocaleLowerCase();
  if (query === undefined) {
    return [];
  }

  return slashCommands.filter(
    (command) =>
      command.id.startsWith(query) ||
      command.command.slice(1).startsWith(query) ||
      command.label.toLowerCase().includes(query)
  );
}

function handleSlashPaletteKeyDown(
  event: KeyboardEvent<HTMLTextAreaElement>,
  {
    commands,
    isOpen,
    onClearDraft,
    onSelect,
    selectedIndex,
    setSelectedIndex,
  }: {
    commands: SlashCommand[];
    isOpen: boolean;
    onClearDraft: () => void;
    onSelect: (command: string) => void;
    selectedIndex: number;
    setSelectedIndex: (updater: (current: number) => number) => void;
  }
) {
  if (event.nativeEvent.isComposing || !isOpen) {
    return false;
  }

  switch (event.key) {
    case "Escape":
      event.preventDefault();
      onClearDraft();
      return true;
    case "ArrowDown":
      event.preventDefault();
      setSelectedIndex((previous) => (previous + 1) % commands.length);
      return true;
    case "ArrowUp":
      event.preventDefault();
      setSelectedIndex(
        (previous) => (previous - 1 + commands.length) % commands.length
      );
      return true;
    case "Enter":
    case "Tab": {
      event.preventDefault();
      const selected = commands[selectedIndex] ?? commands[0];
      if (selected) {
        onSelect(selected.command);
      }
      return true;
    }
    default:
      return false;
  }
}

export function OverviewChatComposer({
  hasConversation,
  isSubmitting,
  onClear,
  onQuery,
}: OverviewChatComposerProps) {
  const [draft, setDraft] = useState("");
  const [isComposerExpanded, setIsComposerExpanded] = useState(false);
  const [isComposerOverflowing, setIsComposerOverflowing] = useState(false);
  const [selectedSlashIndex, setSelectedSlashIndex] = useState(0);
  const slashMenuRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }

    setIsComposerOverflowing(textarea.scrollHeight > textarea.clientHeight + 1);
  }, [draft, isComposerExpanded]);

  const submitDraft = useCallback(
    (value: string) => {
      setDraft("");
      setIsComposerExpanded(false);
      onQuery(value);
    },
    [onQuery]
  );

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      submitDraft(draft);
    },
    [draft, submitDraft]
  );

  const handleDraftChange = useCallback(
    (event: ChangeEvent<HTMLTextAreaElement>) => {
      setDraft(event.currentTarget.value);
    },
    []
  );

  const filteredSlashCommands = getFilteredSlashCommands(draft);
  const isSlashCommandPaletteOpen = filteredSlashCommands.length > 0;

  useEffect(() => {
    setSelectedSlashIndex(0);
  }, [draft]);

  useLayoutEffect(() => {
    if (!isSlashCommandPaletteOpen) {
      return;
    }

    const selectedCommand = filteredSlashCommands[selectedSlashIndex];
    if (!selectedCommand) {
      return;
    }

    const selectedOption = slashMenuRef.current?.querySelector<HTMLElement>(
      `#overview-chat-slash-${selectedCommand.id}`
    );
    selectedOption?.scrollIntoView({ block: "nearest" });
  }, [filteredSlashCommands, isSlashCommandPaletteOpen, selectedSlashIndex]);

  const handleSlashCommandSelect = useCallback(
    (command: string) => {
      submitDraft(command);
    },
    [submitDraft]
  );

  const handleClear = useCallback(() => {
    setDraft("");
    setIsComposerExpanded(false);
    onClear();
  }, [onClear]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLTextAreaElement>) => {
      const wasPaletteKey = handleSlashPaletteKeyDown(event, {
        commands: filteredSlashCommands,
        isOpen: isSlashCommandPaletteOpen,
        onClearDraft: () => setDraft(""),
        onSelect: handleSlashCommandSelect,
        selectedIndex: selectedSlashIndex,
        setSelectedIndex: setSelectedSlashIndex,
      });
      if (wasPaletteKey) {
        return;
      }

      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        submitDraft(draft);
      }
    },
    [
      draft,
      filteredSlashCommands,
      handleSlashCommandSelect,
      isSlashCommandPaletteOpen,
      selectedSlashIndex,
      submitDraft,
    ]
  );

  return (
    <div className="overview-chat-composer">
      <div className="overview-chat-composer-inner">
        {isSlashCommandPaletteOpen ? (
          <motion.div
            animate={{
              filter: "blur(0px)",
              opacity: 1,
              transform: "translateY(0) scale(1)",
            }}
            aria-label={messages.overview.chat.slashCommands}
            className="overview-chat-slash-menu"
            id="overview-chat-slash-commands"
            initial={{
              filter: "blur(2px)",
              opacity: 0,
              transform: "translateY(8px) scale(0.98)",
            }}
            key="overview-chat-slash-menu"
            onMouseDown={(event) => event.preventDefault()}
            ref={slashMenuRef}
            role="listbox"
            transition={{ duration: 0.18, ease: MOTION_EASE.apple }}
          >
            {filteredSlashCommands.map((command, index) => {
              const Icon = command.icon;
              const isSelected = index === selectedSlashIndex;
              return (
                <Button
                  aria-selected={isSelected}
                  className={cn(
                    "overview-chat-slash-option",
                    isSelected && "overview-chat-slash-option-selected"
                  )}
                  id={`overview-chat-slash-${command.id}`}
                  key={command.id}
                  onClick={() => handleSlashCommandSelect(command.command)}
                  onMouseEnter={() => setSelectedSlashIndex(index)}
                  role="option"
                  size="sm"
                  type="button"
                  variant="ghost"
                >
                  <span
                    aria-hidden="true"
                    className="overview-chat-slash-icon"
                  >
                    <Icon />
                  </span>
                  <span className="overview-chat-slash-copy">
                    <strong>{command.label}</strong>
                    <span>{command.description}</span>
                  </span>
                  <kbd>{command.command}</kbd>
                </Button>
              );
            })}
          </motion.div>
        ) : null}

        <form onSubmit={handleSubmit}>
          <label className="sr-only" htmlFor="overview-chat-input">
            {messages.overview.chat.composerLabel}
          </label>
          <div
            className="overview-chat-input-shell"
            data-expanded={isComposerExpanded || undefined}
          >
            <textarea
              aria-activedescendant={
                isSlashCommandPaletteOpen
                  ? `overview-chat-slash-${filteredSlashCommands[selectedSlashIndex]?.id ?? filteredSlashCommands[0]?.id}`
                  : undefined
              }
              aria-autocomplete="list"
              aria-controls={
                isSlashCommandPaletteOpen
                  ? "overview-chat-slash-commands"
                  : undefined
              }
              aria-describedby="overview-chat-input-hint"
              className="overview-chat-input"
              id="overview-chat-input"
              onChange={handleDraftChange}
              onKeyDown={handleKeyDown}
              placeholder={messages.overview.chat.inputPlaceholder}
              ref={textareaRef}
              rows={1}
              value={draft}
            />
            {isComposerOverflowing || isComposerExpanded ? (
              <Button
                aria-label={
                  isComposerExpanded ? "Collapse composer" : "Expand composer"
                }
                className="overview-chat-expand"
                onClick={() => setIsComposerExpanded((current) => !current)}
                size="icon-sm"
                title={isComposerExpanded ? "Collapse" : "Expand"}
                type="button"
                variant="ghost"
              >
                <HugeiconsIcon
                  aria-hidden="true"
                  icon={
                    isComposerExpanded ? MinimizeScreenIcon : MaximizeScreenIcon
                  }
                  strokeWidth={2}
                />
              </Button>
            ) : null}
            <span className="sr-only" id="overview-chat-input-hint">
              {messages.overview.chat.inputHint}
            </span>
            <Button
              aria-label="Send"
              className="overview-chat-submit"
              disabled={!draft.trim() || isSubmitting}
              size="icon-sm"
              type="submit"
            >
              {isSubmitting ? (
                <Spinner aria-hidden="true" />
              ) : (
                <SendHorizontal aria-hidden="true" />
              )}
            </Button>
          </div>
          <div className="overview-chat-composer-footer">
            <span className="overview-chat-composer-hint">
              {messages.overview.chat.composerHint}
            </span>
            {hasConversation ? (
              <Button
                className="overview-chat-reset"
                onClick={handleClear}
                size="sm"
                type="button"
                variant="ghost"
              >
                {messages.overview.chat.clearChat}
              </Button>
            ) : null}
          </div>
        </form>

        <AnimatePresence initial={false}>
          {hasConversation ? null : (
            <motion.fieldset
              animate={{
                filter: "blur(0px)",
                opacity: 1,
                transform: "translateY(0) scale(1)",
              }}
              className="overview-chat-suggestions"
              exit={{
                filter: "blur(4px)",
                opacity: 0,
                transform: "translateY(-6px) scale(0.98)",
              }}
              initial={{
                filter: "blur(4px)",
                opacity: 0,
                transform: "translateY(6px) scale(0.98)",
              }}
              key="overview-chat-suggestions"
              transition={overviewChatEntryTransition}
            >
              <legend>{messages.overview.chat.tryAQuestion}</legend>
              <div className="overview-chat-suggestions-list">
                {suggestedQuestions.map(({ icon: Icon, question }) => (
                  <Button
                    className="overview-chat-suggestion"
                    disabled={isSubmitting}
                    key={question}
                    onClick={() => onQuery(question)}
                    size="sm"
                    type="button"
                    variant="ghost"
                  >
                    <span
                      aria-hidden="true"
                      className="overview-chat-suggestion-icon"
                    >
                      <Icon />
                    </span>
                    <span>{question}</span>
                  </Button>
                ))}
              </div>
            </motion.fieldset>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
