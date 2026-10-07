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
            ].join(", "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
