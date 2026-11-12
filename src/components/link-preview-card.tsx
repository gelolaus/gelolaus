import type { CSSProperties, Ref } from "react";
import type { LinkPreview } from "@/lib/link-previews";

export function LinkPreviewCard({
  preview,
  href,
  id,
  style,
  visible,
  cardRef,
  onPointerEnter,
  onPointerLeave,
}: {
  preview: LinkPreview;
  href: string;
  id?: string;
  style?: CSSProperties;
  visible: boolean;
  cardRef?: Ref<HTMLAnchorElement>;
  onPointerEnter?: (pointerType: string) => void;
  onPointerLeave?: (pointerType: string) => void;
}) {
  return (
    <a
      ref={cardRef}
      id={id}
      className="link-preview-card"
      data-visible={visible}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      tabIndex={-1}
      aria-hidden="true"
      style={style}
      // Keep focus on the link: otherwise its blur unmounts the card before click.
      onMouseDown={(e) => e.preventDefault()}
      onPointerEnter={(e) => onPointerEnter?.(e.pointerType)}
      onPointerLeave={(e) => onPointerLeave?.(e.pointerType)}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="link-preview-image"
        src={preview.image}
        alt=""
        width={1200}
        height={675}
        loading="lazy"
        decoding="async"
      />
      <span className="link-preview-body">
        <span className="meta">{preview.domain}</span>
        <span className="link-preview-title">{preview.title}</span>
        {preview.description ? (
          <span className="link-preview-description">{preview.description}</span>
        ) : null}
      </span>
    </a>
  );
}
