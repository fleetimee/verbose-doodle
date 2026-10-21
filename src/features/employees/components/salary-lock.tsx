import { useQueryClient } from "@tanstack/react-query";
import { type ReactNode, useCallback, useEffect, useState } from "react";
import { UnlockIcon } from "@/components/hugeicons";
import { useI18n } from "@/components/i18n-provider";
import { Button } from "@/components/ui/button";
import { SalaryPattern } from "@/features/employees/components/salary-pattern";
import { formatMessage } from "@/lib/i18n";

const UNLOCK_MS = 5 * 60 * 1000;
const SHARED_PATTERN = "2589";

function readDeadline(key: string) {
  try {
    const value = Number(sessionStorage.getItem(key));
    return value > Date.now() && value <= Date.now() + UNLOCK_MS ? value : 0;
  } catch {
    return 0;
  }
}

export function SalaryLock({
  nrp,
  account,
  children,
}: {
  nrp: number;
  account: string;
  children: (deadline: number) => ReactNode;
}) {
  const { messages } = useI18n();
  const copy = messages.employees;
  const queryClient = useQueryClient();
  const storageKey = `salary-unlock:${account}:${nrp}`;
  const [deadline, setDeadline] = useState(() => readDeadline(storageKey));
  const [now, setNow] = useState(Date.now);
  const [error, setError] = useState(false);
  const lock = useCallback(() => {
    setDeadline(0);
    try {
      sessionStorage.removeItem(storageKey);
    } catch {
      /* Keep the view locked when storage is unavailable. */
    }
    queryClient.removeQueries({ queryKey: ["employee-salary", nrp] });
  }, [nrp, queryClient, storageKey]);

  useEffect(
    () => () => {
      queryClient.removeQueries({ queryKey: ["employee-salary", nrp] });
    },
    [nrp, queryClient]
  );

  useEffect(() => {
    if (!deadline) {
      return;
    }
    const check = () => {
      const current = Date.now();
      setNow(current);
      if (current >= deadline) {
        lock();
      }
    };
    const timeout = window.setTimeout(lock, Math.max(0, deadline - Date.now()));
    const interval = window.setInterval(check, 1000);
    window.addEventListener("focus", check);
    document.addEventListener("visibilitychange", check);
    return () => {
      window.clearTimeout(timeout);
      window.clearInterval(interval);
      window.removeEventListener("focus", check);
      document.removeEventListener("visibilitychange", check);
    };
  }, [deadline, lock]);

  function unlock(pattern: string) {
    if (pattern !== SHARED_PATTERN) {
      setError(true);
      return;
    }
    const current = Date.now();
    const next = current + UNLOCK_MS;
    setNow(current);
    setError(false);
    setDeadline(next);
    try {
      sessionStorage.setItem(storageKey, String(next));
    } catch {
      /* The unlock still expires in memory. */
    }
  }

  if (!deadline || now >= deadline) {
    return (
      <section
        aria-labelledby="salary-lock-title"
        className="flex min-w-0 flex-col items-center gap-4 py-6"
      >
        <div className="flex max-w-sm flex-col gap-2 text-center">
          <h3 className="font-semibold text-base" id="salary-lock-title">
            {copy.salaryLocked}
          </h3>
          <p className="text-muted-foreground text-sm">{copy.salaryLockHint}</p>
        </div>
        <SalaryPattern onComplete={unlock} />
        <p className="min-h-5 text-destructive text-sm" role="alert">
          {error ? copy.salaryPatternError : ""}
        </p>
        <p className="max-w-sm text-center text-muted-foreground text-xs">
          {copy.salaryLockNotice}
        </p>
      </section>
    );
  }
  const remaining = Math.max(0, Math.ceil((deadline - now) / 1000));
  const time = `${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, "0")}`;
  return (
    <div className="flex min-w-0 flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3">
        <p className="flex items-center gap-2 text-muted-foreground text-xs">
          <UnlockIcon aria-hidden="true" className="size-4" />
          <span>{formatMessage(copy.salaryRelocksIn, { time })}</span>
        </p>
        <Button onClick={lock} size="sm" variant="outline">
          {copy.salaryLockNow}
        </Button>
      </div>
      {children(deadline)}
    </div>
  );
}
