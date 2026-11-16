import { profile, SITE_URL } from "@/lib/profile";

/**
 * Personal Agent Protocol (draft 0.1) discovery. This is a website-only
 * declaration: no agent, API, or session interface exists, so there is no
 * `auth.issuer` and no issuer metadata to bind.
 */
export function getPoppyManifest() {
  return {
    protocol_version: "0.1",
    organization: {
      name: profile.name,
      domain: new URL(SITE_URL).hostname,
    },
    web: {},
  };
}
