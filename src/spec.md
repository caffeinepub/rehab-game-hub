# Specification

## Summary
**Goal:** Make wrong-answer feedback in Match Word to Image match the existing Choose Correct Image red X overlay style, and auto-clear so users can retry indefinitely.

**Planned changes:**
- In MatchWordToImageGame, when an incorrect option is selected, render a semi-transparent red overlay with a large centered red X icon covering only the selected option block.
- Automatically clear the incorrect overlay after a short delay (~800ms) and return the option states to idle so all options are clickable again.
- Keep correct-answer behavior unchanged (correct feedback and ability to proceed to the next question).

**User-visible outcome:** When a user taps a wrong option in Match Word to Image, that specific option briefly shows the same red X overlay style as Choose Correct Image, then resets automatically so the user can immediately try again without pressing Next.
