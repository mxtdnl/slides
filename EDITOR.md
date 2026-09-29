# EDITOR.md

What Claude Code does when the user supplies an edited copy of a deck: "here's the updated file", "I've updated the telegraphing deck", or a deck file given without further instruction. The copy usually comes from `tools/deck-editor.html`, which changes text only, but it may also have been edited by hand.

The job is to replace the old version of the deck with the new one, safely: confirm what changed, check it against the repository rules, swap the file, run the tests, commit and report. The user wrote the new text. Never reword it without asking.

---

## 1. Find the incoming file

The file can arrive in several ways. Check in this order:

1. **A path in the message**, or a file attached to it. Use that file.
2. **Already saved in place.** The editor saves straight back to the file it opened, so in a local clone the deck may already be modified in the working tree. `git status` shows it. There is nothing to copy: go to step 3 and compare against `HEAD` instead of against a second file.
3. **A copy inside the repository under another name**, typically a browser download such as `standalone/2026-09-telegraphing (1).html` or a deck file at the repository root. `git status --porcelain` lists untracked `.html` files.
4. **Pasted content.** Write it to a scratch file first. If it does not end with `</html>`, it was cut off: stop and ask for the file instead.

If none of these gives a file, ask for it. Never reconstruct a deck from memory or from the conversation.

## 2. Identify the target deck

Strip browser suffixes from the file name (` (1)`, `-1`, ` copy`) and match it to a deck under `courses/` or `standalone/`. Then confirm the match:

- the same slide ids in the same order:
  `grep -o '<section class="slide[^"]*" id="[^"]*"' <file>`
- the same `DECK_ID` or storage key, where the deck has one.

If no single deck matches, list the candidates and ask.

## 3. Compare the two versions

Bring the working branch up to date first, following the session's git instructions, so the comparison is against the current version of the deck.

```sh
git diff --no-index --word-diff <target> <incoming>
```

Classify every change. **Allowed** changes are the ones the editor makes:

- text between tags inside a `<section class="slide">`, including speaker notes (`aside.notes`)
- `placeholder` attribute values on inputs inside slides
- the `<title>` text
- string values in the constants at the top of the script (`ACTIVITIES`, `MAP` and similar), except under the logic keys the editor never offers: `pattern`, `color`, `colour`, `ink`, `on`, `kind`, `type`, `id`, `key`, `bin`, `target`, `accent`, `mode`, `variant` (kept in step with `LOGIC_KEYS` in `tools/deck-editor.html`)

**Anything else stops the replacement:** markup, attributes, classes, CSS, script logic, `ACTIVITIES` keys or structure, booleans such as `correct`, numbers such as `minutes`, and slides added, removed or reordered. Report what you found and ask before going further. There are two usual causes:

- **Edited by hand.** Ask whether each change is intended. If it is, it goes through the normal workflow in `CLAUDE.md`, including the harnesses.
- **An old copy.** The user edited a version taken before later commits, so replacing the file would silently undo them. Check with `git log --oneline -- <target>` and `git show <commit>:<target> | diff - <incoming>`, and find the commit the copy most closely matches. If this is the cause, do not replace the file. Offer to apply only the user's text changes to the current version, one edit at a time, and show the result.

If there are no differences at all, say so and stop.

## 4. Check the new text

Report problems. Do not fix the user's wording yourself. The only changes you make without asking are mechanical ones that the tests require, such as a curly quote inside `<script>` becoming a straight quote. Report each one.

Check against:

- **Word budgets** (`SLIDES.md` section 3): speaker notes 120 words, statement 20, card body 25 per card, exposition body 70, case vignette 120.
- **The context file.** For a course deck, read `COURSE.md`; for a standalone deck, read its `.brief.md`. Check terms to prefer or avoid, facts that must not be used, phase constraints, and approved sources. New text that cites a source not on the approved list is flagged: ask whether to add the source to the context file.
- **UK English** (`CLAUDE.md` convention 10). Flag US spellings.
- **Scoring** (`CLAUDE.md` convention 8). If the wording of a single-select question or its options changed, check that the option marked `correct` is still the one defensible answer. If it may not be, ask.
- **`PLACEHOLDER:` strings.** Count them before and after, and list the ones the edit resolved and the ones that remain.
- **Stored responses.** Tallies, confidence counts, live-board tags and similar responses are saved by position under the key `slides:<collection>:<deck-file-stem>:v<N>`. If the wording of an option, claim or tag in such an activity changed its meaning, responses already recorded would attach to the new wording. Ask whether to raise `v<N>` by one. Remind the user to export any responses they need before the new version is used.
- **Text repeated elsewhere.** Some text appears in more than one place. Ask before changing the other copy:
  - the deck title, against the deck's card in `index.html` and its line in the Files section of `CLAUDE.md`
  - the outcomes slide, against the close slide, which restates the outcomes
  - `MAP` part names, against the section-divider slides
  - exit-ticket prompts, which print on the exit-ticket cards (they come from the same strings, so no second edit is needed)

## 5. Replace the old version

```sh
cp <incoming> <target>
```

- Keep the target's path and file name. The name is part of the storage key and of the links in `index.html`.
- If the incoming copy sits inside the repository under another name, delete it. Otherwise lint flags an unlisted deck. Never delete files outside the repository.
- Keep the target's line endings. If the incoming copy has CRLF and the target had LF, convert it: `sed -i 's/\r$//' <target>`.
- `git status` should now show only the target deck changed, plus any follow-on changes the user agreed to.

## 6. Verify

```sh
node tests/lint.mjs
node tests/verify-deck.mjs <target> --shots <scratch-dir>
```

Longer text is the usual cause of failures. For each fit failure, give the slide number, its id, the state and the overflow. Then offer these options, and ask which one to take:

- shorten the text: suggest a wording, but let the user choose
- set the slide's body in `.small` (`SLIDES.md` section 3)
- split the slide, which is a structural change

Look at the screenshots of every changed slide. Do not commit a deck that fails a harness unless the user says to.

## 7. Commit and report

Commit on the session's working branch with the message `Update text in <deck file>`. The body lists the changed slides by number and id. Push. Do not open a pull request unless asked.

Report:

- the slides changed and what changed on each, in one line per slide
- lint and harness results
- everything flagged in step 4 that still needs an answer
- `PLACEHOLDER:` strings resolved and remaining
- any follow-on changes made, or proposed and awaiting approval

---

## What the editor cannot do

`tools/deck-editor.html` changes words only. Everything else is a request for Claude Code through the normal workflow in `CLAUDE.md`:

- adding, deleting or reordering slides
- changing accents, archetypes, layout or decorative shapes
- changing activity structure: adding an option, changing which answer is correct, changing timer minutes
- changing text that the deck's code generates as it runs, rather than text stored in the markup or in `ACTIVITIES`

When a request like this arrives with an edited file, handle the text changes by this file and the rest by the workflow, as separate steps.
