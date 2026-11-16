import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  async headers() {
    return [
      {
        // RFC 8288 / RFC 9727 discovery links for agents.
        source: "/",
        headers: [
          {
            key: "Link",
            value: [
              '</.well-known/api-catalog>; rel="api-catalog"',
              '</openapi.json>; rel="service-desc"; type="application/json"',
              '</docs>; rel="service-doc"; type="text/html"',
              '</.well-known/ai-catalog.json>; rel="ai-catalog"; type="application/json"',
              '</.well-known/mcp/server-card.json>; rel="mcp-server-card"; type="application/json"',
              '</.well-known/agent-skills/index.json>; rel="agent-skills"; type="application/json"',
              '</.well-known/oauth-protected-resource>; rel="oauth-protected-resource"; type="application/json"',
            ].join(", "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
