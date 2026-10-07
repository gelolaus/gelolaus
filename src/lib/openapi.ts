import { RATE_LIMIT } from "@/lib/api";
import { profile, SITE_URL } from "@/lib/profile";

const ref = (name: string) => ({ $ref: `#/components/schemas/${name}` });
const response = (name: string) => ({ $ref: `#/components/responses/${name}` });

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
    headers: rateLimitHeaders,
    content: { "application/json": { schema } },
  };
}

function listOf(item: string) {
  return {
    type: "object",
    required: ["data"],
    properties: { data: { type: "array", items: ref(item) } },
  };
}

const sharedErrors = {
  "429": response("RateLimited"),
  "500": response("InternalError"),
};

export function getOpenApiSpec() {
  return {
    openapi: "3.1.0",
    info: {
      title: "gelolaus.com API",
      version: "1.0.0",
      summary: "Read-only public profile API for Angelo Laus (@gelolaus).",
      description:
        "Returns the public profile, current roles, and projects of Angelo Laus (@gelolaus). All endpoints are read-only and need no authentication. Errors are JSON with a stable code, a message, and a resolution hint.",
      contact: { name: profile.name, url: SITE_URL, email: profile.email },
    },
    servers: [{ url: SITE_URL, description: "Production" }],
    externalDocs: {
      description: "Human-readable API documentation",
      url: `${SITE_URL}/docs`,
    },
    tags: [{ name: "Profile", description: "Public profile information." }],
    security: [],
    paths: {
      "/api/v1/profile": {
        get: {
          operationId: "getProfile",
          summary: "Get the full public profile",
          description:
            "Returns the name, handle, summary, location, contact email, social links, current roles, and projects of Angelo Laus in one response. Use this first to identify or verify who @gelolaus is.",
          tags: ["Profile"],
          responses: {
            "200": ok("The full public profile.", ref("Profile")),
            ...sharedErrors,
          },
        },
      },
      "/api/v1/roles": {
        get: {
          operationId: "listRoles",
          summary: "List current roles",
          description:
            "Returns the organizations Angelo Laus is currently active in, with his title at each one.",
          tags: ["Profile"],
          responses: {
            "200": ok("The list of current roles.", listOf("Role")),
            ...sharedErrors,
          },
        },
      },
      "/api/v1/projects": {
        get: {
          operationId: "listProjects",
          summary: "List projects",
          description:
            "Returns the projects Angelo Laus has built. Pass `year` to return only projects from that year; a year with no projects returns an empty list.",
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
            "200": ok("The list of projects.", listOf("Project")),
            "400": response("InvalidParameter"),
            ...sharedErrors,
          },
        },
      },
    },
    components: {
      schemas: {
        Profile: {
          type: "object",
          required: [
            "name",
            "handle",
            "summary",
            "location",
            "url",
            "email",
            "links",
            "roles",
            "projects",
          ],
          properties: {
            name: { type: "string", description: "Full name.", example: profile.name },
            handle: { type: "string", description: "Handle used across platforms.", example: profile.handle },
            summary: { type: "string", description: "One-sentence introduction." },
            location: { type: "string", description: "Country where he is based.", example: profile.location },
            url: { type: "string", format: "uri", description: "Canonical website." },
            email: { type: "string", format: "email", description: "Contact email address." },
            links: {
              type: "object",
              description: "Verified social profiles.",
              required: ["instagram", "linkedin"],
              properties: {
                instagram: { type: "string", format: "uri", description: "Instagram profile." },
                linkedin: { type: "string", format: "uri", description: "LinkedIn profile." },
              },
            },
            roles: { type: "array", items: ref("Role") },
            projects: { type: "array", items: ref("Project") },
          },
        },
        Role: {
          type: "object",
          required: ["organization", "title", "url"],
          properties: {
            organization: { type: "string", description: "Organization name.", example: "Notion" },
            title: { type: "string", description: "His role there.", example: "Campus Leader (Cohort 4)" },
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
      },
      responses: {
        InvalidParameter: {
          description: "A query parameter is malformed. The hint shows a valid value.",
          headers: rateLimitHeaders,
          content: { "application/json": { schema: ref("Error") } },
        },
        RateLimited: {
          description: `More than ${RATE_LIMIT.limit} requests in ${RATE_LIMIT.windowSeconds} seconds. Wait for Retry-After seconds and retry.`,
          headers: {
            ...rateLimitHeaders,
            "Retry-After": { $ref: "#/components/headers/RetryAfter" },
          },
          content: { "application/json": { schema: ref("Error") } },
        },
        InternalError: {
          description: "The server failed to process the request. Retry shortly.",
          headers: rateLimitHeaders,
          content: { "application/json": { schema: ref("Error") } },
        },
      },
    },
  };
}
