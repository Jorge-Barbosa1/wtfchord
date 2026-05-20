import { useEffect, useState } from "react";
import { TUNINGS, type Tuning } from "@/lib/music/tunings";

interface TopbarProps {
  tuning: Tuning;
  onTuning: (t: Tuning) => void;
  leftHanded: boolean;
  onToggleLeft: () => void;
  lightMode: boolean;
  onToggleLight: () => void;
  onOpenHistory: () => void;
}

export function Topbar({
  tuning,
  onTuning,
  leftHanded,
  onToggleLeft,
  lightMode,
  onToggleLight,
  onOpenHistory,
}: TopbarProps) {
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState(false);

  useEffect(() => {
    if (!open && !settings) return;
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setOpen(false); setSettings(false); }
    };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [open, settings]);

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 bg-background/80 backdrop-blur-xl border-b border-border">
      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
        <span className="font-extrabold tracking-tighter text-lg sm:text-xl italic shrink-0">
          CHORD<span className="text-primary text-2xl">.</span>D
        </span>
        <div className="hidden sm:block h-4 w-px bg-border" />
        <div className="relative">
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-2 px-3 py-1.5 bg-surface rounded-full border border-border hover:border-primary/50 transition-colors"
          >
            <span className="text-[10px] font-mono text-muted">TUNING</span>
            <span className="text-xs font-medium uppercase tracking-wider truncate max-w-[140px] sm:max-w-none">
              {tuning.label}
            </span>
            <svg className="size-3 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6"/></svg>
          </button>
          {open && (
            <div className="absolute left-0 mt-2 w-64 bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden z-50">
              {TUNINGS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => { onTuning(t); setOpen(false); }}
                  className={`w-full text-left px-4 py-3 hover:bg-surface-2 transition-colors flex items-center justify-between ${
                    t.id === tuning.id ? "text-primary" : ""
                  }`}
                >
                  <span className="text-sm font-medium">{t.label}</span>
                  {t.id === tuning.id && <span className="font-mono text-[10px]">●</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-5">
        <button
          onClick={onOpenHistory}
          className="text-[11px] sm:text-xs font-mono text-muted hover:text-foreground transition-colors uppercase tracking-widest"
        >
          History
        </button>
        <div className="relative">
          <button
            onClick={() => setSettings((v) => !v)}
            className="text-[11px] sm:text-xs font-mono text-muted hover:text-foreground transition-colors uppercase tracking-widest"
          >
            Settings
          </button>
          {settings && (
            <div className="absolute right-0 mt-2 w-64 bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden z-50 p-2">
              <SettingRow
                label="Left-handed mode"
                active={leftHanded}
                onToggle={onToggleLeft}
              />
              <SettingRow
                label="Light theme"
                active={lightMode}
                onToggle={onToggleLight}
              />
            </div>
          )}
        </div>
        <div className="size-8 rounded-full bg-surface border border-border flex items-center justify-center">
          <div className="size-1.5 rounded-full bg-success shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
        </div>
      </div>
    </nav>
  );
}

function SettingRow({ label, active, onToggle }: { label: string; active: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-surface-2 transition-colors"
    >
      <span className="text-sm">{label}</span>
      <span
        className={`relative w-9 h-5 rounded-full transition-colors ${active ? "bg-primary" : "bg-surface-2 border border-border"}`}
      >
        <span
          className={`absolute top-0.5 size-4 rounded-full bg-background transition-transform ${active ? "translate-x-4" : "translate-x-0.5"}`}
        />
      </span>
    </button>
  );
}
