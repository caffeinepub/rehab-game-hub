# Specification

## Summary
**Goal:** Make predefined playable games reliably appear on the Home screen as selectable thumbnail cards and start immediately when selected.

**Planned changes:**
- Automatically seed the backend game catalog so `getAllGames()` returns the predefined games on fresh install and after upgrades (re-seeding if missing), using stable game IDs (e.g., `match-word-to-image`, `choose-correct-image`).
- Update the frontend Home page to render available games as a grid of thumbnail cards and navigate to `/games/$gameId` on selection to launch the game immediately.
- Ensure seeded games launched from Home do not hit “Game not found” due to missing backend entries.

**User-visible outcome:** On opening the app, users see playable game thumbnails on the Home screen and can tap a game to start it right away.
