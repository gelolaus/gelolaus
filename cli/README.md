# gelolaus

Command-line client for the [gelolaus.com public API](https://gelolaus.com/docs): the profile, roles, and projects of Angelo Laus (@gelolaus), as JSON. No dependencies, Node 18 or newer.

```bash
npx gelolaus profile
npx gelolaus profile --fields name,email
npx gelolaus roles --organization Notion
npx gelolaus projects --year 2026
```

Output is JSON on stdout, so it pipes straight into `jq` or an agent. Errors print `error:` and `hint:` lines to stderr.

| Command    | Option                  | API endpoint            |
| ---------- | ----------------------- | ----------------------- |
| `profile`  | `--fields a,b`          | `GET /api/v1/profile`   |
| `roles`    | `--organization <name>` | `GET /api/v1/roles`     |
| `projects` | `--year <yyyy>`         | `GET /api/v1/projects`  |

Global options: `--base-url <url>` (default `https://gelolaus.com`), `-h/--help`, `-v/--version`.

Exit codes: `0` success, `1` API or network error (including a 429, which also prints `retry after`), `2` usage error.

The API is read-only, needs no authentication, and allows 60 requests per 60 seconds. See the [documentation](https://gelolaus.com/docs) and the [OpenAPI spec](https://gelolaus.com/openapi.json).
