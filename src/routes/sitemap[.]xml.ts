import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { TUNINGS } from "@/lib/music/tunings";
import {
  ROOTS_IN_ORDER,
  QUALITIES_IN_ORDER,
  chordSlug,
} from "@/lib/music/slug";

const BASE_URL = "https://wtfchord.lovable.app";

interface Entry {
  path: string;
  changefreq?: string;
  priority?: string;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const entries: Entry[] = [
          { path: "/", changefreq: "weekly", priority: "1.0" },
          { path: "/chords", changefreq: "weekly", priority: "0.9" },
          { path: "/tunings", changefreq: "monthly", priority: "0.8" },
          { path: "/login", changefreq: "yearly", priority: "0.3" },
        ];

        for (const t of TUNINGS) {
          entries.push({
            path: `/tuning/${t.id}`,
            changefreq: "monthly",
            priority: "0.7",
          });
        }

        for (const r of ROOTS_IN_ORDER) {
          for (const q of QUALITIES_IN_ORDER) {
            entries.push({
              path: `/chord/${chordSlug(r, q)}`,
              changefreq: "monthly",
              priority: "0.6",
            });
          }
        }

        const urls = entries.map((e) =>
          [
            `  <url>`,
            `    <loc>${BASE_URL}${e.path}</loc>`,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            `  </url>`,
          ]
            .filter(Boolean)
            .join("\n"),
        );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
