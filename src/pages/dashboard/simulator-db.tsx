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

  return <SimulatorDbWorkspace />;
}
