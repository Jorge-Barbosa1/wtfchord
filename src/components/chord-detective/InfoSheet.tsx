import { useEffect, useState } from "react";

interface InfoSheetProps {
  open: boolean;
  onClose: () => void;
}

export function InfoSheet({ open, onClose }: InfoSheetProps) {
  useEffect(() => {
    if (!open) return;
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] bg-background/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-surface w-full max-w-lg max-h-[85vh] rounded-3xl border border-border shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: "slide-up 0.3s var(--ease-out-expo)" }}
      >
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h3 className="font-extrabold tracking-tight text-lg">Informations</h3>
          <button
            onClick={onClose}
            className="size-8 rounded-full bg-surface-2 border border-border flex items-center justify-center hover:border-primary/50"
            aria-label="Close"
          >
            <span className="text-sm">×</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          <Section title="How to use">
            <ol className="list-decimal list-inside space-y-2 text-sm text-foreground/90">
              <li>
                Tap a fret on the virtual fretboard to place a finger. Tap the same fret again to remove it.
              </li>
              <li>
                Tap the string label on the left to cycle through states:
                <span className="font-mono text-primary ml-1">O</span> (open string) →{" "}
                <span className="font-mono text-danger">X</span> (muted) → empty (not played).
              </li>
              <li>
                Press <span className="font-bold">Identify Chord</span> to analyze the voicing, or hit{" "}
                <span className="font-mono text-muted">[Enter]</span>.
              </li>
              <li>
                Explore alternative interpretations and save favorites.
              </li>
            </ol>
          </Section>

          <Section title="Match percentage">
            <p className="text-sm text-foreground/90 leading-relaxed">
              The match percentage indicates how closely your selected notes align with a known chord definition. It considers:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm text-foreground/80 mt-2">
              <li>Coverage of the chord's required intervals</li>
              <li>Extra notes not in the standard definition</li>
              <li>Missing essential notes (root or 3rd penalised more)</li>
              <li>Bass note alignment with the root</li>
            </ul>
            <p className="text-sm text-foreground/80 mt-2">
              A score of <span className="font-bold">80%+</span> means a strong match; lower scores may indicate extended or altered voicings.
            </p>
          </Section>

          <Section title="Notes">
            <p className="text-sm text-foreground/90 leading-relaxed">
              Notes are the actual pitches being sounded. The root note is shown in{" "}
              <span className="text-primary font-bold">primary color</span>. The list excludes duplicates — only unique pitch classes are displayed.
            </p>
          </Section>

          <Section title="Root">
            <p className="text-sm text-foreground/90 leading-relaxed">
              The root is the fundamental note the chord is built from. It defines the chord's letter name (e.g., C, F#, Bb). In a slash chord, the root may differ from the bass note.
            </p>
          </Section>

          <Section title="Bass">
            <p className="text-sm text-foreground/90 leading-relaxed">
              The bass is the lowest-sounding note in your voicing. When the bass differs from the root, the chord is shown as a{" "}
              <span className="font-mono text-primary">slash chord</span>{" "}
              (e.g., C/E = C major with E in the bass).
            </p>
          </Section>

          <Section title="Intervals">
            <p className="text-sm text-foreground/90 leading-relaxed">
              Intervals describe the distance (in semitones) from the root to each note in the chord. Common labels:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
              {[
                ["1", "root / unison"],
                ["b3", "minor 3rd"],
                ["3", "major 3rd"],
                ["5", "perfect 5th"],
                ["b5", "diminished 5th"],
                ["#5", "augmented 5th"],
                ["b7", "minor 7th"],
                ["7", "major 7th"],
                ["9", "major 9th"],
                ["b9", "minor 9th"],
                ["11", "perfect 11th"],
                ["13", "major 13th"],
              ].map(([label, desc]) => (
                <div
                  key={label}
                  className="flex items-center gap-2 p-2 rounded-lg bg-surface-2 border border-border"
                >
                  <span className="font-mono text-xs font-bold text-primary w-5 text-center">
                    {label}
                  </span>
                  <span className="text-[11px] text-muted">{desc}</span>
                </div>
              ))}
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="font-mono text-[10px] text-muted uppercase tracking-widest mb-2">{title}</h4>
      <div>{children}</div>
    </div>
  );
}
