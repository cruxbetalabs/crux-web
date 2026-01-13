# Repository Guidelines

## Project Structure & Module Organization
- Next.js app router lives in `src/app` (`page.tsx`, `layout.tsx`, `globals.css`); single-page experience centers on pose reconstruction.
- Feature components in `src/components/pose-reconstruction` (upload, controls, 3D view) and shared UI primitives in `src/components/ui`.
- Hooks for animation/processing logic in `src/hooks`; shared helpers in `src/lib`.
- Static assets in `public`; Tailwind config in `postcss.config.mjs`; lint/format rules in `biome.json`.

## Build, Test, and Development Commands
- `npm run dev` — start the dev server (Turbopack).
- `npm run build` — production build; ensure this succeeds before releases.
- `npm run start` — serve the built app.
- `npm run lint` — Biome static analysis (style + simple lint checks).
- `npm run format` — auto-format with Biome. Run before commits to avoid churn.

## Coding Style & Naming Conventions
- TypeScript + React function components; mark client components with `'use client'` when they rely on hooks or browser APIs.
- Use 2-space indentation, single quotes in TSX/TS, and PascalCase for components, camelCase for hooks/variables, kebab-case for file names.
- Prefer Tailwind utility classes for styling; keep component props typed and avoid implicit `any`.
- Keep components focused; move reusable UI into `src/components/ui` and shared logic into hooks.

## Testing Guidelines
- No automated tests are present yet; add module-scoped tests alongside code (`<name>.test.tsx/ts`) or integration/UI tests if you introduce critical flows.
- At minimum, exercise new logic manually and note what you covered in the PR description; document any gaps.

## Commit & Pull Request Guidelines
- Commit messages are short and imperative (e.g., `Add pose smoothing controls`); group related changes together.
- Before opening a PR: run `npm run format` and `npm run lint`; note build/test status in the description.
- PRs should include a concise summary, linked issues/tasks, and screenshots or short clips for UI-visible changes.
- Call out risks, TODOs, or follow-ups explicitly to ease review.

## Security & Configuration Tips
- Do not commit secrets; prefer `.env.local` for machine-specific config and keep it gitignored.
- Validate external inputs in client code, and gate any future server-side additions behind proper validation and logging.
