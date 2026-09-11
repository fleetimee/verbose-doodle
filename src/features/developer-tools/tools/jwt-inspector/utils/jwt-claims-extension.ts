import { syntaxTree } from "@codemirror/language";
import { RangeSetBuilder } from "@codemirror/state";
import {
  Decoration,
  type DecorationSet,
  EditorView,
  hoverTooltip,
  type Tooltip,
  tooltips,
  ViewPlugin,
  type ViewUpdate,
} from "@codemirror/view";
import type { SyntaxNode } from "@lezer/common";
import { formatClaimTimestamp, getClaimInfo, isKnownClaim } from "./jwt-claims";

const claimKeyUnderline = Decoration.mark({
  class: "cm-jwt-claim-key",
});

const claimValueUnderline = Decoration.mark({
  class: "cm-jwt-claim-value",
});

function getParentPropertyName(view: EditorView, node: SyntaxNode): string {
  const parent = node.parent;
  if (parent?.name !== "Property") {
    return "";
  }
  const propNameNode = parent.getChild("PropertyName");
  if (!propNameNode || propNameNode.from === node.from) {
    return "";
  }
  return view.state.doc
    .sliceString(propNameNode.from, propNameNode.to)
    .replace(/^["']|["']$/g, "");
}

function processNodeDecoration(
  view: EditorView,
  node: SyntaxNode,
  builder: RangeSetBuilder<Decoration>,
  lastTo: number
): number {
  if (node.from < lastTo) {
    return lastTo;
  }

  if (node.name === "PropertyName") {
    const raw = view.state.doc.sliceString(node.from, node.to);
    const key = raw.replace(/^["']|["']$/g, "");
    if (isKnownClaim(key)) {
      builder.add(node.from, node.to, claimKeyUnderline);
      return node.to;
    }
  } else if (node.name === "Number" || node.name === "String") {
    const key = getParentPropertyName(view, node);
    if (["iat", "exp", "nbf"].includes(key)) {
      builder.add(node.from, node.to, claimValueUnderline);
      return node.to;
    }
  }

  return lastTo;
}

export const jwtClaimsDecorations = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;
    constructor(view: EditorView) {
      this.decorations = this.buildDecorations(view);
    }
    update(update: ViewUpdate) {
      if (update.docChanged || update.viewportChanged) {
        this.decorations = this.buildDecorations(update.view);
      }
    }
    buildDecorations(view: EditorView): DecorationSet {
      const builder = new RangeSetBuilder<Decoration>();
      const tree = syntaxTree(view.state);
      let lastTo = -1;

      for (const { from, to } of view.visibleRanges) {
        tree.cursor().iterate((node) => {
          if (node.to < from || node.from > to) {
            return;
          }
          lastTo = processNodeDecoration(view, node.node, builder, lastTo);
        });
      }
      return builder.finish();
    }
  },
  {
    decorations: (v) => v.decorations,
  }
);

function getPropertyTooltip(
  view: EditorView,
  node: SyntaxNode
): Tooltip | null {
  if (node.name !== "PropertyName") {
    return null;
  }
  const rawText = view.state.doc.sliceString(node.from, node.to);
  const key = rawText.replace(/^["']|["']$/g, "");
  const info = getClaimInfo(key);
  if (!info) {
    return null;
  }

  return {
    pos: node.from,
    end: node.to,
    above: true,
    arrow: true,
    create() {
      const dom = document.createElement("div");
      dom.className = "cm-jwt-tooltip-box";

      const title = document.createElement("span");
      title.className = "cm-jwt-tooltip-title";
      title.textContent = info.name;

      const desc = document.createElement("span");
      desc.className = "cm-jwt-tooltip-desc";
      desc.textContent = info.description;

      dom.appendChild(title);
      dom.appendChild(desc);
      return { dom };
    },
  };
}

function getTimestampTooltip(
  view: EditorView,
  node: SyntaxNode
): Tooltip | null {
  const key = getParentPropertyName(view, node);
  if (!["iat", "exp", "nbf"].includes(key)) {
    return null;
  }

  const valStr = view.state.doc
    .sliceString(node.from, node.to)
    .replace(/^["']|["']$/g, "");
  const num = Number(valStr);
  if (!Number.isFinite(num) || num <= 0) {
    return null;
  }

  const timeStatus = formatClaimTimestamp(key, num);
  if (!timeStatus?.isValid) {
    return null;
  }

  return {
    pos: node.from,
    end: node.to,
    above: true,
    arrow: true,
    create() {
      const dom = document.createElement("div");
      dom.className = "cm-jwt-tooltip-box";

      const title = document.createElement("span");
      title.className = "cm-jwt-tooltip-title";
      title.textContent = timeStatus.statusLabel;

      const time = document.createElement("span");
      time.className = "cm-jwt-tooltip-time";
      time.textContent = `${timeStatus.isoDate} (${timeStatus.localDate})`;

      dom.appendChild(title);
      dom.appendChild(time);
      return { dom };
    },
  };
}

export const jwtClaimsTooltip = hoverTooltip(
  (view: EditorView, pos: number, side: -1 | 1): Tooltip | null => {
    const tree = syntaxTree(view.state);
    const node = tree.resolveInner(pos, side);
    return getPropertyTooltip(view, node) ?? getTimestampTooltip(view, node);
  }
);

export const jwtClaimsTheme = EditorView.theme({
  ".cm-jwt-claim-key, .cm-jwt-claim-value": {
    cursor: "help !important",
    textDecorationColor: "var(--muted-foreground) !important",
    textDecorationLine: "underline !important",
    textDecorationStyle: "dotted !important",
    textUnderlineOffset: "3px !important",
  },
  ".cm-tooltip": {
    backgroundColor: "var(--popover) !important",
    border: "1px solid var(--border) !important",
    borderRadius: "0.375rem !important",
    boxShadow:
      "0 10px 15px -3px rgb(0 0 0 / 0.35), 0 4px 6px -4px rgb(0 0 0 / 0.2) !important",
    color: "var(--popover-foreground) !important",
    fontSize: "0.75rem !important",
    lineHeight: "1.25rem !important",
    padding: "0.45rem 0.7rem !important",
    zIndex: "9999 !important",
  },
  "& .cm-tooltip": {
    backgroundColor: "var(--popover) !important",
    border: "1px solid var(--border) !important",
    borderRadius: "0.375rem !important",
    boxShadow:
      "0 10px 15px -3px rgb(0 0 0 / 0.35), 0 4px 6px -4px rgb(0 0 0 / 0.2) !important",
    color: "var(--popover-foreground) !important",
    fontSize: "0.75rem !important",
    lineHeight: "1.25rem !important",
    padding: "0.45rem 0.7rem !important",
    zIndex: "9999 !important",
  },
  ".cm-tooltip.cm-tooltip-above .cm-tooltip-arrow:before": {
    borderTopColor: "var(--border) !important",
  },
  ".cm-tooltip.cm-tooltip-above .cm-tooltip-arrow:after": {
    borderTopColor: "var(--popover) !important",
  },
  ".cm-tooltip.cm-tooltip-below .cm-tooltip-arrow:before": {
    borderBottomColor: "var(--border) !important",
  },
  ".cm-tooltip.cm-tooltip-below .cm-tooltip-arrow:after": {
    borderBottomColor: "var(--popover) !important",
  },
  "& .cm-tooltip-arrow:before": {
    borderBottomColor: "var(--border) !important",
    borderTopColor: "var(--border) !important",
  },
  "& .cm-tooltip-arrow:after": {
    borderBottomColor: "var(--popover) !important",
    borderTopColor: "var(--popover) !important",
  },
  ".cm-jwt-tooltip-box": {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
    maxWidth: "320px",
  },
  ".cm-jwt-tooltip-desc": {
    color: "var(--muted-foreground)",
  },
  ".cm-jwt-tooltip-time": {
    color: "var(--muted-foreground)",
    fontFamily: "var(--font-mono, monospace)",
    fontSize: "0.7rem",
    marginTop: "2px",
  },
  ".cm-jwt-tooltip-title": {
    color: "var(--popover-foreground)",
    fontWeight: "600",
  },
});

export const jwtClaimsExtensions = [
  jwtClaimsDecorations,
  jwtClaimsTooltip,
  jwtClaimsTheme,
  tooltips({
    parent: typeof document === "undefined" ? undefined : document.body,
    position: "fixed",
  }),
];
