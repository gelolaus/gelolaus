import { StaticPage, staticPageMetadata } from "@/components/static-page";

export const metadata = staticPageMetadata("/privacy");

export default function Page() {
  return <StaticPage path="/privacy" />;
}
