import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";
import { z } from "zod";
import { useLocalStorage } from "@/hooks/use-local-storage";

interface LogViewerSelection {
  from: string;
  stream: string;
  to: string;
}

const logDate = z.iso.date();

function initialDate() {
  const date = new Date();
  date.setDate(date.getDate() - 30);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function logSourceHref(
  id: string,
  from: string,
  to: string,
  stream: string
) {
  const params = new URLSearchParams({ from });
  if (to) {
    params.set("to", to);
  }
  if (stream) {
    params.set("stream", stream);
  }
  return `/logs/${encodeURIComponent(id)}?${params}`;
}

export function useLogViewerLocation() {
  const { sourceId } = useParams();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [storedId, setStoredId] = useLocalStorage(
    "log-viewer-selected-source",
    ""
  );
  const [local, setLocal] = useState<LogViewerSelection>(() => ({
    from: initialDate(),
    to: "",
    stream: "",
  }));
  const urlSource = params.get("source");
  useEffect(() => {
    if (!sourceId && storedId && !urlSource) {
      setParams(
        (previous) => {
          const next = new URLSearchParams(previous);
          next.set("source", storedId);
          return next;
        },
        { replace: true }
      );
    }
  }, [sourceId, storedId, urlSource, setParams]);
  const selection = sourceId
    ? {
        from: logDate.safeParse(params.get("from")).data ?? local.from,
        to: logDate.safeParse(params.get("to")).data ?? "",
        stream: params.get("stream") ?? "",
      }
    : local;

  function update(key: keyof LogViewerSelection, value: string) {
    if (sourceId) {
      setParams(
        (previous) => {
          const next = new URLSearchParams(previous);
          if (value) {
            next.set(key, value);
          } else {
            next.delete(key);
          }
          return next;
        },
        { replace: true }
      );
    } else {
      setLocal((previous) => ({ ...previous, [key]: value }));
    }
  }

  function setRange(from: string, to: string) {
    if (sourceId) {
      setParams(
        (previous) => {
          const next = new URLSearchParams(previous);
          next.set("from", from);
          next.set("to", to);
          return next;
        },
        { replace: true }
      );
    } else {
      setLocal((previous) => ({ ...previous, from, to }));
    }
  }

  function selectSource(id: string) {
    if (sourceId) {
      if (!id) {
        navigate("/dashboard/logs");
        return;
      }
      navigate(logSourceHref(id, selection.from, selection.to, ""));
    } else {
      setStoredId(id);
      setParams(
        (previous) => {
          const next = new URLSearchParams(previous);
          if (id) {
            next.set("source", id);
          } else {
            next.delete("source");
          }
          return next;
        },
        { replace: true }
      );
      update("stream", "");
    }
  }

  return {
    ...selection,
    dedicated: Boolean(sourceId),
    selectedId: sourceId ?? params.get("source") ?? storedId,
    setSelectedId: selectSource,
    setRange,
    setFrom: (value: string) => update("from", value),
    setTo: (value: string) => update("to", value),
    setStream: (value: string) => update("stream", value),
  };
}
