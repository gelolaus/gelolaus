// Captures hover-card screenshots and metadata for the home page links.
// Manual only: `npm run previews`. Needs Google Chrome installed.
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright-core";
import {
  PH100_URL,
  previewOverrides,
  projects,
  roles,
} from "../src/lib/profile.ts";
import {
  isFailedCapture,
  mergeResults,
  slugFromUrl,
  trimDescription,
} from "./link-previews-lib.mjs";

const root = path.resolve(import.meta.dirname, "..");
const dataFile = path.join(root, "src/lib/link-previews.generated.json");
const imageDir = path.join(root, "public/images/link-previews");

const ACCEPT_NAME =
  /^(accept( all)?( cookies)?|agree|allow all( cookies)?|i agree|got it|ok(ay)?)$/i;
const BANNER_SELECTORS = [
  '[id*="cookie" i]',
  '[class*="cookie" i]',
  '[id*="consent" i]',
  '[class*="consent" i]',
  '[id*="onetrust" i]',
  '[aria-label*="cookie" i]',
].join(",");

const urls = [
  ...roles.map((r) => r.url),
  ...projects.map((p) => p.url).filter(Boolean),
  PH100_URL,
];

const isFullOverride = (url) => {
  const o = previewOverrides[url];
  return Boolean(o?.title && o?.description && o?.image);
};

async function dismissBanners(page) {
  for (const role of ["button", "link"]) {
    const button = page.getByRole(role, { name: ACCEPT_NAME }).first();
    try {
      if (await button.isVisible({ timeout: 800 })) {
        await button.click({ timeout: 1500 });
        break;
      }
    } catch {
      /* no banner of this kind */
    }
  }
  await page.addStyleTag({
    content: `${BANNER_SELECTORS}{display:none !important}`,
  });
}

async function capture(page, url) {
  let status = null;
  try {
    const response = await page.goto(url, { timeout: 20000, waitUntil: "load" });
    status = response ? response.status() : null;
  } catch (error) {
    return { failed: `navigation: ${error.message.split("\n")[0]}` };
  }
  await dismissBanners(page);
  await page.waitForTimeout(2000);

  const meta = await page.evaluate(() => {
    const pick = (sel) => document.querySelector(sel)?.getAttribute("content") ?? "";
    return {
      title: pick('meta[property="og:title"]') || document.title,
      description:
        pick('meta[property="og:description"]') || pick('meta[name="description"]'),
    };
  });
  if (isFailedCapture({ status, title: meta.title })) {
    return { failed: `status ${status}, title "${meta.title.trim()}"` };
  }

  const shot = await page.screenshot({ type: "jpeg", quality: 80 });
  const slug = slugFromUrl(url);
  return {
    shot,
    slug,
    entry: {
      title: meta.title.trim(),
      description: trimDescription(meta.description),
      domain: new URL(url).hostname.replace(/^www\./, ""),
      image: `/images/link-previews/${slug}.jpg`,
    },
  };
}

const previous = JSON.parse(fs.readFileSync(dataFile, "utf8"));
const results = {};
fs.mkdirSync(imageDir, { recursive: true });

const browser = await chromium.launch({ channel: "chrome" });
const context = await browser.newContext({
  viewport: { width: 1200, height: 675 },
  locale: "en-US",
});
const page = await context.newPage();

for (const url of urls) {
  if (isFullOverride(url)) {
    console.log(`skipped  ${url} (hand-written override)`);
    continue;
  }
  const out = await capture(page, url);
  if (out.failed) {
    results[url] = null;
    console.log(`FAILED   ${url} — ${out.failed}`);
    continue;
  }
  fs.writeFileSync(path.join(imageDir, `${out.slug}.jpg`), out.shot);
  results[url] = out.entry;
  console.log(`ok       ${url} — "${out.entry.title}"`);
}

await browser.close();

const merged = mergeResults(previous, results);
const sorted = Object.fromEntries(
  Object.entries(merged).sort(([a], [b]) => a.localeCompare(b)),
);
fs.writeFileSync(dataFile, `${JSON.stringify(sorted, null, 2)}\n`);
