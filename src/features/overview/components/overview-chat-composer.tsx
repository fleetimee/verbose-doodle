import {
  MaximizeScreenIcon,
  MinimizeScreenIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
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
  FileJson,
  MessageSquareText,
  Plug,
  RefreshCw,
  SendHorizontal,
} from "@/components/hugeicons";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { messages } from "@/lib/i18n";
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
  "Show me a simulator snapshot",
  "Which endpoints need responses?",
  "Show recent endpoints",
];

const slashCommands: SlashCommand[] = [
  {
    command: "/snapshot",
    description: "Read the current biller simulator coverage",
    icon: Activity,
    id: "snapshot",
    label: "Show simulator snapshot",
  },
  {
    command: "/refresh",
    description: "Fetch the latest overview data",
    icon: RefreshCw,
    id: "refresh",
    label: "Refresh overview",
  },
  {
    command: "/endpoints",
    description: "Review configured endpoint coverage",
    icon: Plug,
    id: "endpoints",
    label: "Endpoint catalog",
  },
  {
    command: "/tools",
    description: "Open the integration developer toolbox",
    icon: FileJson,
    id: "tools",
    label: "Developer tools",
  },
  {
    command: "/clear",
    description: "Start a fresh conversation",
    icon: MessageSquareText,
    id: "clear",
    label: "Clear chat",
  },
];

const slashCommandQueryPattern = /^\/(\S*)$/i;

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
  const prefersReducedMotion = useReducedMotion();
  const [draft, setDraft] = useState("");
  const [isComposerExpanded, setIsComposerExpanded] = useState(false);
  const [isComposerOverflowing, setIsComposerOverflowing] = useState(false);
  const [selectedSlashIndex, setSelectedSlashIndex] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }

    setIsComposerOverflowing(textarea.scrollHeight > textarea.clientHeight + 1);
  }, [draft, isComposerExpanded]);

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setDraft("");
      onQuery(draft);
    },
    [draft, onQuery]
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

  const handleSlashCommandSelect = useCallback(
    (command: string) => {
      setDraft("");
      onQuery(command);
    },
    [onQuery]
  );

  const handleClear = useCallback(() => {
    setDraft("");
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
        setDraft("");
        onQuery(draft);
      }
    },
    [
      draft,
      filteredSlashCommands,
      handleSlashCommandSelect,
      isSlashCommandPaletteOpen,
      onQuery,
      selectedSlashIndex,
    ]
  );

  return (
    <motion.div
      className="overview-chat-composer"
      layout="position"
      transition={{
        duration: prefersReducedMotion ? 0 : 0.18,
        ease: [0.65, 0, 0.35, 1],
      }}
    >
      <div className="overview-chat-composer-inner">
        <AnimatePresence initial={false}>
          {hasConversation || draft.trim() ? null : (
            <motion.fieldset
              animate={{ opacity: 1, y: 0 }}
              className="overview-chat-suggestions"
              exit={{ opacity: 0, y: 10 }}
              initial={{ opacity: 0, y: 10 }}
              key="overview-chat-suggestions"
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            >
              <legend>{messages.overview.chat.tryAQuestion}</legend>
              {suggestedQuestions.map((question) => (
                <Button
                  className="overview-chat-suggestion"
                  disabled={isSubmitting}
                  key={question}
                  onClick={() => onQuery(question)}
                  type="button"
                  variant="outline"
                >
                  {question}
                </Button>
              ))}
            </motion.fieldset>
          )}
        </AnimatePresence>

        <AnimatePresence initial={false}>
          {isSlashCommandPaletteOpen ? (
            <motion.div
              animate={{ opacity: 1, scale: 1, y: 0 }}
              aria-label={messages.overview.chat.slashCommands}
              className="overview-chat-slash-menu"
              exit={{ opacity: 0, scale: 0.98, y: 6 }}
              id="overview-chat-slash-commands"
              initial={{ opacity: 0, scale: 0.98, y: 6 }}
              onMouseDown={(event) => event.preventDefault()}
              role="listbox"
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
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
        </AnimatePresence>

        <form onSubmit={handleSubmit}>
          <div className="overview-chat-composer-meta">
            <label htmlFor="overview-chat-input">
              {messages.overview.chat.composerLabel}
            </label>
            <span>{messages.overview.chat.composerHint}</span>
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
              size="icon"
              type="submit"
            >
              {isSubmitting ? (
                <Spinner aria-hidden="true" />
              ) : (
                <SendHorizontal aria-hidden="true" />
              )}
            </Button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
