# WTFChord — Finish the three-front upgrade

## Current state (verified from the codebase)

**1. SEO on `/chord/$slug`**
- `src/lib/music/theory.ts` is already written: formulas, character/usage copy, diatonic chords, key detection, common progressions.
- `src/routes/chord.$slug.tsx` already has dynamic `head()` (title, description, OG, canonical, JSON-LD HowTo).
- `src/routes/sitemap[.]xml.ts` already lists every `/chord/$slug` and `/tuning/$id`.
- **Missing**: the theory content is not rendered on the chord page itself; the H1 does not mention the instrument; `MiniVoicing` diagrams have no `alt` text.

**2. Progressions retention**
- `src/lib/progressions.ts` already has localStorage load/save and `encodeProgressionParam`/`parseProgressionParam` for URL sharing.
- `src/lib/progressions.functions.ts` already has authenticated server functions (`listRemoteProgressions`, `syncProgressions`, `deleteRemoteProgression`) with a merge strategy.
- The `progressions` table exists with RLS and grants.
- **Missing**: the UI never calls the sync functions, never reads `?progression=` from the URL, and never shows `suggestNextChords()`.

**3. Pro clarity**
- `profiles.trial_started_at` exists and is protected by the privilege-escalation trigger.
- `useProStatus` does **not** yet read `trial_started_at`.
- **Missing**: `/pricing` page, "Upgrade to Pro" header CTA, visible-but-locked Pro badges with tooltips, and trial messaging in the paywall.

The user wants to **finish the upgrade**, with **Progressions sync & URL sharing first**, and **skip the Stripe trial** for now.

---

## Implementation plan

### Phase 1 — Progressions sync & URL sharing (ship first)

1. **Account sync on login**
   - In `src/routes/progressions.tsx`, add a `useEffect` that runs when `user` becomes available.
   - Call `listRemoteProgressions()`; merge with local `loadProgressions()` using the same rule as the server (newer `updatedAt` wins).
   - Push the merged list up with `syncProgressions()`, then save the merged result to localStorage.
   - Keep localStorage as the single source of truth for the UI; the server is just a backup/sync target.

2. **Share by URL**
   - Add a "Share" button in the progression editor that copies a URL like `/progressions?progression=Am-F-C-G&tuning=standard`.
   - On mount, read `progression` and `tuning` search params, parse with `parseProgressionParam`, and populate a new progression (auto-pick the first voicing for each chord via `findVoicings`).
   - If the user is logged in, offer to save the imported progression after they edit it.

3. **Next-chord suggestions**
   - After each chord is added, render a "What comes next?" row using `suggestNextChords(current.chords)`.
   - Tapping a suggestion adds that chord with its first available voicing.

4. **Accessibility**
   - Add descriptive `alt` text to every `MiniVoicing` in the progression page (e.g. "Fingering for C major, frets 0-3-2-0-1-0").

### Phase 2 — SEO chord pages

1. **Render theory content on `/chord/$slug`**
   - Import `FORMULAS`, `CHARACTER`, `USAGE`, and `commonProgressions` from `src/lib/music/theory.ts`.
   - Add sections below the voicings grid:
     - "Formula" (scale degrees).
     - "Sound and character" (1-2 sentences).
     - "Where it appears" (1-2 sentences).
     - "Common progressions" (2-3 cards with chord chips linking to their `/chord/$slug`).
   - Keep the existing H1 but add the instrument to the title/meta only: e.g. title becomes "C major guitar chord — notes, voicings and progressions — WTFChord".

2. **Alt text on diagrams**
   - Pass an `alt` prop to `MiniVoicing` on the chord page describing the tuning and fret positions.

3. **Verify sitemap/canonical**
   - Confirm `/sitemap.xml` and canonical links are unchanged and correct (they already are).

### Phase 3 — Pro clarity

1. **Create `/pricing`**
   - New route `src/routes/pricing.tsx` with:
     - Free vs Pro comparison table.
     - Pro features: ukulele, cavaquinho, mandolin, custom tuning, progression sync across devices, shareable URLs.
     - "Unlock Pro" button that links to `/login` (if anonymous) or Stripe checkout (if signed in), reusing `PaywallModal` logic.

2. **Header CTA**
   - Add an unobtrusive "Upgrade" pill in `Topbar.tsx` (desktop and mobile menu) that opens the paywall.
   - Hide it when the user is already Pro.

3. **Visible-but-locked Pro features**
   - In the tuning dropdown, keep the lock icon but add a tooltip on hover/focus: "Pro — unlocks ukulele, mandolin, cavaquinho and custom tunings".
   - In `ProgressionsPage`, show a "Sync across devices" row that is visible to free users but disabled with a "Pro" badge and tooltip.

4. **Paywall polish**
   - Update `PaywallModal` copy to list the concrete features being unlocked.
   - No trial flow (per user request); keep the one-time €4.99 checkout.

### Phase 4 — Verify

1. Run the build and check `/tmp/observability/build-errors.log`.
2. Test the progression URL share flow in the preview (create progression → copy URL → open in new tab).
3. Test login sync by signing in and confirming local progressions appear server-side.
4. Verify chord page meta tags and theory content with a few sample slugs (`/chord/c-major`, `/chord/a-minor-7`).

---

## Out of scope (per user request)

- Stripe 7-day trial implementation.
- Changes to the chord detection engine.
- New instruments or tunings.
- Audio playback.
- Export-to-image.
