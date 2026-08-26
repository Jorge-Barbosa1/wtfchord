import { CHORD_DEFS, type ChordDef } from "./chords";
import { intervalLabel } from "./intervals";
import { noteName, pcOf, stringNoteAtFret } from "./notes";
import type { Tuning } from "./tunings";

export type StringState = null | "mute" | "open" | { fret: number };

export interface SelectionInput {
  tuning: Tuning;
  // index 0 = lowest pitched string
  strings: StringState[];
}

export interface SoundingNote {
  stringIndex: number;
  midi: number;
  pc: number;
}

export interface DetectionResult {
  name: string;          // e.g. "Am7" or "Am7/C"
  baseName: string;      // e.g. "Am7"
  root: string;          // e.g. "A"
  rootPc: number;
  bass: string;          // bass note name
  bassPc: number;
  isSlash: boolean;
  fullName: string;      // human description
  intervals: { semitones: number; label: string }[];
  notes: string[];       // unique note names in order: root, then ascending
  confidence: number;    // 0..100
  missing: number[];     // missing semitones (relative to chord def)
  extras: number[];      // extra semitones not in chord def
}

export function computeSoundingNotes(input: SelectionInput): SoundingNote[] {
  const out: SoundingNote[] = [];
  input.strings.forEach((s, i) => {
    if (!s || s === "mute") return;
    const str = input.tuning.strings[i];
    const fret = s === "open" ? 0 : s.fret;
    const midi = stringNoteAtFret(str.note, str.octave, fret);
    out.push({ stringIndex: i, midi, pc: pcOf(midi) });
  });
  return out;
}

function scoreCandidate(presentSet: Set<number>, def: ChordDef) {
  const wanted = new Set(def.intervals);
  let matches = 0;
  for (const w of wanted) if (presentSet.has(w)) matches++;
  const missing: number[] = [];
  for (const w of wanted) if (!presentSet.has(w)) missing.push(w);
  const extras: number[] = [];
  for (const p of presentSet) if (!wanted.has(p)) extras.push(p);
  // Coverage: how much of the chord def is present
  const coverage = matches / wanted.size;
  // Penalty for extra notes the chord doesn't claim - heavier penalty
  const extrasPenalty = extras.length * 0.4;
  // Penalty for missing notes (heavier if root or 3rd-equivalent missing)
  let missingPenalty = 0;
  for (const m of missing) {
    if (m === 0) missingPenalty += 0.6;
    else if (m === 3 || m === 4) missingPenalty += 0.25;
    else if (m === 7) missingPenalty += 0.1; // 5th missing is common, lighter penalty
    else missingPenalty += 0.15;
  }
  const raw = coverage - extrasPenalty - missingPenalty;
  return { raw, matches, missing, extras };
}

export function detectChords(input: SelectionInput): DetectionResult[] {
  const sounding = computeSoundingNotes(input);
  if (sounding.length === 0) return [];

  const pcs = Array.from(new Set(sounding.map((n) => n.pc)));
  const bass = sounding.reduce((a, b) => (a.midi < b.midi ? a : b));
  const presentSet = new Set(pcs);

  const candidates: DetectionResult[] = [];

  for (const rootPc of pcs) {
    const relSet = new Set<number>();
    for (const p of pcs) relSet.add(((p - rootPc) % 12 + 12) % 12);

    for (const def of CHORD_DEFS) {
      const { raw, matches, missing, extras } = scoreCandidate(relSet, def);
      if (matches < 2) continue; // too weak
      if (raw <= 0) continue;

      // Bonuses
      let bonus = 0;
      // Bass = root is a strong signal
      if (bass.pc === rootPc) bonus += 0.12;
      // Priority bonus (common chords preferred)
      bonus += (6 - def.priority) * 0.02;

      const score = raw + bonus;
      const confidence = Math.max(5, Math.min(99, Math.round(score * 100)));

      const isSlash = bass.pc !== rootPc;
      const rootName = noteName(rootPc);
      const bassName = noteName(bass.pc);
      const baseName = `${rootName}${def.suffix}`;
      const fullName = `${rootName} ${def.fullName}`;
      const name = isSlash ? `${baseName}/${bassName}` : baseName;

      // Notes in the chord (within selection that match def intervals)
      const chordPcs = def.intervals
        .filter((iv) => relSet.has(iv))
        .map((iv) => (rootPc + iv) % 12);
      // Include bass if not already
      const noteSet: number[] = [];
      const seen = new Set<number>();
      for (const p of chordPcs) if (!seen.has(p)) { seen.add(p); noteSet.push(p); }
      const notes = noteSet.map((p) => noteName(p));

      const intervals = def.intervals
        .filter((iv) => relSet.has(iv))
        .map((iv) => ({ semitones: iv, label: intervalLabel(iv) }));

      candidates.push({
        name,
        baseName,
        root: rootName,
        rootPc,
        bass: bassName,
        bassPc: bass.pc,
        isSlash,
        fullName,
        intervals,
        notes,
        confidence,
        missing,
        extras,
      });
    }
  }

  // Sort by confidence
  candidates.sort((a, b) => b.confidence - a.confidence);

  // De-dupe identical names, keep highest
  const seen = new Set<string>();
  const out: DetectionResult[] = [];
  for (const c of candidates) {
    if (seen.has(c.name)) continue;
    seen.add(c.name);
    out.push(c);
  }

  // Also expose pcs-derived "raw" notes if best chord has missing notes:
  // (we keep that out of UI to stay clean; user can read intervals)
  return out.slice(0, 6);
}

export function notesFromInput(input: SelectionInput): string[] {
  const sounding = computeSoundingNotes(input);
  const seen = new Set<number>();
  const ordered: number[] = [];
  // order by midi ascending so it reads bass -> treble
  sounding.sort((a, b) => a.midi - b.midi);
  for (const s of sounding) if (!seen.has(s.pc)) { seen.add(s.pc); ordered.push(s.pc); }
  return ordered.map((p) => noteName(p));
}
