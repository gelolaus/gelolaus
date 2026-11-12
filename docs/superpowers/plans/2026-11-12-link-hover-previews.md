# Link Hover Previews Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show a hover/focus/press-and-hold preview card (screenshot, domain, title, one-line description) on the home page's role, project and PH100 links.

**Architecture:** A dev-only script (`npm run previews`) captures screenshots and metadata into committed files. Pure, node-testable modules hold the data lookup, card placement and gesture timing. A thin client component (`PreviewLink`) wires those to the DOM; `page.tsx` swaps plain `<a>` for it.

**Tech Stack:** Next.js 16 (App Router), React 19, Tailwind 4 + plain CSS in `globals.css`, vitest (node environment, no jsdom), `playwright-core` driving the installed Chrome. Node 24 (can import `.ts` directly in scripts).

**Spec:** `docs/superpowers/specs/2026-11-12-link-hover-previews-design.md`

## Global Constraints

- Cards only for: the three roles, the projects that have a URL (Wantap, Eypi), and the PH100 link. Never for Instagram/LinkedIn/GitHub/`mailto:`; Homelab (no URL) gets no card.
- `Role` / `Project` types and every `/api/v1/*` payload, `llms.txt`, Markdown mirror and OpenAPI stay unchanged. Overrides live in a separate export in `src/lib/profile.ts`, keyed by URL.
- Hover delay 150ms; hold threshold 400ms; keyboard focus opens (focus-visible only); Escape closes and leaves focus on the link.
- Touch: quick tap navigates as normal; hold opens the card and cancels the click that follows release; card stays open until a tap elsewhere; the native long-press menu is suppressed on preview links only.
- A card needs at least a title and a screenshot, otherwise no card and a plain link.
- Card is decorative to assistive tech: not focusable, `aria-hidden`, never traps Tab.
- Screenshots load on first open (card mounts only when open). No runtime fetching, no third-party services. Respect `prefers-reduced-motion`. Follow the light/dark theme variables.
- `npm run previews` is manual only: not part of `build`, CI or deploy. Failed captures never overwrite good data.
- Commits follow Angelo's conventional-commits style (`type(scope): lowercase imperative subject`, terse `- add ...` bullets). No `Co-Authored-By` or any AI/tool trailer. Scope `site` unless noted.

## Review Focus

1. Profile URL vs data key mismatch (trailing slash, `www.`), e.g. `https://sipnscale.com/` — lookup must still hit (Task 1).
2. Phone-width viewport where the card fits neither right nor left — must fall below/above, never off-screen (Task 2).
3. Hold-open on touch where the follow-up click never fires — the stale suppression must not swallow the user's next real tap (Task 3).
4. Mouse moving from link into the card and back out — card must not flicker or close mid-move (Task 3).
5. A capture run where a site is down or returns an error page — previous good data must survive (Task 5).

## File Structure

- Modify `src/lib/profile.ts` — add `previewOverrides` export.
- Create `src/lib/link-previews.ts` (+ `.test.ts`) — types, `normalizeUrl`, `getPreview`.
- Create `src/lib/link-previews.generated.json` — script output, committed.
- Create `src/lib/preview-position.ts` (+ test) — `placeCard`.
- Create `src/lib/preview-gestures.ts` (+ test) — `createPreviewController`.
- Create `src/components/link-preview-card.tsx`, `src/components/preview-link.tsx` (+ test).
- Modify `src/app/globals.css`, `src/app/page.tsx`.
- Create `scripts/link-previews-lib.mjs` (+ test), `scripts/generate-link-previews.mjs`; modify `package.json`, `vitest.config.mts`, `README.md`.
- Existing asset: `public/images/link-previews/jpcs-apc.jpg`.

---

### Task 1: Preview data lookup

**Files:**
- Modify: `src/lib/profile.ts`
- Create: `src/lib/link-previews.ts`, `src/lib/link-previews.generated.json` (initially `{}`)
- Test: `src/lib/link-previews.test.ts`

**Interfaces:**
- Produces:
  - `type LinkPreview = { title: string; description: string; domain: string; image: string }` (`image` is a root-relative path like `/images/link-previews/x.jpg`)
  - `normalizeUrl(url: string): string` — lowercase host, strip `www.`, strip trailing slash, drop hash
  - `getPreview(url: string): LinkPreview | null`
  - in `profile.ts`: `export const previewOverrides: Record<string, Partial<LinkPreview>>`

- [ ] **Step 1: Write failing tests** in `link-previews.test.ts`:
  - `normalizeUrl("https://www.Sipnscale.com/")` equals `normalizeUrl("https://sipnscale.com")`.
  - `getPreview` returns `null` for an unknown URL and for `profile.links.instagram`.
  - JPCS override: `getPreview("https://instagram.com/jpcs.apc")` equals `{ title: "JPCS-APC", description: "APC's student tech org, where I'm VP for External Affairs.", domain: "instagram.com/jpcs.apc", image: "/images/link-previews/jpcs-apc.jpg" }`.
  - Override beats generated data for the same URL; partial override (title only) merges over generated fields (use `vi.mock` of the generated JSON module to inject data).
  - Generated entry missing `title` or `image` → `null`.
  - Integrity: every `image` referenced by the generated JSON and by `previewOverrides` exists under `public/` (`fs.existsSync`).
- [ ] **Step 2: Run** `npx vitest run src/lib/link-previews.test.ts` — expect FAIL (module missing).
- [ ] **Step 3: Implement** `previewOverrides` (single JPCS entry keyed by `https://instagram.com/jpcs.apc`) and `link-previews.ts`. Keys of both the generated JSON and overrides are matched through `normalizeUrl`. `domain` defaults to the URL's host without `www.` when absent.
- [ ] **Step 4: Run** the test file — expect PASS; run `npx vitest run` — all pass.
- [ ] **Step 5: Commit** `feat(site): add link preview data lookup` (bullets: add `previewOverrides` keyed by URL; add `getPreview` merging generated data and overrides; cover URL normalization and image integrity with Vitest).

### Task 2: Card placement

**Files:**
- Create: `src/lib/preview-position.ts`
- Test: `src/lib/preview-position.test.ts`

**Interfaces:**
- Produces:
  - `type Rect = { left: number; top: number; width: number; height: number }`
  - `type Placement = { left: number; top: number; side: "right" | "left" | "below" | "above" }`
  - `placeCard(args: { anchor: Rect; card: { width: number; height: number }; viewport: { width: number; height: number }; gap?: number; margin?: number }): Placement` — viewport coordinates; defaults `gap = 12`, `margin = 8`.

- [ ] **Step 1: Write failing tests** (anchor `{left:100,top:300,width:80,height:20}`, card `280x260`, viewport `1280x800`):
  - desktop → `side: "right"`, `left: 192`, `top` vertically centred on the anchor (`310 - 130 = 180`).
  - anchor near right edge (`left: 1100`) → `side: "left"`, `left: 1100 - 12 - 280`.
  - anchor near top (`top: 10`) → `top` clamped to `8`; near bottom → clamped to `800 - 260 - 8`.
  - viewport `375x812`, anchor `left: 60, width: 200` → `side: "below"`, `left` clamped within `[8, 375 - 280 - 8]`.
  - same narrow viewport with anchor at bottom (`top: 780`) → `side: "above"` and `top + card.height <= anchor.top - gap`.
  - result always satisfies `left >= margin` and `left + card.width <= viewport.width - margin` for a viewport at least `card.width + 2*margin` wide.
- [ ] **Step 2: Run** the test — expect FAIL.
- [ ] **Step 3: Implement** `placeCard`: try right, then left, then below, then above; clamp the cross-axis into the viewport margins.
- [ ] **Step 4: Run** the test — PASS.
- [ ] **Step 5: Commit** `feat(site): add hover card placement` (bullets: add `placeCard` preferring right, flipping left, then below or above; clamp to viewport margins; cover desktop, edge, and phone-width cases with Vitest).

### Task 3: Gesture controller

**Files:**
- Create: `src/lib/preview-gestures.ts`
- Test: `src/lib/preview-gestures.test.ts` (use `vi.useFakeTimers()`)

**Interfaces:**
- Produces:
  - `type PointerKind = "mouse" | "pen" | "touch"`
  - `createPreviewController(opts: { onOpen(source: "hover" | "focus" | "hold"): void; onClose(): void; hoverDelay?: number; holdDelay?: number; graceDelay?: number }): { pointerEnter(k: PointerKind): void; pointerLeave(k: PointerKind): void; cardEnter(): void; cardLeave(): void; pointerDown(k: PointerKind): void; pointerUp(k: PointerKind): void; pointerCancel(): void; focus(): void; blur(): void; escape(): void; dismiss(): void; consumeSuppressedClick(): boolean; isOpen(): boolean; destroy(): void }`
  - defaults: `hoverDelay 150`, `holdDelay 400`, `graceDelay 120`.

- [ ] **Step 1: Write failing tests** (each asserts `onOpen`/`onClose` calls after `vi.advanceTimersByTime`):
  - mouse `pointerEnter` opens with `"hover"` at 150ms, not at 149ms; `pointerLeave` at 100ms cancels it.
  - after open, `pointerLeave` closes only after 120ms; `cardEnter` within the grace keeps it open; `cardLeave` then closes after 120ms (Review Focus 4).
  - touch `pointerEnter` is ignored (no open).
  - touch `pointerDown` opens with `"hold"` at 400ms; `pointerUp` at 300ms cancels with no open; `pointerCancel` at 300ms cancels.
  - after a hold-open, `pointerUp` does not close; `consumeSuppressedClick()` returns `true` once then `false`.
  - stale suppression: hold-open, no click consumed, then a new touch `pointerDown` → `consumeSuppressedClick()` is `false` (Review Focus 3).
  - quick touch tap (down at 0, up at 100) → `consumeSuppressedClick()` is `false`.
  - `focus()` opens immediately with `"focus"`; `blur()`, `escape()` and `dismiss()` each close; `isOpen()` tracks state; `destroy()` clears pending timers.
- [ ] **Step 2: Run** the test — expect FAIL.
- [ ] **Step 3: Implement** with plain `setTimeout`/`clearTimeout` and closure state; `onClose` fires only when currently open, `onOpen` only when currently closed.
- [ ] **Step 4: Run** the test — PASS.
- [ ] **Step 5: Commit** `feat(site): add hover and hold gesture controller` (bullets: add `createPreviewController` with 150ms hover and 400ms hold timing; keep the card open while the pointer moves between link and card; clear stale click suppression on the next touch; cover timing, grace, and suppression with Vitest).

### Task 4: Card and link components, styles

**Files:**
- Create: `src/components/link-preview-card.tsx`, `src/components/preview-link.tsx`
- Modify: `src/app/globals.css`
- Test: `src/components/preview-link.test.tsx`

**Interfaces:**
- Consumes: `LinkPreview` (Task 1), `placeCard` (Task 2), `createPreviewController` (Task 3).
- Produces:
  - `LinkPreviewCard(props: { preview: LinkPreview; href: string; style?: React.CSSProperties; visible: boolean; onPointerEnter?: () => void; onPointerLeave?: () => void; cardRef?: React.Ref<HTMLAnchorElement> })` — renders `<a class="link-preview-card" href target="_blank" rel="noopener noreferrer" tabIndex={-1} aria-hidden="true">` containing `<img src alt="" loading="lazy">`, then domain, title, description.
  - `PreviewLink(props: { href: string; preview: LinkPreview | null; children: React.ReactNode } & React.AnchorHTMLAttributes<HTMLAnchorElement>)` — `"use client"`. With `preview === null` renders a plain `<a>`; otherwise an `<a class="preview-link">` that wires the controller, positions the card with `placeCard` from `getBoundingClientRect` (fixed positioning, measured after mount), mounts the card only while open, sets `aria-describedby` only while open, closes on Escape (focus stays on the link) and on any `pointerdown` outside link and card, cancels the follow-up click when `consumeSuppressedClick()` is true, calls `preventDefault` on `contextmenu` for touch pointers, and opens on focus only when `matches(":focus-visible")`.

- [ ] **Step 1: Write failing tests** with `renderToStaticMarkup`:
  - `LinkPreviewCard` markup contains title, domain, description, `aria-hidden="true"`, `tabindex="-1"`, `alt=""`, `rel="noopener noreferrer"`, `href`.
  - `PreviewLink` with `preview={null}` renders exactly an `<a href=...>` with the children and no `preview-link` class.
  - `PreviewLink` with a preview renders the `preview-link` class and does **not** render the card or the image (closed by default, so nothing loads before first open).
- [ ] **Step 2: Run** the test — expect FAIL.
- [ ] **Step 3: Implement both components**, following the behaviour above.
- [ ] **Step 4: Add CSS** to `globals.css`: `.preview-link { -webkit-touch-callout: none; }`; `.link-preview-card` fixed, width 280px, `var(--canvas)` background, `1px solid var(--border)` border, 12px radius, soft shadow, image 16:9 on top with `object-fit: cover`, domain in `.meta` style, title `--ink`, description `--ink-secondary`, `text-decoration: none`, `z-index` above content; hidden state `opacity: 0; transform: translateY(4px)`, visible state `opacity: 1; transform: none`, 150ms ease transition; `@media (prefers-reduced-motion: reduce)` removes transition and transform.
- [ ] **Step 5: Run** `npx vitest run`, `npx eslint src` and `npx tsc --noEmit` — all clean.
- [ ] **Step 6: Commit** `feat(site): add link preview card and preview link` (bullets: add the decorative `LinkPreviewCard`; add `PreviewLink` wiring hover, focus-visible, Escape, and press-and-hold to the card; style the card for light and dark themes with reduced-motion support; cover markup with Vitest).

### Task 5: Preview generator script

**Files:**
- Create: `scripts/link-previews-lib.mjs`, `scripts/generate-link-previews.mjs`
- Modify: `package.json` (script `"previews": "node scripts/generate-link-previews.mjs"`, devDependency `playwright-core`), `vitest.config.mts` (add `"scripts/**/*.test.mjs"` to `include`), `README.md` (one short section: what `npm run previews` does, that it needs Chrome installed, and that it is manual)
- Generated: `src/lib/link-previews.generated.json`, `public/images/link-previews/<slug>.jpg`
- Test: `scripts/link-previews-lib.test.mjs`

**Interfaces:**
- Consumes: `roles`, `projects`, `PH100_URL`, `previewOverrides` from `src/lib/profile.ts` (import with the `.ts` extension; Node 24 strips types).
- Produces (`link-previews-lib.mjs`):
  - `slugFromUrl(url: string): string` — host plus path, lowercase, non-alphanumerics to `-`, trimmed (e.g. `https://www.eypi.cc/` → `eypi-cc`)
  - `isFailedCapture(r: { status: number | null; title: string }): boolean` — failed when status is null or `>= 400`, or title is empty after trim
  - `trimDescription(text: string, max?: number): string` — default `max 110`; collapses whitespace; cuts on a word boundary and appends `…` only when cut
  - `mergeResults(previous: Record<string, LinkPreview>, results: Record<string, LinkPreview | null>): Record<string, LinkPreview>` — a `null` result keeps the previous entry; a good result replaces it

- [ ] **Step 1: Write failing tests**: `slugFromUrl` cases above; `isFailedCapture` for 404, `null`, empty title, and a good 200; `trimDescription` leaves short text alone, cuts a 200-char string to `<= 111` chars ending in `…`, collapses newlines; `mergeResults` keeps old data on `null` and replaces on success (Review Focus 5).
- [ ] **Step 2: Run** `npx vitest run scripts` — expect FAIL.
- [ ] **Step 3: Implement the lib**, then `generate-link-previews.mjs`: build targets from roles with URLs, projects with URLs and `PH100_URL`; skip a target whose override already has `title`, `description` and `image`; launch `chromium.launch({ channel: "chrome" })` with a 1200×675 viewport; per target `goto` (timeout 20s, `waitUntil: "load"`), try to dismiss consent banners (click a button whose accessible name matches accept/agree/allow-all/got-it, then hide remaining elements matching common cookie/consent selectors), wait briefly for the page to settle, take a JPEG screenshot (quality 80) to `public/images/link-previews/<slug>.jpg`, read title (`og:title` else `document.title`) and description (`og:description` else `meta[name=description]`, through `trimDescription`), set `domain` to the host without `www.`. Print one line per target (ok / FAILED with reason / skipped) and merge into the JSON with `mergeResults`, written with a trailing newline and keys sorted.
- [ ] **Step 4: Run** `npx vitest run` — PASS.
- [ ] **Step 5: Install and run**: `npm install -D playwright-core`, then `npm run previews`. Expected: each of Notion, Sip & Scale, Wantap, Eypi, PH100 reports ok or FAILED (JPCS-APC reports skipped). Open each saved JPG and read the JSON; if a screenshot shows a cookie banner, login wall or error page, or a title/description reads badly, fix the banner handling or add an entry to `previewOverrides` (title/description/image) and re-run. Report any link that could not be made to look right instead of committing it.
- [ ] **Step 6: Commit** the script in one commit `feat(site): add link preview generator` (bullets: add `npm run previews` capturing screenshots and metadata with `playwright-core` and the installed Chrome; keep previous data when a capture fails; document the command in the README; cover slugs, failure rules, trimming, and merging with Vitest) and the generated data + images in a second commit `feat(site): add generated link previews`.

### Task 6: Wire into the home page and verify

**Files:**
- Modify: `src/app/page.tsx`

**Interfaces:**
- Consumes: `PreviewLink` (Task 4), `getPreview` (Task 1).

- [ ] **Step 1: Edit `page.tsx`**: replace the role `<a>`, the project `<a>` (when `project.url` exists) and the PH100 `<a>` with `<PreviewLink href={url} preview={getPreview(url)} {...ext}>`. Leave the Instagram/LinkedIn/GitHub/email links as plain anchors.
- [ ] **Step 2: Run** `npx vitest run`, `npx eslint src`, `npx tsc --noEmit`, `npm run build` — all succeed.
- [ ] **Step 3: Browser check** with the built-in browser against `npm run dev`: hover each of the seven preview links (card appears right of the link after a short delay, correct image/title/description, moves into the card without flicker, closes on leave); Tab to a link (card opens), Escape (closes, focus stays); a social link and the email link show no card; Homelab shows no card; check dark mode (add the `dark` class) and a 375px-wide viewport (card appears below/above, fully on screen). Check `GET /api/v1/projects` and `/api/v1/roles` output is unchanged against `main`.
- [ ] **Step 4: Touch check**: in the 375px mobile emulation, dispatch a hold (`pointerdown` with `pointerType: "touch"`, wait 450ms, `pointerup`, `click`) on a link: card shows, URL does not change; then a quick tap elsewhere closes it; then a plain tap navigates. State clearly that real-device iOS Safari/Android Chrome behaviour was not verified.
- [ ] **Step 5: Commit** `feat(site): show hover previews on home page links` (bullets: use `PreviewLink` for role, project, and PH100 links; leave social and email links plain).
