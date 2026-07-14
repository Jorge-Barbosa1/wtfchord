import { CHORD_DEFS } from "./chords";
import { NOTE_NAMES, noteToPc } from "./notes";

// Root slugs — sharps only to keep URLs canonical
export const ROOT_SLUGS: Record<string, string> = {
  C: "c",
  "C#": "c-sharp",
  D: "d",
  "D#": "d-sharp",
  E: "e",
  F: "f",
  "F#": "f-sharp",
  G: "g",
  "G#": "g-sharp",
  A: "a",
  "A#": "a-sharp",
  B: "b",
};

export const ROOT_LABELS: Record<string, string> = {
  C: "C",
  "C#": "C♯",
  D: "D",
  "D#": "D♯",
  E: "E",
  F: "F",
  "F#": "F♯",
  G: "G",
  "G#": "G♯",
  A: "A",
  "A#": "A♯",
  B: "B",
};

// Chord quality slug ↔ suffix
export const QUALITY_SLUG_TO_SUFFIX: Record<string, string> = {
  major: "",
  minor: "m",
  "dominant-7": "7",
  "major-7": "maj7",
  "minor-7": "m7",
  sus2: "sus2",
  sus4: "sus4",
  diminished: "dim",
  augmented: "aug",
  "6": "6",
  "9": "9",
  add9: "add9",
  "power-chord": "5",
};

export const QUALITY_LABELS: Record<string, string> = {
  major: "Major",
  minor: "Minor",
  "dominant-7": "Dominant 7th",
  "major-7": "Major 7th",
  "minor-7": "Minor 7th",
  sus2: "Suspended 2nd",
  sus4: "Suspended 4th",
  diminished: "Diminished",
  augmented: "Augmented",
  "6": "6th",
  "9": "9th",
  add9: "Add 9",
  "power-chord": "Power Chord",
};

export const ROOTS_IN_ORDER = [
  "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B",
] as const;

export const QUALITIES_IN_ORDER = [
  "major", "minor", "dominant-7", "major-7", "minor-7",
  "sus2", "sus4", "diminished", "augmented", "6", "9", "add9", "power-chord",
] as const;

export interface ParsedChordSlug {
  rootName: string;
  rootPc: number;
  quality: string;
  qualityLabel: string;
  suffix: string;
  displayName: string; // e.g. "Am7"
  intervals: number[];
}

export function parseChordSlug(slug: string): ParsedChordSlug | null {
  // Try to match root prefix (longest first: "c-sharp" before "c")
  const rootEntries = Object.entries(ROOT_SLUGS).sort(
    (a, b) => b[1].length - a[1].length,
  );
  for (const [rootName, rootSlug] of rootEntries) {
    if (slug === rootSlug) return null;
    if (slug.startsWith(rootSlug + "-") || slug === rootSlug) {
      const rest = slug === rootSlug ? "" : slug.slice(rootSlug.length + 1);
      const qualityKey = rest || "major";
      const suffix = QUALITY_SLUG_TO_SUFFIX[qualityKey];
      if (suffix === undefined) continue;
      const def = CHORD_DEFS.find((d) => d.suffix === suffix);
      if (!def) continue;
      const rootPc = noteToPc(rootName);
      return {
        rootName,
        rootPc,
        quality: qualityKey,
        qualityLabel: QUALITY_LABELS[qualityKey] ?? def.fullName,
        suffix,
        displayName: `${ROOT_LABELS[rootName] ?? rootName}${suffix}`,
        intervals: def.intervals,
      };
    }
  }
  return null;
}

export function chordSlug(rootName: string, quality: string): string {
  return `${ROOT_SLUGS[rootName]}-${quality}`;
}

export function isValidRoot(name: string): boolean {
  return NOTE_NAMES.includes(name as (typeof NOTE_NAMES)[number]);
}
