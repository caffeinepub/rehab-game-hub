# Rehab Game Hub

## Current State
The backend (`main.mo`) uses heap-allocated `Map.empty()` and `List.empty()` for all data storage — `persistentGames`, `persistentQuestions`, `persistentChooseCorrectImageQuestions`, and `_nextQuestionId`. These are **not stable**, meaning all data is wiped on every canister upgrade/redeployment.

## Requested Changes (Diff)

### Add
- Stable backing arrays for all game and question data so data survives redeployments.
- Migration/restore logic on `preupgrade`/`postupgrade` hooks to serialize/deserialize data between stable arrays and working Maps/Lists.

### Modify
- Convert `persistentGames` to use a stable array as the source of truth, rebuilt into a Map on `postupgrade`.
- Convert `persistentQuestions` (MatchWordToImage) to use a stable array, rebuilt on `postupgrade`.
- Convert `persistentChooseCorrectImageQuestions` to use a stable array, rebuilt on `postupgrade`.
- Convert `_nextQuestionId` to a `stable var`.

### Remove
- Nothing removed functionally — all existing methods remain unchanged.

## Implementation Plan
1. Add `stable var _stableGames : [(GameId, Game)] = []`
2. Add `stable var _stableQuestions : [(GameId, [MatchWordToImageQuestion])] = []`
3. Add `stable var _stableChooseCorrectImageQuestions : [(GameId, [ChooseCorrectImageQuestion])] = []`
4. Change `var _nextQuestionId = 0` to `stable var _nextQuestionId = 0`
5. Add `system func preupgrade()` that serializes all Maps/Lists into the stable arrays
6. Add `system func postupgrade()` that restores all Maps/Lists from the stable arrays and clears stable arrays
