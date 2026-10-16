import { SimulatorDbWorkspace } from "@/features/simulator-db/components/simulator-db-workspace";
import { useDocumentMeta } from "@/hooks/use-document-meta";

export function SimulatorDbPage() {
  useDocumentMeta({
    description:
      "Inspect, query, and manipulate the remote ISO8583 biller simulator SQLite database.",
    keywords: [
      "sqlite",
      "simulator db",
      "datagrip",
      "database studio",
      "iso8583",
    ],
    title: "Simulator DB Studio",
  });

  return (
    <div className="flex flex-1 flex-col p-4 md:p-6">
      <div className="mb-4 flex flex-col gap-1">
        <h1 className="font-bold text-xl tracking-tight">
          Simulator Database Studio
        </h1>
        <p className="text-muted-foreground text-xs">
          Interactive DataGrip-style workspace for the remote ISO8583 simulator
          SQLite database (192.168.4.45).
        </p>
      </div>
      <SimulatorDbWorkspace />
    </div>
  );
}
