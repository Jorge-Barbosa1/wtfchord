import type { StringState } from "./detect";
import { noteToPc } from "./notes";
import type { Tuning } from "./tunings";

export interface Voicing {
  strings: StringState[]; // length = tuning.strings.length
  minFret: number;        // lowest non-open fretted fret (0 if only open/mute)
  maxFret: number;        // highest fretted fret
  bassPc: number;
  isSlash: boolean;
  score: number;
  playedCount: number;
}

export interface FindOptions {
  maxFret?: number;     // default 12
  maxSpan?: number;     // default 4 (frets within a barre window)
  limit?: number;       // default 10
}

interface StringOption {
  action: StringState;
  pc: number | null; // null = mute
  fret: number | null; // null = mute, 0 = open
}

/**
 * Find playable voicings for a chord (rootPc + intervals) on a given tuning.
 * strings[0] is the lowest pitched string (bass side).
 */
export function findVoicings(
  tuning: Tuning,
  rootPc: number,
  intervals: number[],
  options: FindOptions = {},
): Voicing[] {
  const maxFret = options.maxFret ?? 12;
  const maxSpan = options.maxSpan ?? 4;
  const limit = options.limit ?? 10;

  const chordPcs = new Set(intervals.map((iv) => ((rootPc + iv) % 12 + 12) % 12));
  const N = tuning.strings.length;
  const minRequired = Math.max(3, Math.min(N, chordPcs.size));

  // Build per-string options
  const perString: StringOption[][] = tuning.strings.map((s) => {
    const basePc = noteToPc(s.note);
    const list: StringOption[] = [{ action: "mute", pc: null, fret: null }];
    for (let f = 0; f <= maxFret; f++) {
      const pc = ((basePc + f) % 12 + 12) % 12;
      if (chordPcs.has(pc)) {
        const action: StringState = f === 0 ? "open" : { fret: f };
        list.push({ action, pc, fret: f });
      }
    }
    return list;
  });

  const results: Voicing[] = [];
  const choice: number[] = new Array(N);

  function evaluate(minFretted: number, maxFretted: number) {
    const presentPcs = new Set<number>();
    let bassPc = -1;
    let bassStringIndex = -1;
    let playedCount = 0;
    for (let s = 0; s < N; s++) {
      const o = perString[s][choice[s]];
      if (o.pc !== null) {
        presentPcs.add(o.pc);
        playedCount++;
        if (bassStringIndex === -1) {
          bassStringIndex = s;
          bassPc = o.pc;
        }
      }
    }
    if (playedCount < minRequired) return;
    for (const pc of chordPcs) if (!presentPcs.has(pc)) return;
    if (!presentPcs.has(rootPc)) return;

    // Disallow mute "holes" between played strings on the high side
    // (a mute between two played strings is awkward to strum). Allow muted
    // bass-side strings (common). We detect inner mutes after first played.
    let seenPlayed = false;
    let innerMutes = 0;
    for (let s = 0; s < N; s++) {
      const o = perString[s][choice[s]];
      if (o.pc !== null) seenPlayed = true;
      else if (seenPlayed) innerMutes++;
    }
    // Trailing mutes (after a played string) are penalized but not rejected,
    // except if more than 1 inner mute → skip (very awkward).
    if (innerMutes > 1) return;

    const span = maxFretted === -Infinity ? 0 : maxFretted - (minFretted === Infinity ? maxFretted : minFretted);
    const lowestFretted = minFretted === Infinity ? 0 : minFretted;
    const highest = maxFretted === -Infinity ? 0 : maxFretted;
    const isSlash = bassPc !== rootPc;

    let score = 100;
    score -= span * 3;            // tight shapes win
    score -= highest * 1.2;       // prefer near the nut
    score -= (N - playedCount) * 4; // prefer fewer mutes
    score -= innerMutes * 8;
    if (isSlash) score -= 18;
    else score += 8;
    // small bonus for using open strings
    let opens = 0;
    for (let s = 0; s < N; s++) if (perString[s][choice[s]].action === "open") opens++;
    score += opens * 1.5;

    results.push({
      strings: choice.map((c, s) => perString[s][c].action),
      minFret: lowestFretted,
      maxFret: highest,
      bassPc,
      isSlash,
      score,
      playedCount,
    });
  }

  function rec(i: number, minFretted: number, maxFretted: number) {
    if (i === N) {
      evaluate(minFretted, maxFretted);
      return;
    }
    const opts = perString[i];
    for (let k = 0; k < opts.length; k++) {
      const o = opts[k];
      let nmin = minFretted;
      let nmax = maxFretted;
      if (o.fret !== null && o.fret > 0) {
        if (o.fret < nmin) nmin = o.fret;
        if (o.fret > nmax) nmax = o.fret;
        if (nmax - nmin > maxSpan) continue;
      }
      choice[i] = k;
      rec(i + 1, nmin, nmax);
    }
  }

  rec(0, Infinity, -Infinity);

  // De-dupe identical fingerings
  const seen = new Set<string>();
  const unique: Voicing[] = [];
  for (const v of results) {
    const key = v.strings
      .map((s) =>
        s === null ? "n" : s === "mute" ? "x" : s === "open" ? "0" : String(s.fret),
      )
      .join(",");
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(v);
  }
  unique.sort((a, b) => b.score - a.score);
  return unique.slice(0, limit);
}
