import { useEffect } from "react";

type DocumentMetaProps = {
  title?: string;
  description?: string;
  keywords?: string[];
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
};

const DEFAULT_TITLE = "Biller Simulator";
const DEFAULT_DESCRIPTION =
  "A powerful billing simulator application for prototyping billing scenarios";

export function useDocumentMeta({
  title,
  description = DEFAULT_DESCRIPTION,
  keywords,
  ogTitle,
  ogDescription,
  ogImage,
}: DocumentMetaProps = {}) {
  useEffect(() => {
    // Set document title
    const fullTitle = title ? `${title} | ${DEFAULT_TITLE}` : DEFAULT_TITLE;
    document.title = fullTitle;

    // Helper to update or create meta tags
    const updateMetaTag = (
      selector: string,
      attribute: string,
      content: string
    ) => {
      let element = document.querySelector(selector);
      if (!element) {
        element = document.createElement("meta");
        element.setAttribute(
          selector.includes("property") ? "property" : "name",
          selector.includes("property")
            ? selector.split('"')[1]
            : selector.split('"')[1]
        );
        document.head.appendChild(element);
      }
      element.setAttribute(attribute, content);
    };

    // Update description
    updateMetaTag('meta[name="description"]', "content", description);

    // Update keywords if provided
    if (keywords && keywords.length > 0) {
      updateMetaTag('meta[name="keywords"]', "content", keywords.join(", "));
    }

    // Update Open Graph tags
    const finalOgTitle = ogTitle || title || DEFAULT_TITLE;
    const finalOgDescription = ogDescription || description;

    updateMetaTag('meta[property="og:title"]', "content", finalOgTitle);
    updateMetaTag(
      'meta[property="og:description"]',
      "content",
      finalOgDescription
    );
    updateMetaTag('meta[property="og:type"]', "content", "website");

    if (ogImage) {
      updateMetaTag('meta[property="og:image"]', "content", ogImage);
    }

    // Twitter Card tags
    updateMetaTag('meta[name="twitter:card"]', "content", "summary_large_image");
    updateMetaTag('meta[name="twitter:title"]', "content", finalOgTitle);
    updateMetaTag(
      'meta[name="twitter:description"]',
      "content",
      finalOgDescription
    );

    if (ogImage) {
      updateMetaTag('meta[name="twitter:image"]', "content", ogImage);
    }
  }, [title, description, keywords, ogTitle, ogDescription, ogImage]);
}
