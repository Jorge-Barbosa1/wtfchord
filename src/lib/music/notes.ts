export const NOTE_NAMES = [
  "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B",
] as const;

export const FLAT_NAMES = [
  "C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B",
] as const;

export type PitchClass = number; // 0..11

export function noteName(pc: PitchClass, useFlats = false): string {
  const n = ((pc % 12) + 12) % 12;
  return (useFlats ? FLAT_NAMES : NOTE_NAMES)[n];
}

export function noteToPc(name: string): PitchClass {
  const sharps = NOTE_NAMES.indexOf(name as (typeof NOTE_NAMES)[number]);
  if (sharps >= 0) return sharps;
  const flats = FLAT_NAMES.indexOf(name as (typeof FLAT_NAMES)[number]);
  if (flats >= 0) return flats;
  throw new Error(`Unknown note: ${name}`);
}

// Returns the absolute MIDI-like value (octave * 12 + pc) given a base string note + fret.
// We don't need octaves for chord detection but useful to find the bass note.
export function stringNoteAtFret(openNoteName: string, openOctave: number, fret: number) {
  const basePc = noteToPc(openNoteName);
  const total = openOctave * 12 + basePc + fret;
  return total;
}

export function pcOf(midi: number): PitchClass {
  return ((midi % 12) + 12) % 12;
}
