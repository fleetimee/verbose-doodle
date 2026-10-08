export type DiffMode = "json" | "text";
export type ChangeKind = "added" | "removed" | "changed" | "reordered";
type JsonValue =
  | null
  | boolean
  | number
  | string
  | JsonValue[]
  | { [key: string]: JsonValue };
export type JsonChange = {
  readonly kind: ChangeKind;
  readonly path: string;
  readonly before?: JsonValue;
  readonly after?: JsonValue;
};
export type TextLine = {
  readonly kind: "equal" | "added" | "removed";
  readonly value: string;
  readonly beforeLine?: number;
  readonly afterLine?: number;
};
export type DiffResult =
  | { readonly mode: "json"; readonly changes: readonly JsonChange[] }
  | { readonly mode: "text"; readonly lines: readonly TextLine[] };

export const MAX_INPUT_BYTES = 100_000;
const MAX_JSON_DEPTH = 100;
const MAX_TEXT_LINES = 2000;
const MAX_DIFF_CELLS = 2_000_000;

export class DiffError extends Error {
  readonly code: "size" | "json" | "depth" | "lines" | "complexity" | "number";
  readonly side?: "before" | "after";

  constructor(
    code: DiffError["code"],
    options: ErrorOptions & { side?: DiffError["side"]; detail?: string } = {}
  ) {
    super(options.detail ?? code, { cause: options.cause });
    this.code = code;
    this.side = options.side;
  }
}

function checkInput(value: string, side: "before" | "after") {
  if (new TextEncoder().encode(value).length > MAX_INPUT_BYTES) {
    throw new DiffError("size", { side });
  }
}

function isObject(value: JsonValue): value is { [key: string]: JsonValue } {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isNumber(value: JsonValue): value is number {
  return typeof value === "number";
}

function parseJson(source: string, side: "before" | "after"): JsonValue {
  let value: JsonValue;
  try {
    // SAFETY: JSON.parse accepts only JSON values; the traversal below bounds their depth.
    value = JSON.parse(source) as JsonValue;
  } catch (error) {
    throw new DiffError("json", {
      side,
      detail: error instanceof Error ? error.message : "",
      cause: error,
    });
  }
  const pending = [{ value, depth: 0 }];
  while (pending.length > 0) {
    const entry = pending.pop();
    if (
      entry &&
      isNumber(entry.value) &&
      (!Number.isFinite(entry.value) ||
        (Number.isInteger(entry.value) && !Number.isSafeInteger(entry.value)))
    ) {
      throw new DiffError("number", { side });
    }
    if (!(entry && (Array.isArray(entry.value) || isObject(entry.value)))) {
      continue;
    }
    if (entry.depth >= MAX_JSON_DEPTH) {
      throw new DiffError("depth", { side });
    }
    for (const child of Object.values(entry.value)) {
      pending.push({ value: child, depth: entry.depth + 1 });
    }
  }
  return value;
}

function childPath(path: string, key: string | number) {
  return `${path}/${String(key).replaceAll("~", "~0").replaceAll("/", "~1")}`;
}

function compareArrays(
  before: JsonValue[],
  after: JsonValue[],
  path: string,
  ignoreKeyOrder: boolean,
  changes: JsonChange[]
) {
  for (let index = 0; index < Math.max(before.length, after.length); index++) {
    const nextPath = childPath(path, index);
    if (index >= before.length) {
      changes.push({ kind: "added", path: nextPath, after: after[index] });
    } else if (index >= after.length) {
      changes.push({
        kind: "removed",
        path: nextPath,
        before: before[index],
      });
    } else {
      compareJsonValues(
        before[index],
        after[index],
        nextPath,
        ignoreKeyOrder,
        changes
      );
    }
  }
}

function compareJsonValues(
  before: JsonValue,
  after: JsonValue,
  path: string,
  ignoreKeyOrder: boolean,
  changes: JsonChange[]
) {
  if (before === after) {
    return;
  }
  if (Array.isArray(before) && Array.isArray(after)) {
    compareArrays(before, after, path, ignoreKeyOrder, changes);
    return;
  }
  if (isObject(before) && isObject(after)) {
    const beforeKeys = Object.keys(before);
    const afterKeys = Object.keys(after);
    const sharedBefore = beforeKeys.filter((key) => Object.hasOwn(after, key));
    const sharedAfter = afterKeys.filter((key) => Object.hasOwn(before, key));
    if (
      !ignoreKeyOrder &&
      sharedBefore.some((key, index) => key !== sharedAfter[index])
    ) {
      changes.push({
        kind: "reordered",
        path,
        before: beforeKeys,
        after: afterKeys,
      });
    }
    for (const key of new Set([...beforeKeys, ...afterKeys])) {
      const nextPath = childPath(path, key);
      if (!Object.hasOwn(before, key)) {
        changes.push({ kind: "added", path: nextPath, after: after[key] });
      } else if (Object.hasOwn(after, key)) {
        compareJsonValues(
          before[key],
          after[key],
          nextPath,
          ignoreKeyOrder,
          changes
        );
      } else {
        changes.push({ kind: "removed", path: nextPath, before: before[key] });
      }
    }
    return;
  }
  changes.push({ kind: "changed", path, before, after });
}

function splitLines(value: string, side: "before" | "after") {
  const lines = value === "" ? [] : value.replace(/\r\n?/g, "\n").split("\n");
  if (lines.length > MAX_TEXT_LINES) {
    throw new DiffError("lines", { side });
  }
  return lines;
}

function compareLines(before: string[], after: string[]): TextLine[] {
  const width = after.length + 1;
  if ((before.length + 1) * width > MAX_DIFF_CELLS) {
    throw new DiffError("complexity");
  }
  const lengths = new Uint16Array((before.length + 1) * width);
  for (let left = before.length - 1; left >= 0; left--) {
    for (let right = after.length - 1; right >= 0; right--) {
      lengths[left * width + right] =
        before[left] === after[right]
          ? lengths[(left + 1) * width + right + 1] + 1
          : Math.max(
              lengths[(left + 1) * width + right],
              lengths[left * width + right + 1]
            );
    }
  }
  const lines: TextLine[] = [];
  let left = 0;
  let right = 0;
  while (left < before.length || right < after.length) {
    if (
      left < before.length &&
      right < after.length &&
      before[left] === after[right]
    ) {
      lines.push({
        kind: "equal",
        value: before[left],
        beforeLine: left + 1,
        afterLine: right + 1,
      });
      left++;
      right++;
    } else if (
      left < before.length &&
      (right === after.length ||
        lengths[(left + 1) * width + right] >=
          lengths[left * width + right + 1])
    ) {
      lines.push({
        kind: "removed",
        value: before[left],
        beforeLine: left + 1,
      });
      left++;
    } else {
      lines.push({ kind: "added", value: after[right], afterLine: right + 1 });
      right++;
    }
  }
  return lines;
}

function alignTextLines(before: string[], after: string[]): TextLine[] {
  let prefix = 0;
  while (
    prefix < before.length &&
    prefix < after.length &&
    before[prefix] === after[prefix]
  ) {
    prefix++;
  }
  let suffix = 0;
  while (
    suffix < before.length - prefix &&
    suffix < after.length - prefix &&
    before.at(-suffix - 1) === after.at(-suffix - 1)
  ) {
    suffix++;
  }
  const lines: TextLine[] = before.slice(0, prefix).map((value, index) => ({
    kind: "equal",
    value,
    beforeLine: index + 1,
    afterLine: index + 1,
  }));
  for (const line of compareLines(
    before.slice(prefix, before.length - suffix),
    after.slice(prefix, after.length - suffix)
  )) {
    lines.push({
      ...line,
      beforeLine:
        line.beforeLine === undefined ? undefined : line.beforeLine + prefix,
      afterLine:
        line.afterLine === undefined ? undefined : line.afterLine + prefix,
    });
  }
  for (let index = 0; index < suffix; index++) {
    lines.push({
      kind: "equal",
      value: before[before.length - suffix + index],
      beforeLine: before.length - suffix + index + 1,
      afterLine: after.length - suffix + index + 1,
    });
  }
  return lines;
}

export function compareDocuments(
  before: string,
  after: string,
  mode: DiffMode,
  ignoreKeyOrder = true
): DiffResult {
  checkInput(before, "before");
  checkInput(after, "after");
  if (mode === "text") {
    const left = splitLines(before, "before");
    const right = splitLines(after, "after");
    return { mode, lines: alignTextLines(left, right) };
  }
  const changes: JsonChange[] = [];
  compareJsonValues(
    parseJson(before, "before"),
    parseJson(after, "after"),
    "",
    ignoreKeyOrder,
    changes
  );
  return { mode, changes };
}

export function serializeDiff(result: DiffResult): string {
  if (result.mode === "json") {
    return JSON.stringify(result.changes, null, 2);
  }
  return result.lines
    .map((line) => {
      const marker = { equal: " ", added: "+", removed: "-" }[line.kind];
      return `${marker} ${line.value}`;
    })
    .join("\n");
}
