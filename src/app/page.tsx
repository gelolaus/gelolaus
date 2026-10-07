import { SiteFooter } from "@/components/site-footer";
import { profile, projects, roles } from "@/lib/profile";

const ext = { target: "_blank", rel: "noopener noreferrer" } as const;

export default function Home() {
  return (
    <main className="page">
      <h1>{profile.name}</h1>

      <p>{profile.intro}</p>

      <p>My active roles:</p>
      <ul className="home-list">
        {roles.map((role) => (
          <li key={role.organization}>
            <a href={role.url} {...ext}>
              {role.organization}
            </a>{" "}
            {role.title}
          </li>
        ))}
      </ul>

      <p>Things I&apos;ve built:</p>
      <ul className="home-list">
        {projects.map((project) => {
          const label = `${project.name} (${project.year})`;
          return (
            <li key={project.name}>
              {project.url ? (
                <a href={project.url} {...ext}>
                  {label}
                </a>
              ) : (
                label
              )}{" "}
              &ndash; {project.description}
            </li>
          );
        })}
      </ul>

      <p>
        Connect with me on{" "}
        <a href={profile.links.instagram} {...ext}>
          Instagram
        </a>{" "}
        or{" "}
        <a href={profile.links.linkedin} {...ext}>
          LinkedIn
        </a>
        , or email <a href={`mailto:${profile.email}`}>{profile.email}</a>.
      </p>

      <SiteFooter />
    </main>
  );
}
