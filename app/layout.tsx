import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Blindwoods",
  description: "Private AI with no account to watch. We can't see you.",
};

export const viewport: Viewport = { themeColor: "#1E3A2F" };

// No avatar, no profile, no username anywhere: there is no "you" to show.
const TABS = [
  { href: "/chat", label: "Chat" },
  { href: "/tickets", label: "Tickets" },
  { href: "/verify", label: "Verify" },
  { href: "/meter", label: "Meter" },
  { href: "/settings", label: "Settings" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <main className="shell">{children}</main>
        <nav className="tabs" aria-label="Sections">
          {TABS.map((t) => (
            <Link key={t.href} href={t.href} prefetch={false}>
              {t.label}
            </Link>
          ))}
        </nav>
      </body>
    </html>
  );
}
