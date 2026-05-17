import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import { PageTransitionProvider } from "@/components/PageTransition";
import { KeyboardNav } from "@/components/KeyboardNav";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

const description =
  "Hi, I'm @gelolaus, community builder, student leader, and maker.";

export const metadata: Metadata = {
  metadataBase: new URL("https://gelolaus.com"),
  title: "gelolaus · Angelo Laus",
  description,
  authors: [{ name: "Angelo Laus", url: "https://gelolaus.com" }],
  keywords: [
    "Angelo Laus",
    "gelolaus",
    "community builder",
    "student leader",
    "Asia Pacific College",
    "portfolio",
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: { canonical: "https://gelolaus.com" },
  icons: {
    icon: "/avatar.ico",
    apple: "/avatar.ico",
  },
  openGraph: {
    title: "gelolaus · Angelo Laus",
    description,
    url: "https://gelolaus.com",
    siteName: "gelolaus",
    locale: "en_US",
    type: "profile",
    images: [
      {
        url: "/avatar.png",
        width: 1200,
        height: 630,
        alt: "Angelo Laus – @gelolaus portfolio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "gelolaus · Angelo Laus",
    description,
    creator: "@gelolaus",
    site: "@gelolaus",
    images: ["/avatar.png"],
  },
};

const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Angelo Laus",
  alternateName: "@gelolaus",
  url: "https://gelolaus.com",
  email: "hello@gelolaus.com",
  jobTitle: "Community Builder & Student Leader",
  description:
    "CS student, community builder, and student leader at Asia Pacific College.",
  knowsAbout: ["Cybersecurity", "Web Development", "UI/UX Design", "Productivity"],
  alumniOf: {
    "@type": "CollegeOrUniversity",
    name: "Asia Pacific College",
  },
  sameAs: [
    "https://facebook.com/gelolaus",
    "https://instagram.com/gelolaus",
    "https://linkedin.com/in/gelolaus",
  ],
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "gelolaus",
  url: "https://gelolaus.com",
  description:
    "Personal portfolio of Angelo Laus (@gelolaus) — community builder, student leader, and maker.",
  author: { "@type": "Person", name: "Angelo Laus" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geist.variable} ${geistMono.variable}`}
    >
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <ThemeProvider>
          <PageTransitionProvider>
            <KeyboardNav />
            {children}
          </PageTransitionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
