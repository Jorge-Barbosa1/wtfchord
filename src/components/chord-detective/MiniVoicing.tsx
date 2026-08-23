import type { StringState } from "@/lib/music/detect";
import type { Tuning } from "@/lib/music/tunings";

interface MiniVoicingProps {
  tuning: Tuning;
  strings: StringState[];
  minFret: number;
  maxFret: number;
  leftHanded?: boolean;
  alt?: string;
}

/**
 * Compact fretboard preview for a single voicing. 5 frets wide.
 * Highest pitched string is on the right (mirrors main Fretboard which has
 * lowest on left when right-handed).
 */
export function MiniVoicing({
  tuning,
  strings,
  minFret,
  maxFret,
  leftHanded = false,
}: MiniVoicingProps) {
  const N = tuning.strings.length;
  const indices = leftHanded
    ? Array.from({ length: N }, (_, i) => N - 1 - i)
    : Array.from({ length: N }, (_, i) => i);

  // Determine which frets to render (5 frets). If all open/mute, show frets 1..5.
  const onlyOpen = maxFret === 0;
  const start = onlyOpen ? 1 : Math.max(1, minFret);
  const end = onlyOpen ? 5 : Math.max(start + 4, maxFret);
  const frets: number[] = [];
  for (let f = start; f <= end && frets.length < 5; f++) frets.push(f);
  // Pad to 5 frets if necessary
  while (frets.length < 5) frets.push(frets[frets.length - 1] + 1);

  return (
    <div className="inline-flex flex-col items-stretch gap-1">
      {/* Open / Mute row */}
      <div
        className="grid"
        style={{ gridTemplateColumns: `repeat(${N}, minmax(0, 1fr))` }}
      >
        {indices.map((si) => {
          const s = strings[si];
          const isOpen = s === "open";
          const isMute = s === "mute";
          return (
            <div
              key={`om-${si}`}
              className="flex items-center justify-center h-3 font-mono text-[9px]"
            >
              <span
                className={
                  isOpen
                    ? "text-primary"
                    : isMute
                      ? "text-danger"
                      : "text-transparent"
                }
              >
                {isOpen ? "○" : isMute ? "✕" : "·"}
              </span>
            </div>
          );
        })}
      </div>

      {/* Nut */}
      <div
        className={`h-0.5 w-full rounded ${start === 1 ? "bg-foreground/70" : "bg-foreground/15"}`}
      />

      {/* Fret rows */}
      <div className="relative">
        {frets.map((fret) => (
          <div
            key={fret}
            className="relative grid border-b border-foreground/10 last:border-b-0"
            style={{ gridTemplateColumns: `repeat(${N}, minmax(0, 1fr))` }}
          >
            {/* String lines overlay */}
            <div className="absolute inset-0 pointer-events-none flex">
              {indices.map((si) => (
                <div key={`str-${si}`} className="flex-1 flex justify-center">
                  <div className="w-px h-full bg-foreground/20" />
                </div>
              ))}
            </div>
            {indices.map((si) => {
              const s = strings[si];
              const isThis = s && typeof s === "object" && s.fret === fret;
              return (
                <div
                  key={`c-${si}-${fret}`}
                  className="relative h-5 flex items-center justify-center"
                >
                  {isThis && (
                    <div className="relative z-10 size-3.5 rounded-full bg-primary shadow-[0_0_6px_rgba(245,158,11,0.5)]" />
                  )}
                </div>
              );
            })}
          </div>
        ))}

        {/* Fret-start label */}
        {start > 1 && (
          <div className="absolute -left-3 top-0 font-mono text-[8px] text-muted">
            {start}fr
          </div>
        )}
      </div>
    </div>
  );
}
