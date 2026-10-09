import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { run } from "./cli.mjs";

const { version } = JSON.parse(
  readFileSync(new URL("../package.json", import.meta.url), "utf8"),
);

function harness(response) {
  const calls = [];
  const out = [];
  const err = [];
  const fetch = async (url, init) => {
    calls.push({ url: String(url), init });
    if (response instanceof Error) throw response;
    return response;
  };
  return {
    calls,
    deps: {
      fetch,
      stdout: { write: (s) => out.push(s) },
      stderr: { write: (s) => err.push(s) },
    },
    stdout: () => out.join(""),
    stderr: () => err.join(""),
  };
}

const json = (body, init = {}) =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: { "content-type": "application/json" },
    ...init,
  });

describe("gelolaus cli", () => {
  it("prints pretty JSON for a successful call and exits 0", async () => {
    const h = harness(json({ data: [{ name: "Wantap" }] }));
    expect(await run(["projects"], h.deps)).toBe(0);
    expect(JSON.parse(h.stdout())).toEqual({ data: [{ name: "Wantap" }] });
    expect(h.stdout()).toContain("\n  ");
    expect(h.stderr()).toBe("");
  });

  it("calls the right endpoint with JSON Accept and a versioned user agent", async () => {
    const h = harness(json({}));
    await run(["profile"], h.deps);
    expect(h.calls[0].url).toBe("https://gelolaus.com/api/v1/profile");
    expect(h.calls[0].init.headers.Accept).toBe("application/json");
    expect(h.calls[0].init.headers["User-Agent"]).toBe(`gelolaus-cli/${version}`);
  });

  it.each([
    [["profile", "--fields", "name,email"], "/api/v1/profile?fields=name%2Cemail"],
    [["profile", "--fields=name"], "/api/v1/profile?fields=name"],
    [["roles", "--organization", "Sip & Scale"], "/api/v1/roles?organization=Sip+%26+Scale"],
    [["projects", "--year", "2026"], "/api/v1/projects?year=2026"],
  ])("maps %j to a query string", async (argv, path) => {
    const h = harness(json({}));
    expect(await run(argv, h.deps)).toBe(0);
    expect(h.calls[0].url).toBe(`https://gelolaus.com${path}`);
  });

  it("honors --base-url", async () => {
    const h = harness(json({}));
    await run(["roles", "--base-url", "http://localhost:3000"], h.deps);
    expect(h.calls[0].url).toBe("http://localhost:3000/api/v1/roles");
  });

  it("prints the API error message and hint to stderr and exits 1", async () => {
    const h = harness(
      json(
        { error: { code: "invalid_parameter", message: "Bad year.", hint: "Use ?year=2026." } },
        { status: 400 },
      ),
    );
    expect(await run(["projects", "--year", "x"], h.deps)).toBe(1);
    expect(h.stdout()).toBe("");
    expect(h.stderr()).toContain("error: Bad year.");
    expect(h.stderr()).toContain("hint: Use ?year=2026.");
  });

  it("reports Retry-After on a 429", async () => {
    const h = harness(
      json(
        { error: { code: "rate_limited", message: "Slow down.", hint: "Wait." } },
        { status: 429, headers: { "retry-after": "17" } },
      ),
    );
    expect(await run(["roles"], h.deps)).toBe(1);
    expect(h.stderr()).toContain("retry after: 17 seconds");
  });

  it("handles a non-JSON error body", async () => {
    const h = harness(new Response("Bad gateway", { status: 502 }));
    expect(await run(["roles"], h.deps)).toBe(1);
    expect(h.stderr()).toContain("error: request failed with HTTP 502");
  });

  it("reports network failures with exit code 1", async () => {
    const h = harness(new Error("getaddrinfo ENOTFOUND"));
    expect(await run(["roles"], h.deps)).toBe(1);
    expect(h.stderr()).toContain("could not reach https://gelolaus.com");
  });

  it.each([
    [["nope"], 'unknown command "nope"'],
    [["profile", "--year", "2026"], '"profile" does not accept --year'],
    [["projects", "extra"], 'unexpected argument "extra"'],
    [["projects", "--year"], "--year needs a value"],
  ])("rejects %j with exit code 2 and no request", async (argv, message) => {
    const h = harness(json({}));
    expect(await run(argv, h.deps)).toBe(2);
    expect(h.stderr()).toContain(message);
    expect(h.calls).toHaveLength(0);
  });

  it("shows help on stdout for --help and on stderr (exit 2) with no command", async () => {
    const withFlag = harness(json({}));
    expect(await run(["--help"], withFlag.deps)).toBe(0);
    expect(withFlag.stdout()).toContain("Usage:");

    const bare = harness(json({}));
    expect(await run([], bare.deps)).toBe(2);
    expect(bare.stderr()).toContain("Usage:");
  });

  it("prints the package version", async () => {
    const h = harness(json({}));
    expect(await run(["--version"], h.deps)).toBe(0);
    expect(h.stdout().trim()).toBe(version);
  });
});
