import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { findVoicings } from "@/lib/music/voicings";
import { intervalLabel } from "@/lib/music/intervals";
import { noteName } from "@/lib/music/notes";
import { TUNINGS, DEFAULT_TUNING } from "@/lib/music/tunings";
import {
  parseChordSlug,
  ROOTS_IN_ORDER,
  QUALITIES_IN_ORDER,
  QUALITY_LABELS,
  ROOT_LABELS,
  chordSlug,
} from "@/lib/music/slug";
import {
  FORMULAS,
  CHARACTER,
  USAGE,
  commonProgressions,
} from "@/lib/music/theory";
import { parseProgressionParam } from "@/lib/progressions";
import { MiniVoicing } from "@/components/chord-detective/MiniVoicing";

const BASE_URL = "https://wtfchord.lovable.app";

export const Route = createFileRoute("/chord/$slug")({
  loader: ({ params }) => {
    const parsed = parseChordSlug(params.slug);
    if (!parsed) throw notFound();
    const voicings = findVoicings(DEFAULT_TUNING, parsed.rootPc, parsed.intervals, {
      limit: 6,
    });
    const notes: string[] = parsed.intervals.map((iv: number) =>
      noteName((parsed.rootPc + iv) % 12),
    );
    return { parsed, voicings, notes };
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Chord not found — WTFChord" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const { parsed } = loaderData;
    const title = `${parsed.displayName} chord on guitar — how to play ${parsed.rootName} ${parsed.qualityLabel} in standard tuning`;
    const desc = `${parsed.displayName} (${parsed.rootName} ${parsed.qualityLabel}) guitar chord diagrams, notes, intervals, formula and voicings in standard tuning. Common progressions and usage context included.`;
    const url = `${BASE_URL}/chord/${params.slug}`;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "article" },
        { property: "og:url", content: url },
        { name: "twitter:card", content: "summary" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: desc },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "HowTo",
            name: `How to play ${parsed.displayName} on guitar`,
            description: desc,
            step: loaderData.voicings.slice(0, 3).map((v, i) => ({
              "@type": "HowToStep",
              name: `Voicing ${i + 1}`,
              text: `Fret positions: ${v.strings
                .map((s) =>
                  s === null || s === "mute" ? "x" : s === "open" ? "0" : String(s.fret),
                )
                .join(" ")}`,
            })),
          }),
        },
      ],
    };
  },
  component: ChordPage,
  notFoundComponent: () => (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
      <div className="max-w-md text-center">
        <h1 className="text-3xl font-extrabold tracking-tighter mb-2">Chord not found</h1>
        <p className="text-muted text-sm mb-6">
          We couldn't parse that chord. Try one of the common voicings instead.
        </p>
        <Link
          to="/chords"
          className="inline-flex px-4 py-2 rounded-xl bg-foreground text-background text-sm font-bold"
        >
          Browse all chords
        </Link>
      </div>
    </div>
  ),
});

function ChordPage() {
  const loaderData = Route.useLoaderData() as {
    parsed: ReturnType<typeof parseChordSlug> & object;
    voicings: ReturnType<typeof findVoicings>;
    notes: string[];
  };
  const { parsed, voicings, notes } = loaderData;

  const theory = {
    formula: FORMULAS[parsed.quality] ?? null,
    character: CHARACTER[parsed.quality] ?? null,
    usage: USAGE[parsed.quality] ?? null,
    progressions: commonProgressions(parsed.rootPc, parsed.quality),
  };

  function voicingAlt(index: number, strings: typeof voicings[number]["strings"]): string {
    const frets = strings
      .map((s) =>
        s === null || s === "mute"
          ? "x"
          : s === "open"
            ? "0"
            : String(s.fret),
      )
      .join("-");
    return `${parsed.displayName} guitar voicing ${index + 1}: frets ${frets}`;
  }



  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link to="/" className="font-extrabold italic tracking-tighter text-lg">
            WTFChord
          </Link>
          <nav className="flex items-center gap-4 text-xs font-mono uppercase tracking-widest text-muted">
            <Link to="/chords" className="hover:text-foreground">Chords</Link>
            <Link to="/tunings" className="hover:text-foreground">Tunings</Link>
            <Link to="/" className="text-primary hover:text-foreground">Identifier</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-screen-xl mx-auto px-4 sm:px-6 py-10">
        <nav className="text-xs font-mono uppercase tracking-widest text-muted mb-4">
          <Link to="/chords" className="hover:text-foreground">Chords</Link>
          <span className="mx-2">/</span>
          <span>{parsed.displayName}</span>
        </nav>

        <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tighter mb-2">
          {parsed.displayName}
        </h1>
        <p className="text-muted text-lg mb-8">
          {parsed.rootName} {parsed.qualityLabel} chord
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <div className="p-5 rounded-2xl bg-surface border border-border">
            <p className="text-[10px] font-mono text-muted uppercase mb-2">Notes</p>
            <div className="flex flex-wrap gap-2">
              {notes.map((n) => (
                <span
                  key={n}
                  className={`text-lg font-bold ${n === parsed.rootName ? "text-primary" : ""}`}
                >
                  {n}
                </span>
              ))}
            </div>
          </div>
          <div className="p-5 rounded-2xl bg-surface border border-border">
            <p className="text-[10px] font-mono text-muted uppercase mb-2">Intervals</p>
            <div className="flex flex-wrap gap-2">
              {parsed.intervals.map((iv) => (
                <span key={iv} className="text-sm font-mono font-bold">
                  {intervalLabel(iv)}
                </span>
              ))}
            </div>
          </div>
          <div className="p-5 rounded-2xl bg-surface border border-border">
            <p className="text-[10px] font-mono text-muted uppercase mb-2">Root</p>
            <p className="text-2xl font-extrabold text-primary">{parsed.rootName}</p>
          </div>
        </div>

        <section className="mb-12">
          <h2 className="text-2xl font-extrabold tracking-tighter mb-4">
            Voicings on standard tuning
          </h2>
          {voicings.length === 0 ? (
            <p className="text-muted text-sm">
              No comfortable voicings found in the first 12 frets.
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {voicings.map((v, i) => (
                <div
                  key={i}
                  className="p-4 rounded-2xl bg-surface border border-border"
                >
                  <div className="text-[10px] font-mono uppercase text-muted mb-3">
                    Voicing {i + 1}
                    {v.isSlash && (
                      <span className="ml-2 text-primary">
                        /{noteName(v.bassPc)}
                      </span>
                    )}
                  </div>
                  <div className="flex justify-center">
                    <MiniVoicing
                      tuning={DEFAULT_TUNING}
                      strings={v.strings}
                      minFret={v.minFret}
                      maxFret={v.maxFret}
                      alt={voicingAlt(i, v.strings)}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="mt-6">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-foreground text-background text-sm font-bold hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              Open in the interactive fretboard →
            </Link>
          </div>
        </section>

        {/* Theory content */}
        <section className="mb-12">
          <h2 className="text-2xl font-extrabold tracking-tighter mb-4">
            About {parsed.displayName}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {theory.formula && (
              <div className="p-5 rounded-2xl bg-surface border border-border">
                <p className="text-[10px] font-mono text-muted uppercase mb-2">Interval formula</p>
                <p className="text-lg font-bold">{theory.formula}</p>
              </div>
            )}
            {theory.character && (
              <div className="p-5 rounded-2xl bg-surface border border-border">
                <p className="text-[10px] font-mono text-muted uppercase mb-2">Sound character</p>
                <p className="text-sm text-muted">{theory.character}</p>
              </div>
            )}
            {theory.usage && (
              <div className="p-5 rounded-2xl bg-surface border border-border md:col-span-2">
                <p className="text-[10px] font-mono text-muted uppercase mb-2">Where it appears</p>
                <p className="text-sm text-muted">{theory.usage}</p>
              </div>
            )}
          </div>

          {theory.progressions.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-extrabold tracking-tight mb-3">
                Common progressions using {parsed.displayName}
              </h3>
              <div className="space-y-3">
                {theory.progressions.map((prog, i) => {
                  const parsedChords = parseProgressionParam(prog.chords.join("-"));
                  return (
                    <div key={i} className="p-4 rounded-2xl bg-surface border border-border">
                      <p className="text-sm font-bold mb-2">{prog.name}</p>
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        {parsedChords.map((c, j) => (
                          <span key={j}>
                            <Link
                              to="/chord/$slug"
                              params={{ slug: chordSlug(noteName(c.rootPc), c.suffix) }}
                              className="text-sm font-bold text-primary hover:underline"
                            >
                              {noteName(c.rootPc)}{c.suffix}
                            </Link>
                            {j < parsedChords.length - 1 && (
                              <span className="text-muted mx-1">→</span>
                            )}
                          </span>
                        ))}
                      </div>
                      <p className="text-xs text-muted">{prog.note}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-extrabold tracking-tighter mb-4">
            Other {parsed.rootName} chords
          </h2>
          <div className="flex flex-wrap gap-2">
            {QUALITIES_IN_ORDER.filter((q) => q !== parsed.quality).map((q) => (
              <Link
                key={q}
                to="/chord/$slug"
                params={{ slug: chordSlug(parsed.rootName, q) }}
                className="px-3 py-1.5 rounded-full bg-surface border border-border hover:border-primary/50 text-xs font-mono uppercase tracking-widest text-muted hover:text-foreground transition-colors"
              >
                {ROOT_LABELS[parsed.rootName]}
                {q === "major" ? "" : q === "minor" ? "m" : ` ${QUALITY_LABELS[q]}`}
              </Link>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-extrabold tracking-tighter mb-4">
            Same quality, other roots
          </h2>
          <div className="flex flex-wrap gap-2">
            {ROOTS_IN_ORDER.filter((r) => r !== parsed.rootName).map((r) => (
              <Link
                key={r}
                to="/chord/$slug"
                params={{ slug: chordSlug(r, parsed.quality) }}
                className="px-3 py-1.5 rounded-full bg-surface border border-border hover:border-primary/50 text-sm font-bold text-muted hover:text-foreground transition-colors"
              >
                {ROOT_LABELS[r]}
                {parsed.suffix}
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
