import { createFileRoute, Link, useSearch, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useRef, useState } from "react";
import { CHORD_DEFS } from "@/lib/music/chords";
import { noteName } from "@/lib/music/notes";
import { findVoicings, type Voicing } from "@/lib/music/voicings";
import {
  TUNINGS,
  DEFAULT_TUNING,
  DEFAULT_CUSTOM_STRINGS,
  CUSTOM_TUNING_ID,
  makeCustomTuning,
  type Tuning,
} from "@/lib/music/tunings";
import { MiniVoicing } from "@/components/chord-detective/MiniVoicing";
import { usePersistedState } from "@/hooks/usePersistedState";
import {
  loadProgressions,
  saveProgressions,
  newProgression,
  newChordId,
  encodeProgressionParam,
  parseProgressionParam,
  type Progression,
  type ProgressionChord,
  type SimpleChord,
} from "@/lib/progressions";
import {
  listRemoteProgressions,
  syncProgressions,
} from "@/lib/progressions.functions";
import { suggestNextChords, keyLabel, type Suggestion } from "@/lib/music/theory";
import { useAuth } from "@/hooks/useAuth";
import { useProStatus } from "@/hooks/useProStatus";
import { PaywallModal } from "@/components/chord-detective/PaywallModal";

export const Route = createFileRoute("/progressions")({
  component: ProgressionsPage,
  validateSearch: (search: Record<string, unknown>) => ({
    progression: typeof search.progression === "string" ? search.progression : undefined,
    tuning: typeof search.tuning === "string" ? search.tuning : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Chord Progression Builder — WTFChord" },
      {
        name: "description",
        content:
          "Build guitar, ukulele, mandolin and cavaquinho chord progressions. Save variations, pin voicings and step through your progression on the fretboard.",
      },
      { property: "og:title", content: "Chord Progression Builder — WTFChord" },
      {
        property: "og:description",
        content:
          "Build, save and step through chord progressions with pinned voicings for guitar, ukulele, mandolin and cavaquinho.",
      },
    ],
  }),
});

const QUALITY_GROUPS: { label: string; suffixes: string[] }[] = [
  { label: "Common", suffixes: ["", "m", "7", "m7", "maj7", "sus2", "sus4"] },
  { label: "Extensions", suffixes: ["6", "m6", "add9", "madd9", "9", "maj9", "m9", "6/9"] },
  { label: "Altered", suffixes: ["dim", "aug", "m7b5", "dim7", "7b9", "7#9", "5"] },
];

function chordDisplayName(rootPc: number, suffix: string): string {
  return `${noteName(rootPc)}${suffix}`;
}

function ProgressionsPage() {
  const { isPro } = useProStatus();
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [leftHanded] = usePersistedState<boolean>("cd.left", false);
  const [customStrings] = usePersistedState<
    { note: string; octave: number }[] | null
  >("cd.customTuning", null);
  const [savedTuningId] = usePersistedState<string>("cd.tuning", DEFAULT_TUNING.id);

  // Resolve initial tuning
  const initialTuning = useMemo<Tuning>(() => {
    if (savedTuningId === CUSTOM_TUNING_ID) {
      return makeCustomTuning(customStrings ?? DEFAULT_CUSTOM_STRINGS);
    }
    const t = TUNINGS.find((t) => t.id === savedTuningId) ?? DEFAULT_TUNING;
    if (t.pro && !isPro) return DEFAULT_TUNING;
    return t;
  }, [savedTuningId, customStrings, isPro]);

  // All progressions and the one currently being edited
  const [all, setAll] = useState<Progression[]>([]);
  const [current, setCurrent] = useState<Progression>(() => newProgression(initialTuning.id));
  const [focusIdx, setFocusIdx] = useState<number>(0);
  const [addOpen, setAddOpen] = useState(false);

  // Load on mount
  useEffect(() => {
    setAll(loadProgressions());
  }, []);

  // Sync from other tabs
  useEffect(() => {
    const sync = () => setAll(loadProgressions());
    window.addEventListener("storage", sync);
    window.addEventListener("cd.progressions.changed", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("cd.progressions.changed", sync);
    };
  }, []);

  const currentTuning = useMemo<Tuning>(() => {
    if (current.tuningId === CUSTOM_TUNING_ID) {
      return makeCustomTuning(customStrings ?? DEFAULT_CUSTOM_STRINGS);
    }
    const t = TUNINGS.find((t) => t.id === current.tuningId) ?? DEFAULT_TUNING;
    if (t.pro && !isPro) return DEFAULT_TUNING;
    return t;
  }, [current.tuningId, customStrings, isPro]);

  const focused = current.chords[focusIdx];

  // Voicing alternatives for the focused chord (computed from current tuning)
  const alternatives: Voicing[] = useMemo(() => {
    if (!focused) return [];
    const def = CHORD_DEFS.find((d) => d.suffix === focused.suffix);
    if (!def) return [];
    return findVoicings(currentTuning, focused.rootPc, def.intervals, {
      limit: 8,
      maxFret: 12,
    });
  }, [focused, currentTuning]);

  const updateCurrent = (mut: (p: Progression) => Progression) => {
    setCurrent((prev) => ({ ...mut(prev), updatedAt: Date.now() }));
  };

  const handleAddChord = (rootPc: number, suffix: string) => {
    const def = CHORD_DEFS.find((d) => d.suffix === suffix);
    if (!def) return;
    const voicings = findVoicings(currentTuning, rootPc, def.intervals, {
      limit: 1,
      maxFret: 12,
    });
    const v = voicings[0];
    const chord: ProgressionChord = {
      id: newChordId(),
      rootPc,
      suffix,
      tuningId: currentTuning.id,
      strings: v ? v.strings : currentTuning.strings.map(() => "mute" as const),
      minFret: v?.minFret ?? 0,
      maxFret: v?.maxFret ?? 0,
    };
    updateCurrent((p) => ({ ...p, chords: [...p.chords, chord] }));
    setFocusIdx(current.chords.length);
    setAddOpen(false);
  };

  const handlePickVoicing = (v: Voicing) => {
    if (!focused) return;
    updateCurrent((p) => ({
      ...p,
      chords: p.chords.map((c, i) =>
        i === focusIdx
          ? { ...c, strings: v.strings, minFret: v.minFret, maxFret: v.maxFret, tuningId: currentTuning.id }
          : c,
      ),
    }));
  };

  const handleRemoveChord = (idx: number) => {
    updateCurrent((p) => ({ ...p, chords: p.chords.filter((_, i) => i !== idx) }));
    setFocusIdx((i) => Math.max(0, Math.min(i, current.chords.length - 2)));
  };

  const handleMove = (idx: number, dir: -1 | 1) => {
    const j = idx + dir;
    if (j < 0 || j >= current.chords.length) return;
    updateCurrent((p) => {
      const arr = [...p.chords];
      [arr[idx], arr[j]] = [arr[j], arr[idx]];
      return { ...p, chords: arr };
    });
    setFocusIdx(j);
  };

  const handlePrev = () => setFocusIdx((i) => Math.max(0, i - 1));
  const handleNext = () =>
    setFocusIdx((i) => Math.min(current.chords.length - 1, i + 1));

  // Keyboard nav
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (addOpen) return;
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const handleSave = () => {
    if (current.chords.length === 0) return;
    const stamped: Progression = { ...current, updatedAt: Date.now() };
    const idx = all.findIndex((p) => p.id === stamped.id);
    const next = idx >= 0
      ? all.map((p) => (p.id === stamped.id ? stamped : p))
      : [stamped, ...all];
    setAll(next);
    saveProgressions(next);
  };

  const handleNew = () => {
    setCurrent(newProgression(currentTuning.id));
    setFocusIdx(0);
  };

  const handleLoad = (p: Progression) => {
    setCurrent(p);
    setFocusIdx(0);
  };

  const handleDelete = (id: string) => {
    const next = all.filter((p) => p.id !== id);
    setAll(next);
    saveProgressions(next);
    if (current.id === id) handleNew();
  };

  const handleDuplicate = (p: Progression) => {
    const now = Date.now();
    const copy: Progression = {
      ...p,
      id: `p-${now}`,
      name: `${p.name} (copy)`,
      createdAt: now,
      updatedAt: now,
    };
    const next = [copy, ...all];
    setAll(next);
    saveProgressions(next);
    setCurrent(copy);
    setFocusIdx(0);
  };

  const setTuningForCurrent = (id: string) => {
    const t = TUNINGS.find((tt) => tt.id === id);
    if (!t) return;
    if (t.pro && !isPro) {
      setPaywallOpen(true);
      return;
    }
    updateCurrent((p) => ({ ...p, tuningId: id }));
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="sticky top-0 z-40 flex items-center justify-between gap-2 px-4 sm:px-6 py-3 sm:py-4 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="text-xs font-mono uppercase tracking-widest text-muted hover:text-foreground"
          >
            ← WTFChord
          </Link>
          <div className="h-4 w-px bg-border" />
          <h1 className="text-sm sm:text-base font-extrabold tracking-tight">
            Progressions
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleNew}
            className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-muted hover:text-foreground px-2 py-1"
          >
            New
          </button>
          <button
            onClick={handleSave}
            disabled={current.chords.length === 0}
            className="text-[10px] sm:text-xs font-mono uppercase tracking-widest bg-foreground text-background px-3 py-1.5 rounded-full disabled:opacity-30 hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            Save
          </button>
        </div>
      </nav>

      <main className="max-w-screen-lg mx-auto px-4 sm:px-6 py-5 sm:py-8 pb-24">
        {/* Editor header */}
        <section className="mb-6">
          <input
            value={current.name}
            onChange={(e) => updateCurrent((p) => ({ ...p, name: e.target.value }))}
            placeholder="Progression name"
            className="w-full bg-transparent text-2xl sm:text-4xl font-extrabold tracking-tighter outline-none border-b border-transparent focus:border-primary/40 py-1"
          />
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <span className="text-[10px] font-mono uppercase tracking-widest text-muted">
              Tuning
            </span>
            <TuningSelect
              currentId={current.tuningId}
              onChange={setTuningForCurrent}
              isPro={isPro}
            />
            <span className="text-[10px] font-mono text-muted">
              {current.chords.length} chord{current.chords.length === 1 ? "" : "s"}
            </span>
          </div>
        </section>

        {/* Sequence chips */}
        <section className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted">
              Sequence
            </p>
            <div className="flex-1 h-px bg-border" />
            <button
              onClick={() => setAddOpen(true)}
              className="text-[10px] font-mono uppercase tracking-widest text-primary hover:text-foreground"
            >
              + Add chord
            </button>
          </div>
          {current.chords.length === 0 ? (
            <button
              onClick={() => setAddOpen(true)}
              className="w-full border border-dashed border-border rounded-2xl py-10 text-sm text-muted hover:border-primary/50 hover:text-foreground transition-colors"
            >
              Tap to add your first chord
            </button>
          ) : (
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 snap-x">
              {current.chords.map((c, i) => (
                <button
                  key={c.id}
                  onClick={() => setFocusIdx(i)}
                  className={`snap-start shrink-0 min-w-[76px] px-3 py-3 rounded-2xl border text-center transition-colors ${
                    i === focusIdx
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-surface hover:border-primary/50"
                  }`}
                >
                  <div className="text-[9px] font-mono text-muted mb-0.5">
                    {i + 1}
                  </div>
                  <div className="font-extrabold tracking-tight">
                    {chordDisplayName(c.rootPc, c.suffix)}
                  </div>
                </button>
              ))}
              <button
                onClick={() => setAddOpen(true)}
                className="snap-start shrink-0 min-w-[76px] px-3 py-3 rounded-2xl border border-dashed border-border text-muted hover:border-primary/50 hover:text-foreground transition-colors font-mono text-xs uppercase tracking-widest"
                aria-label="Add chord"
              >
                +
              </button>
            </div>
          )}
        </section>

        {/* Focused chord viewer */}
        {focused && (
          <section className="mb-8">
            <div className="rounded-3xl border border-border bg-surface/50 p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3 mb-4">
                <button
                  onClick={handlePrev}
                  disabled={focusIdx === 0}
                  className="size-10 rounded-full border border-border bg-surface hover:border-primary/50 disabled:opacity-30 flex items-center justify-center"
                  aria-label="Previous chord"
                >
                  ‹
                </button>
                <div className="text-center">
                  <div className="text-[10px] font-mono uppercase tracking-widest text-muted">
                    {focusIdx + 1} of {current.chords.length}
                  </div>
                  <div className="text-3xl sm:text-4xl font-extrabold tracking-tighter">
                    {chordDisplayName(focused.rootPc, focused.suffix)}
                  </div>
                </div>
                <button
                  onClick={handleNext}
                  disabled={focusIdx === current.chords.length - 1}
                  className="size-10 rounded-full border border-border bg-surface hover:border-primary/50 disabled:opacity-30 flex items-center justify-center"
                  aria-label="Next chord"
                >
                  ›
                </button>
              </div>

              <div className="flex justify-center py-4">
                <div className="w-40 sm:w-56">
                  <MiniVoicing
                    tuning={currentTuning}
                    strings={focused.strings}
                    minFret={focused.minFret}
                    maxFret={focused.maxFret}
                    leftHanded={leftHanded}
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
                <button
                  onClick={() => handleMove(focusIdx, -1)}
                  disabled={focusIdx === 0}
                  className="text-[10px] font-mono uppercase tracking-widest px-2 py-1 rounded-full border border-border hover:border-primary/50 disabled:opacity-30"
                >
                  ← Move
                </button>
                <button
                  onClick={() => handleMove(focusIdx, 1)}
                  disabled={focusIdx === current.chords.length - 1}
                  className="text-[10px] font-mono uppercase tracking-widest px-2 py-1 rounded-full border border-border hover:border-primary/50 disabled:opacity-30"
                >
                  Move →
                </button>
                <button
                  onClick={() => handleRemoveChord(focusIdx)}
                  className="text-[10px] font-mono uppercase tracking-widest px-2 py-1 rounded-full border border-border text-danger hover:border-danger/50"
                >
                  Remove
                </button>
              </div>
            </div>

            {/* Alternative voicings */}
            {alternatives.length > 0 && (
              <div className="mt-6">
                <p className="text-[10px] font-mono uppercase tracking-widest text-muted mb-3">
                  Alternative voicings
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {alternatives.map((v, i) => {
                    const active =
                      JSON.stringify(v.strings) === JSON.stringify(focused.strings);
                    return (
                      <button
                        key={i}
                        onClick={() => handlePickVoicing(v)}
                        className={`p-3 rounded-2xl border transition-colors ${
                          active
                            ? "border-primary bg-primary/5"
                            : "border-border bg-surface hover:border-primary/50"
                        }`}
                      >
                        <div className="flex justify-center">
                          <MiniVoicing
                            tuning={currentTuning}
                            strings={v.strings}
                            minFret={v.minFret}
                            maxFret={v.maxFret}
                            leftHanded={leftHanded}
                          />
                        </div>
                        <div className="text-[9px] font-mono text-muted text-center mt-2">
                          {v.minFret === 0 && v.maxFret === 0 ? "Open" : `${v.minFret || 1}–${v.maxFret} fr`}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </section>
        )}

        {/* Saved progressions */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted">
              Saved variations
            </p>
            <div className="flex-1 h-px bg-border" />
            <span className="text-[10px] font-mono text-muted">{all.length}</span>
          </div>
          {all.length === 0 ? (
            <p className="text-xs text-muted">
              Nothing saved yet — build a progression and hit Save.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {all.map((p) => {
                const isCurrent = p.id === current.id;
                const tuningLabel =
                  TUNINGS.find((tt) => tt.id === p.tuningId)?.label ??
                  (p.tuningId === CUSTOM_TUNING_ID ? "Custom" : p.tuningId);
                return (
                  <div
                    key={p.id}
                    className={`p-4 rounded-2xl border ${
                      isCurrent ? "border-primary bg-primary/5" : "border-border bg-surface"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <button
                        onClick={() => handleLoad(p)}
                        className="text-left flex-1 min-w-0"
                      >
                        <div className="font-bold truncate">{p.name}</div>
                        <div className="text-[10px] font-mono text-muted">
                          {tuningLabel} · {p.chords.length} chord
                          {p.chords.length === 1 ? "" : "s"}
                        </div>
                      </button>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleDuplicate(p)}
                          title="Duplicate"
                          className="text-[10px] font-mono uppercase text-muted hover:text-foreground px-2 py-1"
                        >
                          Dup
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          title="Delete"
                          className="text-[10px] font-mono uppercase text-muted hover:text-danger px-2 py-1"
                        >
                          Del
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {p.chords.slice(0, 12).map((c) => (
                        <span
                          key={c.id}
                          className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface-2 border border-border"
                        >
                          {chordDisplayName(c.rootPc, c.suffix)}
                        </span>
                      ))}
                      {p.chords.length > 12 && (
                        <span className="text-[10px] font-mono text-muted">
                          +{p.chords.length - 12}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {addOpen && (
        <AddChordPicker
          onClose={() => setAddOpen(false)}
          onAdd={handleAddChord}
        />
      )}
      <PaywallModal open={paywallOpen} onClose={() => setPaywallOpen(false)} />
    </div>
  );
}

function TuningSelect({
  currentId,
  onChange,
  isPro,
}: {
  currentId: string;
  onChange: (id: string) => void;
  isPro: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const label =
    TUNINGS.find((t) => t.id === currentId)?.label ??
    (currentId === CUSTOM_TUNING_ID ? "Custom" : "Standard");

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-3 py-1 bg-surface rounded-full border border-border hover:border-primary/50 text-xs"
      >
        {label}
        <svg className="size-3 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6"/></svg>
      </button>
      {open && (
        <div className="absolute left-0 mt-2 w-64 max-w-[calc(100vw-2rem)] bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden z-50">
          {TUNINGS.map((t) => {
            const locked = !!t.pro && !isPro;
            return (
              <button
                key={t.id}
                onClick={() => {
                  setOpen(false);
                  onChange(t.id);
                }}
                className={`w-full text-left px-4 py-2.5 hover:bg-surface-2 text-sm flex items-center justify-between ${
                  t.id === currentId ? "text-primary" : ""
                }`}
              >
                <span>{t.label}</span>
                {locked && (
                  <span className="text-[9px] font-mono uppercase text-muted">🔒 Pro</span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function AddChordPicker({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (rootPc: number, suffix: string) => void;
}) {
  const [rootPc, setRootPc] = useState<number>(0);
  const [suffix, setSuffix] = useState<string>("");

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-background/70 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full sm:max-w-lg bg-surface border border-border rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[92vh] overflow-hidden flex flex-col"
        style={{ animation: "slide-up 0.35s var(--ease-out-expo) both" }}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted">Add chord</p>
            <h2 className="text-xl font-extrabold tracking-tight">
              {noteName(rootPc)}
              {suffix}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="size-8 rounded-full bg-surface-2 border border-border flex items-center justify-center hover:border-primary/50"
            aria-label="Close"
          >
            <span className="text-sm">×</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted mb-2">
              Root
            </p>
            <div className="grid grid-cols-6 gap-1.5">
              {Array.from({ length: 12 }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setRootPc(i)}
                  className={`h-10 rounded-lg text-sm font-bold border transition-colors ${
                    rootPc === i
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-surface-2 border-border hover:border-primary/50"
                  }`}
                >
                  {noteName(i)}
                </button>
              ))}
            </div>
          </div>

          {QUALITY_GROUPS.map((group) => (
            <div key={group.label}>
              <p className="text-[10px] font-mono uppercase tracking-widest text-muted mb-2">
                {group.label}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {group.suffixes.map((s) => (
                  <button
                    key={s || "maj"}
                    onClick={() => setSuffix(s)}
                    className={`px-3 h-9 rounded-lg text-xs font-mono border transition-colors ${
                      suffix === s
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-surface-2 border-border hover:border-primary/50"
                    }`}
                  >
                    {s || "maj"}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-border">
          <button
            onClick={() => onAdd(rootPc, suffix)}
            className="w-full h-12 rounded-2xl bg-foreground text-background font-extrabold uppercase tracking-wider text-sm hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            Add {noteName(rootPc)}
            {suffix}
          </button>
        </div>
      </div>
    </div>
  );
}
