import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { LinkPreviewCard } from "@/components/link-preview-card";
import { PreviewLink } from "@/components/preview-link";
import type { LinkPreview } from "@/lib/link-previews";

const preview: LinkPreview = {
  title: "Eypi",
  description: "Campus suite.",
  domain: "eypi.cc",
  image: "/images/link-previews/eypi-cc.jpg",
};

describe("LinkPreviewCard", () => {
  const html = renderToStaticMarkup(
    <LinkPreviewCard preview={preview} href="https://eypi.cc" visible />,
  );

  it("shows image, domain, title and description", () => {
    expect(html).toContain('src="/images/link-previews/eypi-cc.jpg"');
    expect(html).toContain("eypi.cc");
    expect(html).toContain("Eypi");
    expect(html).toContain("Campus suite.");
  });

  it("is decorative, unfocusable and links out safely", () => {
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain('tabindex="-1"');
    expect(html).toContain('alt=""');
    expect(html).toContain('href="https://eypi.cc"');
    expect(html).toContain('rel="noopener noreferrer"');
  });
});

describe("PreviewLink", () => {
  it("renders a plain anchor when there is no preview", () => {
    const html = renderToStaticMarkup(
      <PreviewLink href="https://example.com" preview={null}>
        Example
      </PreviewLink>,
    );
    expect(html).toBe('<a href="https://example.com">Example</a>');
  });

  it("keeps the card and its image out of the markup until opened", () => {
    const html = renderToStaticMarkup(
      <PreviewLink href="https://eypi.cc" preview={preview} target="_blank">
        Eypi
      </PreviewLink>,
    );
    expect(html).toContain("preview-link");
    expect(html).toContain('target="_blank"');
    expect(html).not.toContain("<img");
    expect(html).not.toContain("link-preview-card");
  });
});
