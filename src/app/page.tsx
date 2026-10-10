import Image from "next/image";
import { SiteFooter } from "@/components/site-footer";
import { PH100_URL, profile, projects, roles } from "@/lib/profile";
import ph100Badge from "../../public/images/badges/ph100-2026.png";

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

      <figure className="ph100">
        <Image
          src={ph100Badge}
          alt="I'm part of PH100 2026, powered by PayMongo and organised by StellarPH"
          placeholder="blur"
          sizes="(min-width: 640px) 640px, 100vw"
          className="ph100-image"
        />
        <figcaption>
          Recognized as part of{" "}
          <a href={PH100_URL} {...ext}>
            StellarPH&rsquo;s PH100 Cohort
          </a>{" "}
          for 2026
        </figcaption>
      </figure>

      <SiteFooter />
    </main>
  );
}
