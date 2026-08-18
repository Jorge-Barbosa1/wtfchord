import { noteName } from "./notes";
import { CHORD_DEFS } from "./chords";

/** Human formula (scale degrees) per chord suffix. */
export const FORMULAS: Record<string, string> = {
  "": "1 – 3 – 5",
  m: "1 – ♭3 – 5",
  "5": "1 – 5",
  sus2: "1 – 2 – 5",
  sus4: "1 – 4 – 5",
  dim: "1 – ♭3 – ♭5",
  aug: "1 – 3 – ♯5",
  "6": "1 – 3 – 5 – 6",
  m6: "1 – ♭3 – 5 – 6",
  maj7: "1 – 3 – 5 – 7",
  m7: "1 – ♭3 – 5 – ♭7",
  "7": "1 – 3 – 5 – ♭7",
  m7b5: "1 – ♭3 – ♭5 – ♭7",
  dim7: "1 – ♭3 – ♭5 – ♭♭7",
  add9: "1 – 3 – 5 – 9",
  madd9: "1 – ♭3 – 5 – 9",
  "9": "1 – 3 – 5 – ♭7 – 9",
  maj9: "1 – 3 – 5 – 7 – 9",
  m9: "1 – ♭3 – 5 – ♭7 – 9",
  "6/9": "1 – 3 – 5 – 6 – 9",
};

/** Short character description per chord suffix. */
export const CHARACTER: Record<string, string> = {
  "": "bright, stable and resolved — the default 'happy' sound",
  m: "darker and more introspective than its major counterpart",
  "5": "neutral and powerful: no third, so it is neither major nor minor",
  sus2: "open and airy — the third is replaced by the second",
  sus4: "tense and unresolved, begging to fall back to the plain major",
  dim: "unstable and anxious, almost always used as a passing chord",
  aug: "dreamlike and unsettled, great as a lift into the next chord",
  "6": "vintage and sweet — a major chord with a nostalgic edge",
  m6: "bittersweet, common in jazz and bossa nova",
  maj7: "lush, warm and floaty — the sound of soul, bossa and city pop",
  m7: "smooth and mellow, the workhorse of funk, soul and jazz",
  "7": "bluesy and restless: it wants to resolve a fourth upwards",
  m7b5: "half-diminished — the classic minor ii chord in jazz",
  dim7: "fully symmetrical tension, used to pivot between keys",
  add9: "a major chord with extra sparkle, no seventh involved",
  madd9: "minor with a shimmering, slightly cinematic colour",
  "9": "a dominant 7th with extra grit — funk and blues staple",
  maj9: "even lusher than maj7, the sound of neo-soul",
  m9: "silky and sophisticated, huge in R&B",
  "6/9": "rich and resolved, a favourite ending chord",
};

/** Typical usage context per chord suffix. */
export const USAGE: Record<string, string> = {
  "": "It works as the I, IV or V chord of a major key and appears in virtually every pop, folk and rock song ever written.",
  m: "It usually sits as the vi, ii or iii chord of a major key, or as the tonic of its own minor key.",
  "5": "Used almost exclusively with distortion in rock, punk and metal riffs where full triads would sound muddy.",
  sus2: "Used as a decoration of the major or minor chord — strum it and resolve to the plain triad.",
  sus4: "Classic suspension before a major chord; extremely common in gospel, worship and 70s rock.",
  dim: "Bridges two diatonic chords a tone apart, or acts as the vii° leading back to the tonic.",
  aug: "A chromatic connector, typically between I and IV or before the vi chord.",
  "6": "Ends verses in jazz standards, rockabilly and doo-wop instead of a plain major.",
  m6: "Appears as a minor tonic in bossa nova and as a substitute for a iv chord.",
  maj7: "The I or IV chord in jazz, bossa nova, soul and lo-fi — anywhere you want warmth instead of brightness.",
  m7: "The ii chord in a jazz ii–V–I, and the standard flavour for minor chords in funk and soul.",
  "7": "The V chord that resolves to the tonic, and the entire vocabulary of blues.",
  m7b5: "The ii chord of a minor ii–V–i progression in jazz.",
  dim7: "A pivot chord: any of its notes can act as the root, so it modulates anywhere.",
  add9: "Adds movement to strummed major chords in pop, indie and acoustic ballads.",
  madd9: "Used for tension in film scores, ambient and alternative rock.",
  "9": "The funk chord — think James Brown stabs and blues turnarounds.",
  maj9: "Neo-soul and R&B tonic chord, often over a static bass.",
  m9: "Smooth R&B and house voicings, usually as the ii or the minor tonic.",
  "6/9": "A final chord in jazz and bossa nova where maj7 feels too sharp.",
};

const MAJOR_DEGREE_OFFSETS = [0, 2, 4, 5, 7, 9, 11];
const MAJOR_DEGREE_SUFFIXES = ["", "m", "m", "", "", "m", "dim"];
const MINOR_DEGREE_OFFSETS = [0, 2, 3, 5, 7, 8, 10];
const MINOR_DEGREE_SUFFIXES = ["m", "dim", "", "m", "m", "", ""];

export interface DiatonicChord {
  rootPc: number;
  suffix: string;
  degree: string;
  name: string;
}

export function diatonicChords(keyPc: number, minor = false): DiatonicChord[] {
  const offsets = minor ? MINOR_DEGREE_OFFSETS : MAJOR_DEGREE_OFFSETS;
  const suffixes = minor ? MINOR_DEGREE_SUFFIXES : MAJOR_DEGREE_SUFFIXES;
  const degrees = minor
    ? ["i", "ii°", "III", "iv", "v", "VI", "VII"]
    : ["I", "ii", "iii", "IV", "V", "vi", "vii°"];
  return offsets.map((o, i) => {
    const rootPc = (keyPc + o) % 12;
    return {
      rootPc,
      suffix: suffixes[i],
      degree: degrees[i],
      name: `${noteName(rootPc)}${suffixes[i]}`,
    };
  });
}

/** Three well-known progressions that feature the given chord. */
export function commonProgressions(
  rootPc: number,
  suffix: string,
): { name: string; chords: string[]; note: string }[] {
  const n = (semis: number, suf = "") => `${noteName((rootPc + semis + 12) % 12)}${suf}`;
  const isMinorish = suffix.startsWith("m") && !suffix.startsWith("maj");

  if (isMinorish) {
    // Treat the chord as the vi of a major key (root + 3 semitones = relative major)
    const rel = 3;
    return [
      {
        name: "The 'axis' progression (vi–IV–I–V)",
        chords: [n(0, suffix), n(rel + 5), n(rel), n(rel + 7)],
        note: `Here ${n(0, suffix)} is the vi chord of ${n(rel)} major — the most common loop in modern pop.`,
      },
      {
        name: "Minor ii–V–i",
        chords: [n(2, "m7b5"), n(7, "7"), n(0, suffix)],
        note: `${n(0, suffix)} acts as the tonic and the chord everything resolves to.`,
      },
      {
        name: "I–V–vi–IV",
        chords: [n(rel), n(rel + 7), n(0, suffix), n(rel + 5)],
        note: `${n(0, suffix)} is the emotional turn in the middle of the loop.`,
      },
    ];
  }

  if (suffix === "7" || suffix === "9") {
    return [
      {
        name: "12-bar blues (I7–IV7–V7)",
        chords: [n(0, "7"), n(5, "7"), n(7, "7"), n(0, "7")],
        note: `${n(0, suffix)} works as the I chord of a blues in ${n(0)}.`,
      },
      {
        name: "ii–V–I in " + n(5),
        chords: [n(7, "m7"), n(0, suffix), n(5, "maj7")],
        note: `As a dominant, ${n(0, suffix)} pulls strongly to ${n(5)}.`,
      },
      {
        name: "Turnaround",
        chords: [n(5), n(0, suffix), n(5)],
        note: "A classic way to end a blues or soul chorus and loop back.",
      },
    ];
  }

  if (suffix === "m7b5" || suffix === "dim" || suffix === "dim7") {
    return [
      {
        name: "Minor ii–V–i",
        chords: [n(0, suffix), n(5, "7"), n(10, "m")],
        note: `${n(0, suffix)} is the ii chord leading into a minor tonic.`,
      },
      {
        name: "Chromatic passing chord",
        chords: [n(-1), n(0, suffix), n(1, "m")],
        note: "Slid between two diatonic chords a tone apart to smooth the movement.",
      },
      {
        name: "vii° resolution",
        chords: [n(0, suffix), n(1)],
        note: `Resolves upward by a semitone into ${n(1)}.`,
      },
    ];
  }

  // Major-family default
  return [
    {
      name: "I–V–vi–IV",
      chords: [n(0, suffix), n(7), n(9, "m"), n(5)],
      note: `With ${n(0, suffix)} as the tonic, this is the classic four-chord pop loop.`,
    },
    {
      name: "ii–V–I",
      chords: [n(2, "m7"), n(7, "7"), n(0, suffix)],
      note: `${n(0, suffix)} is the resting point everything resolves to.`,
    },
    {
      name: "I–IV–V",
      chords: [n(0, suffix), n(5), n(7)],
      note: "The three-chord backbone of folk, country and early rock and roll.",
    },
  ];
}

/** Suggests the next chords for a progression, based on the detected key. */
export interface Suggestion {
  rootPc: number;
  suffix: string;
  name: string;
  reason: string;
}

export function detectKey(
  chords: { rootPc: number; suffix: string }[],
): { keyPc: number; minor: boolean } | null {
  if (chords.length === 0) return null;
  let best: { keyPc: number; minor: boolean; score: number } | null = null;
  for (let keyPc = 0; keyPc < 12; keyPc++) {
    for (const minor of [false, true]) {
      const set = diatonicChords(keyPc, minor);
      let score = 0;
      for (const c of chords) {
        const match = set.find(
          (d) =>
            d.rootPc === c.rootPc &&
            (d.suffix === simplify(c.suffix) || d.suffix === "" || simplify(c.suffix) === ""),
        );
        const strict = set.find(
          (d) => d.rootPc === c.rootPc && d.suffix === simplify(c.suffix),
        );
        if (strict) score += 2;
        else if (match) score += 1;
      }
      // Favour keys where the first chord is the tonic
      if (chords[0].rootPc === keyPc) score += 1;
      if (!best || score > best.score) best = { keyPc, minor, score };
    }
  }
  return best && best.score > 0 ? { keyPc: best.keyPc, minor: best.minor } : null;
}

function simplify(suffix: string): string {
  if (suffix === "" || suffix === "maj7" || suffix === "6" || suffix === "add9" || suffix === "maj9" || suffix === "sus2" || suffix === "sus4" || suffix === "5" || suffix === "6/9")
    return "";
  if (suffix.startsWith("m") && !suffix.startsWith("maj")) return suffix === "m7b5" ? "dim" : "m";
  if (suffix.startsWith("dim")) return "dim";
  if (suffix === "7" || suffix === "9" || suffix === "13" || suffix === "11") return "";
  return "";
}

export function suggestNextChords(
  chords: { rootPc: number; suffix: string }[],
  limit = 4,
): Suggestion[] {
  const key = detectKey(chords) ?? { keyPc: chords[0]?.rootPc ?? 0, minor: false };
  const set = diatonicChords(key.keyPc, key.minor);
  const last = chords[chords.length - 1];

  const order = key.minor
    ? [0, 5, 3, 6, 4, 2, 1] // i, VI, iv, VII, v, III, ii°
    : [4, 5, 3, 0, 1, 2, 6]; // V, vi, IV, I, ii, iii, vii°

  const lastDegree = last
    ? set.findIndex((d) => d.rootPc === last.rootPc)
    : -1;

  const moves: Record<number, number[]> = key.minor
    ? { 0: [5, 3, 6], 5: [6, 3, 4], 3: [0, 4, 6], 6: [0, 2], 4: [0, 5], 2: [5, 6], 1: [4, 0] }
    : { 0: [4, 5, 3], 4: [0, 5], 5: [3, 1, 4], 3: [0, 4], 1: [4, 0], 2: [5, 3], 6: [0] };

  const preferred =
    lastDegree >= 0 && moves[lastDegree] ? moves[lastDegree] : order;
  const ranked = [...preferred, ...order].filter(
    (v, i, a) => a.indexOf(v) === i,
  );

  const reasons: Record<string, string> = {
    I: "home — resolves the phrase",
    ii: "sets up the V chord",
    iii: "a softer substitute for the tonic",
    IV: "lifts away from home",
    V: "strong pull back to the tonic",
    vi: "the emotional relative minor",
    "vii°": "tension that resolves up to the tonic",
    i: "home — resolves the phrase",
    "ii°": "tension leading to the v chord",
    III: "the bright relative major",
    iv: "deepens the minor mood",
    v: "leads back to the tonic",
    VI: "warm, open lift",
    VII: "rock-flavoured step below the tonic",
  };

  return ranked
    .slice(0, limit)
    .map((idx) => {
      const d = set[idx];
      const suffix = enrich(d.suffix);
      return {
        rootPc: d.rootPc,
        suffix,
        name: `${noteName(d.rootPc)}${suffix}`,
        reason: `${d.degree} of ${noteName(key.keyPc)}${key.minor ? " minor" : " major"} — ${reasons[d.degree] ?? "diatonic"}`,
      };
    })
    .filter((s) => CHORD_DEFS.some((d) => d.suffix === s.suffix));
}

function enrich(suffix: string): string {
  return suffix === "dim" ? "dim" : suffix;
}

export function keyLabel(key: { keyPc: number; minor: boolean }): string {
  return `${noteName(key.keyPc)} ${key.minor ? "minor" : "major"}`;
}
