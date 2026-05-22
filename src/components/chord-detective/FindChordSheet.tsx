import { useEffect, useMemo, useState } from "react";
import { CHORD_DEFS, type ChordDef } from "@/lib/music/chords";
import { NOTE_NAMES, noteName } from "@/lib/music/notes";
import type { Tuning } from "@/lib/music/tunings";
import { findVoicings, type Voicing } from "@/lib/music/voicings";
import { MiniVoicing } from "./MiniVoicing";

interface FindChordSheetProps {
  open: boolean;
  onClose: () => void;
  tuning: Tuning;
  leftHanded: boolean;
  onLoadVoicing: (v: Voicing) => void;
}

const QUALITY_GROUPS: { label: string; defs: ChordDef[] }[] = [
  {
    label: "Common",
    defs: CHORD_DEFS.filter((d) => ["", "m", "7", "m7", "maj7", "sus4", "sus2"].includes(d.suffix)),
  },
  {
    label: "Extensions",
    defs: CHORD_DEFS.filter((d) => ["6", "m6", "add9", "madd9", "9", "maj9", "m9", "6/9"].includes(d.suffix)),
  },
  {
    label: "Altered",
    defs: CHORD_DEFS.filter((d) => ["dim", "aug", "m7b5", "dim7", "7b9", "7#9", "7b5", "7#5", "7sus4", "mMaj7", "5"].includes(d.suffix)),
  },
];

export function FindChordSheet({
  open,
  onClose,
  tuning,
  leftHanded,
  onLoadVoicing,
}: FindChordSheetProps) {
  const [rootPc, setRootPc] = useState<number>(0); // C
  const [defSuffix, setDefSuffix] = useState<string>(""); // Major

  useEffect(() => {
    if (!open) return;
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [open, onClose]);

  const def = useMemo(
    () => CHORD_DEFS.find((d) => d.suffix === defSuffix) ?? CHORD_DEFS[0],
    [defSuffix],
  );

  const voicings = useMemo(() => {
    if (!open) return [];
    return findVoicings(tuning, rootPc, def.intervals, { limit: 12, maxFret: 12 });
  }, [open, tuning, rootPc, def]);

  const chordName = `${noteName(rootPc)}${def.suffix}`;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
      <div
        className="absolute inset-0 bg-background/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div
        className="relative w-full sm:max-w-2xl bg-surface border border-border rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[92vh] overflow-hidden flex flex-col"
        style={{ animation: "slide-up 0.35s var(--ease-out-expo) both" }}
      >
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-border">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted">
              Find Chord
            </p>
            <h2 className="text-xl font-extrabold tracking-tight">
              {chordName}{" "}
              <span className="text-muted text-sm font-normal font-mono">
                · {def.fullName}
              </span>
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="size-9 rounded-lg border border-border hover:bg-surface-2 flex items-center justify-center"
          >
            <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto px-5 sm:px-6 py-4 space-y-5">
          {/* Root picker */}
          <div>
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted mb-2">
              Root
            </p>
            <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5">
              {NOTE_NAMES.map((n, i) => (
                <button
                  key={n}
                  onClick={() => setRootPc(i)}
                  className={`h-9 rounded-lg text-sm font-bold border transition-colors ${
                    rootPc === i
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-surface-2 border-border hover:border-primary/50"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Quality picker */}
          <div className="space-y-3">
            {QUALITY_GROUPS.map((g) => (
              <div key={g.label}>
                <p className="text-[10px] font-mono uppercase tracking-widest text-muted mb-2">
                  {g.label}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {g.defs.map((d) => (
                    <button
                      key={d.suffix}
                      onClick={() => setDefSuffix(d.suffix)}
                      className={`px-2.5 h-8 rounded-lg text-xs font-mono border transition-colors ${
                        defSuffix === d.suffix
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-surface-2 border-border hover:border-primary/50"
                      }`}
                    >
                      {d.suffix === "" ? "maj" : d.suffix}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Voicings */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-mono uppercase tracking-widest text-muted">
                Voicings on {tuning.label}
              </p>
              <p className="text-[10px] font-mono text-muted">
                {voicings.length} found
              </p>
            </div>
            {voicings.length === 0 ? (
              <div className="p-6 rounded-2xl bg-surface-2 border border-border text-center text-sm text-muted">
                No playable voicing found within 12 frets for this tuning.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {voicings.map((v, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      onLoadVoicing(v);
                      onClose();
                    }}
                    className="group p-3 rounded-2xl bg-surface-2 border border-border hover:border-primary/60 transition-colors text-left"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-muted">
                        #{idx + 1}
                      </span>
                      {v.isSlash && (
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-surface text-muted">
                          /{noteName(v.bassPc)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-center py-1">
                      <MiniVoicing
                        tuning={tuning}
                        strings={v.strings}
                        minFret={v.minFret}
                        maxFret={v.maxFret}
                        leftHanded={leftHanded}
                      />
                    </div>
                    <div className="mt-2 text-[10px] font-mono text-muted group-hover:text-primary transition-colors">
                      Tap to load →
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
