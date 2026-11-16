import { profile, SITE_URL } from "@/lib/profile";

const DOMAIN = new URL(SITE_URL).hostname;
const urn = (namespace: string, name: string) => `urn:air:${DOMAIN}:${namespace}:${name}`;

export const AI_CATALOG_URL = `${SITE_URL}/.well-known/ai-catalog.json`;

/** ARD manifest (ai-catalog data model): every entry uses `url`, never `data`. */
export function getAiCatalog() {
  return {
    specVersion: "1.0",
    host: {
      displayName: `${profile.name} (@${profile.handle})`,
      identifier: `did:web:${DOMAIN}`,
    },
    entries: [
      {
        identifier: urn("server", "profile"),
        displayName: "gelolaus profile MCP server",
        type: "application/mcp-server-card+json",
        url: `${SITE_URL}/.well-known/mcp/server-card.json`,
        representativeQueries: [
          "who is Angelo Laus",
          "get the public profile of @gelolaus",
          "which organizations is Angelo Laus a part of",
          "what projects has gelolaus built",
        ],
      },
      {
        identifier: urn("api", "profile-rest"),
        displayName: "gelolaus.com REST API",
        type: "application/vnd.oai.openapi+json",
        url: `${SITE_URL}/openapi.json`,
        representativeQueries: [
          "read Angelo Laus's contact email",
          "list gelolaus projects from 2026",
          "find roles at Notion held by Angelo Laus",
        ],
      },
      {
        identifier: urn("skills", "index"),
        displayName: "gelolaus agent skills",
        type: "application/json",
        url: `${SITE_URL}/.well-known/agent-skills/index.json`,
        representativeQueries: [
          "how do I look up Angelo Laus with the API",
          "how do I connect to the gelolaus MCP server",
        ],
      },
      {
        identifier: urn("docs", "llms-txt"),
        displayName: "gelolaus llms.txt",
        type: "text/plain",
        url: `${SITE_URL}/llms.txt`,
        representativeQueries: [
          "give me an overview of gelolaus.com for an LLM",
          "what pages does gelolaus.com have",
        ],
      },
    ],
  };
}
