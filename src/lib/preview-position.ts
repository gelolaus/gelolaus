export type Rect = { left: number; top: number; width: number; height: number };

export type Placement = {
  left: number;
  top: number;
  side: "right" | "left" | "below" | "above";
};

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(value, Math.max(min, max)));

/** Position a card around a link, in viewport coordinates. */
export function placeCard({
  anchor,
  card,
  viewport,
  gap = 12,
  margin = 8,
}: {
  anchor: Rect;
  card: { width: number; height: number };
  viewport: { width: number; height: number };
  gap?: number;
  margin?: number;
}): Placement {
  const maxLeft = viewport.width - card.width - margin;
  const maxTop = viewport.height - card.height - margin;
  const centredTop = clamp(
    anchor.top + anchor.height / 2 - card.height / 2,
    margin,
    maxTop,
  );

  const rightLeft = anchor.left + anchor.width + gap;
  if (rightLeft <= maxLeft) {
    return { left: rightLeft, top: centredTop, side: "right" };
  }

  const leftLeft = anchor.left - gap - card.width;
  if (leftLeft >= margin) {
    return { left: leftLeft, top: centredTop, side: "left" };
  }

  const centredLeft = clamp(
    anchor.left + anchor.width / 2 - card.width / 2,
    margin,
    maxLeft,
  );
  const belowTop = anchor.top + anchor.height + gap;
  if (belowTop <= maxTop) {
    return { left: centredLeft, top: belowTop, side: "below" };
  }
  return {
    left: centredLeft,
    top: clamp(anchor.top - gap - card.height, margin, maxTop),
    side: "above",
  };
}
