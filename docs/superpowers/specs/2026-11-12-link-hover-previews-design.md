# Link hover previews – design

Date: 2026-11-12

## Intent and why

Angelo wants the link hover-card feature from https://www.brianan.ca/ on the
gelolaus.com home page. Hovering a link opens a small card beside it showing a
screenshot of the destination, its domain, a title and a one-line description.
The point: a visitor can see what is behind a name like "Eypi" or "Sip & Scale"
before leaving the site. The result should feel polished ("make this the best").

## Goals

- Cards on the home page for: the three roles, the three projects (Wantap,
  Eypi; Homelab has no URL so no card) and the PH100 link.
- Cards open on pointer hover and keyboard focus, and on touch via
  press-and-hold.
- Preview data is generated ahead of time and committed, so cards are instant
  and independent of third-party sites at visit time.
- Hand-written overrides beat generated data.

## Non-goals

- No cards on Instagram, LinkedIn, GitHub, the email link or other `mailto:`
  links.
- No cards for links inside journal posts (possible later).
- No runtime/live fetching, no third-party screenshot service.
- No change to the `/api/v1/*` payloads, `llms.txt`, Markdown mirror or
  OpenAPI.

## Anti-goals (failures even if it "works")

- Visitors on phones losing normal tap-to-open behaviour.
- A card showing a cookie banner, login wall or error page.
- A broken or half-empty card appearing when data is missing (show nothing).
- Any visitor data sent to third parties.
- Layout shift or page jank when a card opens.

## Constraints

- Stack: Next.js 16 (App Router), React 19, Tailwind 4, vitest. No animation
  library; use CSS.
- Existing theme: light/dark via CSS variables in `src/app/globals.css`
  (`--canvas`, `--ink*`, `--border`, `--fill`).
- Home page links come from `roles` / `projects` in `src/lib/profile.ts` and
  PH100 from `PH100_URL`; rendered in `src/app/page.tsx`.
- JPCS-APC links to Instagram, which blocks screenshots/metadata scraping.
- No Python on the dev machine; tooling must be Node.

## Approaches considered

1. **Build-time generated previews (chosen).** A dev script captures
   screenshots + metadata, committed to the repo. Instant, resilient, private;
   goes stale until re-run. Fits ~7 rarely changing links.
2. **Live fetch via a service.** Always fresh, but slower, can fail, adds a
   dependency and leaks visitor activity to a third party. Rejected.
3. **Fully hand-written cards.** Simplest, full control, but tedious image
   work. Kept only as the override layer.

Angelo picked approach 1 with hand overrides.

## Decided behaviour

**Trigger and placement**
- Pointer hover opens the card after ~150ms; leaving closes it (short grace so
  moving the pointer into the card doesn't flicker).
- Keyboard focus opens it; Escape closes it.
- Card sits to the right of the link; flips left (or otherwise stays fully in
  the viewport) when there is no room.
- Fade + slight movement in; none when `prefers-reduced-motion`.
- Card follows the light/dark theme.

**Touch**
- Quick tap: normal navigation, unchanged.
- Hold ~400ms: opens the card and cancels the click that follows release, so
  the link is not opened.
- Card stays open after release until the user taps elsewhere. Tapping the
  card opens the link.
- The native long-press context menu is suppressed on preview-enabled links
  only.
- Pointer-hover cards do not open from synthesized touch events.

**Card content**: screenshot (top), domain, title, one-line description.
Screenshots load on first hover/hold (not at page load).

**Missing data**: no card for that link; link behaves as a plain link.

**Data generation**
- `npm run previews` runs a Node script (dev-only) using Playwright (new dev
  dependency) to visit each preview-enabled URL.
- Output: compressed screenshot per link in `public/images/link-previews/`
  and title/description/domain in a committed data file.
- Script tries to dismiss cookie banners before capture (the uwaterloo.ca-style
  banner in the reference screenshots is the known failure to avoid), skips a
  link it cannot capture and reports it, and never overwrites good data with a
  failed run.
- Overrides in `src/lib/profile.ts` (title, description, image) take priority
  over generated data. JPCS-APC uses an override.

## Left to the builder

- Exact file/module names, data file format, image format and dimensions.
- Card dimensions, spacing, easing, shadow, exact positioning maths.
- Component structure (single provider vs per-link wrapper), test layout.
- How cookie-banner dismissal is implemented in the script.
- Where preview-enabled links are marked in `profile.ts` (e.g. a flag vs
  presence of data).

## Resolved after builder review

- **Overrides live in a separate export in `src/lib/profile.ts`, keyed by URL.**
  The `Role` and `Project` types and every `/api/v1/*` payload stay exactly as
  they are (this also covers PH100, which has no object). Settled by the
  "payloads unchanged" non-goal.
- **A card needs at least a title and a screenshot.** Anything less shows no
  card. The JPCS-APC override must therefore supply an image file (see Angelo's
  open item below).
- **"Failed capture"** means an HTTP error, timeout, or empty title. The script
  prints a per-link summary so the output can be eyeballed (banners, login
  walls) before committing; it never overwrites good data with a failed run.
- **`npm run previews` is manual only.** It is not part of `build`, CI or
  deploys. Generated screenshots are committed (small, compressed).
- **Card is decorative to assistive tech**: not focusable, linked to its link
  with `aria-describedby`, never traps Tab. Escape closes it and leaves focus
  on the link. Pointer/touch tapping the card opens the link.

## JPCS-APC override (decided with Angelo)

- Image: `public/images/link-previews/jpcs-apc.jpg` (1200x675, cropped from
  Angelo's own event photo). Two spots showing login/Wi-Fi details (a desk
  label and a whiteboard notice) were blurred before it was saved.
- Title: `JPCS-APC`. Domain line: `instagram.com/jpcs.apc`.
- Description: "APC's student tech org, where I'm VP for External Affairs."

## Builder's calls to verify (author's decisions, not Angelo's)

- 150ms hover delay, 400ms hold threshold.
- Playwright as the capture tool, preferring the machine's installed Chrome so
  no large browser download is needed.
- Screenshots lazy-loaded on first open.
- Homelab (no URL) gets no card.
- Override export keyed by URL; failure rules and manual-only script above.
- Card is decorative / `aria-describedby`.
