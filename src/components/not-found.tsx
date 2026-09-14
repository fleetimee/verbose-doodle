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
    <div className="flex w-full items-center justify-center">
      <div className="flex h-screen items-center border-x">
        <div>
          <div className="absolute inset-x-0 h-px bg-border" />
          <Empty>
            <EmptyHeader>
              <EmptyTitle className="font-black font-mono text-8xl">
                {messages.errors.notFoundTitle}
              </EmptyTitle>
              <EmptyDescription className="text-nowrap">
                {messages.errors.notFoundDescriptionLine1} <br />
                {messages.errors.notFoundDescriptionLine2}
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <div className="flex gap-2">
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
          <div className="absolute inset-x-0 h-px bg-border" />
        </div>
      </div>
    </div>
  );
}
