import { useMemo } from "react";
import type { StringState } from "@/lib/music/detect";
import type { Tuning } from "@/lib/music/tunings";
import { noteName, pcOf, stringNoteAtFret } from "@/lib/music/notes";

interface FretboardProps {
  tuning: Tuning;
  strings: StringState[];
  visibleFrets?: number;
  leftHanded?: boolean;
  onSetFret: (stringIndex: number, fret: number) => void;
  onCycleOpenMute: (stringIndex: number) => void;
}

const INLAY_FRETS = new Set([3, 5, 7, 9]);
const DOUBLE_INLAY = new Set([12]);

export function Fretboard({
  tuning,
  strings,
  visibleFrets = 12,
  leftHanded = false,
  onSetFret,
  onCycleOpenMute,
}: FretboardProps) {
  // Build columns for strings. Display order: in standard guitar visuals, the LOW string is on the LEFT
  // when looking at the player's hand. We render strings[0] (lowest) on the left for right-handed.
  const displayStrings = useMemo(() => {
    const indices = tuning.strings.map((_, i) => i);
    return leftHanded ? indices.reverse() : indices;
  }, [tuning, leftHanded]);

  const frets = Array.from({ length: visibleFrets }, (_, i) => i + 1);

  return (
    <div className="relative bg-surface/60 rounded-3xl p-4 sm:p-6 border border-border overflow-hidden fretboard-mesh shadow-2xl">
      {/* String tuning labels */}
      <div
        className="grid mb-3"
        style={{ gridTemplateColumns: `repeat(${displayStrings.length}, minmax(0,1fr))` }}
      >
        {displayStrings.map((si) => {
          const s = tuning.strings[si];
          return (
            <div key={`label-${si}`} className="flex flex-col items-center gap-1">
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
                {s.note}
              </span>
            </div>
          );
        })}
      </div>

      {/* Open / Mute toggles */}
      <div
        className="grid mb-2"
        style={{ gridTemplateColumns: `repeat(${displayStrings.length}, minmax(0,1fr))` }}
      >
        {displayStrings.map((si) => {
          const state = strings[si];
          const isOpen = state === "open";
          const isMute = state === "mute";
          const label = isOpen ? "O" : isMute ? "X" : "·";
          const cls = isOpen
            ? "text-primary border-primary/40 bg-primary/10"
            : isMute
              ? "text-danger border-danger/30 bg-danger/5"
              : "text-muted/60 border-border bg-transparent hover:border-primary/40";
          return (
            <button
              key={`om-${si}`}
              onClick={() => onCycleOpenMute(si)}
              aria-label={`Toggle open or mute on string ${si + 1}`}
              className={`mx-auto w-9 h-9 rounded-lg border font-mono text-sm font-bold flex items-center justify-center transition-all active:scale-95 ${cls}`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Nut */}
      <div className="h-1.5 w-full bg-gradient-to-b from-zinc-300 to-zinc-500 rounded-sm shadow-md" />

      {/* Fret grid */}
      <div className="relative">
        {frets.map((fret) => {
          const isInlay = INLAY_FRETS.has(fret);
          const isDouble = DOUBLE_INLAY.has(fret);
          return (
            <div key={fret} className="relative">
              {/* Inlay dots */}
              {isInlay && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="size-3 rounded-full bg-foreground/10" />
                </div>
              )}
              {isDouble && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-between px-[18%]">
                  <div className="size-3 rounded-full bg-foreground/10" />
                  <div className="size-3 rounded-full bg-foreground/10" />
                </div>
              )}

              {/* Row of fret cells */}
              <div
                className="relative grid"
                style={{ gridTemplateColumns: `repeat(${displayStrings.length}, minmax(0,1fr))` }}
              >
                {/* String vertical lines (overlay across this row) */}
                <div className="absolute inset-0 pointer-events-none">
                  <div
                    className="absolute inset-y-0 grid"
                    style={{
                      gridTemplateColumns: `repeat(${displayStrings.length}, minmax(0,1fr))`,
                      left: 0,
                      right: 0,
                    }}
                  >
                    {displayStrings.map((si, idx) => {
                      // Thicker strings for lower pitched (lower index)
                      const order = leftHanded ? displayStrings.length - 1 - idx : idx;
                      const thickness = 1 + (displayStrings.length - 1 - order) * 0.35;
                      return (
                        <div key={`str-${si}`} className="flex justify-center">
                          <div
                            className="h-full bg-gradient-to-b from-zinc-300/70 via-zinc-200/80 to-zinc-400/70"
                            style={{ width: `${thickness}px` }}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {displayStrings.map((si) => {
                  const state = strings[si];
                  const isThisFret =
                    state && typeof state === "object" && state.fret === fret;
                  const tuningStr = tuning.strings[si];
                  const midi = stringNoteAtFret(tuningStr.note, tuningStr.octave, fret);
                  const note = noteName(pcOf(midi));
                  return (
                    <button
                      key={`cell-${si}-${fret}`}
                      onClick={() => onSetFret(si, fret)}
                      aria-label={`String ${si + 1} fret ${fret} — ${note}`}
                      className="relative h-12 sm:h-14 flex items-center justify-center group"
                    >
                      {isThisFret ? (
                        <div
                          className="relative z-10 size-9 sm:size-10 rounded-full bg-primary text-primary-foreground font-bold text-sm shadow-[0_0_24px_rgba(245,158,11,0.55)] ring-4 ring-background flex items-center justify-center"
                          style={{ animation: "pop 0.25s var(--ease-out-expo)" }}
                        >
                          {note}
                        </div>
                      ) : (
                        <div className="relative z-10 size-9 sm:size-10 rounded-full border border-transparent group-hover:border-primary/30 group-hover:bg-primary/5 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <span className="font-mono text-[10px] text-muted">{note}</span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
              {/* Fret wire (bottom border of this row) */}
              <div className="h-px w-full bg-foreground/15" />

              {/* Fret number */}
              <div
                className="absolute -left-1 top-1/2 -translate-y-1/2 font-mono text-[9px] text-muted/60 pointer-events-none"
                aria-hidden
              >
                {fret}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
