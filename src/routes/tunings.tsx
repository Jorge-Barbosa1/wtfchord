import { createFileRoute, Link } from "@tanstack/react-router";
import { TUNINGS } from "@/lib/music/tunings";

const BASE_URL = "https://wtfchord.lovable.app";

export const Route = createFileRoute("/tunings")({
  head: () => {
    const title = "Alternate tunings — guitar, ukulele, mandolin, cavaquinho | WTFChord";
    const desc = "Chord finder for standard guitar, ukulele (high-G & low-G), mandolin, cavaquinho and custom tunings. Notes and voicings for each.";
    const url = `${BASE_URL}/tunings`;
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
  component: TuningsIndex,
});

function TuningsIndex() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link to="/" className="font-extrabold italic tracking-tighter text-lg">
            WTFChord
          </Link>
          <nav className="flex items-center gap-4 text-xs font-mono uppercase tracking-widest text-muted">
            <Link to="/chords" className="hover:text-foreground">Chords</Link>
            <Link to="/tunings" className="text-foreground">Tunings</Link>
            <Link to="/" className="text-primary hover:text-foreground">Identifier</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-screen-xl mx-auto px-4 sm:px-6 py-10">
        <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tighter mb-3">
          Tunings
        </h1>
        <p className="text-muted text-lg mb-10 max-w-2xl">
          The identifier works with every tuning below. Pick one to see its notes,
          then jump into the fretboard.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {TUNINGS.map((t) => (
            <Link
              key={t.id}
              to="/tuning/$id"
              params={{ id: t.id }}
              className="p-6 rounded-2xl bg-surface border border-border hover:border-primary/50 transition-colors block"
            >
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-xl font-extrabold tracking-tighter">{t.label}</h2>
                {t.pro && (
                  <span className="text-[9px] font-mono uppercase tracking-widest px-1.5 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/30">
                    Pro
                  </span>
                )}
              </div>
              <p className="font-mono text-sm text-muted">
                {t.strings.map((s) => `${s.note}${s.octave}`).join("  ")}
              </p>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
