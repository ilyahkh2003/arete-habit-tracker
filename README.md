# ARETE — ἀρετή

> *"We are what we repeatedly do. Excellence, then, is not an act, but a habit."*  
> — Aristotle, as paraphrased by Will Durant

A minimalist habit tracker inspired by ancient Greek philosophy and aesthetics. Built with vanilla JavaScript, no frameworks required.

## Features

- **Daily habit tracking** with visual progress indicators
- **Greek-themed domains** (Apollo, Athena, Dionysus, Hephaestus, Hermes)
- **Streak tracking** with Roman numeral formatting
- **30-day heatmap** visualization
- **Statistics dashboard** (ΚΛΕΟΣ view)
- **Data export/import** for backups
- **Keyboard shortcuts** for power users
- **Daily oracle quotes** from classical philosophy

## Usage

Open `index.html` in a browser. Data persists in localStorage.

### Keyboard Shortcuts

- `A` — Add new habit
- `1-9` — Toggle habits 1-9 on Today view
- `Esc` — Close modal

### Views

- **ἈΓΟΡΆ (Today)** — Complete today's habits
- **ἜΡΓΑ (Scrolls)** — Manage all habits
- **ΚΛΕΟΣ (Kleos)** — View statistics and heatmap

## Tech Stack

- Vanilla JavaScript
- CSS with custom properties
- Google Fonts (Cinzel, EB Garamond, IBM Plex Mono)
- Web Audio API for completion sounds

## Data Storage

Uses `localStorage` by default. Implements a storage adapter pattern for easy integration with other backends.

## License

Built by me during spring break. Use freely.
