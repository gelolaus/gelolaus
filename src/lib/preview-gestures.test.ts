import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createPreviewController } from "@/lib/preview-gestures";

function setup() {
  const onOpen = vi.fn();
  const onClose = vi.fn();
  const c = createPreviewController({ onOpen, onClose });
  return { c, onOpen, onClose };
}

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe("hover", () => {
  it("opens after 150ms, not before", () => {
    const { c, onOpen } = setup();
    c.pointerEnter("mouse");
    vi.advanceTimersByTime(149);
    expect(onOpen).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(onOpen).toHaveBeenCalledWith("hover");
    expect(c.isOpen()).toBe(true);
  });

  it("cancels when the pointer leaves early", () => {
    const { c, onOpen } = setup();
    c.pointerEnter("mouse");
    vi.advanceTimersByTime(100);
    c.pointerLeave("mouse");
    vi.advanceTimersByTime(500);
    expect(onOpen).not.toHaveBeenCalled();
  });

  it("closes only after a 120ms grace once the pointer leaves", () => {
    const { c, onClose } = setup();
    c.pointerEnter("mouse");
    vi.advanceTimersByTime(150);
    c.pointerLeave("mouse");
    vi.advanceTimersByTime(119);
    expect(onClose).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("stays open while the pointer moves from the link into the card", () => {
    const { c, onClose } = setup();
    c.pointerEnter("mouse");
    vi.advanceTimersByTime(150);
    c.pointerLeave("mouse");
    vi.advanceTimersByTime(60);
    c.cardEnter();
    vi.advanceTimersByTime(1000);
    expect(onClose).not.toHaveBeenCalled();
    c.cardLeave();
    vi.advanceTimersByTime(120);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("ignores touch pointers", () => {
    const { c, onOpen } = setup();
    c.pointerEnter("touch");
    vi.advanceTimersByTime(1000);
    expect(onOpen).not.toHaveBeenCalled();
  });
});

describe("touch hold", () => {
  it("opens at 400ms and survives release", () => {
    const { c, onOpen, onClose } = setup();
    c.pointerDown("touch");
    vi.advanceTimersByTime(399);
    expect(onOpen).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(onOpen).toHaveBeenCalledWith("hold");
    c.pointerUp("touch");
    vi.advanceTimersByTime(1000);
    expect(onClose).not.toHaveBeenCalled();
  });

  it("suppresses exactly one following click", () => {
    const { c } = setup();
    c.pointerDown("touch");
    vi.advanceTimersByTime(400);
    c.pointerUp("touch");
    expect(c.consumeSuppressedClick()).toBe(true);
    expect(c.consumeSuppressedClick()).toBe(false);
  });

  it("does not open when released early, and a quick tap is not suppressed", () => {
    const { c, onOpen } = setup();
    c.pointerDown("touch");
    vi.advanceTimersByTime(100);
    c.pointerUp("touch");
    vi.advanceTimersByTime(1000);
    expect(onOpen).not.toHaveBeenCalled();
    expect(c.consumeSuppressedClick()).toBe(false);
  });

  it("cancels on pointercancel (scroll started)", () => {
    const { c, onOpen } = setup();
    c.pointerDown("touch");
    vi.advanceTimersByTime(300);
    c.pointerCancel();
    vi.advanceTimersByTime(1000);
    expect(onOpen).not.toHaveBeenCalled();
  });

  it("drops suppression when the card closes, so a later activation is not swallowed", () => {
    const { c } = setup();
    c.pointerDown("touch");
    vi.advanceTimersByTime(400);
    c.pointerUp("touch"); // the click never arrives
    c.dismiss();
    expect(c.consumeSuppressedClick()).toBe(false);
  });

  it("clears stale suppression on the next touch", () => {
    const { c } = setup();
    c.pointerDown("touch");
    vi.advanceTimersByTime(400);
    c.pointerUp("touch"); // the click never arrives
    c.pointerDown("touch");
    expect(c.consumeSuppressedClick()).toBe(false);
  });
});

describe("focus and dismissal", () => {
  it("opens on focus immediately", () => {
    const { c, onOpen } = setup();
    c.focus();
    expect(onOpen).toHaveBeenCalledWith("focus");
  });

  it.each(["blur", "escape", "dismiss"] as const)("%s closes an open card", (method) => {
    const { c, onClose } = setup();
    c.focus();
    c[method]();
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(c.isOpen()).toBe(false);
  });

  it("does not report close when nothing is open", () => {
    const { c, onClose } = setup();
    c.dismiss();
    expect(onClose).not.toHaveBeenCalled();
  });

  it("destroy clears pending timers", () => {
    const { c, onOpen } = setup();
    c.pointerEnter("mouse");
    c.destroy();
    vi.advanceTimersByTime(1000);
    expect(onOpen).not.toHaveBeenCalled();
  });
});
