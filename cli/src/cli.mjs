import { readFileSync } from "node:fs";

const DEFAULT_BASE_URL = "https://gelolaus.com";

const { version } = JSON.parse(
  readFileSync(new URL("../package.json", import.meta.url), "utf8"),
);

export const HELP = `gelolaus ${version}
Command-line client for the gelolaus.com public API (https://gelolaus.com/docs).

Usage:
  gelolaus profile [--fields name,email,...]
  gelolaus roles [--organization <name>]
  gelolaus projects [--year <yyyy>]

Options:
  --base-url <url>   API origin (default ${DEFAULT_BASE_URL})
  -h, --help         Show this help
  -v, --version      Show the version

Output is JSON on stdout. Errors go to stderr as "error: ..." with a hint.
Exit codes: 0 success, 1 API or network error, 2 usage error.
`;

/** command name -> [API path, option flag -> query parameter] */
const COMMANDS = {
  profile: ["/api/v1/profile", { fields: "fields" }],
  roles: ["/api/v1/roles", { organization: "organization" }],
  projects: ["/api/v1/projects", { year: "year" }],
};

class UsageError extends Error {}

function parseArgs(argv) {
  const positional = [];
  const options = {};
  const flags = new Set();

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "-h" || arg === "--help") flags.add("help");
    else if (arg === "-v" || arg === "--version") flags.add("version");
    else if (arg.startsWith("--")) {
      const [name, inline] = arg.slice(2).split(/=(.*)/s);
      const value = inline ?? argv[++i];
      if (value === undefined) throw new UsageError(`--${name} needs a value`);
      options[name] = value;
    } else positional.push(arg);
  }
  return { positional, options, flags };
}

async function printApiError(response, stderr) {
  let body;
  try {
    body = await response.json();
  } catch {
    body = undefined;
  }
  const error = body?.error;
  stderr.write(
    `error: ${error?.message ?? `request failed with HTTP ${response.status}`}\n`,
  );
  if (error?.hint) stderr.write(`hint: ${error.hint}\n`);
  const retryAfter = response.headers.get("retry-after");
  if (retryAfter) stderr.write(`retry after: ${retryAfter} seconds\n`);
}

/**
 * Runs the CLI and resolves to the process exit code. The fetch and output
 * streams are injectable so the behavior can be tested without a network.
 */
export async function run(
  argv,
  {
    fetch = globalThis.fetch,
    stdout = process.stdout,
    stderr = process.stderr,
  } = {},
) {
  try {
    const { positional, options, flags } = parseArgs(argv);

    if (flags.has("version")) {
      stdout.write(`${version}\n`);
      return 0;
    }
    if (flags.has("help") || positional.length === 0) {
      (flags.has("help") ? stdout : stderr).write(HELP);
      return flags.has("help") ? 0 : 2;
    }

    const [name, ...extra] = positional;
    const command = COMMANDS[name];
    if (!command) throw new UsageError(`unknown command "${name}"`);
    if (extra.length > 0) {
      throw new UsageError(`unexpected argument "${extra[0]}"`);
    }

    const [path, queryFlags] = command;
    const { "base-url": baseUrl = DEFAULT_BASE_URL, ...rest } = options;
    const url = new URL(path, baseUrl);
    for (const [flag, value] of Object.entries(rest)) {
      if (!(flag in queryFlags)) {
        throw new UsageError(`"${name}" does not accept --${flag}`);
      }
      url.searchParams.set(queryFlags[flag], value);
    }

    let response;
    try {
      response = await fetch(url, {
        headers: {
          Accept: "application/json",
          "User-Agent": `gelolaus-cli/${version}`,
        },
      });
    } catch (cause) {
      stderr.write(`error: could not reach ${url.origin} (${cause.message})\n`);
      return 1;
    }

    if (!response.ok) {
      await printApiError(response, stderr);
      return 1;
    }
    stdout.write(`${JSON.stringify(await response.json(), null, 2)}\n`);
    return 0;
  } catch (error) {
    if (!(error instanceof UsageError)) throw error;
    stderr.write(`error: ${error.message}\n\n${HELP}`);
    return 2;
  }
}
