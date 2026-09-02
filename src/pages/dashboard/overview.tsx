import { useAuth } from "@/features/auth/context";
import { OverviewChat } from "@/features/overview/components/overview-chat";
import { useGetOverview } from "@/features/overview/hooks/use-get-overview";
import { useDocumentMeta } from "@/hooks/use-document-meta";
import { messages } from "@/lib/i18n";

export function OverviewPage() {
  const { snapshot } = useAuth();
  const isAdmin = snapshot.user?.role === "ADMIN";
  const { data, isLoading, error, refetch } = useGetOverview();

  useDocumentMeta({
    description: messages.overview.documentDescription,
    keywords: [
      "dashboard",
      "overview",
      "billing simulator",
      "endpoints",
      "responses",
    ],
    title: messages.overview.documentTitle,
  });

  return (
    <OverviewChat
      data={data}
      error={error}
      isAdmin={isAdmin}
      isLoading={isLoading}
      refetch={refetch}
    />
  );
}
