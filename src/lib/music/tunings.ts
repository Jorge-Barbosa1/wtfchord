export interface Tuning {
  id: string;
  label: string;
  // Lowest string first (index 0 = thickest, lowest pitch)
  strings: { note: string; octave: number }[];
}

export const TUNINGS: Tuning[] = [
  {
    id: "standard",
    label: "Standard (EADGBE)",
    strings: [
      { note: "E", octave: 2 },
      { note: "A", octave: 2 },
      { note: "D", octave: 3 },
      { note: "G", octave: 3 },
      { note: "B", octave: 3 },
      { note: "E", octave: 4 },
    ],
  },
  {
    id: "drop-d",
    label: "Drop D (DADGBE)",
    strings: [
      { note: "D", octave: 2 },
      { note: "A", octave: 2 },
      { note: "D", octave: 3 },
      { note: "G", octave: 3 },
      { note: "B", octave: 3 },
      { note: "E", octave: 4 },
    ],
  },
  {
    id: "dadgad",
    label: "DADGAD",
    strings: [
      { note: "D", octave: 2 },
      { note: "A", octave: 2 },
      { note: "D", octave: 3 },
      { note: "G", octave: 3 },
      { note: "A", octave: 3 },
      { note: "D", octave: 4 },
    ],
  },
  {
    id: "open-g",
    label: "Open G (DGDGBD)",
    strings: [
      { note: "D", octave: 2 },
      { note: "G", octave: 2 },
      { note: "D", octave: 3 },
      { note: "G", octave: 3 },
      { note: "B", octave: 3 },
      { note: "D", octave: 4 },
    ],
  },
  {
    id: "seven-string",
    label: "7-String (BEADGBE)",
    strings: [
      { note: "B", octave: 1 },
      { note: "E", octave: 2 },
      { note: "A", octave: 2 },
      { note: "D", octave: 3 },
      { note: "G", octave: 3 },
      { note: "B", octave: 3 },
      { note: "E", octave: 4 },
    ],
  },
];

export const DEFAULT_TUNING = TUNINGS[0];
