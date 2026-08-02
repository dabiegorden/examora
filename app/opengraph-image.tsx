import { ImageResponse } from "next/og";

import { siteConfig } from "@/lib/marketing/content";

export const alt = `${siteConfig.name} — ${siteConfig.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Social share card, generated at build time so there is no static asset to
 * keep in sync with the brand.
 */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#ffffff",
          padding: 80,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 18,
              background: "#6D28D9",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              fontSize: 36,
              fontWeight: 700,
            }}
          >
            E
          </div>
          <div style={{ fontSize: 40, fontWeight: 600, color: "#0a0a0a" }}>
            {siteConfig.name}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <div
            style={{
              fontSize: 76,
              fontWeight: 600,
              letterSpacing: -2,
              lineHeight: 1.1,
              color: "#0a0a0a",
              display: "flex",
              flexWrap: "wrap",
            }}
          >
            Secure online exams, made simple.
          </div>
          <div
            style={{
              fontSize: 30,
              color: "#52525b",
              lineHeight: 1.4,
              maxWidth: 900,
            }}
          >
            A secure online MCQ examination platform for teachers — question
            banks, bulk imports, proctored sittings, and instant grading.
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {["Automatic grading", "Proctored sessions", "Instant results"].map(
            (label) => (
              <div
                key={label}
                style={{
                  fontSize: 24,
                  color: "#6D28D9",
                  background: "#F5F3FF",
                  border: "1px solid #DDD6FE",
                  borderRadius: 999,
                  padding: "10px 22px",
                }}
              >
                {label}
              </div>
            )
          )}
        </div>
      </div>
    ),
    size
  );
}
