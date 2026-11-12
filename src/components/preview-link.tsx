"use client";

import {
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type AnchorHTMLAttributes,
  type CSSProperties,
  type ReactNode,
} from "react";
import { LinkPreviewCard } from "@/components/link-preview-card";
import type { LinkPreview } from "@/lib/link-previews";
import { createPreviewController, type PointerKind } from "@/lib/preview-gestures";
import { placeCard } from "@/lib/preview-position";

type Props = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  href: string;
  preview: LinkPreview | null;
  children: ReactNode;
};

const kindOf = (pointerType: string): PointerKind =>
  pointerType === "touch" ? "touch" : pointerType === "pen" ? "pen" : "mouse";

export function PreviewLink({ href, preview, children, ...rest }: Props) {
  if (!preview) {
    return (
      <a href={href} {...rest}>
        {children}
      </a>
    );
  }
  return (
    <InteractivePreviewLink href={href} preview={preview} {...rest}>
      {children}
    </InteractivePreviewLink>
  );
}

function InteractivePreviewLink({
  href,
  preview,
  children,
  className,
  onClick,
  ...rest
}: Props & { preview: LinkPreview }) {
  const cardId = useId();
  const anchorRef = useRef<HTMLAnchorElement>(null);
  const cardRef = useRef<HTMLAnchorElement>(null);
  const lastPointer = useRef<PointerKind>("mouse");
  const [open, setOpen] = useState(false);
  const [style, setStyle] = useState<CSSProperties | null>(null);
  const [visible, setVisible] = useState(false);

  const controller = useMemo(
    () =>
      createPreviewController({
        onOpen: () => setOpen(true),
        onClose: () => {
          setOpen(false);
          setStyle(null);
          setVisible(false);
        },
      }),
    [],
  );
  useEffect(() => () => controller.destroy(), [controller]);

  // Measure and place the card once it has mounted, then fade it in.
  useLayoutEffect(() => {
    if (!open || !anchorRef.current || !cardRef.current) return;
    const a = anchorRef.current.getBoundingClientRect();
    const card = cardRef.current;
    const { left, top } = placeCard({
      anchor: { left: a.left, top: a.top, width: a.width, height: a.height },
      card: { width: card.offsetWidth, height: card.offsetHeight },
      viewport: { width: window.innerWidth, height: window.innerHeight },
    });
    setStyle({ left, top });
    // A timeout (not rAF) so a throttled tab can't leave the card invisible.
    const timer = setTimeout(() => setVisible(true), 20);
    return () => clearTimeout(timer);
  }, [open]);

  // Close on Escape, on a press outside, and when the page moves under the card.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") controller.escape();
    };
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (anchorRef.current?.contains(t) || cardRef.current?.contains(t)) return;
      controller.dismiss();
    };
    const onMove = () => controller.dismiss();
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    window.addEventListener("scroll", onMove, true);
    window.addEventListener("resize", onMove);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
      window.removeEventListener("scroll", onMove, true);
      window.removeEventListener("resize", onMove);
    };
  }, [open, controller]);

  return (
    <>
      <a
        ref={anchorRef}
        href={href}
        className={["preview-link", className].filter(Boolean).join(" ")}
        aria-describedby={open ? cardId : undefined}
        onPointerEnter={(e) => {
          // Start fetching the screenshot during the hover delay.
          if (kindOf(e.pointerType) !== "touch") new Image().src = preview.image;
          controller.pointerEnter(kindOf(e.pointerType));
        }}
        onPointerLeave={(e) => controller.pointerLeave(kindOf(e.pointerType))}
        onPointerDown={(e) => {
          lastPointer.current = kindOf(e.pointerType);
          controller.pointerDown(lastPointer.current);
        }}
        onPointerUp={(e) => controller.pointerUp(kindOf(e.pointerType))}
        onPointerCancel={() => controller.pointerCancel()}
        onFocus={(e) => {
          if (e.currentTarget.matches(":focus-visible")) controller.focus();
        }}
        onBlur={() => controller.blur()}
        onContextMenu={(e) => {
          if (lastPointer.current === "touch") e.preventDefault();
        }}
        onClick={(e) => {
          if (controller.consumeSuppressedClick()) e.preventDefault();
          else onClick?.(e);
        }}
        {...rest}
      >
        {children}
      </a>
      {open ? (
        <LinkPreviewCard
          preview={preview}
          href={href}
          id={cardId}
          cardRef={cardRef}
          visible={visible}
          style={style ?? { left: 0, top: 0, visibility: "hidden" }}
          onPointerEnter={(t) => kindOf(t) !== "touch" && controller.cardEnter()}
          onPointerLeave={(t) => kindOf(t) !== "touch" && controller.cardLeave()}
        />
      ) : null}
    </>
  );
}
