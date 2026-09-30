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
  {
    icon: Activity,
    get question() {
      return messages.overview.chat.suggestions.snapshot;
    },
  },
  {
    icon: ShieldAlert,
    get question() {
      return messages.overview.chat.suggestions.missing;
    },
  },
  {
    icon: Plug,
    get question() {
      return messages.overview.chat.suggestions.recent;
    },
  },
];

const slashCommands: SlashCommand[] = [
  {
    command: "/snapshot",
    get description() {
      return messages.overview.chat.commands.snapshotDescription;
    },
    icon: Activity,
    id: "snapshot",
    get label() {
      return messages.overview.chat.commands.snapshotLabel;
    },
  },
  {
    command: "/refresh",
    get description() {
      return messages.overview.chat.commands.refreshDescription;
    },
    icon: RefreshCw,
    id: "refresh",
    get label() {
      return messages.overview.chat.commands.refreshLabel;
    },
  },
  {
    command: "/endpoints",
    get description() {
      return messages.overview.chat.commands.endpointsDescription;
    },
    icon: Plug,
    id: "endpoints",
    get label() {
      return messages.overview.chat.commands.endpointsLabel;
    },
  },
  {
    command: "/billers",
    get description() {
      return messages.overview.chat.commands.billersDescription;
    },
    icon: Building2,
    id: "billers",
    get label() {
      return messages.overview.chat.commands.billersLabel;
    },
  },
  {
    command: "/missing",
    get description() {
      return messages.overview.chat.commands.missingDescription;
    },
    icon: ShieldAlert,
    id: "missing",
    get label() {
      return messages.overview.chat.commands.missingLabel;
    },
  },
  {
    command: "/tools",
    get description() {
      return messages.overview.chat.commands.toolsDescription;
    },
    icon: FileJson,
    id: "tools",
    get label() {
      return messages.overview.chat.commands.toolsLabel;
    },
  },
  {
    command: "/jwt",
    get description() {
      return messages.overview.chat.commands.jwtDescription;
    },
    icon: Fingerprint,
    id: "jwt",
    get label() {
      return messages.overview.chat.commands.jwtLabel;
    },
  },
  {
    command: "/iso8583",
    get description() {
      return messages.overview.chat.commands.iso8583Description;
    },
    icon: Code2,
    id: "iso8583",
    get label() {
      return messages.overview.chat.commands.iso8583Label;
    },
  },
  {
    command: "/json-yaml",
    get description() {
      return messages.overview.chat.commands.yamlDescription;
    },
    icon: FileJson,
    id: "json-yaml",
    get label() {
      return messages.overview.chat.commands.yamlLabel;
    },
  },
  {
    command: "/schema",
    get description() {
      return messages.overview.chat.commands.schemaDescription;
    },
    icon: Braces,
    id: "schema",
    get label() {
      return messages.overview.chat.commands.schemaLabel;
    },
  },
  {
    command: "/cron",
    get description() {
      return messages.overview.chat.commands.cronDescription;
    },
    icon: Timer,
    id: "cron",
    get label() {
      return messages.overview.chat.commands.cronLabel;
    },
  },
  {
    command: "/base",
    get description() {
      return messages.overview.chat.commands.baseDescription;
    },
    icon: Binary,
    id: "base",
    get label() {
      return messages.overview.chat.commands.baseLabel;
    },
  },
  {
    command: "/date",
    get description() {
      return messages.overview.chat.commands.dateDescription;
    },
    icon: CalendarDays,
    id: "date",
    get label() {
      return messages.overview.chat.commands.dateLabel;
    },
  },
  {
    command: "/sockets",
    get description() {
      return messages.overview.chat.commands.socketsDescription;
    },
    icon: Network,
    id: "sockets",
    get label() {
      return messages.overview.chat.commands.socketsLabel;
    },
  },
  {
    command: "/socks-relay",
    get description() {
      return messages.overview.chat.commands.socksRelayDescription;
    },
    icon: ShieldCheck,
    id: "socks-relay",
    get label() {
      return messages.overview.chat.commands.socksRelayLabel;
    },
  },
  {
    command: "/users",
    get description() {
      return messages.overview.chat.commands.usersDescription;
    },
    icon: Users,
    id: "users",
    get label() {
      return messages.overview.chat.commands.usersLabel;
    },
  },
  {
    command: "/help",
    get description() {
      return messages.overview.chat.commands.helpDescription;
    },
    icon: Compass,
    id: "help",
    get label() {
      return messages.overview.chat.commands.helpLabel;
    },
  },
  {
    command: "/clear",
    get description() {
      return messages.overview.chat.commands.clearDescription;
    },
    icon: MessageSquareText,
    id: "clear",
    get label() {
      return messages.overview.chat.commands.clearLabel;
    },
  },
];

const slashCommandQueryPattern = /^\/(\S*)$/i;

const overviewChatEntryTransition = {
  duration: MOTION_DURATION.chat,
  ease: MOTION_EASE.apple,
} as const;

const MotionButton = motion.create(Button);

const suggestionListVariants = {
  hidden: {},
  visible: {
    transition: {
      delayChildren: 0.32,
      staggerChildren: 0.06,
    },
  },
} as const;

const suggestionItemVariants = {
  hidden: { opacity: 0, transform: "translateY(10px)" },
  visible: {
    opacity: 1,
    transform: "translateY(0px)",
    transition: overviewChatEntryTransition,
  },
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
    <motion.div
      animate={{ opacity: 1, transform: "translateY(0px)" }}
      className="overview-chat-composer"
      data-overview-entrance="item"
      initial={{ opacity: 0, transform: "translateY(14px)" }}
      transition={{
        delay: 0.24,
        duration: MOTION_DURATION.chat,
        ease: MOTION_EASE.apple,
      }}
    >
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
                  id={`overview-chat-slash-${command.id}`}
                  key={command.id}
                  onClick={() => handleSlashCommandSelect(command.command)}
                  onMouseEnter={() => setSelectedSlashIndex(index)}
                  role="option"
                  size="sm"
                  type="button"
                  variant={
                    isSelected
                      ? "chat-slash-option-selected"
                      : "chat-slash-option"
                  }
                >
                  <span aria-hidden="true" className="overview-chat-slash-icon">
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
                  isComposerExpanded
                    ? messages.overview.chat.collapseComposer
                    : messages.overview.chat.expandComposer
                }
                onClick={() => setIsComposerExpanded((current) => !current)}
                size="icon-sm"
                title={
                  isComposerExpanded
                    ? messages.overview.chat.collapse
                    : messages.overview.chat.expand
                }
                type="button"
                variant="chat-expand"
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
              aria-label={messages.overview.chat.send}
              disabled={!draft.trim() || isSubmitting}
              size="icon-sm"
              type="submit"
              variant="chat-submit"
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
                onClick={handleClear}
                size="sm"
                type="button"
                variant="chat-reset"
              >
                {messages.overview.chat.clearChat}
              </Button>
            ) : null}
          </div>
        </form>

        <AnimatePresence>
          {hasConversation ? null : (
            <motion.fieldset
              animate="visible"
              className="overview-chat-suggestions"
              exit={{
                filter: "blur(4px)",
                opacity: 0,
                transform: "translateY(-6px) scale(0.98)",
              }}
              initial="hidden"
              key="overview-chat-suggestions"
              variants={suggestionListVariants}
            >
              <legend>{messages.overview.chat.tryAQuestion}</legend>
              <div className="overview-chat-suggestions-list">
                {suggestedQuestions.map(({ icon: Icon, question }) => (
                  <MotionButton
                    className="overview-chat-suggestion"
                    data-overview-entrance="item"
                    disabled={isSubmitting}
                    key={question}
                    onClick={() => onQuery(question)}
                    size="sm"
                    type="button"
                    variant="ghost"
                    variants={suggestionItemVariants}
                  >
                    <span
                      aria-hidden="true"
                      className="overview-chat-suggestion-icon"
                    >
                      <Icon />
                    </span>
                    <span>{question}</span>
                  </MotionButton>
                ))}
              </div>
            </motion.fieldset>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
