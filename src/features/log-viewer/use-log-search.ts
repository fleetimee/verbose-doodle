import { type RefObject, useEffect, useState } from "react";
import type { LogPage } from "@/features/log-viewer/types";

const MAX_MATCHES = 2000;
const REGEX_SPECIAL = /[.*+?^${}()|[\]\\]/g;
interface TextPart {
  length: number;
  node: Node;
  offset: number;
}

function endpoint(parts: TextPart[], offset: number) {
  let low = 0;
  let high = parts.length - 1;
  while (low < high) {
    const middle = Math.floor((low + high) / 2);
    if (parts[middle].offset + parts[middle].length < offset) {
      low = middle + 1;
    } else {
      high = middle;
    }
  }
  return { node: parts[low].node, offset: offset - parts[low].offset };
}

function rangesForFile(
  elements: HTMLElement[],
  query: string,
  budget: number
): Range[] {
  const parts: TextPart[] = [];
  let text = "";
  for (const element of elements) {
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    let node = walker.nextNode();
    while (node) {
      const value = node.textContent || "";
      if (value) {
        parts.push({ node, offset: text.length, length: value.length });
        text += value;
      }
      node = walker.nextNode();
    }
  }
  const ranges: Range[] = [];
  const pattern = new RegExp(query.replace(REGEX_SPECIAL, "\\$&"), "giu");
  for (const match of text.matchAll(pattern)) {
    const start = endpoint(parts, match.index);
    const end = endpoint(parts, match.index + match[0].length);
    const range = document.createRange();
    range.setStart(start.node, start.offset);
    range.setEnd(end.node, end.offset);
    ranges.push(range);
    if (ranges.length >= budget) {
      break;
    }
  }
  return ranges;
}

function findRanges(viewport: HTMLElement, query: string): Range[] {
  const groups: HTMLElement[][] = [];
  let filename: string | undefined;
  for (const element of viewport.querySelectorAll<HTMLElement>(
    "[data-log-text]"
  )) {
    if (element.dataset.logText !== filename) {
      groups.push([]);
      filename = element.dataset.logText;
    }
    groups.at(-1)?.push(element);
  }
  const ranges: Range[] = [];
  for (const group of groups) {
    ranges.push(
      ...rangesForFile(group, query, MAX_MATCHES + 1 - ranges.length)
    );
    if (ranges.length > MAX_MATCHES) {
      break;
    }
  }
  return ranges;
}

export function useLogSearch(
  viewport: RefObject<HTMLDivElement | null>,
  pages: LogPage[],
  query: string
) {
  const [ranges, setRanges] = useState<Range[]>([]);
  const [active, setActive] = useState(0);
  const [limited, setLimited] = useState(false);
  const [supported, setSupported] = useState(true);
  useEffect(() => {
    const available = "Highlight" in window && "highlights" in CSS;
    setSupported(available);
    if (!(available && viewport.current && query)) {
      setRanges([]);
      setActive(0);
      setLimited(false);
      return;
    }
    const found = findRanges(viewport.current, query);
    setLimited(found.length > MAX_MATCHES);
    setRanges(found.slice(0, MAX_MATCHES));
    setActive(0);
  }, [viewport, pages, query]);
  useEffect(() => {
    if (!(supported && ranges.length)) {
      return;
    }
    const highlight = new Highlight(...ranges);
    CSS.highlights.set("log-search-matches", highlight);
    return () => {
      if (CSS.highlights.get("log-search-matches") === highlight) {
        CSS.highlights.delete("log-search-matches");
      }
    };
  }, [ranges, supported]);
  useEffect(() => {
    const range = ranges[active];
    const element = viewport.current;
    if (!(range && element && supported)) {
      return;
    }
    const highlight = new Highlight(range);
    highlight.priority = 1;
    CSS.highlights.set("log-search-current", highlight);
    const bounds = range.getBoundingClientRect();
    const frame = element.getBoundingClientRect();
    element.scrollTop += bounds.top - frame.top - element.clientHeight / 2;
    if (bounds.left < frame.left || bounds.right > frame.right) {
      element.scrollLeft += bounds.left - frame.left - element.clientWidth / 2;
    }
    return () => {
      if (CSS.highlights.get("log-search-current") === highlight) {
        CSS.highlights.delete("log-search-current");
      }
    };
  }, [ranges, active, supported, viewport]);
  const navigate = (direction: number) =>
    setActive((current) =>
      ranges.length ? (current + direction + ranges.length) % ranges.length : 0
    );
  return {
    count: ranges.length,
    active: ranges.length ? active + 1 : 0,
    limited,
    supported,
    navigate,
  };
}
