# BrainBloom

## Current State
The Game Manager lets admins create and edit questions for all three games (Choose The Word, Choose The Image, Find The Item), but there is no way to delete a question. The backend has no delete endpoints for any question type. The question list components (MatchWordToImageQuestionList, ChooseCorrectImageQuestionList, FindTheItemQuestionList) only have Edit buttons. A ConfirmDeleteDialog component exists but is currently only used for game deletion (which itself is a stub).

## Requested Changes (Diff)

### Add
- `deleteQuestion(gameId, questionId)` function in `main.mo` for MatchWordToImage questions
- `deleteChooseCorrectImageQuestion(gameId, questionId)` function in `main.mo`
- `deleteFindTheItemQuestion(gameId, questionId)` function in `main.mo`
- `useDeleteQuestion`, `useDeleteChooseCorrectImageQuestion`, `useDeleteFindTheItemQuestion` mutation hooks in `useQueries.ts`
- Delete button (trash icon) on each question card in all three question list components
- Confirmation dialog before deleting (reuse existing ConfirmDeleteDialog or a question-specific variant)

### Modify
- `MatchWordToImageQuestionList` — add `onDelete` prop and a delete button per card
- `ChooseCorrectImageQuestionList` — add `onDelete` prop and a delete button per card
- `FindTheItemQuestionList` — add `onDelete` prop and a delete button per card
- `GameManagerPage` — wire up delete handlers and confirmation dialog state for all three question types
- `backend.d.ts` — add the three delete function signatures

### Remove
- Nothing removed

## Implementation Plan
1. Add three delete functions to `main.mo` (filter out the matching question ID from the list)
2. Update `backend.d.ts` with the three delete method signatures
3. Add three delete mutation hooks to `useQueries.ts`
4. Update all three question list components to accept and show a delete button
5. Update `GameManagerPage` to hold delete confirmation state and wire up all three delete flows
