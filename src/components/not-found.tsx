import { HomeIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Link } from "react-router";
import { Compass } from "@/components/hugeicons";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { useDocumentMeta } from "@/hooks/use-document-meta";
import { messages } from "@/lib/i18n";

export function NotFoundPage() {
  useDocumentMeta({
    description: messages.errors.notFoundDocumentDescription,
    robots: "noindex, nofollow",
    title: messages.errors.notFoundDocumentTitle,
  });

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
                {messages.errors.notFoundTitle}
              </EmptyTitle>
              <EmptyDescription className="max-w-sm" variant="lead">
                {messages.errors.notFoundDescriptionLine1} <br />
                {messages.errors.notFoundDescriptionLine2}
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent className="max-w-none lg:items-start" size="sm">
              <div className="flex flex-wrap justify-center gap-2 lg:justify-start">
                <Button nativeButton={false} render={<Link to="/" />}>
                  <HugeiconsIcon icon={HomeIcon} strokeWidth={2} />{" "}
                  {messages.common.goHome}
                </Button>

                <Button
                  nativeButton={false}
                  render={<Link to="/dashboard" />}
                  variant="outline"
                >
                  <Compass /> {messages.common.explore}
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
