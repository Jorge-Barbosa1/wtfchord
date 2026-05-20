# Chord Detective

Chord Detective is a mobile-first chord identification app for guitarists. Tap notes on a virtual fretboard, mark strings as open or muted, and get an instant chord analysis with root, bass, intervals, notes, confidence, and alternative interpretations.

The app supports standard tuning, common alternate tunings, and 7-string guitars. Your history and favorites are persisted locally in the browser.

## Features

- Interactive virtual fretboard for fast chord input
- Support for standard, drop D, DADGAD, open G, and 7-string tuning
- Left-handed mode and light/dark theme toggle
- Chord detection with confidence scoring
- Alternative interpretations for ambiguous voicings and slash chords
- Root, bass, intervals, and unique note display
- Local history and favorites
- Keyboard shortcut: press `Enter` to identify the chord

## Tech Stack

- TanStack Start
- TanStack Router
- React 19
- TypeScript
- Vite
- Tailwind CSS 4
- Radix UI primitives
- Cloudflare Vite plugin / Wrangler-compatible deployment

## How It Works

The detector compares the notes you play against a set of chord definitions. It scores candidates based on:

- interval coverage
- missing chord tones
- extra notes outside the chord definition
- bass note alignment with the root

This gives a practical result for real-world voicings, including partial shapes and slash chords.

## Theory Behind The Results

Chord Detective is built around a few core theory concepts that help explain the output:

- Notes are the actual pitches sounding in the voicing, shown as unique pitch classes.
- The root is the note the chord is built from and defines the chord name, such as C, Am, or F#maj7.
- The bass is the lowest sounding note. If it differs from the root, the result is shown as a slash chord, such as C/E.
- Intervals measure the distance in semitones from the root to each chord tone, which is why labels like 1, b3, 5, b7, 9, and 11 appear in the result panel.
- Match percentage is a practical confidence score, not a strict music-theory grade. Strong matches usually mean the voicing covers most required intervals, avoids too many extra tones, and keeps important notes like the root or third present.

In short, the app is tuned for how guitarists actually play chords: partial voicings, dropped notes, extensions, and inversions are all expected.

## Getting Started

### Prerequisites

- Node.js 20+ or Bun

### Install

```bash
npm install
```

If you use Bun:

```bash
bun install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

### Lint

```bash
npm run lint
```

## Usage

1. Pick a tuning from the top bar.
2. Tap the fretboard to place fingered notes.
3. Tap the string control to cycle between open, muted, and unused.
4. Press `Identify Chord` or hit `Enter`.
5. Review the best result, alternatives, and save favorites if needed.

## Supported Tunings

- Standard (EADGBE)
- Drop D (DADGBE)
- DADGAD
- Open G (DGDGBD)
- 7-String (BEADGBE)

## Project Structure

- `src/routes` - app routes and page entry points
- `src/components/chord-detective` - UI for the fretboard, top bar, results, history, and info sheets
- `src/lib/music` - chord detection, notes, intervals, chords, and tuning data
- `src/hooks` - persisted browser state helpers

## Notes

- The app stores history, favorites, theme, handedness, and tuning choice locally.
- Chord detection is optimized for practical guitar voicings, not strict academic harmony alone.
- The interface is responsive and designed for quick use on desktop and mobile.

## License

Add your preferred license here before publishing the repository.