import { useEffect, useState } from "react";
import { useI18n } from "@/components/i18n-provider";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const jakartaTime = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Jakarta",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});

export function JakartaClock() {
  const { locale, messages } = useI18n();
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <Tooltip delayDuration={250}>
      <TooltipTrigger
        render={
          <Button
            aria-label={messages.common.jakartaTime}
            className="mr-1 shrink-0"
            size="sm"
            variant="ghost"
          />
        }
      >
        <time
          className="jakarta-clock-digits whitespace-nowrap tabular-nums"
          dateTime={now.toISOString()}
        >
          {jakartaTime.format(now)}
        </time>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        <div className="grid gap-1">
          <span>
            {new Intl.DateTimeFormat(locale, {
              timeZone: "Asia/Jakarta",
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            }).format(now)}
          </span>
          <span>{messages.common.jakartaTime} · Asia/Jakarta</span>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
