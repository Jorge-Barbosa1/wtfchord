import type { StringState } from "@/lib/music/detect";

export interface ProgressionChord {
  id: string;
  rootPc: number;
  suffix: string; // chord def suffix, e.g. "", "m", "maj7"
  tuningId: string;
  strings: StringState[]; // pinned voicing for this chord
  minFret: number;
  maxFret: number;
}

export interface Progression {
  id: string;
  name: string;
  tuningId: string; // default tuning the progression was built with
  chords: ProgressionChord[];
  createdAt: number;
  updatedAt: number;
}

const KEY = "cd.progressions";

export function loadProgressions(): Progression[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as Progression[];
  } catch {
    return [];
  }
}

export function saveProgressions(list: Progression[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(list));
    window.dispatchEvent(new Event("cd.progressions.changed"));
  } catch {}
}

export function newProgression(tuningId: string): Progression {
  const now = Date.now();
  return {
    id: `p-${now}`,
    name: "Untitled progression",
    tuningId,
    chords: [],
    createdAt: now,
    updatedAt: now,
  };
}

export function newChordId(): string {
  return `c-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}
