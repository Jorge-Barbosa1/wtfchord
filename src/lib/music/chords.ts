// Chord definitions: intervals (semitones from root). Order doesn't matter.
export interface ChordDef {
  suffix: string;        // appended to root: e.g. "m7", "maj9", ""
  fullName: string;      // e.g. "Minor 7th"
  intervals: number[];   // semitones from root, must include 0
  priority: number;      // tie-breaker: lower = more common / preferred
}

export const CHORD_DEFS: ChordDef[] = [
  { suffix: "",         fullName: "Major",            intervals: [0, 4, 7],           priority: 1 },
  { suffix: "m",        fullName: "Minor",            intervals: [0, 3, 7],           priority: 1 },
  { suffix: "5",        fullName: "Power Chord",      intervals: [0, 7],              priority: 4 },
  { suffix: "sus2",     fullName: "Suspended 2nd",    intervals: [0, 2, 7],           priority: 3 },
  { suffix: "sus4",     fullName: "Suspended 4th",    intervals: [0, 5, 7],           priority: 3 },
  { suffix: "dim",      fullName: "Diminished",       intervals: [0, 3, 6],           priority: 3 },
  { suffix: "aug",      fullName: "Augmented",        intervals: [0, 4, 8],           priority: 3 },
  { suffix: "6",        fullName: "Major 6th",        intervals: [0, 4, 7, 9],        priority: 2 },
  { suffix: "m6",       fullName: "Minor 6th",        intervals: [0, 3, 7, 9],        priority: 3 },
  { suffix: "maj7",     fullName: "Major 7th",        intervals: [0, 4, 7, 11],       priority: 2 },
  { suffix: "m7",       fullName: "Minor 7th",        intervals: [0, 3, 7, 10],       priority: 2 },
  { suffix: "7",        fullName: "Dominant 7th",     intervals: [0, 4, 7, 10],       priority: 2 },
  { suffix: "m7b5",     fullName: "Half-Diminished",  intervals: [0, 3, 6, 10],       priority: 3 },
  { suffix: "dim7",     fullName: "Diminished 7th",   intervals: [0, 3, 6, 9],        priority: 3 },
  { suffix: "mMaj7",    fullName: "Minor Major 7th",  intervals: [0, 3, 7, 11],       priority: 4 },
  { suffix: "add9",     fullName: "Add 9",            intervals: [0, 4, 7, 2],        priority: 3 },
  { suffix: "madd9",    fullName: "Minor Add 9",      intervals: [0, 3, 7, 2],        priority: 3 },
  { suffix: "6/9",      fullName: "Six-Nine",         intervals: [0, 4, 7, 9, 2],     priority: 4 },
  { suffix: "9",        fullName: "Dominant 9th",     intervals: [0, 4, 7, 10, 2],    priority: 3 },
  { suffix: "maj9",     fullName: "Major 9th",        intervals: [0, 4, 7, 11, 2],    priority: 3 },
  { suffix: "m9",       fullName: "Minor 9th",        intervals: [0, 3, 7, 10, 2],    priority: 3 },
  { suffix: "11",       fullName: "Dominant 11th",    intervals: [0, 7, 10, 2, 5],    priority: 4 },
  { suffix: "m11",      fullName: "Minor 11th",       intervals: [0, 3, 7, 10, 2, 5], priority: 4 },
  { suffix: "13",       fullName: "Dominant 13th",    intervals: [0, 4, 7, 10, 2, 9], priority: 4 },
  { suffix: "maj13",    fullName: "Major 13th",       intervals: [0, 4, 7, 11, 2, 9], priority: 4 },
  { suffix: "m13",      fullName: "Minor 13th",       intervals: [0, 3, 7, 10, 2, 9], priority: 4 },
  { suffix: "7b9",      fullName: "Dom 7 b9",         intervals: [0, 4, 7, 10, 1],    priority: 4 },
  { suffix: "7#9",      fullName: "Dom 7 #9 (Hendrix)", intervals: [0, 4, 7, 10, 3],  priority: 4 },
  { suffix: "7b5",      fullName: "Dom 7 b5",         intervals: [0, 4, 6, 10],       priority: 4 },
  { suffix: "7#5",      fullName: "Dom 7 #5 (Altered)", intervals: [0, 4, 8, 10],     priority: 4 },
  { suffix: "7sus4",    fullName: "Dom 7 sus4",       intervals: [0, 5, 7, 10],       priority: 4 },
  { suffix: "maj7#11",  fullName: "Lydian Maj7",      intervals: [0, 4, 7, 11, 6],    priority: 5 },
];
