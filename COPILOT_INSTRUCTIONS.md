# GitHub Copilot — Usage & Best Practices for this Repository

This document explains how to use GitHub Copilot effectively with this repository. It covers recommended prompts, templates, safety/security notes, review workflow, and troubleshooting tips so Copilot suggestions are predictable, high-quality, and safe.

---

## Goal
Make Copilot a helpful, consistent coding assistant:
- Accelerate development by suggesting idiomatic code, tests, and docs.
- Preserve code quality and security by treating suggestions as drafts that require review.
- Encourage reproducible, well-tested contributions.

---

## Quick Start
1. Open the file you want to work on.
2. Start typing a descriptive function/comment or a TODO-like prompt.
3. Review each Copilot suggestion before accepting — treat it as a first-draft.
4. Add or update unit tests for any non-trivial logic Copilot generates.

Example minimal prompt:
```gihcopilot/COPILOT_INSTRUCTIONS.md#L1-20
# Prompt: Implement a function that validates an email address
# Describe constraints: return boolean, no external libs.
```

---

## Recommended Prompt Patterns
- "Implement: <short description>. Inputs: <types>. Output: <type>. Constraints: <constraints>."
- "Create tests for: <function name> — cover edge cases X, Y, Z."
- "Refactor this into smaller functions and keep behavior identical: <paste snippet>."

Example prompt to create tests:
```gihcopilot/COPILOT_INSTRUCTIONS.md#L21-60
# Create tests for `parseUser`:
# - Should reject missing `email`
# - Should accept valid emails
# - Use project test helper `testHelpers.createUser`
```

---

## Code Review / Acceptance Criteria
- Read and understand every line Copilot inserts.
- Ensure suggestion adheres to repository patterns (naming, error handling, logging).
- Add/modify unit and integration tests to cover new code and edge cases.
- Check for performance implications and security (input validation, escaping).
- Avoid blind acceptance of long code blocks — stepwise acceptance is safer.

Suggested checklist before merging:
- Lint passes
- Unit tests added/updated and all pass
- No hard-coded secrets or credentials
- No new transitive dependencies without approval

---

## Security & Secrets
- Never accept suggestions that embed secrets (API keys, tokens, passwords).
- If Copilot suggests `.env` or config values with credentials, replace with placeholders and store secrets in the secure vault/environment.
- Validate input thoroughly for user-facing or network-exposed code.

---

## Commit Message & PR Description Templates
Use these to produce consistent history.

Commit message template:
```gihcopilot/COPILOT_INSTRUCTIONS.md#L61-95
feat(component): add <short description>

- What: One-line summary
- Why: Brief motivation
- Test: Which tests were added/updated
```

PR description template:
```gihcopilot/COPILOT_INSTRUCTIONS.md#L96-140
### Summary
What changed and why.

### Changes
- Bullet list of modifications.

### How to test
- Steps to reproduce / run tests

### Notes
- Any migration, config or compatibility notes
```

---

## Working with Tests
- Ask Copilot to generate tests alongside implementation.
- Prefer property-based or table-driven tests for edge cases.
- Ensure tests are deterministic.

Example test prompt:
```gihcopilot/COPILOT_INSTRUCTIONS.md#L141-180
# Generate unit tests for `normalizeDate(dateString)`:
# - locale edge cases
# - invalid input behavior
```

---

## Customization & Settings
- Configure Copilot settings in your editor for suggestion frequency and inline completions.
- Use file-scoped comments (e.g., `// Copilot: disable` or your editor equivalent) only when necessary and with a code comment explaining why.

---

## When Not to Use Copilot
- Cryptography, security-critical logic, or new auth flows.
- Subtle algorithmic correctness that requires formal proofs.
- Anything requiring regulatory compliance without human review.

---

## Troubleshooting & Tips
- If suggestions are off-style, add a short comment describing the repository conventions (naming, error types) before requesting code.
- Accept suggestions in small chunks and run tests frequently.
- If suggestions introduce flaky behavior, revert and ask Copilot for deterministic alternatives.

---

## Feedback Loop
- When Copilot gives a good suggestion, note what prompt you used so you can reuse it.
- For repeated poor suggestions, refine your prompt to be more specific about constraints and style.

---

## Etiquette
- Always credit Copilot in PR description when a substantial portion of code was generated, and describe how you audited and tested it.
- Treat Copilot output as a collaborator who needs review — not as an authority.

---

If you want, add repository-specific examples below (function signatures, common helpers) so Copilot can better match our patterns.

---

## Key Patterns

### UI elements

All buttons must be a pink color.