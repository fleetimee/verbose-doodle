import { useCallback, useEffect, useRef, useState } from "react";
import type { RemoteFileListing } from "@/features/server-inventory/utils/terminal-file-browser";

function nextHistory(
  current: { paths: string[]; index: number },
  path: string,
  historyIndex?: number
) {
  if (historyIndex !== undefined) {
    return { paths: current.paths, index: historyIndex };
  }
  if (current.paths[current.index] === path) {
    return current;
  }
  const paths = [...current.paths.slice(0, current.index + 1), path];
  return { paths, index: paths.length - 1 };
}

export function useRemoteFileBrowser(
  open: boolean,
  connected: boolean,
  transferBusy: boolean,
  listFiles: (path: string) => Promise<RemoteFileListing>
) {
  const [listing, setListing] = useState<RemoteFileListing | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState<{ paths: string[]; index: number }>({
    paths: [],
    index: -1,
  });
  const savedPath = useRef(".");
  const pending = useRef(false);
  const generation = useRef(0);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const finishRequest = useCallback((request: number) => {
    if (request !== generation.current) {
      return;
    }
    pending.current = false;
    if (mounted.current) {
      setLoading(false);
    }
  }, []);

  const navigate = useCallback(
    async (path: string, historyIndex?: number) => {
      if (!connected || transferBusy || pending.current) {
        return;
      }
      pending.current = true;
      const request = ++generation.current;
      setLoading(true);
      setError("");
      try {
        const result = await listFiles(path);
        if (!mounted.current || request !== generation.current) {
          return;
        }
        savedPath.current = result.path;
        setListing(result);
        setHistory((current) =>
          nextHistory(current, result.path, historyIndex)
        );
      } catch (failure) {
        const message =
          failure instanceof Error ? failure.message : String(failure);
        if (mounted.current && request === generation.current) {
          setError(message);
        }
      } finally {
        finishRequest(request);
      }
    },
    [connected, finishRequest, listFiles, transferBusy]
  );

  useEffect(() => {
    if (!connected) {
      generation.current += 1;
      pending.current = false;
      savedPath.current = ".";
      setLoading(false);
      setListing(null);
      setHistory({ paths: [], index: -1 });
      setError("");
    } else if (open) {
      navigate(savedPath.current);
    }
  }, [connected, open, navigate]);

  return {
    listing,
    loading,
    error,
    navigate,
    canBack: history.index > 0,
    canForward: history.index >= 0 && history.index < history.paths.length - 1,
    back: () => {
      const index = history.index - 1;
      if (index >= 0) {
        navigate(history.paths[index], index);
      }
    },
    forward: () => {
      const index = history.index + 1;
      if (index < history.paths.length) {
        navigate(history.paths[index], index);
      }
    },
    refresh: () => navigate(savedPath.current),
  };
}
