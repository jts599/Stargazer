# Stargazer

Stargazer is a Vite, React, and TypeScript web app for finding better nights to go stargazing. It combines sun or twilight timing, moonrise and moonset timing, and moon illumination data into a daily stargazing score.

The app currently defaults to Madison, Wisconsin coordinates and lets users adjust latitude, longitude, and timezone from the sidebar.

## Features

- Year-at-a-glance calendar with per-day stargazing scores.
- Selected-day details for sunrise, sunset, moonrise, moonset, moon illumination, and score.
- Moon phase visualization using local React/SVG components.
- Celestial timing and illumination data loaded from the U.S. Naval Observatory web calculators.

## Project Structure

```text
.
├── AGENTS.md
├── README.md
└── stargazer-react/
    ├── package.json
    ├── src/
    │   ├── App.tsx
    │   ├── components/
    │   └── core/
    └── vite.config.ts
```

Important directories:

- `stargazer-react/src/components/` contains the React UI, including the calendar, sidebar, date detail card, and moon graphics.
- `stargazer-react/src/core/` contains Navy data loading, parsing, date helpers, interfaces, and score calculation logic.
- `stargazer-react/src/test/` contains a manual demo/test view, not an automated test suite.

## Requirements

- Node.js compatible with Vite 6.
- npm.
- Network access to the U.S. Naval Observatory calculator pages when loading app data.

## Getting Started

Run commands from the React app directory:

```bash
cd stargazer-react
npm install
npm run dev
```

Vite will print a local development URL, usually `http://localhost:5173/`.

## Scripts

```bash
npm run dev
```

Starts the Vite development server.

```bash
npm run build
```

Runs TypeScript project checks and builds the production bundle.

```bash
npm run lint
```

Runs ESLint over the project.

```bash
npm run preview
```

Serves the production build locally after `npm run build`.

## Data Flow

1. `src/App.tsx` requests celestial data for the selected year and location.
2. `src/core/NavyDataLoader.ts` loads and parses Navy rise/set tables for sun or twilight and moon events.
3. `src/core/NavyIlluminationDataLoader.ts` loads moon illumination percentages.
4. `src/core/ScoreCalculation.ts` estimates moon presence after sunset and assigns daily scores.
5. UI components render calendar scores and selected-day details.

## Development Notes

- The app uses a fixed numeric timezone offset rather than a named IANA timezone.
- Score calculations depend on parsed Navy table formats, so data-loading changes should be verified with representative dates.
- There is no automated test suite yet. Before submitting changes, run:

```bash
npm run lint
npm run build
```

## Known Gaps

- No persisted user configuration.
- No automated tests.
- No offline cache for Navy data.
- Current scoring is an approximation and should be treated as an app-specific heuristic, not an astronomy model.
