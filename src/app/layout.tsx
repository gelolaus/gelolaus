import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
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

export const metadata: Metadata = {
  title: "gelolaus — Angelo Laus",
  description: "Hi, I'm @gelolaus — community builder, student leader, and maker.",
  icons: {
    icon: "/avatar.ico",
    apple: "/avatar.ico",
  },
  openGraph: {
    title: "gelolaus — Angelo Laus",
    description: "Hi, I'm @gelolaus — community builder, student leader, and maker.",
    url: "https://gelolaus.com",
    siteName: "gelolaus",
    images: [{ url: "/avatar.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "gelolaus — Angelo Laus",
    images: ["/avatar.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geist.variable} ${geistMono.variable}`}
    >
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
