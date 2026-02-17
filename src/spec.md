# Specification

## Summary
**Goal:** Ensure the predefined game “Match Word to Image” is always present in the backend catalog and reliably appears as a playable game card on Home.

**Planned changes:**
- Seed the backend game catalog on canister initialization and after upgrades to guarantee the predefined game with id `match-word-to-image` exists and is returned by `getAllGames()`.
- Fix the Home page flow so the “Match Word to Image” game returned by `getAllGames()` renders as a thumbnail card in the Home grid and opens the existing route `/games/match-word-to-image` when clicked.

**User-visible outcome:** The Home page consistently shows a playable “Match Word to Image” thumbnail card (including after fresh deploys and upgrades), and selecting it launches the existing game experience.
