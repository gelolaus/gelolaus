import { describe, expect, it } from "vitest";
import { placeCard } from "@/lib/preview-position";

const card = { width: 280, height: 260 };
const desktop = { width: 1280, height: 800 };
const phone = { width: 375, height: 812 };
const anchor = { left: 100, top: 300, width: 80, height: 20 };

describe("placeCard", () => {
  it("prefers the right side, centred on the link", () => {
    expect(placeCard({ anchor, card, viewport: desktop })).toEqual({
      left: 192,
      top: 180,
      side: "right",
    });
  });

  it("flips left when there is no room on the right", () => {
    const p = placeCard({ anchor: { ...anchor, left: 1100 }, card, viewport: desktop });
    expect(p.side).toBe("left");
    expect(p.left).toBe(1100 - 12 - 280);
  });

  it("clamps vertically into the viewport margins", () => {
    expect(placeCard({ anchor: { ...anchor, top: 10 }, card, viewport: desktop }).top).toBe(8);
    expect(placeCard({ anchor: { ...anchor, top: 780 }, card, viewport: desktop }).top).toBe(
      800 - 260 - 8,
    );
  });

  it("goes below on a phone-width viewport, clamped horizontally", () => {
    const p = placeCard({
      anchor: { left: 60, top: 200, width: 200, height: 20 },
      card,
      viewport: phone,
    });
    expect(p.side).toBe("below");
    expect(p.left).toBeGreaterThanOrEqual(8);
    expect(p.left + card.width).toBeLessThanOrEqual(375 - 8);
  });

  it("goes above on a phone when the link is near the bottom", () => {
    const a = { left: 60, top: 780, width: 200, height: 20 };
    const p = placeCard({ anchor: a, card, viewport: phone });
    expect(p.side).toBe("above");
    expect(p.top + card.height).toBeLessThanOrEqual(a.top - 12);
  });
});
