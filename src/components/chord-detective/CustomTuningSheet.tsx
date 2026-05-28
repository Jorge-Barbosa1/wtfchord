import { useState } from "react";
import { DEFAULT_CUSTOM_STRINGS } from "@/lib/music/tunings";

interface CustomTuningSheetProps {
  open: boolean;
  initial: { note: string; octave: number }[];
  onClose: () => void;
  onConfirm: (strings: { note: string; octave: number }[]) => void;
}

const NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const OCTAVES = [2, 3, 4, 5];

export function CustomTuningSheet({
  open,
  initial,
  onClose,
  onConfirm,
}: CustomTuningSheetProps) {
  const seed =
    initial && initial.length === 6 ? initial : DEFAULT_CUSTOM_STRINGS;
  const [draft, setDraft] = useState(seed);

  if (!open) return null;

  const update = (i: number, patch: Partial<{ note: string; octave: number }>) => {
    setDraft((prev) => prev.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
  };

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-surface border border-border rounded-3xl p-6 shadow-2xl"
      >
        <h2 className="text-xl font-extrabold tracking-tighter mb-1">
          Custom Tuning
        </h2>
        <p className="text-xs text-muted mb-5">
          6 strings, from lowest (string 6) to highest (string 1).
        </p>

        <div className="space-y-2 mb-6">
          {draft.map((s, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted w-16">
                String {i + 1}
              </span>
              <select
                value={s.note}
                onChange={(e) => update(i, { note: e.target.value })}
                className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-sm font-mono"
              >
                {NOTES.map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
              <select
                value={s.octave}
                onChange={(e) => update(i, { octave: Number(e.target.value) })}
                className="w-20 bg-background border border-border rounded-lg px-3 py-2 text-sm font-mono"
              >
                {OCTAVES.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 h-11 rounded-xl border border-border font-mono text-xs uppercase tracking-widest hover:bg-surface-2"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(draft)}
            className="flex-1 h-11 rounded-xl bg-foreground text-background font-extrabold text-sm hover:bg-primary hover:text-primary-foreground"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
