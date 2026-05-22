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
  onOpenInfo: () => void;
}

export function Topbar({
  tuning,
  onTuning,
  leftHanded,
  onToggleLeft,
  lightMode,
  onToggleLight,
  onOpenHistory,
  onOpenInfo,
}: TopbarProps) {
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState(false);
  const [menu, setMenu] = useState(false);

  useEffect(() => {
    if (!open && !settings && !menu) return;
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setOpen(false); setSettings(false); setMenu(false); }
    };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [open, settings, menu]);

  // Short label for mobile: strip the parenthetical if present
  const shortLabel = tuning.label.replace(/\s*\(.*\)\s*/, "") || tuning.label;

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between gap-2 px-4 sm:px-6 py-3 sm:py-4 bg-background/80 backdrop-blur-xl border-b border-border">
      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
        <span className="font-extrabold tracking-tighter text-lg sm:text-xl italic shrink-0">
          WTFChord
        </span>
        <div className="hidden sm:block h-4 w-px bg-border" />
        <div className="relative min-w-0">
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 bg-surface rounded-full border border-border hover:border-primary/50 transition-colors max-w-full"
          >
            <span className="hidden sm:inline text-[10px] font-mono text-muted">TUNING</span>
            <span className="text-xs font-medium uppercase tracking-wider truncate max-w-[120px] sm:max-w-none">
              <span className="sm:hidden">{shortLabel}</span>
              <span className="hidden sm:inline">{tuning.label}</span>
            </span>
            <svg className="size-3 opacity-50 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6"/></svg>
          </button>
          {open && (
            <div className="absolute left-0 mt-2 w-64 max-w-[calc(100vw-2rem)] bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden z-50">
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

      {/* Desktop actions */}
      <div className="hidden sm:flex items-center gap-5">
        <button
          onClick={onOpenInfo}
          className="text-xs font-mono text-muted hover:text-foreground transition-colors uppercase tracking-widest"
        >
          Informations
        </button>
        <button
          onClick={onOpenHistory}
          className="text-xs font-mono text-muted hover:text-foreground transition-colors uppercase tracking-widest"
        >
          History
        </button>
        <div className="relative">
          <button
            onClick={() => setSettings((v) => !v)}
            className="text-xs font-mono text-muted hover:text-foreground transition-colors uppercase tracking-widest"
          >
            Settings
          </button>
          {settings && (
            <div className="absolute right-0 mt-2 w-64 bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden z-50 p-2">
              <SettingRow label="Left-handed mode" active={leftHanded} onToggle={onToggleLeft} />
              <SettingRow label="Light theme" active={lightMode} onToggle={onToggleLight} />
            </div>
          )}
        </div>
        <div className="size-8 rounded-full bg-surface border border-border flex items-center justify-center">
          <div className="size-1.5 rounded-full bg-success shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
        </div>
      </div>

      {/* Mobile menu */}
      <div className="sm:hidden relative shrink-0">
        <button
          onClick={() => setMenu((v) => !v)}
          aria-label="Open menu"
          className="size-9 rounded-lg border border-border bg-surface flex items-center justify-center hover:border-primary/50 transition-colors"
        >
          <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 6h18M3 12h18M3 18h18" />
          </svg>
        </button>
        {menu && (
          <div className="absolute right-0 mt-2 w-60 max-w-[calc(100vw-2rem)] bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden z-50 p-2">
            <button
              onClick={() => { setMenu(false); onOpenInfo(); }}
              className="w-full text-left px-3 py-2 rounded-lg hover:bg-surface-2 text-sm font-mono uppercase tracking-widest text-muted hover:text-foreground"
            >
              Informations
            </button>
            <button
              onClick={() => { setMenu(false); onOpenHistory(); }}
              className="w-full text-left px-3 py-2 rounded-lg hover:bg-surface-2 text-sm font-mono uppercase tracking-widest text-muted hover:text-foreground"
            >
              History
            </button>
            <div className="my-2 h-px bg-border" />
            <SettingRow label="Left-handed mode" active={leftHanded} onToggle={onToggleLeft} />
            <SettingRow label="Light theme" active={lightMode} onToggle={onToggleLight} />
          </div>
        )}
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
