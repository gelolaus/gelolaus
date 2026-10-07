export const SITE_URL = "https://gelolaus.com";

export type Role = {
  organization: string;
  title: string;
  url: string;
};

export type Project = {
  name: string;
  year: number;
  url: string | null;
  description: string;
};

export const profile = {
  name: "Angelo Laus",
  handle: "gelolaus",
  intro: "I'm @gelolaus, a builder and community leader from the Philippines.",
  location: "Philippines",
  email: "hello@gelolaus.com",
  links: {
    instagram: "https://instagram.com/gelolaus",
    linkedin: "https://linkedin.com/in/gelolaus",
  },
} as const;

export const roles: Role[] = [
  {
    organization: "Notion",
    title: "Campus Leader (Cohort 4)",
    url: "https://instagram.com/notionhq",
  },
  {
    organization: "Sip & Scale",
    title: "Partnerships",
    url: "https://instagram.com/sipnscale",
  },
  {
    organization: "JPCS-APC",
    title: "VP for External Affairs",
    url: "https://instagram.com/jpcs.apc",
  },
];

export const projects: Project[] = [
  {
    name: "Wantap",
    year: 2026,
    url: "https://wantap.cc",
    description: "Digital calling card platform with custom dynamic routing.",
  },
  {
    name: "Eypi",
    year: 2026,
    url: "https://eypi.cc",
    description:
      "Unified campus suite for student org links, forms, and ticketing.",
  },
  {
    name: "Homelab",
    year: 2026,
    url: null,
    description:
      "Self-hosted infrastructure for private cloud storage and network security.",
  },
];

export function getProfilePayload() {
  return {
    name: profile.name,
    handle: profile.handle,
    summary: profile.intro,
    location: profile.location,
    url: SITE_URL,
    email: profile.email,
    links: profile.links,
    roles,
    projects,
  };
}

export function getRolesPayload() {
  return { data: roles };
}

export function getProjectsPayload(year?: number) {
  const data =
    year === undefined ? projects : projects.filter((p) => p.year === year);
  return { data };
}
