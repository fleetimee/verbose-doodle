import { AboutPage } from "@/features/about/components/about-page";
import { useDocumentMeta } from "@/hooks/use-document-meta";
import { messages } from "@/lib/i18n";

export function About() {
  useDocumentMeta({
    title: messages.about.documentTitle,
    description: messages.about.documentDescription,
    keywords: ["about", "billing simulator", "information"],
  });

  return <AboutPage />;
}
