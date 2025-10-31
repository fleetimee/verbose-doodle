import { useDocumentMeta } from "@/hooks/use-document-meta";

export function SettingsPage() {
  useDocumentMeta({
    title: "Settings",
    description: "Configure your billing simulator settings and preferences",
    keywords: ["settings", "preferences", "configuration"],
  });

  return (
    <div>
      <h1 className="mb-6 font-bold text-3xl">Settings</h1>
      <p className="text-muted-foreground">Settings content goes here.</p>
    </div>
  );
}
