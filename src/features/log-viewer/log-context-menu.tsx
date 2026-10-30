import { Search01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { type ReactElement, type RefObject, useState } from "react";
import { toast } from "sonner";
import { CopyIcon, FileText } from "@/components/hugeicons";
import { useI18n } from "@/components/i18n-provider";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { logEntryAt } from "@/features/log-viewer/log-entries";
import { LogSelectionAction } from "@/features/log-viewer/log-selection-action";
import { copyToClipboard } from "@/lib/clipboard";

const MULTILINE = /[\r\n]/;

function selectedText(viewport: HTMLElement): string {
  const selection = window.getSelection();
  if (
    !(
      selection &&
      viewport.contains(selection.anchorNode) &&
      viewport.contains(selection.focusNode)
    )
  ) {
    return "";
  }
  return selection.toString();
}

function caretOffset(pre: HTMLElement, x: number, y: number): number | null {
  const caret = document.caretPositionFromPoint?.(x, y);
  const fallback = caret ? null : document.caretRangeFromPoint?.(x, y);
  const node = caret?.offsetNode ?? fallback?.startContainer;
  const offset = caret?.offset ?? fallback?.startOffset;
  if (!node || offset === undefined || !pre.contains(node)) {
    return null;
  }
  const range = document.createRange();
  range.selectNodeContents(pre);
  range.setEnd(node, offset);
  return range.toString().length;
}

function entryText(
  viewport: HTMLElement,
  pre: HTMLElement,
  x: number,
  y: number
): string {
  const offset = caretOffset(pre, x, y);
  if (offset === null) {
    return "";
  }
  let position = offset;
  let text = "";
  let before = true;
  for (const element of viewport.querySelectorAll<HTMLElement>(
    "[data-log-text]"
  )) {
    if (element.dataset.logText !== pre.dataset.logText) {
      continue;
    }
    if (element === pre) {
      before = false;
    }
    const content = element.textContent ?? "";
    if (before) {
      position += content.length;
    }
    text += content;
  }
  return logEntryAt(text, position);
}

export function LogContextMenu({
  children,
  viewportRef,
  onFind,
}: {
  children: ReactElement;
  viewportRef: RefObject<HTMLDivElement | null>;
  onFind: (text: string) => void;
}) {
  const { messages } = useI18n();
  const copy = messages.logViewer;
  const [open, setOpen] = useState(false);
  const [selection, setSelection] = useState("");
  const [entry, setEntry] = useState("");
  const canFind =
    Boolean(selection.trim()) && !MULTILINE.test(selection.trim());

  async function copyText(text: string, success: string) {
    try {
      if (await copyToClipboard(text)) {
        toast.success(success);
      } else {
        toast.error(copy.selectionCopyFailed);
      }
    } catch {
      toast.error(copy.selectionCopyFailed);
    }
  }

  return (
    <ContextMenu onOpenChange={setOpen}>
      <ContextMenuTrigger
        asChild
        onContextMenu={(event) => {
          const viewport = viewportRef.current;
          const pre =
            event.target instanceof Element
              ? event.target.closest<HTMLElement>("[data-log-text]")
              : null;
          if (event.shiftKey || !viewport || !pre) {
            event.preventBaseUIHandler();
            return;
          }
          setSelection(selectedText(viewport));
          setEntry(entryText(viewport, pre, event.clientX, event.clientY));
        }}
      >
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent
        finalFocus={false}
        portalContainer={viewportRef.current?.closest<HTMLElement>(
          ".log-viewer-panel"
        )}
        size="compact"
        variant="subtle"
      >
        <ContextMenuGroup>
          <ContextMenuItem
            disabled={!selection}
            onClick={() => copyText(selection, copy.selectionCopied)}
          >
            <CopyIcon aria-hidden="true" />
            {copy.copySelectedText}
          </ContextMenuItem>
          <ContextMenuItem
            disabled={!entry}
            onClick={() => copyText(entry, copy.entryCopied)}
          >
            <FileText aria-hidden="true" />
            {copy.copyLogEntry}
          </ContextMenuItem>
          <ContextMenuItem
            disabled={!canFind}
            onClick={() => onFind(selection.trim())}
          >
            <HugeiconsIcon aria-hidden="true" icon={Search01Icon} />
            {copy.findSelectedText}
          </ContextMenuItem>
        </ContextMenuGroup>
        <ContextMenuSeparator />
        <p className="max-w-64 px-2 py-1.5 text-muted-foreground text-xs">
          {copy.browserMenuHint}
        </p>
      </ContextMenuContent>
      <LogSelectionAction disabled={open} viewportRef={viewportRef} />
    </ContextMenu>
  );
}
