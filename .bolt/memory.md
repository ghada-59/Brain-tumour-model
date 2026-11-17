# Project memory

## Product intent & audience

- Web dashboard application; project includes a set of "redesign files."

## Brand personality & voice

- Not yet inferred.

## Visual design & UX direction

- Frontend is a dashboard UI (specifics not yet inferred).

## Decisions, constraints & rationale

- Frontend app lives in `frontend/` subfolder, not at project root.
- Vite is used as the dev server and build tool.
- Added a root `package.json` that forwards `dev`, `build`, and `preview` scripts to the existing `frontend/` app — no new dependencies, no app changes.
- Rationale: Bolt's preview panel looks for a start script at project root; without a root entry point the panel showed "no preview available."
- Build verified clean through the root package file; no diagnostics errors.

## Open questions & assumptions

- May need to add a `host` setting to Vite config if the dev server must accept external connections (pending if preview still fails after restart).
- Whether the preview panel reliably starts after the root `package.json` fix is unconfirmed.