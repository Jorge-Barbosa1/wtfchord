export interface Tuning {
  id: string;
  label: string;
  // Lowest string first (index 0 = thickest, lowest pitch)
  strings: { note: string; octave: number }[];
  pro?: boolean;
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
    id: "cavaquinho",
    label: "Cavaquinho (GGBD)",
    pro: true,
    strings: [
      { note: "G", octave: 4 },
      { note: "G", octave: 4 },
      { note: "B", octave: 4 },
      { note: "D", octave: 5 },
    ],
  },
  {
    id: "ukulele-high-g",
    label: "Ukulele High-G (gCEA)",
    pro: true,
    strings: [
      { note: "G", octave: 4 },
      { note: "C", octave: 4 },
      { note: "E", octave: 4 },
      { note: "A", octave: 4 },
    ],
  },
  {
    id: "ukulele-low-g",
    label: "Ukulele Low-G (GCEA)",
    pro: true,
    strings: [
      { note: "G", octave: 3 },
      { note: "C", octave: 4 },
      { note: "E", octave: 4 },
      { note: "A", octave: 4 },
    ],
  },
  {
    id: "mandolin",
    label: "Mandolin (GDAE)",
    pro: true,
    strings: [
      { note: "G", octave: 3 },
      { note: "D", octave: 4 },
      { note: "A", octave: 4 },
      { note: "E", octave: 5 },
    ],
  },
];

export const DEFAULT_TUNING = TUNINGS[0];

export const DEFAULT_CUSTOM_STRINGS: { note: string; octave: number }[] = [
  { note: "E", octave: 2 },
  { note: "A", octave: 2 },
  { note: "D", octave: 3 },
  { note: "G", octave: 3 },
  { note: "B", octave: 3 },
  { note: "E", octave: 4 },
];

export const CUSTOM_TUNING_ID = "custom";

export function makeCustomTuning(
  strings: { note: string; octave: number }[]
): Tuning {
  return {
    id: CUSTOM_TUNING_ID,
    label: `Custom (${strings.map((s) => s.note).join("")})`,
    pro: true,
    strings,
  };
}
