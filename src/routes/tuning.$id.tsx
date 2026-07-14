import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { TUNINGS } from "@/lib/music/tunings";
import { ROOTS_IN_ORDER, chordSlug, ROOT_LABELS } from "@/lib/music/slug";

const BASE_URL = "https://wtfchord.lovable.app";

export const Route = createFileRoute("/tuning/$id")({
  loader: ({ params }) => {
    const tuning = TUNINGS.find((t) => t.id === params.id);
    if (!tuning) throw notFound();
    return { tuning };
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Tuning not found — WTFChord" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const { tuning } = loaderData;
    const stringLabels = tuning.strings.map((s) => s.note).join(" ");
    const title = `${tuning.label} tuning — chord finder & guide`;
    const desc = `Play in ${tuning.label} tuning. String notes: ${stringLabels}. Identify any chord you finger, or browse common voicings.`;
    const url = `${BASE_URL}/tuning/${params.id}`;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "article" },
        { property: "og:url", content: url },
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
  component: TuningPage,
  notFoundComponent: () => (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
      <div className="max-w-md text-center">
        <h1 className="text-3xl font-extrabold tracking-tighter mb-2">Tuning not found</h1>
        <Link to="/tunings" className="text-primary underline text-sm">
          Browse all tunings
        </Link>
      </div>
    </div>
  ),
});

function TuningPage() {
  const { tuning } = Route.useLoaderData() as { tuning: (typeof TUNINGS)[number] };


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
          <Link to="/tunings" className="hover:text-foreground">Tunings</Link>
          <span className="mx-2">/</span>
          <span>{tuning.label}</span>
        </nav>

        <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tighter mb-2">
          {tuning.label}
        </h1>
        <p className="text-muted text-lg mb-8">
          {tuning.strings.length} strings, lowest to highest:{" "}
          <span className="font-mono text-foreground">
            {tuning.strings.map((s) => `${s.note}${s.octave}`).join("  ")}
          </span>
        </p>

        <div className="p-6 rounded-2xl bg-surface border border-border mb-10">
          <p className="text-sm text-muted leading-relaxed">
            The Chord Detective identifier works with {tuning.label} out of the box.
            Pick this tuning at the top of the app, tap notes on the fretboard, and
            we'll name whatever you're holding. Below are common chord roots — click any
            to explore voicings.
          </p>
          <div className="mt-4">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-foreground text-background text-sm font-bold hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              Open the identifier →
            </Link>
          </div>
        </div>

        <section>
          <h2 className="text-2xl font-extrabold tracking-tighter mb-4">
            Common chords
          </h2>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {ROOTS_IN_ORDER.map((r) => (
              <Link
                key={r}
                to="/chord/$slug"
                params={{ slug: chordSlug(r, "major") }}
                className="px-3 py-3 rounded-xl bg-surface border border-border hover:border-primary/50 text-center font-bold text-sm transition-colors"
              >
                {ROOT_LABELS[r]}
              </Link>
            ))}
          </div>

          <h3 className="text-lg font-extrabold tracking-tighter mt-8 mb-4">Minor</h3>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {ROOTS_IN_ORDER.map((r) => (
              <Link
                key={r}
                to="/chord/$slug"
                params={{ slug: chordSlug(r, "minor") }}
                className="px-3 py-3 rounded-xl bg-surface border border-border hover:border-primary/50 text-center font-bold text-sm transition-colors"
              >
                {ROOT_LABELS[r]}m
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
