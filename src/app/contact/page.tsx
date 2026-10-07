import { StaticPage, staticPageMetadata } from "@/components/static-page";

export const metadata = staticPageMetadata("/contact");

export default function Page() {
  return <StaticPage path="/contact" />;
}
