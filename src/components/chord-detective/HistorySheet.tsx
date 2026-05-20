import { useEffect } from "react";
import type { HistoryEntry } from "@/hooks/usePersistedState";

interface HistorySheetProps {
  open: boolean;
  onClose: () => void;
  history: HistoryEntry[];
  favorites: HistoryEntry[];
  onLoad: (entry: HistoryEntry) => void;
  onClearHistory: () => void;
}

export function HistorySheet({
  open,
  onClose,
  history,
  favorites,
  onLoad,
  onClearHistory,
}: HistorySheetProps) {
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
        className="bg-surface w-full max-w-md max-h-[80vh] rounded-3xl border border-border shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: "slide-up 0.3s var(--ease-out-expo)" }}
      >
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h3 className="font-extrabold tracking-tight text-lg">History & Favorites</h3>
          <button
            onClick={onClose}
            className="size-8 rounded-full bg-surface-2 border border-border flex items-center justify-center hover:border-primary/50"
            aria-label="Close"
          >
            <span className="text-sm">×</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <Section title="Favorites" empty="No favorites yet — tap ★ on a result.">
            {favorites.map((f) => (
              <EntryRow key={`fav-${f.id}`} entry={f} onLoad={() => onLoad(f)} />
            ))}
          </Section>
          <Section
            title="Recent"
            empty="Identify a chord to start a history."
            action={
              history.length > 0 ? (
                <button
                  onClick={onClearHistory}
                  className="font-mono text-[10px] text-muted hover:text-danger uppercase tracking-widest"
                >
                  Clear
                </button>
              ) : null
            }
          >
            {history.map((h) => (
              <EntryRow key={`hist-${h.id}`} entry={h} onLoad={() => onLoad(h)} />
            ))}
          </Section>
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
  empty,
  action,
}: {
  title: string;
  children: React.ReactNode;
  empty: string;
  action?: React.ReactNode;
}) {
  const isEmpty = Array.isArray(children) ? children.length === 0 : !children;
  return (
    <div className="px-6 py-4">
      <div className="flex items-center justify-between mb-3">
        <p className="font-mono text-[10px] text-muted uppercase tracking-widest">{title}</p>
        {action}
      </div>
      {isEmpty ? (
        <p className="text-xs text-muted">{empty}</p>
      ) : (
        <div className="space-y-2">{children}</div>
      )}
    </div>
  );
}

function EntryRow({ entry, onLoad }: { entry: HistoryEntry; onLoad: () => void }) {
  return (
    <button
      onClick={onLoad}
      className="w-full flex items-center justify-between p-3 rounded-xl bg-surface-2 border border-border/60 hover:border-primary/50 transition-colors text-left"
    >
      <div>
        <div className="font-bold">{entry.name}</div>
        <div className="text-[10px] font-mono text-muted">
          {entry.tuningLabel} · {entry.notes.join(" ")}
        </div>
      </div>
      <span className="font-mono text-[10px] text-muted">{entry.confidence}%</span>
    </button>
  );
}
