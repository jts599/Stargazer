# Repository Guidelines

## Project Structure & Module Organization

This repository contains a Vite React app for finding good stargazing nights. The app lives in `stargazer-react/`.

- `stargazer-react/src/main.tsx` and `src/App.tsx` are the entry points.
- `stargazer-react/src/components/` contains UI components, grouped by feature such as `Calendar/`, `Moon/`, `DateDisplay/`, and `sidebar/`.
- `stargazer-react/src/core/` contains data loading, date, scoring, helper, and interface logic.
- `stargazer-react/src/assets/` and `public/` hold static assets.
- `stargazer-react/src/test/` contains test/demo views, not an automated test suite.

## Build, Test, and Development Commands

Run commands from `stargazer-react/`.

```bash
npm install
npm run dev
npm run build
npm run lint
npm run preview
```

- `npm install` installs dependencies from `package-lock.json`.
- `npm run dev` starts the Vite development server.
- `npm run build` runs TypeScript project build checks and creates a production bundle.
- `npm run lint` runs ESLint across the project.
- `npm run preview` serves the production build locally.

## Coding Style & Naming Conventions

Use TypeScript and React function components. Name component files and exported components in PascalCase, for example `StargazerCalendar.tsx` or `MoonDisplay.tsx`. Keep shared calculation and loading logic in `src/core/`, and place feature CSS next to its component when that pattern already exists.

Follow `eslint.config.js`, including React Hooks rules and React Refresh export checks. Prefer explicit interfaces for shared data shapes in `src/core/interfaces.ts`. Keep comments focused on non-obvious calculation or data-loading behavior.

## Testing Guidelines

There is no configured automated test command yet. Before submitting changes, run:

```bash
npm run lint
npm run build
```

For changes to scoring, moon calculations, or date handling, add focused tests when introducing a test framework, or at minimum verify representative dates manually through the UI.

## Commit & Pull Request Guidelines

Recent commits use short, imperative summaries such as `Fix september bug` and `Make Calendar more compact`. Keep commits focused and use a concise subject line.

Pull requests should include a short description, testing performed, and screenshots or recordings for visible UI changes. Link related issues when available, and call out changes to scoring assumptions, data loading, or default location/timezone behavior.

## Security & Configuration Tips

Do not commit secrets, tokens, or machine-specific configuration. Keep generated build output such as `dist/` out of source control. Treat celestial data parsing changes carefully, since upstream changes can affect scoring.
