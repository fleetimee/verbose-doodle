import { HomePage } from "@/features/home/components/home-page";
import { useDocumentMeta } from "@/hooks/use-document-meta";

export function Home() {
  useDocumentMeta({
    title: "Home",
  });

  return <HomePage />;
}
