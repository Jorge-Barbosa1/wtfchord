## Mobile issue found

At 390px the topbar overflows: the tuning pill ("STANDARD (EADGBE)") visually collides with "Informations / History / Settings" and gets clipped behind them. Root cause: too many text actions in the right cluster + a long tuning label in the left cluster, all rendered inline on every breakpoint.

## Fix plan (UI only)

**`src/components/chord-detective/Topbar.tsx`**
1. On mobile (`< sm`), collapse the right cluster into a single icon button (☰) that opens a small dropdown containing: Informations, History, Left-handed toggle, Light theme toggle. On `sm+`, keep the current inline layout.
2. Shrink the tuning pill on mobile: hide the small "TUNING" label, keep only the value, and shorten Standard's label display (e.g. show "EADGBE" rather than "Standard (EADGBE)" under `sm`).
3. Remove the decorative status dot on mobile (keep on `sm+`) to free space.
4. Make the tuning dropdown panel width-capped to viewport (`max-w-[calc(100vw-2rem)]`) so it never overflows.

**`src/routes/index.tsx`** (tiny)
- Reduce the h1 from `text-2xl` to `text-xl` on mobile so the hero doesn't wrap to 3 lines, and tighten the `pt-6` to `pt-4` on mobile.

No business-logic / detection / tuning data changes.

## Next features — my recommendation

Both ideas you mentioned are great. Suggested order:

1. **Capo** (ship first — small, high value)
   - Add a Capo selector in the topbar (0–12).
   - In `detect.ts`, transpose detected pitch classes down by the capo offset before matching, and label results with both the "shape" name (what you're fingering) and the "sounding" name (what's heard). Display as `C (sounds D)` when capo > 0.
   - Visual: shade frets `< capo` on the fretboard and draw a capo bar across the capo fret.

2. **Play the chord** (real samples, not synth)
   - Use a small set of pre-recorded single-note samples per instrument (guitar, cavaquinho, ukulele) hosted as static assets, triggered with the Web Audio API. Strum = sequential note triggers with ~15 ms offset.
   - Add a ▶ button next to the detected chord in `ResultsPanel`.
   - Trade-off: hosting samples adds ~1–2 MB per instrument. Alternative: start with guitar-only and add others later.

3. Other quick wins worth considering after those:
   - **Reverse mode**: pick a chord name → see voicings on the current tuning.
   - **Share link**: encode tuning + strings into the URL so a voicing is shareable.
   - **Chord diagram export**: download the current voicing as a PNG.

If you approve, I'll implement the mobile fix now, and we can decide which feature to tackle next.
