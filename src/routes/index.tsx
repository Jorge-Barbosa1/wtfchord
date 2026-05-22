import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Fretboard } from "@/components/chord-detective/Fretboard";
import { ResultsPanel } from "@/components/chord-detective/ResultsPanel";
import { Topbar } from "@/components/chord-detective/Topbar";
import { HistorySheet } from "@/components/chord-detective/HistorySheet";
import { InfoSheet } from "@/components/chord-detective/InfoSheet";
import { FindChordSheet } from "@/components/chord-detective/FindChordSheet";
import type { Voicing } from "@/lib/music/voicings";

import { TUNINGS, DEFAULT_TUNING, type Tuning } from "@/lib/music/tunings";
import {
  detectChords,
  notesFromInput,
  type DetectionResult,
  type StringState,
} from "@/lib/music/detect";
import { usePersistedState, type HistoryEntry } from "@/hooks/usePersistedState";

export const Route = createFileRoute("/")({
  component: Index,
});

function emptyStringsFor(t: Tuning): StringState[] {
  return Array.from({ length: t.strings.length }, () => null);
}

function Index() {
  const [tuningId, setTuningId] = usePersistedState<string>("cd.tuning", DEFAULT_TUNING.id);
  const tuning = useMemo(
    () => TUNINGS.find((t) => t.id === tuningId) ?? DEFAULT_TUNING,
    [tuningId]
  );

  const [strings, setStrings] = useState<StringState[]>(() => emptyStringsFor(tuning));
  const [leftHanded, setLeftHanded] = usePersistedState<boolean>("cd.left", false);
  const [lightMode, setLightMode] = usePersistedState<boolean>("cd.light", false);
  const [results, setResults] = useState<DetectionResult[]>([]);
  const [selectedName, setSelectedName] = useState<string | undefined>();
  const [historyOpen, setHistoryOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [findOpen, setFindOpen] = useState(false);


  const [history, setHistory] = usePersistedState<HistoryEntry[]>("cd.history", []);
  const [favorites, setFavorites] = usePersistedState<HistoryEntry[]>("cd.favorites", []);

  // Apply theme class
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.classList.toggle("light", lightMode);
    document.documentElement.classList.toggle("dark", !lightMode);
  }, [lightMode]);

  // Reset strings when tuning changes (length may differ)
  useEffect(() => {
    setStrings(emptyStringsFor(tuning));
    setResults([]);
    setSelectedName(undefined);
  }, [tuning]);

  const onSetFret = (stringIndex: number, fret: number) => {
    setStrings((prev) => {
      const next = [...prev];
      const cur = next[stringIndex];
      // Toggle off if same fret
      if (cur && typeof cur === "object" && cur.fret === fret) {
        next[stringIndex] = null;
      } else {
        next[stringIndex] = { fret };
      }
      return next;
    });
  };

  const onCycleOpenMute = (stringIndex: number) => {
    setStrings((prev) => {
      const next = [...prev];
      const cur = next[stringIndex];
      // cycle: null -> open -> mute -> null (also clears fret marker)
      if (cur === null) next[stringIndex] = "open";
      else if (cur === "open") next[stringIndex] = "mute";
      else if (cur === "mute") next[stringIndex] = null;
      else next[stringIndex] = "open";
      return next;
    });
  };

  const onIdentify = () => {
    const r = detectChords({ tuning, strings });
    setResults(r);
    setSelectedName(r[0]?.name);
    if (r[0]) {
      const notes = notesFromInput({ tuning, strings });
      const entry: HistoryEntry = {
        id: `${Date.now()}`,
        name: r[0].name,
        notes,
        confidence: r[0].confidence,
        tuningId: tuning.id,
        tuningLabel: tuning.label,
        strings: [...strings],
        timestamp: Date.now(),
      };
      setHistory((prev) => [entry, ...prev.filter((p) => p.name !== entry.name)].slice(0, 20));
    }
  };

  const onClear = () => {
    setStrings(emptyStringsFor(tuning));
    setResults([]);
    setSelectedName(undefined);
  };

  const notes = useMemo(() => notesFromInput({ tuning, strings }), [tuning, strings]);

  const onFavorite = (r: DetectionResult) => {
    const entry: HistoryEntry = {
      id: `fav-${Date.now()}`,
      name: r.name,
      notes,
      confidence: r.confidence,
      tuningId: tuning.id,
      tuningLabel: tuning.label,
      strings: [...strings],
      timestamp: Date.now(),
    };
    setFavorites((prev) => {
      const exists = prev.some((p) => p.name === r.name);
      if (exists) return prev.filter((p) => p.name !== r.name);
      return [entry, ...prev].slice(0, 50);
    });
  };

  const isFavorite = useMemo(() => {
    const primary = results.find((r) => r.name === selectedName) ?? results[0];
    if (!primary) return false;
    return favorites.some((f) => f.name === primary.name);
  }, [favorites, results, selectedName]);

  const onLoadEntry = (e: HistoryEntry) => {
    const t = TUNINGS.find((tt) => tt.id === e.tuningId) ?? DEFAULT_TUNING;
    setTuningId(t.id);
    // wait for tuning effect to reset, then set strings
    requestAnimationFrame(() => {
      setStrings(e.strings);
      const r = detectChords({ tuning: t, strings: e.strings });
      setResults(r);
      setSelectedName(e.name);
      setHistoryOpen(false);
    });
  };

  // Press Enter to identify
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" && !historyOpen) onIdentify();
      if (e.key === "Backspace" && (e.metaKey || e.ctrlKey)) onClear();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const hasInput = strings.some((s) => s !== null);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Topbar
        tuning={tuning}
        onTuning={(t) => setTuningId(t.id)}
        leftHanded={leftHanded}
        onToggleLeft={() => setLeftHanded((v) => !v)}
        lightMode={lightMode}
        onToggleLight={() => setLightMode((v) => !v)}
        onOpenHistory={() => setHistoryOpen(true)}
        onOpenInfo={() => setInfoOpen(true)}
        onOpenFind={() => setFindOpen(true)}
      />


      <main className="max-w-screen-xl mx-auto px-4 sm:px-6 pt-4 sm:pt-8 pb-24 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">
        <section className="lg:col-span-7 flex flex-col gap-4">
          <header className="px-1">
            <h1 className="text-xl sm:text-3xl font-extrabold tracking-tighter">
              Map your fingers. <span className="text-muted">Decode the voicing.</span>
            </h1>
            <p className="text-muted text-sm mt-1">
              Tap a fret to place a finger. <span className="font-mono text-primary">O</span> opens
              a string, <span className="font-mono text-danger">X</span> mutes it.
            </p>
          </header>

          <Fretboard
            tuning={tuning}
            strings={strings}
            leftHanded={leftHanded}
            onSetFret={onSetFret}
            onCycleOpenMute={onCycleOpenMute}
          />

          <div className="flex gap-3">
            <button
              onClick={onIdentify}
              disabled={!hasInput}
              className="flex-1 bg-foreground text-background h-14 sm:h-16 rounded-2xl font-extrabold text-base sm:text-lg flex items-center justify-center gap-3 hover:bg-primary hover:text-primary-foreground transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              IDENTIFY CHORD
              <span className="hidden sm:inline text-xs font-mono opacity-50">[ENTER]</span>
            </button>
            <button
              onClick={onClear}
              className="px-5 sm:px-8 border border-border rounded-2xl hover:bg-surface hover:border-primary/50 transition-colors font-mono text-xs uppercase tracking-widest"
            >
              Clear
            </button>
          </div>
        </section>

        <aside className="lg:col-span-5">
          <ResultsPanel
            results={results}
            notes={notes}
            selectedName={selectedName}
            onPickAlternative={(r) => setSelectedName(r.name)}
            onFavorite={onFavorite}
            isFavorite={isFavorite}
          />
        </aside>
      </main>

      <HistorySheet
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        history={history}
        favorites={favorites}
        onLoad={onLoadEntry}
        onClearHistory={() => setHistory([])}
      />
      <InfoSheet open={infoOpen} onClose={() => setInfoOpen(false)} />
      <FindChordSheet
        open={findOpen}
        onClose={() => setFindOpen(false)}
        tuning={tuning}
        leftHanded={leftHanded}
        onLoadVoicing={(v: Voicing) => {
          setStrings(v.strings);
          setResults([]);
          setSelectedName(undefined);
        }}
      />
    </div>
  );
}

