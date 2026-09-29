# Lecture Slides

Projection decks for lectures and seminars across several courses. Every deck is a static, self-contained HTML file with inline CSS and JavaScript: no build step, no dependencies, no network calls. The repository is served through GitHub Pages and every deck must also work when opened directly from the file system.

Read this file for repository rules and the visual system. Read `SLIDES.md` before building or editing any deck: it covers the stage model, slide archetypes, activity patterns and verification. Before writing any content, read the deck's context file: the course's `COURSE.md` for a course deck, or the deck's `.brief.md` for a standalone deck.

---

## Repository structure

```
index.html                    Landing page: every course and every deck
CLAUDE.md                     This file
SLIDES.md                     Deck blueprint
tests/
  verify-deck.mjs             Fit, state, contrast and print harnesses (see SLIDES.md section 16)
  lint.mjs                    Static checks across every deck (see Testing)
courses/
  <course-slug>/
    COURSE.md                 Course context: read before writing content for this course
    w01-<topic>.html          One deck per session
    w06a-<topic>.html         Suffix a, b for two sessions in one week
reference/
  theory-of-change.html       Reference deck from a previous repository (see SLIDES.md, Reference implementations)
standalone/
  <YYYY-MM>-<slug>.html       A deck that belongs to no course (talk, workshop, guest lecture)
  <YYYY-MM>-<slug>.brief.md   Its context: read before writing content for it
tools/
  prompt-builder.html         Form that writes a Claude Code prompt to create a deck's context file and request its plan
```

- Course slugs are short, lower-case and hyphenated (`social-phenomena`, `research-methods`).
- Course deck file names start with a two-digit week number so they sort correctly. Standalone deck file names start with the year and month of first delivery.
- Nothing lives outside a single HTML file. No image folders, no shared CSS, no shared JS. Duplication across decks is the accepted cost of each deck being portable.
- `tests/` holds Node scripts only. If a harness does not exist yet, the first deck build creates it to the specification in `SLIDES.md` and lists it in the Files section below.
- **First build in an empty repository.** If `index.html` does not exist, create it before the first deck: a landing page in the visual system below, with a heading per course and a `STANDALONE` heading, each followed by a `.deck-grid` of cards. List it in the Files section.

## Files

- `CLAUDE.md` — Repository rules, visual system and workflow
- `SLIDES.md` — Deck blueprint: stage model, type scale, slide archetypes, activity patterns, contrast rules, verification and build order
- `reference/theory-of-change.html` — Reference implementation of the stage, navigation and the eight proven archetypes, carried over from a previous repository. Read-only: never edit it, link it from `index.html`, or copy its content
- `tools/prompt-builder.html` — Deck prompt builder: a form that writes the deck's `COURSE.md` or `.brief.md` from the templates above and a Claude Code prompt that creates it and asks for the deck plan. Follows the visual system and the technical conventions; not a deck, so it is not listed in `index.html` deck grids
- `index.html` — Landing page: a heading per course and a `STANDALONE` heading, each followed by a `.deck-grid` of deck cards
- `tests/lint.mjs` — Static checks across every `.html` file (see Testing)
- `tests/verify-deck.mjs` — Fit, state, keyboard, persistence, contrast and print harnesses for one deck (see `SLIDES.md` section 16)
- `standalone/2026-09-lagging-and-leading-indicators.brief.md` — Brief for the deck below
- `standalone/2026-09-lagging-and-leading-indicators.html` — Coaching 1 Workshop 2 (September 2026), undergraduate students at Hult, lagging and leading indicators applied to goal hierarchies; patterns: retrieval warm-up, claim tally, comparison-matrix row reveal, single-select with confidence check, select-detail, predict and reveal, spot the flaw, worked example, think pair share, live board, exit ticket
- `standalone/2026-09-telegraphing.brief.md` — Brief for the deck below
- `standalone/2026-09-telegraphing.html` — Coaching department meeting (September 2026), student development coaches, telegraphing direction and purpose to emerging adults; dark theme, interaction level none: no activity patterns (presenter row reveal on the comparison matrix only)
- `standalone/2026-10-pep-degree.brief.md` — Brief for the deck below
- `standalone/2026-10-pep-degree.html` — Recruitment talk (October 2026, date to be confirmed), prospective students, the Bachelor's in Psychology, Economics & Politics built from the PEP Course Guide (June 2026); interaction level light: two claim tallies by show of hands (hook and mid check), select-detail on the electives

Keep this list current. When adding a deck, add a line here in the form `courses/<slug>/<file>.html` — Course, week, topic, and the activity patterns it uses. Also add a card for it in `index.html` under its course heading, inside `.deck-grid`. When adding a course, add its `COURSE.md` here and a course heading in `index.html`. Standalone decks are listed as `standalone/<file>.html` — Occasion, audience, topic, activity patterns, and appear in `index.html` under a `STANDALONE` heading placed after the courses.

---

## Deck context

### Course decks

Decks carry course-specific content: frameworks, terminology, phase constraints, clients, approved sources. None of that belongs in this file or in `SLIDES.md`. It lives in `courses/<course-slug>/COURSE.md`.

**Before writing content for a course, read its `COURSE.md`.** If it does not exist, stop and ask for the course context rather than inferring it from existing decks or file names. Offer to create the file from the template below.

`COURSE.md` template:

```markdown
# <Course title>

## Identity
- Programme and level:
- Course code:
- Cohort size and room type:        (drives activity choice: 20 in a seminar room differs from 150 in a tiered hall)
- Session length:
- Accent colour for this course:    (one of --accent-1 to --accent-8; used on index.html and title slides)

## Arc
- Week-by-week topics:
- Phases and their constraints:     (for example, "weeks 4-7 explain only: no slide may prompt for interventions")

## Analytical spine
- Core frameworks and the exact terms to use for them:
- Concept-to-colour mapping, if any: (for example, eight concepts mapped to --accent-1 to --accent-8, used consistently in every deck)

## Sources
- Readings and sources approved for citation on slides:
- Facts or examples that must not be used:

## Voice
- Terminology to prefer or avoid:
- Anything else a deck for this course must or must not do:
```

When a course maps concepts to accent colours, that mapping overrides the default cycling rules in every deck for that course.

### Standalone decks

A deck that belongs to no course (a conference talk, a staff workshop, a guest lecture, an open day session) lives in `standalone/` and takes its context from a brief beside it: `standalone/<YYYY-MM>-<slug>.brief.md`. The same rule applies: if the brief does not exist, stop and ask for it, and offer to create it from this template.

```markdown
# <Deck title>

## Occasion
- Event, host and date:
- Format and length:                (for example, 45-minute talk plus 15 minutes of questions)
- Room and audience size:
- Accent colour for this deck:

## Audience
- Who they are:
- What they already know:            (replaces the course arc: sets the starting level)
- What they need to leave with:

## Interaction level
- full | light | none                (see SLIDES.md section 7.1)

## Content
- Frameworks and exact terms:
- Sources approved for citation on slides:
- Facts or examples that must not be used:

## Voice
- Register, terminology to prefer or avoid:
- Anything else the deck must or must not do:
```

A standalone deck never reads or inherits a course's `COURSE.md`, even when the topic overlaps. If material from a course is wanted, the brief says so explicitly.

**Moving a standalone deck into a course** changes its storage key. Export any stored responses first, move and rename the file, replace the brief with the course's `COURSE.md` context, and import the responses into the moved deck.

---

## Technical conventions

These are non-negotiable.

1. **One self-contained file per deck.** Inline CSS and JS. No frameworks, no CDN links, no web fonts, no network calls of any kind. It must work from `file://` and from GitHub Pages.
2. **`<meta charset="utf-8">`** is the first element in `<head>`.
3. **Straight quotes in JavaScript.** Strings use `'` or `"`, never Unicode curly quotes.
4. **Editable content is separated from logic.** Slide prose lives in the markup. Activity content (questions, options, feedback, bins, items, timer durations, group labels) lives in one `const ACTIVITIES = {...}` object at the top of the script, keyed by slide id and commented so a non-developer can edit it without touching logic.
5. **No invented facts.** Never invent study findings, statistics, citations, quotations, dates, or facts about real people, places or organisations. Use only what the instructor supplies or what the deck's context file lists as approved. Anything added as a stand-in is prefixed with the literal string `PLACEHOLDER:` and reported at the end of the build.
6. **Persistence where a deck captures responses.** Tallies, live-board entries and other room responses autosave to `localStorage` under the key `slides:<collection>:<deck-file-stem>:v<N>`, where `<collection>` is the course slug or `standalone`, wrapped in `try/catch`. Provide Reset (with a confirm step), Export JSON and Import JSON. If storage is unavailable, the deck still works and says that responses will not persist.
7. **Accessibility.** Keyboard operable throughout, visible focus states, labels on every input, WCAG AA contrast (see `SLIDES.md` section 10), `prefers-reduced-motion` honoured, touch targets at least 44px in the narrow layout.
8. **Scoring.** Only questions with a single defensible answer may resolve as correct or incorrect. Judgement, opinion and position prompts never display a right answer; they display the room's distribution.
9. **Privacy.** No deck stores or displays individual names of students or other participants. Group labels only.
10. **UK English** throughout, in prose, labels and code comments.

---

## Visual style

A warm, hard-edged, playful Bauhaus visual language, closer to a Kandinsky painting or a Herbert Bayer poster than a corporate template. Pages should feel alive with colour and geometric energy: floating shapes, bold accent blocks, diagonal tension. The eight accent colours are the primary expressive tool; neutral surfaces exist to let them sing. Colours are CSS custom properties on `:root`. Use these values exactly.

### Design principles

1. **Colour is architecture.** The accent colours identify sections, mark boundaries, signal relationships and create visual weight. A page should read as colour-rich from a distance, not muted with occasional accents.
2. **Geometry is decoration.** Rectangles, circles, triangles and diagonal bars are the ornamental system. No figurative illustration, no icons, no gradients.
3. **Playful asymmetry.** Off-centre, weighted compositions. Overlapping shapes and elements that bleed past their containers. A curated poster, not a spreadsheet.
4. **Contrast creates hierarchy.** Bold colour-on-neutral and neutral-on-colour pairings. A solid accent fill with white or `--text` foreground is preferred over a muted tint when emphasis is needed.
5. **Confident density.** Every element earns its space, but the page never feels sparse. Coloured shapes fill negative space.

### Themes

Light is the default for every deck and for `index.html`. A dark theme is available for decks shown in dimmed rooms; a deck uses one theme throughout. No `prefers-color-scheme` switching.

**Light theme:**

| Variable | Hex | Usage |
|---|---|---|
| `--bg` | `#F2DFBE` | Page and stage background |
| `--bg-card` | `#FFFAF2` | Card and panel background |
| `--bg-deep` | `#E8D2A8` | Inset tracks, deeper surfaces |
| `--text` | `#2A1F18` | Headings, primary text |
| `--text-muted` | `#6A5A48` | Secondary text |
| `--border` | `#D8C8A8` | Borders, dividers |

**Dark theme:**

| Variable | Hex | Usage |
|---|---|---|
| `--bg` | `#1A1510` | Page and stage background |
| `--bg-card` | `#2E241C` | Card background |
| `--bg-surface` | `#241C14` | Mid-tone surface, bar tracks |
| `--bg-elevated` | `#382E24` | Elevated panels |
| `--text` | `#F2DFBE` | Primary text |
| `--text-muted` | `#A89878` | Secondary text |
| `--text-dim` | `#6A5A48` | Disabled states only; 2.73:1 on `--bg`, never for readable text |
| `--border` | `#3A3228` | Borders |

**Eight accent colours (identical in both themes):**

| Variable | Hex | Name |
|---|---|---|
| `--accent-1` | `#5C3A96` | Purple |
| `--accent-2` | `#B52838` | Red |
| `--accent-3` | `#C85218` | Burnt orange |
| `--accent-4` | `#D4A020` | Gold |
| `--accent-5` | `#7A5828` | Brown |
| `--accent-6` | `#B83068` | Magenta |
| `--accent-7` | `#CC6830` | Orange |
| `--accent-8` | `#7E58A8` | Lighter purple |

**Derived ink tones** (text only, where an accent that fails contrast must carry text; see `SLIDES.md` section 10):

| Variable | Hex | For |
|---|---|---|
| `--accent-4-ink` | `#7A5410` | Gold text on light surfaces |
| `--accent-7-ink` | `#9E4718` | Orange text on light surfaces |

**Feedback colours:**

| Token | Fill / border (light) | Text ink (light) | Tint bg (light) | Fill / border (dark) | Tint bg (dark) |
|---|---|---|---|---|---|
| correct | `#2A7A42` | `#1F6A36` | `#E6F4EA` | `#2A8A4A` | `rgba(42,138,74,0.15)` |
| incorrect | `#B82828` | `#B82828` | `#FDEEEE` | `#C83838` | `rgba(200,56,56,0.12)` |
| ambiguous | `#B98A10` | `#7A5410` | `#FFF3D6` | `#D4A020` | `rgba(212,160,32,0.12)` |

The fill values of correct (4.06:1 on cream) and ambiguous (2.40:1 on cream) fail as body text, hence the separate ink column. In the dark theme, green and red feedback are for fills and borders only; feedback labels are set in `--text`.

### Accent colour usage

- **Section identity.** Each section or slide carries an accent via a thick left rail, a coloured top rule or a coloured eyebrow. Cycle so adjacent sections contrast, unless the deck's context file maps concepts to colours.
- **Card accents.** A card in a group gets a thick left or top border in its group colour, with its label in the same colour or its ink tone.
- **Colour bars.** Thick (`3px` to `6px`, or the rem equivalent on a deck) rules in accent colours separate regions. They are compositional elements, not mere dividers.
- **Solid-colour blocks.** High-emphasis moments (section openers, activity headers, reveals) use a solid accent fill. The colour field is the visual event.
- **Active and selected states** shift border or background to an accent colour, never just a darker neutral.
- **Data.** Bars, dots and swatches use the accent mapped to the data they represent.
- **Pairing.** No two adjacent accent elements share a hue. Prefer high-contrast sequences (purple, gold, red, orange) over close ones (purple, lighter purple, brown).
- **Tints.** For secondary emphasis, an accent at `0.08` to `0.12` opacity over `--bg-card` (light) or `0.10` to `0.15` (dark).
- **Neutrals stay neutral.** `--bg`, `--bg-card`, `--bg-deep` are never tinted; accents sit on top of them.
- **Err toward more colour.** If a squinted page reads as "beige with text", it needs more accent fills.

### Typography

- **Font stack:** `system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif`
- **Weights:** 800 for headings, 700 for labels and buttons, 400 for body.
- **Uppercase** for eyebrows, sub-headings, buttons, labels, tags and table headers. Body text and headings stay in sentence case.
- **Coloured type** for eyebrows and labels only; headings stay `--text` unless they sit on a solid accent fill.
- Decks use the stage type scale in `SLIDES.md` section 3. `index.html` uses `16px` base, `clamp()` headings, `0.95rem` to `1.05rem` body, `0.68rem` to `0.85rem` eyebrows with `0.08em` to `0.2em` letter-spacing.

### Geometry

Zero border-radius on cards, buttons, panels and inputs. Non-negotiable. The only exceptions are decorative circles and progress dots (`50%`). Borders are `2px` minimum on `index.html` and the rem equivalent on decks; a `1px` border reads as incidental.

### Decorative geometry

Abstract shapes in accent colours appear on every page. They are empty elements or pseudo-elements with `position: absolute; pointer-events: none`, behind content.

- **Vocabulary:** solid squares and rectangles (rotated `12deg` to `45deg`), circles (solid or thick rings), triangles (`clip-path` or the border trick), diagonal bars (rotated `2deg` to `8deg`).
- **Placement:** two or three shapes per page or slide, in contrasting hues, bleeding off at least one edge; larger shapes behind card grids to anchor them; shapes in any significant negative space.
- **Opacity:** background shapes `0.06` to `0.12` (light), `0.08` to `0.15` (dark). Foreground accents (pips, marker blocks) at full opacity.
- **Layering:** shapes at a lower `z-index` than content; the containing element has `overflow: hidden` so rotations clip cleanly.

Deck-specific sizing is in `SLIDES.md` section 11.

### Components

- **Buttons:** `--accent-1` fill, white text, weight 700, uppercase, `letter-spacing: 0.12em`. Hover: `--accent-2` fill and `translateY(-2px)`. Disabled: `opacity: 0.4; cursor: not-allowed`. Ghost variant: transparent fill, thick `--text` border. Secondary actions may use another accent fill with white text, subject to the text-on-fill rules in `SLIDES.md` section 10.
- **Cards:** `--bg-card` fill, thick `--border` border, thick accent left or top border when the card has a group identity. Interactive hover: `translateY(-2px)`, warm shadow, border shifts to the accent.
- **Shadows:** warm-tinted only, `0 4px 12px rgba(42,31,24,0.1)` on hover. No resting shadows.
- **Feedback boxes:** thick left border in the feedback colour, matching tint, text in the feedback ink.
- **Accent pips:** small solid squares marking list items, legend entries or steps.
- **Colour-block banners:** full-width solid accent fill, uppercase heading. The poster moments.

### Motion

- Hover: `translateY(-2px)` over `0.15s ease`.
- Reveals: `opacity 0` and `translateY(0.4rem)` to visible over `0.3s ease`.
- Colour changes: `border-color`, `background-color`, `color` over `0.2s ease`.
- Bar fills: width from zero over `0.6s`, or staggered `40ms` to `80ms` per bar.
- Under `prefers-reduced-motion: reduce`, every duration becomes `0.001ms`.

### Naming conventions

- Hyphenated compound class names: `chain-link`, `tally-bar`, `quad-cell`.
- Component prefixes: `s-` (slide structure), `q-` (checks), `tally-`, `timer-`, `sort-`, `rank-`, `spec-` (spectrum), `est-` (estimate), `board-` (live board), `tl-` (timeline), `quad-` (quadrant), `cmp-` (comparison matrix).
- State classes: `.active`, `.visible`, `.selected`, `.correct`, `.incorrect`, `.ambiguous`, `.locked`, `.revealed`, `.running`, `.expired`, `.disabled`.
- Utility classes: `.eyebrow`, `.lede`, `.small`, `.micro`, `.quiet`.
- Data attributes: `data-accent`, `data-activity`, `data-opt`, `data-bin`, `data-step`, `data-reveal`, `data-target`.

---

## Workflow

1. **Read** this file, `SLIDES.md`, and the deck's context file (`COURSE.md` or `.brief.md`). For a course deck, inspect that course's existing decks and match them.
2. **Plan.** Reply with a deck plan before writing code: session outcomes, then a table with one row per slide giving slide number, archetype, accent, the one idea the slide carries, the activity pattern if any, and estimated minutes. Add a list of questions and a list of any content you would need to mark `PLACEHOLDER:`. Wait for approval.
3. **Build** to `SLIDES.md`, following its build order.
4. **Verify** with the harnesses in `SLIDES.md` section 16 after every significant change, not once at the end.
5. **Report**: harness results per slide, anything that failed and why, every `PLACEHOLDER:` string with its slide number, and the `index.html` and Files-section updates made.

If an instruction in a request conflicts with this file, `SLIDES.md` or the deck's context file, point out the conflict and ask before proceeding.

---

## Testing

`tests/lint.mjs` runs static checks across every `.html` file in the repository and exits non-zero on any failure:

- `<meta charset="utf-8">` present and first in `<head>`
- No `http:` or `https:` URLs in `src`, `href` (other than plain outbound reading links the instructor supplied), `url()`, `@import`, `fetch` or `XMLHttpRequest`
- No curly quotes inside `<script>` blocks
- No `border-radius` values other than `0` and `50%`
- Files under `reference/` are excluded from every check below
- Every deck under `courses/` or `standalone/` is linked from `index.html` and listed in the Files section of this file
- Every course folder has a `COURSE.md`, and every standalone deck has a matching `.brief.md`
- A count of `PLACEHOLDER:` strings per deck, printed as a warning

Run it with `node tests/lint.mjs`. Run `node tests/verify-deck.mjs <path-to-deck>` for the per-deck harnesses. Both use Node built-ins plus Playwright; if Playwright is not already available, install it as a dev dependency rather than adding it to any deck.

To serve the repository locally with correct content types:

```sh
npx http-server -p 8080 -c-1
```
