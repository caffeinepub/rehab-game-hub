# BrainBloom

## Current State
- GameLaunchPage fetches questions and passes the full list to MatchWordToImageGame or ChooseCorrectImageGame.
- Both game components receive a `questions` prop and always play all questions.
- No pre-game configuration exists; the game starts immediately on page load once questions are fetched.

## Requested Changes (Diff)

### Add
- A `GameConfigScreen` component that appears between the loading stage and the game start.
- The config screen shows the game name, total available questions, and a slider to choose how many questions to play.
- The slider range is from 1 (or a smart minimum) up to the total count, with smart step increments so it doesn't go 1-by-1 on large sets. The final position is always "All" (the total).
- The selected count is displayed clearly (e.g. "10 questions" or "All 15 questions").
- A "Start Game" button launches the game with the selected question count.
- If questions available < selected count, just play all available (already handled by capping at total).

### Modify
- `GameLaunchPage`: After questions load, show `GameConfigScreen` instead of immediately launching the game. On confirm, slice/limit the questions array to the chosen count and pass it to the game component.
- Both game components: No internal changes needed; they already accept a `questions` prop and play exactly what is passed.

### Remove
- Nothing removed.

## Implementation Plan
1. Create `src/frontend/src/components/GameConfigScreen.tsx` with slider + Start Game button.
2. Add state to `GameLaunchPage`: `configDone: boolean` and `questionLimit: number`.
3. When questions are loaded and `configDone` is false, render `GameConfigScreen`.
4. On confirm, set `configDone = true` and slice questions to `questionLimit` before passing to game component.
5. Smart step calculation: for N total questions, produce ~5-6 steps (e.g. 25%, 50%, 75%, 100%) mapped to actual question counts, always including 1 and N.
