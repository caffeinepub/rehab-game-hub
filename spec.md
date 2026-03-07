# Rehab Game Hub

## Current State

Two predefined games exist:
1. **Match Word to Image** — shows an image, player picks the correct word from 3 inline options
2. **Choose Correct Image** — shows a word, player picks the correct image from multiple image options

Both games currently enforce a hard minimum of exactly 3 options/images:
- Backend `createQuestion` traps if `options.size() != 3`
- Backend `createChooseCorrectImageQuestion` traps if `images.size() != 3`
- Frontend editor dialogs enforce "exactly 3" in validation
- Frontend game components initialize option states with a hardcoded array of 3

## Requested Changes (Diff)

### Add
- Nothing new to add

### Modify
- **Backend `createQuestion`**: Change validation from `options.size() != 3` to `options.size() < 2` (minimum 2, no enforced maximum)
- **Backend `createChooseCorrectImageQuestion`**: Change validation from `images.size() != 3` to `images.size() < 2` (minimum 2, no enforced maximum)
- **MatchWordToImageQuestionEditorDialog**: Make Option 3 optional; allow saving with 2 filled options; update label from "exactly 3" to "2 to 3 options"; update radio group to only show filled options; update validation error message
- **ChooseCorrectImageQuestionEditorDialog**: Remove the 3-image cap in create mode; allow saving with as few as 2 images; update label and helper text from "exactly 3" to "minimum 2"; update validation error message
- **MatchWordToImageGame**: Initialize `optionStates` dynamically based on actual number of options instead of hardcoded `["idle","idle","idle"]`; same for `advanceToNext` reset

### Remove
- Nothing to remove

## Implementation Plan

1. Regenerate backend Motoko with relaxed minimum (2) for both `createQuestion` and `createChooseCorrectImageQuestion`
2. Update `MatchWordToImageQuestionEditorDialog`:
   - Make option 3 input not `required`; update label to "2–3 word options"
   - Change validation: allow 2 or 3 non-empty options (filter non-empty, check >= 2)
   - Radio group only renders options that have text
3. Update `ChooseCorrectImageQuestionEditorDialog`:
   - Remove 3-image cap in create mode (allow more than 3)
   - Change validation: require >= 2 images in both create and edit modes
   - Update description text to say "minimum 2 images"
4. Update `MatchWordToImageGame`:
   - Replace all hardcoded `["idle","idle","idle"]` with `Array(currentQuestion.options.length).fill("idle")`
   - Ensure `advanceToNext` reset also uses dynamic length
