// Interval semitones -> display labels (assuming chord context, using 9/11/13 where useful)
export const INTERVAL_LABELS: Record<number, string> = {
  0: "1",
  1: "b9",
  2: "9",
  3: "b3",
  4: "3",
  5: "11",
  6: "b5",
  7: "5",
  8: "#5",
  9: "13",
  10: "b7",
  11: "7",
};

export function intervalLabel(semitones: number): string {
  return INTERVAL_LABELS[((semitones % 12) + 12) % 12] ?? String(semitones);
}

export function intervalsFromRoot(rootPc: number, pcs: number[]): number[] {
  return pcs.map((p) => ((p - rootPc) % 12 + 12) % 12).sort((a, b) => a - b);
}
