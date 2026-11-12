export type PointerKind = "mouse" | "pen" | "touch";
export type OpenSource = "hover" | "focus" | "hold";

type Timer = ReturnType<typeof setTimeout> | null;

export function createPreviewController({
  onOpen,
  onClose,
  hoverDelay = 150,
  holdDelay = 400,
  graceDelay = 120,
}: {
  onOpen(source: OpenSource): void;
  onClose(): void;
  hoverDelay?: number;
  holdDelay?: number;
  graceDelay?: number;
}) {
  let open = false;
  let suppressClick = false;
  let hoverTimer: Timer = null;
  let holdTimer: Timer = null;
  let graceTimer: Timer = null;

  const clear = (t: Timer) => {
    if (t) clearTimeout(t);
    return null;
  };

  const show = (source: OpenSource) => {
    if (open) return;
    open = true;
    onOpen(source);
  };

  const hide = () => {
    hoverTimer = clear(hoverTimer);
    holdTimer = clear(holdTimer);
    graceTimer = clear(graceTimer);
    if (!open) return;
    open = false;
    // A hold whose click never arrived must not swallow a later activation.
    suppressClick = false;
    onClose();
  };

  const hideAfterGrace = () => {
    graceTimer = clear(graceTimer);
    if (open) graceTimer = setTimeout(hide, graceDelay);
  };

  return {
    pointerEnter(kind: PointerKind) {
      if (kind === "touch") return;
      graceTimer = clear(graceTimer);
      if (open) return;
      hoverTimer = clear(hoverTimer);
      hoverTimer = setTimeout(() => show("hover"), hoverDelay);
    },
    pointerLeave(kind: PointerKind) {
      if (kind === "touch") return;
      hoverTimer = clear(hoverTimer);
      hideAfterGrace();
    },
    cardEnter() {
      graceTimer = clear(graceTimer);
    },
    cardLeave() {
      hideAfterGrace();
    },
    pointerDown(kind: PointerKind) {
      suppressClick = false;
      holdTimer = clear(holdTimer);
      if (kind !== "touch") return;
      holdTimer = setTimeout(() => {
        holdTimer = null;
        if (open) return;
        suppressClick = true;
        show("hold");
      }, holdDelay);
    },
    pointerUp(kind: PointerKind) {
      if (kind === "touch") holdTimer = clear(holdTimer);
    },
    pointerCancel() {
      holdTimer = clear(holdTimer);
    },
    focus() {
      hoverTimer = clear(hoverTimer);
      graceTimer = clear(graceTimer);
      show("focus");
    },
    blur: hide,
    escape: hide,
    dismiss: hide,
    consumeSuppressedClick() {
      const was = suppressClick;
      suppressClick = false;
      return was;
    },
    isOpen: () => open,
    destroy() {
      hoverTimer = clear(hoverTimer);
      holdTimer = clear(holdTimer);
      graceTimer = clear(graceTimer);
    },
  };
}
