import type { DetectionResult } from "@/lib/music/detect";

interface ResultsPanelProps {
  results: DetectionResult[];
  notes: string[];
  onPickAlternative: (r: DetectionResult) => void;
  selectedName?: string;
  onFavorite?: (r: DetectionResult) => void;
  isFavorite?: boolean;
}

export function ResultsPanel({
  results,
  notes,
  onPickAlternative,
  selectedName,
  onFavorite,
  isFavorite,
}: ResultsPanelProps) {
  if (results.length === 0) {
    return (
      <div className="bg-surface rounded-3xl p-8 border border-border h-full shadow-2xl">
        <h2 className="text-muted font-mono text-[10px] tracking-[0.2em] uppercase mb-6">
          Awaiting input
        </h2>
        <p className="text-muted text-sm leading-relaxed">
          Tap a fret to place a finger. Use{" "}
          <span className="font-mono text-primary">O</span> for open strings and{" "}
          <span className="font-mono text-danger">X</span> to mute. Then press{" "}
          <span className="font-bold text-foreground">Identify Chord</span>.
        </p>
        <div className="mt-8 grid grid-cols-3 gap-2">
          {["Tap", "Identify", "Discover"].map((s, i) => (
            <div
              key={s}
              className="p-3 rounded-xl bg-surface-2 border border-border/60 text-center"
            >
              <div className="font-mono text-[10px] text-muted mb-1">0{i + 1}</div>
              <div className="text-xs font-medium">{s}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const primary = results.find((r) => r.name === selectedName) ?? results[0];
  const alternatives = results.filter((r) => r.name !== primary.name);

  return (
    <div
      key={primary.name}
      className="bg-surface rounded-3xl p-6 sm:p-8 border border-border h-full shadow-2xl"
      style={{ animation: "slide-up 0.5s var(--ease-out-expo) both" }}
    >
      <div className="flex items-center justify-between mb-6">
        <p className="text-muted font-mono text-[10px] tracking-[0.2em] uppercase">
          {primary.confidence >= 80 ? "Primary Interpretation" : "Best Guess"}
        </p>
        <span className="px-2 py-1 rounded bg-primary/10 text-primary font-mono text-[10px]">
          {primary.confidence}% Match
        </span>
      </div>

      <div className="space-y-1 mb-8">
        <h2 className="text-5xl sm:text-6xl font-extrabold tracking-tighter break-all">
          {primary.name}
        </h2>

        <p className="text-muted font-mono text-xs">
          {primary.fullName}
          {primary.isSlash && (
            <span className="ml-2 px-1.5 py-0.5 rounded bg-surface-2 text-foreground/80">
              {primary.bass} in bass
            </span>
          )}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="p-4 rounded-2xl bg-surface-2 border border-border">
          <p className="text-[10px] font-mono text-muted uppercase mb-2">Intervals</p>
          <div className="flex flex-wrap gap-1.5">
            {primary.intervals.map((iv) => (
              <span
                key={iv.semitones}
                className={`text-xs font-bold font-mono px-1.5 py-0.5 rounded ${
                  iv.label.startsWith("b") || iv.label.startsWith("#") || iv.label === "3" || iv.label === "b3"
                    ? "text-primary"
                    : "text-foreground"
                }`}
              >
                {iv.label}
              </span>
            ))}
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-surface-2 border border-border">
          <p className="text-[10px] font-mono text-muted uppercase mb-2">Notes</p>
          <div className="flex flex-wrap gap-1.5">
            {notes.map((n, i) => (
              <span
                key={`${n}-${i}`}
                className={`text-xs font-bold ${
                  n === primary.root ? "text-primary" : "text-foreground"
                }`}
              >
                {n}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="p-4 rounded-2xl bg-surface-2 border border-border">
          <p className="text-[10px] font-mono text-muted uppercase mb-1">Root</p>
          <p className="font-bold">{primary.root}</p>
        </div>
        <div className="p-4 rounded-2xl bg-surface-2 border border-border">
          <p className="text-[10px] font-mono text-muted uppercase mb-1">Bass</p>
          <p className="font-bold">{primary.bass}</p>
        </div>
      </div>

      {alternatives.length > 0 && (
        <div className="space-y-3 mb-6">
          <p className="text-[10px] font-mono text-muted uppercase tracking-widest">
            Alternative Interpretations
          </p>
          <div className="space-y-2">
            {alternatives.slice(0, 4).map((alt) => (
              <button
                key={alt.name}
                onClick={() => onPickAlternative(alt)}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-surface-2 border border-border/60 hover:border-primary/50 transition-colors group text-left"
              >
                <div>
                  <div className="font-bold">{alt.name}</div>
                  <div className="text-[10px] font-mono text-muted">{alt.fullName}</div>
                </div>
                <span className="font-mono text-[10px] text-muted group-hover:text-primary">
                  {alt.confidence}%
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={() => onFavorite?.(primary)}
        className={`w-full py-3 border-2 border-dashed rounded-xl text-xs font-mono uppercase tracking-widest transition-all ${
          isFavorite
            ? "border-primary/50 text-primary bg-primary/5"
            : "border-border text-muted hover:border-primary/50 hover:text-primary"
        }`}
      >
        {isFavorite ? "★ Favorited" : "+ Add to Favorites"}
      </button>
    </div>
  );
}
