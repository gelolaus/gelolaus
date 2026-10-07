import { Marked } from "marked";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

const renderer = new Marked({ gfm: true });

// Heading ids make section links such as /docs#errors resolvable.
renderer.use({
  renderer: {
    heading({ tokens, depth, text }) {
      const inner = this.parser.parseInline(tokens);
      return `<h${depth} id="${slugify(text)}">${inner}</h${depth}>\n`;
    },
  },
});

/** Renders trusted, first-party Markdown to HTML. */
export function renderMarkdown(markdown: string): string {
  return renderer.parse(markdown) as string;
}
