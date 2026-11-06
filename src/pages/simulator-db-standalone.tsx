import { Link } from "react-router";
import { ChevronLeft } from "@/components/hugeicons";
import { useI18n } from "@/components/i18n-provider";
import { Button } from "@/components/ui/button";
import { SimulatorDbWorkspace } from "@/features/simulator-db/components/simulator-db-workspace";
import { useDocumentMeta } from "@/hooks/use-document-meta";

export function SimulatorDbStandalonePage() {
  const { messages } = useI18n();
  useDocumentMeta({
    description:
      "Inspect, query, and manipulate the remote ISO8583 biller simulator SQLite database.",
    keywords: ["sqlite", "simulator db", "iso8583"],
    title: "ISOBillerSim",
  });

  return (
    <main className="flex h-dvh min-h-0 flex-col overflow-hidden bg-background text-foreground">
      <header className="flex shrink-0 items-center gap-3 border-b px-3 py-1.5">
        <h1 className="font-medium text-sm">ISOBillerSim</h1>
        <Button
          className="ml-auto"
          render={<Link to="/dashboard/simulator-db" />}
          size="sm"
          variant="ghost"
        >
          <ChevronLeft data-icon="inline-start" />
          {messages.simulatorDb.backToDashboard}
        </Button>
      </header>
      <SimulatorDbWorkspace dedicated />
    </main>
  );
}
