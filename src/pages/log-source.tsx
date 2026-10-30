import { Link } from "react-router";
import { ChevronLeft, FileTerminal } from "@/components/hugeicons";
import { useI18n } from "@/components/i18n-provider";
import { Button } from "@/components/ui/button";
import { LogViewerPage } from "@/pages/dashboard/log-viewer";

export function LogSourcePage() {
  const { messages } = useI18n();
  const copy = messages.logViewer;

  return (
    <main className="log-source-page flex h-dvh min-h-0 flex-col gap-3 overflow-hidden bg-background p-3 text-foreground sm:p-4">
      <header className="flex shrink-0 items-center gap-3">
        <FileTerminal
          aria-hidden="true"
          className="size-4 text-muted-foreground"
        />
        <h1 className="font-medium text-sm">{copy.title}</h1>
        <Button
          className="ml-auto"
          render={<Link to="/dashboard/logs" />}
          size="sm"
          variant="ghost"
        >
          <ChevronLeft data-icon="inline-start" />
          {copy.backToWorkspace}
        </Button>
      </header>
      <LogViewerPage />
    </main>
  );
}
