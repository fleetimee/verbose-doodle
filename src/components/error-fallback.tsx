import { HomeIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { RotateCcw } from "@/components/hugeicons";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { messages } from "@/lib/i18n";

type ErrorFallbackProps = {
  error: Error;
  resetError: () => void;
};

export function ErrorFallback({ error, resetError }: ErrorFallbackProps) {
  return (
    <main className="flex min-h-svh w-full items-center justify-center bg-background px-4 sm:px-8">
      <div className="relative flex min-h-svh w-full max-w-6xl items-center overflow-hidden border-border/70 border-x sm:min-h-[calc(100svh-3rem)]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-10 h-px bg-border/70 sm:top-16"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-10 h-px bg-border/70 sm:bottom-16"
        />

        <div className="relative z-10 flex w-full flex-col-reverse items-center px-6 py-16 sm:px-12 lg:flex-row lg:justify-between lg:px-20 lg:py-12">
          <Empty
            className="w-full flex-1 justify-center lg:items-start lg:text-left"
            size="hero"
            variant="plain"
          >
            <EmptyHeader
              className="max-w-md lg:items-start lg:text-left"
              size="lg"
            >
              <EmptyTitle variant="display">
                {messages.errors.fallbackTitle}
              </EmptyTitle>
              <EmptyDescription className="max-w-sm" variant="lead">
                {messages.errors.fallbackDescriptionLine1} <br />
                {messages.errors.fallbackDescriptionLine2}
              </EmptyDescription>
              {import.meta.env.DEV && error.message && (
                <div className="mt-4 w-full rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-left">
                  <p className="break-words font-mono text-destructive text-xs">
                    {error.message}
                  </p>
                </div>
              )}
            </EmptyHeader>
            <EmptyContent className="max-w-none lg:items-start" size="sm">
              <div className="flex flex-wrap justify-center gap-2 lg:justify-start">
                <Button onClick={resetError}>
                  <RotateCcw data-icon="inline-start" />
                  {messages.common.tryAgain}
                </Button>
                <Button
                  nativeButton={false}
                  render={<a href="/" />}
                  variant="outline"
                >
                  <HugeiconsIcon
                    data-icon="inline-start"
                    icon={HomeIcon}
                    strokeWidth={2}
                  />
                  {messages.common.goHome}
                </Button>
              </div>
            </EmptyContent>
          </Empty>

          <div
            aria-hidden="true"
            className="relative flex h-[min(42svh,330px)] w-full max-w-[290px] shrink-0 items-end justify-center sm:h-[min(52svh,430px)] sm:max-w-[330px] lg:h-[min(76svh,680px)] lg:w-[min(38vw,400px)] lg:max-w-none"
          >
            <div className="absolute inset-x-8 bottom-2 h-24 rounded-full bg-primary/10 blur-3xl sm:bottom-4 sm:h-32" />
            <img
              alt=""
              className="relative h-full w-full object-contain object-bottom drop-shadow-2xl"
              height={1536}
              src="/brand/biller-operator-mascot-not-found.png"
              width={1024}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
