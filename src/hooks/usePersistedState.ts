import { useEffect, useState } from "react";
import type { StringState } from "@/lib/music/detect";

export interface HistoryEntry {
  id: string;
  name: string;
  notes: string[];
  confidence: number;
  tuningId: string;
  tuningLabel: string;
  strings: StringState[];
  timestamp: number;
}

export function usePersistedState<T>(key: string, initial: T): [T, (v: T | ((p: T) => T)) => void] {
  const [state, setState] = useState<T>(() => {
    if (typeof window === "undefined") return initial;
    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) return initial;
      return JSON.parse(raw) as T;
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    try { window.localStorage.setItem(key, JSON.stringify(state)); } catch {}
  }, [key, state]);

  return [state, setState];
}
