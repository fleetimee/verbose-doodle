import {
  findNext,
  findPrevious,
  getSearchQuery,
  openSearchPanel,
  SearchQuery,
  search,
  setSearchQuery,
} from "@codemirror/search";
import type { EditorState, Extension } from "@codemirror/state";
import type { EditorView } from "@codemirror/view";
import {
  ArrowUp01Icon,
  Cancel01Icon,
  Search01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown } from "@/components/hugeicons";
import { useI18n } from "@/components/i18n-provider";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { DocumentEditor } from "@/features/developer-tools/components/document-editor";
import { formatMessage } from "@/lib/i18n";

type SearchPanel = {
  dom: HTMLDivElement;
  view: EditorView;
  state: EditorState;
};

function FileSearchToolbar({
  view,
  state,
}: Pick<SearchPanel, "view" | "state">) {
  const { messages } = useI18n();
  const copy = messages.logViewer;
  const query = getSearchQuery(state);
  const matches = useMemo(() => {
    let total = 0;
    let current = 0;
    if (query.valid) {
      const cursor = query.getCursor(state);
      for (let match = cursor.next(); !match.done; match = cursor.next()) {
        total += 1;
        if (
          match.value.from === state.selection.main.from &&
          match.value.to === state.selection.main.to
        ) {
          current = total;
        }
      }
    }
    return { current, total };
  }, [query, state]);
  const changeQuery = (value: string) =>
    view.dispatch({
      effects: setSearchQuery.of(
        new SearchQuery({ search: value, literal: true })
      ),
    });

  return (
    <div className="border-b bg-background px-4 py-2">
      <InputGroup className="max-w-xl" size="compact">
        <InputGroupAddon>
          <HugeiconsIcon aria-hidden="true" icon={Search01Icon} />
        </InputGroupAddon>
        <InputGroupInput
          aria-label={messages.servers.containers.volumePreviewSearch}
          main-field="true"
          onChange={(event) => changeQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              event.stopPropagation();
              if (event.shiftKey) {
                findPrevious(view);
              } else {
                findNext(view);
              }
            }
            if (event.key === "Escape") {
              event.preventDefault();
              event.stopPropagation();
              changeQuery("");
            }
          }}
          placeholder={messages.servers.containers.volumePreviewSearch}
          type="text"
          value={query.search}
        />
        <InputGroupAddon align="inline-end">
          <InputGroupText
            aria-label={formatMessage(
              messages.servers.containers.volumePreviewMatches,
              { current: matches.current, total: matches.total }
            )}
            aria-live="polite"
          >
            {matches.current}/{matches.total}
          </InputGroupText>
          <Tooltip>
            <TooltipTrigger asChild>
              <InputGroupButton
                aria-label={copy.previousMatch}
                disabled={!matches.total}
                onClick={() => findPrevious(view)}
                size="icon-xs"
              >
                <HugeiconsIcon aria-hidden="true" icon={ArrowUp01Icon} />
              </InputGroupButton>
            </TooltipTrigger>
            <TooltipContent>{copy.previousMatch}</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <InputGroupButton
                aria-label={copy.nextMatch}
                disabled={!matches.total}
                onClick={() => findNext(view)}
                size="icon-xs"
              >
                <ChevronDown aria-hidden="true" />
              </InputGroupButton>
            </TooltipTrigger>
            <TooltipContent>{copy.nextMatch}</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <InputGroupButton
                aria-label={copy.clearSearch}
                disabled={!query.search}
                onClick={() => changeQuery("")}
                size="icon-xs"
              >
                <HugeiconsIcon aria-hidden="true" icon={Cancel01Icon} />
              </InputGroupButton>
            </TooltipTrigger>
            <TooltipContent>{copy.clearSearch}</TooltipContent>
          </Tooltip>
        </InputGroupAddon>
      </InputGroup>
    </div>
  );
}

export function ServerFilePreviewEditor({
  name,
  text,
  format,
  extensions,
}: {
  name: string;
  text: string;
  format: "json" | "text";
  extensions: Extension[];
}) {
  const [panel, setPanel] = useState<SearchPanel | null>(null);
  const searchExtension = useMemo(
    () =>
      search({
        top: true,
        createPanel: (view) => {
          const dom = document.createElement("div");
          return {
            dom,
            top: true,
            mount: () => setPanel({ dom, view, state: view.state }),
            update: (update) => {
              if (
                update.selectionSet ||
                update.docChanged ||
                update.transactions.some((transaction) =>
                  transaction.effects.some((effect) =>
                    effect.is(setSearchQuery)
                  )
                )
              ) {
                setPanel({ dom, view, state: update.state });
              }
            },
            destroy: () =>
              setPanel((current) => (current?.dom === dom ? null : current)),
          };
        },
      }),
    []
  );
  const editorExtensions = useMemo(
    () => [...extensions, searchExtension],
    [extensions, searchExtension]
  );

  return (
    <>
      <DocumentEditor
        compact
        extensions={editorExtensions}
        format={format}
        height="100%"
        label={name}
        onCreateEditor={(view) => {
          openSearchPanel(view);
        }}
        readOnly
        showHeader={false}
        value={text}
      />
      {panel &&
        createPortal(
          <FileSearchToolbar state={panel.state} view={panel.view} />,
          panel.dom
        )}
    </>
  );
}
