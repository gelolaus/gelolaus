export function slugFromUrl(url) {
  const u = new URL(url);
  const host = u.hostname.replace(/^www\./, "");
  return `${host}${u.pathname}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** A capture is failed on HTTP errors, no response, or an empty title. */
export function isFailedCapture({ status, title }) {
  return status === null || status >= 400 || !title || title.trim() === "";
}

export function trimDescription(text, max = 110) {
  const clean = (text ?? "").replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const head = clean.slice(0, max);
  const space = head.lastIndexOf(" ");
  return `${(space > 0 ? head.slice(0, space) : head).trimEnd()}…`;
}

/** Failed (null) results never overwrite previously good data. */
export function mergeResults(previous, results) {
  const merged = { ...previous };
  for (const [url, result] of Object.entries(results)) {
    if (result) merged[url] = result;
  }
  return merged;
}
