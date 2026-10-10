import { API_VERSION, RATE_LIMIT } from "@/lib/api";
import { PROFILE_FIELDS, profile, SITE_URL } from "@/lib/profile";

const ref = (name: string) => ({ $ref: `#/components/schemas/${name}` });

const versionHeader = { "API-Version": { $ref: "#/components/headers/ApiVersion" } };

const rateLimitHeaders = {
  RateLimit: { $ref: "#/components/headers/RateLimit" },
  "RateLimit-Policy": { $ref: "#/components/headers/RateLimitPolicy" },
  "RateLimit-Limit": { $ref: "#/components/headers/RateLimitLimit" },
  "RateLimit-Remaining": { $ref: "#/components/headers/RateLimitRemaining" },
  "RateLimit-Reset": { $ref: "#/components/headers/RateLimitReset" },
};

function ok(description: string, schema: object) {
  return {
    description,
    headers: { ...versionHeader, ...rateLimitHeaders },
    content: { "application/json": { schema } },
  };
}

/** Every error response uses the shared Error schema. */
function failure(description: string, headers: object = {}) {
  return {
    description,
    headers: { ...versionHeader, ...rateLimitHeaders, ...headers },
    content: { "application/json": { schema: ref("Error") } },
  };
}

const badRequest = (description: string) => failure(description);

const sharedErrors = {
  "429": failure(
    `More than ${RATE_LIMIT.limit} requests in ${RATE_LIMIT.windowSeconds} seconds. Wait for Retry-After seconds and retry.`,
    { "Retry-After": { $ref: "#/components/headers/RetryAfter" } },
  ),
  "500": failure("The server failed to process the request. Retry shortly."),
  default: failure("Any other error, using the same Error object."),
};

export function getOpenApiSpec() {
  return {
    openapi: "3.1.0",
    info: {
      title: "gelolaus.com API",
      version: `${API_VERSION}.0.0`,
      summary: "Read-only API for my public profile (Angelo Laus, @gelolaus).",
      description:
        "Returns my public profile, current roles, and projects (I'm Angelo Laus, @gelolaus). All endpoints are read-only and need no authentication. Errors are JSON with a stable code, a message, and a resolution hint. The API is versioned in the URL path (/api/v1); breaking changes ship under a new version, and deprecations are announced with Deprecation and Sunset headers (see the versioning policy in the documentation).",
      contact: { name: profile.name, url: SITE_URL, email: profile.email },
    },
    servers: [{ url: SITE_URL, description: "Production" }],
    externalDocs: {
      description:
        "Human-readable API documentation, including the versioning and deprecation policy",
      url: `${SITE_URL}/docs#versioning-and-deprecation`,
    },
    tags: [{ name: "Profile", description: "Public profile information." }],
    security: [],
    paths: {
      "/api/v1/profile": {
        get: {
          operationId: "getProfile",
          summary: "Get the full public profile",
          description:
            "Returns my name, handle, summary, location, contact email, social links, current roles, and projects in one response. Use this first to identify or verify who @gelolaus is. Pass `fields` to receive only some of the properties.",
          tags: ["Profile"],
          parameters: [
            {
              name: "fields",
              in: "query",
              required: false,
              description:
                "Comma-separated list of top-level properties to return. Omit to return all of them.",
              style: "form",
              explode: false,
              schema: {
                type: "array",
                minItems: 1,
                uniqueItems: true,
                items: { type: "string", enum: [...PROFILE_FIELDS] },
              },
              example: ["name", "email"],
            },
          ],
          responses: {
            "200": ok("The public profile, or the selected fields of it.", ref("Profile")),
            "400": badRequest("The `fields` parameter names an unknown field. The hint lists the valid ones."),
            ...sharedErrors,
          },
        },
      },
      "/api/v1/roles": {
        get: {
          operationId: "listRoles",
          summary: "List current roles",
          description:
            "Returns the organizations I'm currently active in, with my title at each one. Pass `organization` to look up a single organization; an organization with no match returns an empty list.",
          tags: ["Profile"],
          parameters: [
            {
              name: "organization",
              in: "query",
              required: false,
              description:
                "Only return roles at the organization with this name (case-insensitive exact match).",
              schema: { type: "string", minLength: 1 },
              example: "Notion",
            },
          ],
          responses: {
            "200": ok("The list of current roles.", ref("RoleList")),
            "400": badRequest("The `organization` parameter is empty."),
            ...sharedErrors,
          },
        },
      },
      "/api/v1/projects": {
        get: {
          operationId: "listProjects",
          summary: "List projects",
          description:
            "Returns the projects I've built. Pass `year` to return only projects from that year; a year with no projects returns an empty list.",
          tags: ["Profile"],
          parameters: [
            {
              name: "year",
              in: "query",
              required: false,
              description: "Only return projects from this four-digit year.",
              schema: { type: "integer", minimum: 1000, maximum: 9999 },
              example: 2026,
            },
          ],
          responses: {
            "200": ok("The list of projects.", ref("ProjectList")),
            "400": badRequest("The `year` parameter is not a four-digit year."),
            ...sharedErrors,
          },
        },
      },
    },
    components: {
      schemas: {
        Profile: {
          type: "object",
          description:
            "The public profile. When `fields` is used, only the selected properties are present.",
          properties: {
            name: { type: "string", description: "Full name.", example: profile.name },
            handle: { type: "string", description: "Handle used across platforms.", example: profile.handle },
            summary: { type: "string", description: "One-sentence introduction." },
            location: { type: "string", description: "Country where I'm based.", example: profile.location },
            url: { type: "string", format: "uri", description: "My website." },
            email: { type: "string", format: "email", description: "My contact email address." },
            links: {
              type: "object",
              description: "My social profiles.",
              required: ["instagram", "linkedin"],
              properties: {
                instagram: { type: "string", format: "uri", description: "My Instagram profile." },
                linkedin: { type: "string", format: "uri", description: "My LinkedIn profile." },
              },
            },
            roles: { type: "array", items: ref("Role") },
            projects: { type: "array", items: ref("Project") },
          },
        },
        RoleList: {
          type: "object",
          required: ["data"],
          properties: {
            data: { type: "array", description: "Matching roles.", items: ref("Role") },
          },
        },
        ProjectList: {
          type: "object",
          required: ["data"],
          properties: {
            data: { type: "array", description: "Matching projects.", items: ref("Project") },
          },
        },
        Role: {
          type: "object",
          required: ["organization", "title", "url"],
          properties: {
            organization: { type: "string", description: "Organization name.", example: "Notion" },
            title: { type: "string", description: "My role there.", example: "for Startups Partner, Templates Creator, and Campus Leader (Cohort 4)" },
            url: { type: "string", format: "uri", description: "The organization's public profile." },
          },
        },
        Project: {
          type: "object",
          required: ["name", "year", "url", "description"],
          properties: {
            name: { type: "string", description: "Project name.", example: "Wantap" },
            year: { type: "integer", description: "Year the project was built.", example: 2026 },
            url: {
              type: ["string", "null"],
              format: "uri",
              description: "Public website, or null if the project has none.",
            },
            description: { type: "string", description: "What the project does." },
          },
        },
        Error: {
          type: "object",
          required: ["error"],
          properties: {
            error: {
              type: "object",
              required: ["code", "status", "message", "hint", "documentation_url"],
              properties: {
                code: {
                  type: "string",
                  description: "Stable machine-readable error code.",
                  enum: [
                    "invalid_parameter",
                    "not_found",
                    "method_not_allowed",
                    "rate_limited",
                    "internal_error",
                  ],
                },
                status: { type: "integer", description: "HTTP status code, repeated for convenience." },
                message: { type: "string", description: "What went wrong." },
                hint: { type: "string", description: "How to resolve it." },
                documentation_url: { type: "string", format: "uri", description: "Where the error is documented." },
              },
            },
          },
        },
      },
      headers: {
        ApiVersion: {
          description:
            "Major version of the API that served the response, for example `1`.",
          schema: { type: "string", example: API_VERSION },
        },
        RateLimit: {
          description:
            'Remaining quota as a structured field, for example `"default";r=59;t=42` (requests left, seconds until reset).',
          schema: { type: "string" },
        },
        RateLimitPolicy: {
          description: `Quota policy as a structured field: \`"default";q=${RATE_LIMIT.limit};w=${RATE_LIMIT.windowSeconds}\`.`,
          schema: { type: "string" },
        },
        RateLimitLimit: {
          description: "Maximum requests allowed per window.",
          schema: { type: "integer" },
        },
        RateLimitRemaining: {
          description: "Requests left in the current window.",
          schema: { type: "integer" },
        },
        RateLimitReset: {
          description: "Seconds until the current window resets.",
          schema: { type: "integer" },
        },
        RetryAfter: {
          description: "Seconds to wait before retrying.",
          schema: { type: "integer" },
        },
      }
    },
  };
}
