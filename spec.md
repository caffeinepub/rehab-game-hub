# Rehab Game Hub

## Current State

The app has two predefined games: Match Word to Image and Choose Correct Image. Both have question lists rendered in the Game Manager. Questions can be created via editor dialogs but cannot be edited after creation. The backend has `createQuestion` and `createChooseCorrectImageQuestion` but no update methods. The frontend question list components display questions as read-only cards.

## Requested Changes (Diff)

### Add
- Backend: `updateQuestion(gameId, questionId, image, options, correctOption)` method for MatchWordToImage questions
- Backend: `updateChooseCorrectImageQuestion(gameId, questionId, word, images, correctImageIndex)` method for ChooseCorrectImage questions
- Frontend: Edit button on each question card in MatchWordToImageQuestionList
- Frontend: Edit button on each question card in ChooseCorrectImageQuestionList
- Frontend: Edit dialog for MatchWordToImage that pre-fills all existing fields (image, 3 words, correct word); allows replacing the image or keeping the existing one
- Frontend: Edit dialog for ChooseCorrectImage that pre-fills all fields (word, images, correct index); allows adding/removing images and changing correct selection
- Frontend: `useUpdateQuestion` and `useUpdateChooseCorrectImageQuestion` hooks in useQueries.ts
- GameManagerPage: Wire edit state — track which question is being edited and open the correct dialog

### Modify
- MatchWordToImageQuestionList: Accept an `onEdit` callback and render an edit button per card
- ChooseCorrectImageQuestionList: Accept an `onEdit` callback and render an edit button per card
- MatchWordToImageQuestionEditorDialog: Support both create and edit mode; when in edit mode, pre-fill fields and call update instead of create
- ChooseCorrectImageQuestionEditorDialog: Support both create and edit mode; when in edit mode, pre-fill fields and call update instead of create
- GameManagerPage: Pass edit handlers to list components and dialogs

### Remove
- Nothing removed

## Implementation Plan

1. Add `updateQuestion` and `updateChooseCorrectImageQuestion` to `main.mo`
2. Add `useUpdateQuestion` and `useUpdateChooseCorrectImageQuestion` hooks in `useQueries.ts`
3. Update `MatchWordToImageQuestionEditorDialog` to accept an optional `initialQuestion` prop; when present, switch to edit mode (pre-fill fields, call update mutation)
4. Update `ChooseCorrectImageQuestionEditorDialog` similarly with optional `initialQuestion` prop
5. Update `MatchWordToImageQuestionList` to accept `onEdit(question)` and show an Edit button per card
6. Update `ChooseCorrectImageQuestionList` to accept `onEdit(question)` and show an Edit button per card
7. Update `GameManagerPage` to hold `editingMatchWordQuestion` and `editingChooseImageQuestion` state, pass them through to dialogs, and wire edit callbacks from lists
