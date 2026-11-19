# Agent Rules for CFP Updates

When updating CFP (Call for Papers) data in this repository, agents must follow these strict rules:

## 1. Past Editions Are Read-Only

**Never modify past editions.** An edition is considered "past" if:
- Its conference dates have already occurred, OR
- All its submission deadlines have passed

Only add or update current and future editions.

## 2. No Deadline Guessing or Shifting

- Never shift deadlines forward (no "+14 day" rolling or similar heuristics)
- Never guess or estimate deadlines
- Only use dates explicitly confirmed on the official conference CFP page
- If a deadline is not published yet, leave the field empty or mark as unverified

## 3. Never Delete or Replace Confirmed Data

- Don't delete confirmed dates, locations, or URLs
- Don't replace specific data with placeholders or empty strings
- Don't replace a specific CFP page URL with a generic conference homepage
- Keep existing verified data intact unless the official source shows it changed

## 4. No Cosmetic Changes

- Don't reword location strings (e.g., "Chicago, IL" → "Chicago, Illinois")
- Don't change Unicode escaping (keep literal characters like "Montréal", "Malmö")
- Don't reformat or reorder JSON keys
- **Formatting:** `cfp.json` uses 4-space indentation, `ensure_ascii=False`, and no trailing newline

## 5. No Duplicate Cycles

Don't add a submission cycle that duplicates an existing cycle in the same edition.

## 6. No Extra Files in Repository

- Never commit report files, logs, changelogs, or checklists (e.g., `cfp_changes.txt`, `venues_to_check.json`, `CHANGELOG.md`)
- Put update notes and changelogs in the PR description instead

## 7. PR Policy

- If nothing verified changed, don't open a PR
- Don't open a PR that only updates `last.updated`
- Never merge PRs — the repository owner handles all merges

## 8. Verification Required

Every change must be verifiable by visiting the official conference CFP page cited in the commit/PR.
