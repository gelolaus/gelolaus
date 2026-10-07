import { StaticPage, staticPageMetadata } from "@/components/static-page";

export const metadata = staticPageMetadata("/docs");

export default function Page() {
  return <StaticPage path="/docs" />;
}
