import { useEffect } from "react";
import { getActiveLocale } from "@/lib/i18n";

export type DocumentMetaProps = {
  readonly canonicalUrl?: string;
  readonly description?: string;
  readonly keywords?: readonly string[] | string[];
  readonly ogDescription?: string;
  readonly ogImage?: string;
  readonly ogLocale?: string;
  readonly ogTitle?: string;
  readonly ogType?: string;
  readonly ogUrl?: string;
  readonly robots?: string;
  readonly themeColor?: string;
  readonly title?: string;
};

export const DEFAULT_TITLE = "Fleetime Labs";
export const DEFAULT_DESCRIPTION =
  "Fleetime Labs helps teams prototype billing scenarios, test socket protocols, and inspect network traffic.";
export const DEFAULT_KEYWORDS: readonly string[] = [
  "billing simulator",
  "billing prototype",
  "invoicing",
  "payment simulation",
  "developer tools",
  "socket test",
  "socks relay",
];
export const DEFAULT_OG_IMAGE = "/brand/biller-app-icon.png";
export const DEFAULT_IMAGE = DEFAULT_OG_IMAGE;
export const DEFAULT_THEME_COLOR = "#0a0a0a";
export const DEFAULT_OG_TYPE = "website";
export const DEFAULT_TYPE = DEFAULT_OG_TYPE;

export function formatDocumentTitle(title?: string): string {
  if (!title || title.trim() === "") {
    return DEFAULT_TITLE;
  }
  const trimmed = title.trim();
  if (trimmed === DEFAULT_TITLE || trimmed.endsWith(`| ${DEFAULT_TITLE}`)) {
    return trimmed;
  }
  return `${trimmed} | ${DEFAULT_TITLE}`;
}

function getFormattedLocale(localeOverride?: string): string {
  if (localeOverride) {
    return localeOverride;
  }
  const activeLocale = getActiveLocale();
  return activeLocale === "id-ID" ? "id_ID" : "en_US";
}

function updateMetaTag(
  keyType: "name" | "property",
  keyValue: string,
  content: string
): void {
  let element = document.querySelector(`meta[${keyType}="${keyValue}"]`);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(keyType, keyValue);
    document.head.appendChild(element);
  }
  element.setAttribute("content", content);
}

function removeMetaTag(keyType: "name" | "property", keyValue: string): void {
  const element = document.querySelector(`meta[${keyType}="${keyValue}"]`);
  if (element) {
    element.remove();
  }
}

function updateLinkTag(rel: string, href: string): void {
  let element = document.querySelector(`link[rel="${rel}"]`);
  if (!element) {
    element = document.createElement("link");
    element.setAttribute("rel", rel);
    document.head.appendChild(element);
  }
  element.setAttribute("href", href);
}

function removeLinkTag(rel: string): void {
  const element = document.querySelector(`link[rel="${rel}"]`);
  if (element) {
    element.remove();
  }
}

export function useDocumentMeta({
  canonicalUrl,
  description = DEFAULT_DESCRIPTION,
  keywords,
  ogDescription,
  ogImage,
  ogLocale,
  ogTitle,
  ogType = DEFAULT_OG_TYPE,
  ogUrl,
  robots,
  themeColor = DEFAULT_THEME_COLOR,
  title,
}: DocumentMetaProps = {}): void {
  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    const fullTitle = formatDocumentTitle(title);
    const resolvedDescription = description || DEFAULT_DESCRIPTION;
    const resolvedKeywords =
      keywords && keywords.length > 0
        ? [...keywords].join(", ")
        : DEFAULT_KEYWORDS.join(", ");
    const finalOgTitle = ogTitle || fullTitle;
    const finalOgDescription = ogDescription || resolvedDescription;
    const finalImage = ogImage || DEFAULT_OG_IMAGE;
    const finalLocale = getFormattedLocale(ogLocale);
    const resolvedUrl =
      ogUrl ||
      canonicalUrl ||
      (typeof window !== "undefined" &&
      window.location?.href &&
      !window.location.href.startsWith("about:")
        ? window.location.href
        : undefined);

    // Document Title & Primary Meta Tags
    document.title = fullTitle;
    updateMetaTag("name", "title", fullTitle);
    updateMetaTag("name", "description", resolvedDescription);
    updateMetaTag("name", "keywords", resolvedKeywords);
    updateMetaTag("name", "application-name", DEFAULT_TITLE);
    updateMetaTag("name", "apple-mobile-web-app-title", DEFAULT_TITLE);
    updateMetaTag("name", "theme-color", themeColor);

    // Robots meta
    if (robots) {
      updateMetaTag("name", "robots", robots);
    } else {
      removeMetaTag("name", "robots");
    }

    // Canonical link
    if (canonicalUrl) {
      updateLinkTag("canonical", canonicalUrl);
    } else {
      removeLinkTag("canonical");
    }

    // Open Graph
    updateMetaTag("property", "og:type", ogType);
    updateMetaTag("property", "og:site_name", DEFAULT_TITLE);
    updateMetaTag("property", "og:title", finalOgTitle);
    updateMetaTag("property", "og:description", finalOgDescription);
    updateMetaTag("property", "og:image", finalImage);
    updateMetaTag("property", "og:locale", finalLocale);

    if (resolvedUrl) {
      updateMetaTag("property", "og:url", resolvedUrl);
    } else {
      removeMetaTag("property", "og:url");
    }

    // Twitter Card
    updateMetaTag("name", "twitter:card", "summary_large_image");
    updateMetaTag("name", "twitter:title", finalOgTitle);
    updateMetaTag("name", "twitter:description", finalOgDescription);
    updateMetaTag("name", "twitter:image", finalImage);

    if (resolvedUrl) {
      updateMetaTag("name", "twitter:url", resolvedUrl);
    } else {
      removeMetaTag("name", "twitter:url");
    }
  }, [
    canonicalUrl,
    description,
    keywords,
    ogDescription,
    ogImage,
    ogLocale,
    ogTitle,
    ogType,
    ogUrl,
    robots,
    themeColor,
    title,
  ]);
}

export function DocumentMeta(props: DocumentMetaProps) {
  useDocumentMeta(props);
  return null;
}
