import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ROOTS_IN_ORDER,
  QUALITIES_IN_ORDER,
  QUALITY_LABELS,
  ROOT_LABELS,
  chordSlug,
  QUALITY_SLUG_TO_SUFFIX,
} from "@/lib/music/slug";

const BASE_URL = "https://wtfchord.lovable.app";

export const Route = createFileRoute("/chords")({
  head: () => {
    const title = "Guitar chord library — every chord, every voicing | WTFChord";
    const desc = "Browse guitar chords by root and quality. Major, minor, 7ths, sus, diminished, augmented, and more — with playable voicings for standard tuning.";
    const url = `${BASE_URL}/chords`;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "website" },
        { property: "og:url", content: url },
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
  component: ChordsIndex,
});

function ChordsIndex() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link to="/" className="font-extrabold italic tracking-tighter text-lg">
            WTFChord
          </Link>
          <nav className="flex items-center gap-4 text-xs font-mono uppercase tracking-widest text-muted">
            <Link to="/chords" className="text-foreground">Chords</Link>
            <Link to="/tunings" className="hover:text-foreground">Tunings</Link>
            <Link to="/" className="text-primary hover:text-foreground">Identifier</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-screen-xl mx-auto px-4 sm:px-6 py-10">
        <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tighter mb-3">
          Guitar chord library
        </h1>
        <p className="text-muted text-lg mb-10 max-w-2xl">
          Every chord in every key. Click any tile to see the notes, intervals,
          and playable voicings on standard tuning.
        </p>

        {QUALITIES_IN_ORDER.map((q) => (
          <section key={q} className="mb-10">
            <h2 className="text-xl font-extrabold tracking-tighter mb-3">
              {QUALITY_LABELS[q]}{" "}
              <span className="font-mono text-xs text-muted uppercase tracking-widest ml-2">
                {QUALITY_SLUG_TO_SUFFIX[q] || "maj"}
              </span>
            </h2>
            <div className="grid grid-cols-3 sm:grid-cols-6 md:grid-cols-12 gap-2">
              {ROOTS_IN_ORDER.map((r) => (
                <Link
                  key={r}
                  to="/chord/$slug"
                  params={{ slug: chordSlug(r, q) }}
                  className="px-2 py-3 rounded-xl bg-surface border border-border hover:border-primary/50 text-center font-bold text-sm transition-colors"
                >
                  {ROOT_LABELS[r]}
                  {QUALITY_SLUG_TO_SUFFIX[q]}
                </Link>
              ))}
            </div>
          </section>
        ))}
      </main>
    </div>
  );
}
