import { AboutPage } from "@/features/about/components/about-page";
import { useDocumentMeta } from "@/hooks/use-document-meta";

export function About() {
  useDocumentMeta({
    title: "About",
    description:
      "Learn more about the Biller Simulator - a powerful tool for prototyping billing scenarios",
    keywords: ["about", "billing simulator", "information"],
  });

  return <AboutPage />;
}
