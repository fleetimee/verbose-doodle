import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { render } from "@testing-library/react";
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_IMAGE,
  DEFAULT_KEYWORDS,
  DEFAULT_THEME_COLOR,
  DEFAULT_TITLE,
  DEFAULT_TYPE,
  DocumentMeta,
  formatDocumentTitle,
  useDocumentMeta,
} from "@/hooks/use-document-meta";

function TestMetaComponent(props: Parameters<typeof useDocumentMeta>[0]) {
  useDocumentMeta(props);
  return null;
}

describe("formatDocumentTitle", () => {
  test("returns DEFAULT_TITLE when title is empty or undefined", () => {
    expect(formatDocumentTitle()).toBe(DEFAULT_TITLE);
    expect(formatDocumentTitle("")).toBe(DEFAULT_TITLE);
    expect(formatDocumentTitle("   ")).toBe(DEFAULT_TITLE);
  });

  test("appends DEFAULT_TITLE to title", () => {
    expect(formatDocumentTitle("Endpoints")).toBe(`Endpoints | ${DEFAULT_TITLE}`);
    expect(formatDocumentTitle("TCP Client | Socket Tester")).toBe(
      `TCP Client | Socket Tester | ${DEFAULT_TITLE}`
    );
  });

  test("does not duplicate DEFAULT_TITLE if already present", () => {
    expect(formatDocumentTitle(DEFAULT_TITLE)).toBe(DEFAULT_TITLE);
    expect(formatDocumentTitle(`Endpoints | ${DEFAULT_TITLE}`)).toBe(
      `Endpoints | ${DEFAULT_TITLE}`
    );
  });
});

describe("useDocumentMeta", () => {
  beforeEach(() => {
    document.title = "";
    document.head.innerHTML = "";
  });

  afterEach(() => {
    document.title = "";
    document.head.innerHTML = "";
  });

  test("applies default metadata when no props are provided", () => {
    render(<TestMetaComponent />);

    expect(document.title).toBe(DEFAULT_TITLE);
    expect(
      document.querySelector('meta[name="title"]')?.getAttribute("content")
    ).toBe(DEFAULT_TITLE);
    expect(
      document
        .querySelector('meta[name="description"]')
        ?.getAttribute("content")
    ).toBe(DEFAULT_DESCRIPTION);
    expect(
      document.querySelector('meta[name="keywords"]')?.getAttribute("content")
    ).toBe(DEFAULT_KEYWORDS.join(", "));
    expect(
      document
        .querySelector('meta[name="application-name"]')
        ?.getAttribute("content")
    ).toBe(DEFAULT_TITLE);
    expect(
      document
        .querySelector('meta[name="theme-color"]')
        ?.getAttribute("content")
    ).toBe(DEFAULT_THEME_COLOR);

    // Open Graph defaults
    expect(
      document.querySelector('meta[property="og:type"]')?.getAttribute("content")
    ).toBe(DEFAULT_TYPE);
    expect(
      document
        .querySelector('meta[property="og:site_name"]')
        ?.getAttribute("content")
    ).toBe(DEFAULT_TITLE);
    expect(
      document
        .querySelector('meta[property="og:title"]')
        ?.getAttribute("content")
    ).toBe(DEFAULT_TITLE);
    expect(
      document
        .querySelector('meta[property="og:description"]')
        ?.getAttribute("content")
    ).toBe(DEFAULT_DESCRIPTION);
    expect(
      document
        .querySelector('meta[property="og:image"]')
        ?.getAttribute("content")
    ).toBe(DEFAULT_IMAGE);
    expect(
      document
        .querySelector('meta[property="og:locale"]')
        ?.getAttribute("content")
    ).toBe("en_US");

    // Twitter Card defaults
    expect(
      document
        .querySelector('meta[name="twitter:card"]')
        ?.getAttribute("content")
    ).toBe("summary_large_image");
    expect(
      document
        .querySelector('meta[name="twitter:title"]')
        ?.getAttribute("content")
    ).toBe(DEFAULT_TITLE);
    expect(
      document
        .querySelector('meta[name="twitter:description"]')
        ?.getAttribute("content")
    ).toBe(DEFAULT_DESCRIPTION);
    expect(
      document
        .querySelector('meta[name="twitter:image"]')
        ?.getAttribute("content")
    ).toBe(DEFAULT_IMAGE);
  });

  test("applies custom title, description, keywords, and images", () => {
    render(
      <TestMetaComponent
        canonicalUrl="https://example.com/dashboard/overview"
        description="Custom overview description"
        keywords={["custom", "keywords"]}
        ogImage="/custom-image.png"
        ogTitle="Custom OG Title"
        robots="noindex, nofollow"
        themeColor="#ff0000"
        title="Overview"
      />
    );

    expect(document.title).toBe(`Overview | ${DEFAULT_TITLE}`);
    expect(
      document.querySelector('meta[name="title"]')?.getAttribute("content")
    ).toBe(`Overview | ${DEFAULT_TITLE}`);
    expect(
      document
        .querySelector('meta[name="description"]')
        ?.getAttribute("content")
    ).toBe("Custom overview description");
    expect(
      document.querySelector('meta[name="keywords"]')?.getAttribute("content")
    ).toBe("custom, keywords");
    expect(
      document.querySelector('meta[name="robots"]')?.getAttribute("content")
    ).toBe("noindex, nofollow");
    expect(
      document
        .querySelector('meta[name="theme-color"]')
        ?.getAttribute("content")
    ).toBe("#ff0000");

    // Canonical link
    expect(
      document.querySelector('link[rel="canonical"]')?.getAttribute("href")
    ).toBe("https://example.com/dashboard/overview");

    // Open Graph
    expect(
      document
        .querySelector('meta[property="og:title"]')
        ?.getAttribute("content")
    ).toBe("Custom OG Title");
    expect(
      document
        .querySelector('meta[property="og:description"]')
        ?.getAttribute("content")
    ).toBe("Custom overview description");
    expect(
      document
        .querySelector('meta[property="og:image"]')
        ?.getAttribute("content")
    ).toBe("/custom-image.png");
    expect(
      document.querySelector('meta[property="og:url"]')?.getAttribute("content")
    ).toBe("https://example.com/dashboard/overview");

    // Twitter Card
    expect(
      document
        .querySelector('meta[name="twitter:title"]')
        ?.getAttribute("content")
    ).toBe("Custom OG Title");
    expect(
      document
        .querySelector('meta[name="twitter:image"]')
        ?.getAttribute("content")
    ).toBe("/custom-image.png");
  });

  test("resets back to defaults when rerendered without optional props", () => {
    const { rerender } = render(
      <TestMetaComponent
        canonicalUrl="https://example.com/foo"
        keywords={["temporary"]}
        ogImage="/temp.png"
        robots="noindex"
        title="Temporary"
      />
    );

    expect(
      document.querySelector('meta[name="keywords"]')?.getAttribute("content")
    ).toBe("temporary");
    expect(
      document.querySelector('meta[name="robots"]')?.getAttribute("content")
    ).toBe("noindex");
    expect(document.querySelector('link[rel="canonical"]')).not.toBeNull();

    // Rerender with default props
    rerender(<TestMetaComponent title="New Page" />);

    expect(document.title).toBe(`New Page | ${DEFAULT_TITLE}`);
    expect(
      document.querySelector('meta[name="keywords"]')?.getAttribute("content")
    ).toBe(DEFAULT_KEYWORDS.join(", "));
    expect(
      document
        .querySelector('meta[property="og:image"]')
        ?.getAttribute("content")
    ).toBe(DEFAULT_IMAGE);
    expect(document.querySelector('meta[name="robots"]')).toBeNull();
    expect(document.querySelector('link[rel="canonical"]')).toBeNull();
  });

  test("DocumentMeta declarative component functions identically", () => {
    render(
      <DocumentMeta
        description="Declarative component test"
        title="Declarative"
      />
    );

    expect(document.title).toBe(`Declarative | ${DEFAULT_TITLE}`);
    expect(
      document
        .querySelector('meta[name="description"]')
        ?.getAttribute("content")
    ).toBe("Declarative component test");
  });
});
