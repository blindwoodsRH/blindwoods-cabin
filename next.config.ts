import type { NextConfig } from "next";

const dev = process.env.NODE_ENV !== "production";

// What a page may load: only this app's own files, no frames, no plugins, no other site's scripts, and it may only
// talk to this origin. The wallet is a browser extension, outside the page. Next's boot scripts are inline, so inline
// scripts stay allowed; the dev server also needs eval and a websocket.
const CSP = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${dev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  `connect-src 'self'${dev ? " ws: wss:" : ""}`,
  "worker-src 'self'",
  "manifest-src 'self'",
  "frame-src 'none'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const nextConfig: NextConfig = {
  output: process.env.STANDALONE === "1" ? "standalone" : undefined,
  poweredByHeader: false,
  images: { unoptimized: true },
  async redirects() {
    return [{ source: "/", destination: "/chat", permanent: false }];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: CSP },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "no-referrer" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          // Keeps a CDN edge from rewriting the HTML to append its own analytics script.
          { key: "Cache-Control", value: "private, no-store, no-transform" },
        ],
      },
    ];
  },
};

export default nextConfig;
