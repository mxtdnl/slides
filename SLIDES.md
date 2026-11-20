# SLIDES.md

Blueprint for building a projection deck in this repository. Read it in full before building or editing a deck.

Everything in `CLAUDE.md` still applies: one self-contained HTML file, inline CSS and JS, no build step, no network calls, UK English, the eight-accent palette, zero border-radius, decorative geometry on every slide. Content, terminology and constraints come from the deck's context file, never from this file: `COURSE.md` for a course deck, `<deck>.brief.md` for a standalone deck (see `CLAUDE.md`, Deck context).

**Reference implementations.** `reference/theory-of-change.html` was built in a previous repository to an earlier version of this blueprint. It demonstrates the stage model, the type scale, slide anatomy, navigation, idle-hiding chrome, the four interaction primitives, print and narrow layouts, and the eight archetypes marked *proven* in section 6. Read it alongside this document when one of those patterns is unclear.

It differs from this repository's conventions, and **where it differs, this document and `CLAUDE.md` win**. Known differences:

- It uses `--char-1` to `--char-8` and `--char-4-ink`, `--char-7-ink`. New decks use `--accent-N` and `--accent-N-ink` with the same hex values.
- Its content belongs to a specific course. Copy structure and code patterns, never its text, terminology or examples.
- It predates the `ACTIVITIES` object, the response store, the timer, the tally, the keyboard guards and key map in section 8.2, deep links, blackout, speaker notes, the two print modes, and the contrast rules for text on fills and at 1280x720.

Any other difference should be checked against this document rather than assumed to be deliberate.

`reference/archetype-specimens.html` was built in this repository to the current blueprint. It holds one specimen slide for each of archetypes 26 to 45, with sample content, and passes every harness. Copy its structure, CSS and code patterns; never copy its text into a teaching deck. Unlike the legacy deck it is maintained: when the specification of archetype 26 to 45 changes, update its specimen slide in the same commit.

Archetypes marked *specified* have no teaching deck as reference yet; archetypes 26 to 45 have their specimen slide meanwhile. The first teaching deck in this repository that builds one becomes its reference: record the file and slide number in the Reference column of the register in section 6. When a pattern is unclear, read the reference slide before improvising.

---

## 1. What a deck is for

A deck is projected on a large screen in front of a room, and it runs the session: it carries the content, the activities, their timings and the room's responses. Two facts drive every decision below.

**It is read from the back of a room.**

- Text must be legible at distance. Body text lands at roughly 35px on a 1080p screen, about 28pt in PowerPoint terms.
- The screen is the canvas. A centred 780px column on a 1920px projector wastes 60% of the surface. Every slide fills the frame.
- Nothing scrolls. A presenter cannot scroll mid-sentence. Every slide fits its frame in every state it can reach, or it is not finished.

**It exists so the room thinks.**

- A deck that only transmits is incomplete. Every section ends with the room doing something: recalling, predicting, deciding, explaining, sorting, arguing.
- Interactions make the room commit to an answer before it sees one. Reveals are controlled by the presenter, never automatic.
- Section 7 sets the pedagogical rules; sections 8 and 9 give the mechanics.

---

## 2. The stage model

This is the core mechanism. Get it right and everything else follows.

A deck is a fixed 16:9 stage centred in the viewport. The root font-size **is** the slide unit, so `1rem` equals 1% of stage width:

```css
html { font-size: min(1vw, 1.7778vh); }

.deck  { position: fixed; inset: 0; display: flex; align-items: center; justify-content: center; }
.stage { position: relative; width: 100rem; height: 56.25rem; background: var(--bg); overflow: hidden; }
body   { background: var(--text); overflow: hidden; }            /* light theme */
body.theme-dark { background: var(--bg-surface); }               /* dark theme: --text is cream, so not used here */
```

`min(1vw, 1.7778vh)` is the larger of the two constraints that keeps a 16:9 box inside the viewport. The stage is then exactly `100rem` wide and `56.25rem` tall by definition, whatever the display.

**Express every dimension in rem.** Font sizes, padding, gaps, border widths, decorative shape sizes, shadow offsets, timer digits, tally bars. The entire composition then scales as one piece, and a layout verified at 1920x1080 is proportionally correct at 1280x720 and on a 4K projector.

On a projector at exactly 16:9 the body background is never seen. On a 16:10 display it shows as slim letterbox bars, which read as intentional.

**Do not use `clamp()` or viewport units inside the stage.** They break the single-scale property. The stage already handles responsiveness.

---

## 3. Type scale

All values in stage units. The pixel columns show 1920x1080 (1rem = 19.2px) and 1280x720 (1rem = 12.8px).

| Role | Size | At 1080p | At 720p | Weight | Notes |
|---|---|---|---|---|---|
| Title `h1` | `7rem` | 134px | 90px | 800 | Title and section-divider slides only, line-height `0.94` |
| Statement | `5rem` | 96px | 64px | 800 | Statement archetype only, line-height `1.05` |
| Heading `h2` | `3.8rem` | 73px | 49px | 800 | Slide headings, line-height `1.02` |
| Timer digits | `3.2rem` | 61px | 41px | 800 | Tabular numerals |
| Sub-heading `h3` | `2rem` | 38px | 26px | 800 | Uppercase, `letter-spacing: 0.08em` |
| Lede | `2.1rem` | 40px | 27px | 400 | Title-slide standfirst, `--text-muted` |
| Body `p` | `1.85rem` | 35px | 24px | 400 | line-height `1.5` |
| `.small` | `1.55rem` | 30px | 20px | 400 | Dense slides, supporting paragraphs |
| Card body | `1.3` to `1.5rem` | 25 to 29px | 17 to 19px | 400 | Inside a three-column grid |
| `.micro` | `1.25rem` | 24px | 16px | 400 | Footnotes, captions, source lines |
| Eyebrow | `1.3rem` | 25px | 17px | 700 | Uppercase, `letter-spacing: 0.2em` |
| Chrome | `1.1rem` | 21px | 14px | 700 | Nav buttons, slide counter, response menu |

**`1.25rem` is the floor for anything a student must read.** Below that, treat it as chrome.

Prefer dropping to `.small` on a dense slide over shrinking the heading. A slide that needs body text below `1.3rem` has too much content and should be split.

**Word budgets** (house limits, applied at the planning stage):

| Slide type | Maximum |
|---|---|
| Statement | 20 words |
| Card body | 25 words per card |
| Exposition slide body | 70 words |
| Case vignette text | 120 words |
| Speaker notes | 120 words per slide |

---

## 4. Slide anatomy

Every slide has the same skeleton:

```html
<section class="slide" id="s-causal-pathway" data-accent="var(--accent-6)" data-archetype="chain">
  <div class="rail"></div>
  <div class="slide-no"></div>
  <div class="slide-inner">
    <header class="s-head">
      <span class="eyebrow">Core structure</span>
      <h2>The causal pathway</h2>
    </header>
    <div class="s-body"> ... </div>
  </div>
  <aside class="notes"> ... </aside>
  <div class="deco ..."></div>
  <div class="deco ..."></div>
</section>
```

- **`id`** is a stable, descriptive slug prefixed `s-`. `ACTIVITIES` entries are keyed by it, and stored responses survive reordering because they are keyed by id rather than position.
- **`data-accent`** names the slide's accent colour. JS reads it and sets `--slide-accent` on `documentElement`, which drives the rail, the head rule, the eyebrow, the progress bar and any component that inherits it. One attribute recolours the whole slide.
- **`data-archetype`** names the archetype from section 6 or the activity pattern from section 9. The verification harness reports by it.
- **`.rail`** is a `1.9rem` full-height bar down the left edge in the slide accent: section identity, a hard left margin and a Bauhaus colour block in one element.
- **`.slide-inner`** carries `padding: 3.8rem 5.5rem 4.6rem 7rem` and is a column flexbox. The extra left padding clears the rail. The larger bottom padding reserves space for the presenter chrome. The content box is therefore `87.5rem` wide and `47.85rem` tall.
- **`.s-head::before`** draws a `13rem x 0.9rem` accent bar above the eyebrow, so the eye learns where a slide starts.
- **`.s-body`** is `flex: 1; min-height: 0` so it takes the remaining height and its children can be measured against the frame. After a one-line heading it has roughly 34 to 36rem of height; measure rather than assume.
- **`.slide-no`** is numbered by JS (`01 / 13`), so slides can be reordered without editing markup.
- **`aside.notes`** holds speaker notes (section 14). Hidden on screen.

**Activity slides** differ in two places. The eyebrow becomes a solid-fill `.act-tag` naming the pattern and duration (`PAIR AND SHARE · 4 MIN`), so the room learns to recognise that it is being asked to act. The head becomes a two-column grid with the heading on the left and the timer plate (section 9.0) on the right.

```css
.s-head.is-activity { display: grid; grid-template-columns: 1fr auto; column-gap: 3rem; align-items: end; }
```

**Cycle accents so adjacent slides contrast.** Never two adjacent slides in the same hue. Where the context file maps concepts to accents, slides about a concept take its colour and the cycling rule yields to the mapping; separate two same-colour slides with a contrasting divider or activity slide where possible.

---

## 5. Layout vocabulary

A small set of grid helpers covers almost everything:

```css
.grid   { display: grid; gap: 2.6rem; }
.g-2    { grid-template-columns: 1fr 1fr; }
.g-3    { grid-template-columns: repeat(3, 1fr); }
.g-4    { grid-template-columns: repeat(4, 1fr); }
.g-7-5  { grid-template-columns: 7fr 5fr; }   /* text-dominant split */
.g-5-7  { grid-template-columns: 5fr 7fr; }   /* panel-dominant split */
.g-6-6  { grid-template-columns: 1fr 1fr; }
.stack > * + * { margin-top: 1.2rem; }
.center-y { align-content: center; }
```

Rules of thumb for a wide frame:

- **Prose belongs in two columns, never one.** A single column of body text across `87.5rem` gives 120-character lines. Split the paragraphs or set a `max-width` of about `84rem` and accept two or three lines.
- **Three columns is the natural card grid.** A third of the content width is about `28rem`, which takes card body text at `1.3` to `1.5rem` comfortably. Four columns is the ceiling and suits labels, not prose.
- **Asymmetric splits beat even ones** when one side is a quote, a diagram, a chart or a photograph. `7fr 5fr` and `5fr 7fr` are the house ratios.
- **Fill vertical space rather than letting content float at the top.** If a slide has spare height, enlarge the type or the card padding until the composition reaches the bottom padding. A half-empty frame is a design failure.
- **Reserve space for states.** Any element that grows on interaction (a detail panel, a feedback box, a revealed row) has its final height reserved with `min-height` or `visibility: hidden` from the start, so nothing jumps.

---

## 6. Slide archetypes

Forty-five patterns in four families. Archetypes 26 to 45 are constructed illustrations: pictures built from the house geometry that carry the slide's meaning (section 12.3). Choose the archetype from the idea the slide carries, not from variety for its own sake.

### Register

| # | Archetype | Family | Use when | Status | Reference |
|---|---|---|---|---|---|
| 1 | Title poster | Framing | Opening the deck | proven | `reference/theory-of-change.html` |
| 2 | Outcomes | Framing | Stating what the room will be able to do | specified | `standalone/2026-09-lagging-and-leading-indicators.html` slide 3 |
| 3 | Session map | Framing | Showing the running order, reprised at each section | specified | `standalone/2026-09-lagging-and-leading-indicators.html` slides 4, 12, 18 |
| 4 | Section divider | Framing | Marking a new section | specified | `standalone/2026-09-lagging-and-leading-indicators.html` slide 6 |
| 5 | Close and bridge | Framing | Consolidating and pointing to the next session | specified | `standalone/2026-09-lagging-and-leading-indicators.html` slide 22 (standalone variant) |
| 6 | Statement | Exposition | One claim that deserves the whole frame | specified | `standalone/2026-09-telegraphing.html` slide 2 |
| 7 | Definition | Exposition | Fixing a term and its boundary | specified | `standalone/2026-09-lagging-and-leading-indicators.html` slides 7, 8 |
| 8 | Quote plus commentary | Exposition | A source's words, then interpretation | proven | `reference/theory-of-change.html` |
| 9 | Split with panel | Exposition | One principle with one worked illustration | proven | `reference/theory-of-change.html` |
| 10 | Numbered cards | Exposition | Three parallel ideas of equal weight | proven | `reference/theory-of-change.html` |
| 11 | Card grid | Exposition | Six parallel items | proven | `reference/theory-of-change.html` |
| 12 | Takeaway grid | Exposition | Six summary points | proven | `reference/theory-of-change.html` |
| 13 | Sequence band | Relations | A progression or ordered stages | proven | `reference/theory-of-change.html` |
| 14 | Chain diagram | Relations | A causal or logical pathway with direction | proven | `reference/theory-of-change.html` |
| 15 | Cycle | Relations | A loop with no start or end | specified | |
| 16 | Quadrant | Relations | Two dimensions crossing to make four types | specified | |
| 17 | Comparison matrix | Relations | Options compared against criteria | specified | `standalone/2026-09-lagging-and-leading-indicators.html` slide 9 (row reveal) |
| 18 | Timeline | Relations | Dated events or periods | specified | |
| 19 | Annotated model | Relations | A diagram whose parts need naming in turn | specified | `standalone/2026-09-lagging-and-leading-indicators.html` slide 13 |
| 20 | Data exhibit | Evidence | One chart supporting one claim | specified | |
| 21 | Photograph | Evidence | An image that carries information text cannot | specified | |
| 22 | Case vignette | Evidence | A concrete case to reason about | specified | `standalone/2026-10-pep-meta-session.html` slide 16 (fact strip with three cards, no discussion questions) |
| 23 | Worked example | Evidence | A solution shown step by step | specified | `standalone/2026-09-lagging-and-leading-indicators.html` slide 19 |
| 24 | Claim and correction | Evidence | A common misconception set against the evidence | specified | |
| 25 | Annotated image | Evidence | A screenshot or supplied illustration whose parts need naming | specified | `standalone/2026-10-feed-briefing.html` slides 7, 13, 14 (portrait), 12 (landscape), 15 (strip) |
| 26 | Typographic poster | Framing | Launching the one term a section turns on | specified | `reference/archetype-specimens.html` slide 2 |
| 27 | Specimen plate | Exposition | One artefact (a metric, a policy, a model) inspected closely | specified | `reference/archetype-specimens.html` slide 3 |
| 28 | Triptych | Exposition | A narrative in three beats | specified | `reference/archetype-specimens.html` slide 4 |
| 29 | Isotype array | Evidence | A proportion made countable | specified | `reference/archetype-specimens.html` slide 5 |
| 30 | Proportional field | Evidence | Part to whole with three to seven parts | specified | `reference/archetype-specimens.html` slide 6 |
| 31 | Scale comparison | Evidence | Magnitudes too far apart to grasp as numbers | specified | `reference/archetype-specimens.html` slide 7 |
| 32 | Orbit | Relations | Centrality, or closeness to a core concept | specified | `reference/archetype-specimens.html` slide 8 |
| 33 | Overlap | Relations | Two or three concepts sharing ground | specified | `reference/archetype-specimens.html` slide 9 |
| 34 | Iceberg | Relations | Surface behaviour set against underlying causes | specified | `reference/archetype-specimens.html` slide 10 |
| 35 | Strata | Relations | Layers that rest on one another | specified | `reference/archetype-specimens.html` slide 11 |
| 36 | Funnel | Evidence | Attrition or selection across stages | specified | `reference/archetype-specimens.html` slide 12 |
| 37 | Zoom | Relations | Levels of analysis, nested | specified | `reference/archetype-specimens.html` slide 13 |
| 38 | Balance | Relations | A trade-off between considerations | specified | `reference/archetype-specimens.html` slide 14 |
| 39 | Tipping point | Relations | Thresholds, path dependence, lock-in | specified | `reference/archetype-specimens.html` slide 15 |
| 40 | Route map | Relations | A course or field as connected themes | specified | `reference/archetype-specimens.html` slide 16 |
| 41 | Constellation | Relations | Undirected ties among five to nine actors | specified | `reference/archetype-specimens.html` slide 17 |
| 42 | Branching tree | Relations | Conditional logic, choices and consequences | specified | `reference/archetype-specimens.html` slide 18 |
| 43 | Exploded view | Relations | A whole decomposed into components | specified | `reference/archetype-specimens.html` slide 19 |
| 44 | Lens | Evidence | One case read through several theories | specified | `reference/archetype-specimens.html` slide 20 |
| 45 | Before and after | Evidence | An intervention changing a system | specified | `reference/archetype-specimens.html` slide 21 |

### Framing

**1. Title poster.** `g-7-5`. Left: eyebrow (course and week, or event and date for a standalone deck), `h1` broken across two lines, lede. Right: a geometric composition at full opacity (solid circle, rotated square, thick ring, triangle, diagonal bar) built from absolutely positioned divs inside a `position: relative` container. This, the statement slide and the section divider are the only places where accent shapes are foreground art rather than background texture.

**2. Outcomes.** `g-5-7`. Left: `h2` ("By the end of this session") and a short `.small` line on how the session will check each outcome. Right: three or four outcome rows. Each row is a `5rem` solid accent square holding a white numeral (or `--text` on gold), beside the outcome text at body size. Outcome text starts with an observable verb (explain, compare, calculate, evaluate, design, predict), never "understand", "know" or "appreciate", because the room cannot be seen to do those. Every outcome is revisited on the close slide and checked by at least one activity (section 7.1).

**3. Session map.** A full-width band of segments, one per section of the session, with widths proportional to minutes: set `grid-template-columns` inline from the plan, for example `style="grid-template-columns: minmax(9rem, 10fr) minmax(9rem, 25fr) ..."`. Each segment shows the section name and its minutes; segments that contain an activity carry a small solid triangle marker. States: completed segments are `--bg-deep` with a thick accent top border; the current segment is a solid accent fill and `2rem` taller; upcoming segments are an accent tint. Reprise the map at each section boundary with `data-current="N"` set on the slide; JS applies the states. The `9rem` minimum keeps labels legible; merge sections if more than seven segments are needed. Distinct from the sequence band, which shows a conceptual progression rather than the clock.

**4. Section divider.** A full-bleed solid accent fill across the stage; the rail takes the same colour so the frame reads as one field. Top left: `PART 2` as an eyebrow. Centre left: the section title at `h1` size. Beneath: one line at `h3` size stating the question the section answers. A very large numeral (around `30rem`) sits bottom right in `--bg` at `0.15` opacity, bleeding off the frame; it duplicates the eyebrow and is decorative. Background shapes on a solid fill use `--bg` at `0.10` to `0.15`. Choose a fill whose text pairing passes at `h3` size (section 10). No body copy.

**5. Close and bridge.** `g-7-5`. Left: `h2` ("What we can now do"), then the session outcomes restated, each with a solid accent pip. Right, stacked: a bordered card headed `BEFORE NEXT SESSION` listing reading or tasks exactly as the instructor supplied them, and a solid-fill block headed `NEXT` with the next session's title. If the deck captured responses, the close slide is the reminder to export them (the export itself lives in the response menu, section 8.3). Standalone variant: the card is headed `TO GO FURTHER` and lists only what the brief supplies; the `NEXT` block carries a next step or contact from the brief, or is omitted and the left column widens.

**26. Typographic poster.** The heading is one word, set in lower case after Herbert Bayer, as a row of solid letter blocks across the content width: each block `9rem` by `13.6rem` with the glyph at `12rem`, weight 800, and alternate blocks dropped `2.4rem`. Every block takes a different accent, with no two adjacent hues alike, and its text pairing from section 10. The head has an eyebrow but no `h2`: the word is the heading, and the row carries `role="img"` with the word as its `aria-label`. Beneath, `50rem 1fr`: a solid block with the word divided into syllables, its part of speech, and a one-line working definition at `2.1rem`, beside a card with `SEE ALSO` and `OPPOSITE`. Nine letters fill the width at this size; for a longer word, narrow the blocks so the row stays inside the content box rather than cropping a letter. Maximum one per section. When the term's boundary needs fixing, follow it with a definition slide.

### Exposition

**6. Statement.** One sentence at statement size (`5rem`, weight 800, maximum three lines, `max-width: 68rem`), anchored low and left. A solid accent block occupying the right quarter of the frame, full height and bleeding off the top and bottom, acts as the counterweight. Optional `.micro` attribution beneath. Maximum two per deck; a statement loses force when repeated.

**7. Definition.** Top: the term at `h2` size, with an eyebrow naming the field or source. Beneath: the definition in a card with a `1rem` accent left border, text at `2.1rem`. Bottom: `g-2` with an `EXAMPLE` card and a `NON-EXAMPLE` card, each holding the case and one line on why it is or is not an instance. The non-example is the point of the slide: it fixes the concept's boundary. Interactive variant: the two cards are presented unlabelled as "Is this an instance?" and resolve as a single-select check (section 8.1).

**8. Quote plus commentary.** `g-6-6` with `center-y`. Left: a `.quote-block` with a `1rem` accent left border, italic text at about `2.05rem`, an uppercase attribution, and `justify-content: center` so the quote sits centred in a full-height card. Right: a `.stack` of commentary paragraphs ending in a small solid-colour banner. Quotations are used only verbatim from a source the instructor supplied.

**9. Split with panel.** `g-5-7`. Principle text on one side, a worked illustration in a bordered card with an accent left border on the other. Use when one idea needs an illustration rather than a second idea.

**10. Numbered cards.** `g-3`, each card carrying a solid accent header bar with a large faded numeral and the card name, and a neutral body below. The poster moment of a deck: three flat colour fields across the frame.

**11. Card grid.** `repeat(3, 1fr)` over two rows for six items. Each card gets a `0.9rem` accent left border, a name in the accent (or its ink tone), and muted body text. Cycle colours so no two adjacent cards share a hue, including vertically.

**12. Takeaway grid.** `1fr 1fr` over three rows. Each item is a large accent numeral beside the text, with a `0.4rem` accent rule across the top. The rules align per row and read as a set of colour bars.

**27. Specimen plate.** `g-7-5`. Left: the concept drawn in geometry on a plate: `--bg-card` with a `0.3rem` `--text` outer rule, a `0.8rem` margin and an inner `--border` rule, catalogue and plate numbers in muted uppercase in the top corners, and a measuring rule with ticks and unit labels along the bottom that gives the drawing a true scale. Up to three numbered markers (`2.8rem` `--text` squares with `--bg-card` numerals) sit on its parts. Right: a catalogue card with a top border in the slide accent, holding four to six label and value rows (`CLASS`, `ACTS ON`, `FAILS WHEN`, `SEE ALSO`) and the key to the numbered parts. It differs from the annotated model in being static and catalogued: one artefact inspected, not a model whose parts are selected in turn.

**28. Triptych.** `g-3` of tall panels showing the same scene in three states, with a solid caption bar at the foot of each (a numbered `h3` and one line; reserve `min-height` so the bars align) in three contrasting accents. Panels beyond the current step sit at `0.35` opacity with the scene emptied, so the room can predict the next beat; `r` reveals the next panel. The scene comes from `ACTIVITIES` and must be the same composition in all three panels, or the slide is three cards.

### Relations

**13. Sequence band.** A full-width row of solid colour blocks marking a progression, with the current step taller and a label beneath each. Runs the full content width; a sequence squeezed into a column loses its meaning. Reuse it across a deck to show where the current slide sits in a conceptual progression.

**14. Chain diagram.** The most valuable pattern for a wide frame. Four nodes in `repeat(4, 1fr)`, each a card with a thick coloured top border. Connector text sits in a second row inset so each item centres on a seam between nodes:

```css
.chain       { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.6rem; }
.chain-links { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.6rem;
               margin: 0 calc(12.5% + 0.2rem); padding-top: 1rem; }
```

The inset is `W/8 + g/8`. With a `1.6rem` gap that is `12.5% + 0.2rem`, which puts each connector exactly over a seam. A CSS triangle on `.chain-link::before` points up at the join. Direction bands above and below the chain state the reading direction explicitly. A chain diagram without direction labels is ambiguous. For a three- or five-node chain, recompute the inset as `W/(2n) + g/(2n)`.

**15. Cycle.** `g-5-7`. Left: a square container (`min(100%, 36rem)` on each side) holding a thick ring (`1.2rem` border in `--border`) with four to six node cards sitting on it. Compute node positions in JS at load from the node count (angle `-90deg + i * 360deg / n`), never by hand, so adding a node does not require re-placing the others. Small solid triangles on the ring between nodes point in the direction of travel. Right: a detail panel that fills when a node is selected (the select-one pattern, section 8.1). Use only for genuine loops; a process with a start and an end is a sequence band or a chain.

**16. Quadrant.** `g-7-5`. Left: a 2x2 grid in a near-square area, each cell tinted in its own accent with the cell name in that accent's ink and one or two examples. Axis labels run along the bottom and the left edge in uppercase at `1.3rem`, each with a solid triangle marking the high end. Right: commentary, or a detail panel for the selected cell. Interactive variant: the room places items into cells with the sort pattern (section 9.8), with the quadrant as the bins.

**17. Comparison matrix.** A real `<table>`, for semantics and screen readers. First column holds criteria at `1.4rem` bold; two to four option columns. Header cells are solid accent fills with white (or `--text`) labels; body cells are `--bg-card` with thick borders and text at `1.35` to `1.5rem`. Maximum five rows and four option columns, and about twelve words per cell. Interactive variant: rows reveal one at a time on click so the room can predict each row before seeing it; reserve the full table height from the start.

**18. Timeline.** A horizontal axis (`0.5rem` bar in `--text`) across the content width. Events are solid accent squares on the axis, positioned proportionally with a custom property set in markup (`style="--t: 0.42"`, `left: calc(var(--t) * 100%)`). Each event has a date label at `1.3rem` bold and up to twelve words at `1.35rem`. Labels alternate above and below the axis so neighbours never collide; if two events are closer than about `12rem`, they must be on opposite sides. Periods are solid bars above the axis. Maximum seven events per slide. Dates only from supplied sources.

**19. Annotated model.** `g-7-5`. Left: the model or diagram, built from positioned divs or inline SVG, with numbered hotspots (solid accent squares with white numerals). Right: a list of the parts in the same numbering, and a detail panel. Selecting a hotspot or a list item highlights both and fills the panel. A presenter can also step through parts in order with `r` (section 8.2). Text inside an SVG must render at `1.25rem` or larger at the SVG's displayed size; size the `viewBox` accordingly.

**32. Orbit.** `34rem 1fr`. Left: a `34rem` square holding up to three concentric rings (`0.6rem`, each in its own accent) around a solid `9rem` core circle in the slide accent carrying its name. Satellites are buttons (`--bg-card`, `--text` border, a top border in their ring's colour), placed by JS from the ring radius and an angle in `ACTIVITIES` (0 is right, -90 is top). Choose angles so no satellite overlaps the core or leaves the square. Right: a ring legend stating what distance means, a detail panel that fills on selection (click or number key), and a `.micro` line on what distance does not mean. Five to eight satellites. Distinct from the cycle (no loop) and the constellation (distance, not ties).

**33. Overlap.** `50rem 1fr`. Left: inline SVG of two or three rings (12-unit strokes) in contrasting accents. Pairwise regions are tinted (an accent at `0.14`) and numbered; the region all of them share is a solid fill in the slide accent, cut with nested `clipPath` elements. Never use `mix-blend-mode`, which produces colours outside the palette. A `C` chip, an HTML element with `--bg-card` fill and a `--text` border, sits over the centre so its contrast can be measured. Ring names sit outside the rings in uppercase. Right: the regions listed with matching number chips; the centre item and its fill reveal together on `r`. Prefix `clipPath` ids with the slide name so they stay unique in the deck.

**34. Iceberg.** A tip triangle above a waterline, labelled beside it (`WHAT WE SEE`, then an `h3` at `2.4rem`). Beneath, two to four trapezoid bands (`clip-path` polygons) widen downward, each a solid accent with a white label at `2rem` weight 800, under a `WHAT LIES BENEATH` eyebrow in the accent. The water (a slide-accent tint at `0.10`) and the `0.6rem` waterline sit at slide level, outside `.slide-inner`, so they bleed to the frame without failing the fit check; place them at the body top plus the waterline offset (the body top is `14.43rem` after a one-line `h2`). Bands reveal from the top on `r`. Each label must fit its band's top width.

**35. Strata.** `52rem 1fr`. Left: bands stacked from the bottom up (`column-reverse`), each narrower than the one below (`100%`, `82%`, `64%`, `46%`) and left-aligned so the stack is asymmetric, with heights set by `flex` and a label and layer tag on each solid fill. Right: one note per band, sharing its band's `flex` value so they align, with a left border in the band's colour. The stack builds from the foundation on `r`. Three to five layers. Distinct from the sequence band: this is dependency, not order in time.

**37. Zoom.** `34rem 1fr`. Left: a `34rem` square viewport (`overflow: hidden`, `0.4rem` `--text` border) holding one nested square per level, each given in `ACTIVITIES` as `x`, `y` and `s`, fractions of the outermost; the innermost holds a solid circle. Each step pulls back one level by setting `transform: scale(1/s) translate(-x, -y)` with `transform-origin: 0 0` over `0.7s`. Labels sit in each square's top-left corner and are resized at each step so they stay `1.5rem` on screen; a label hides when its square is under `9rem` on screen. Leave at least `2.5rem` between the top edges of nested squares so labels do not collide at the widest view. Right: one row per level with a pip and one question; the current row inverts to a `--text` fill. Three to five levels.

**38. Balance.** Full width: a `--text` base bar, a gold fulcrum triangle, and a `76rem` `--text` beam that rotates about its centre on the apex. Considerations are solid blocks with white labels at `1.7rem` weight 800, taller when weightier; they stack on each end as children of the beam, so they tilt with it. Side names sit under the beam ends on a `--bg` chip. Each `r` adds the next block in `ACTIVITIES` order, alternating sides; the angle is the right weight minus the left, times `degPerWeight`, clamped to 8 degrees either way. Unless the weights come from supplied data, a source line says the tilt is the presenter's argued judgement. Two or three blocks a side.

**39. Tipping point.** A full-width SVG (`87.5rem` by `24rem`) of a landscape with two basins: the ground is a filled path sampled in JS from a double-well function whose deeper basin is the new state, with a dashed `--bg-card` line down from the crest. A red ball sits on the curve, offset along its normal. Four steps (at rest, a push, at the crest, the new state) move the ball along the curve with `requestAnimationFrame`, jumping straight there under reduced motion. A `g-4` strip of step cards sits beneath, the current one filled. Basin and crest labels go above the curve on the background, never on the ground fill.

**40. Route map.** A full-width SVG of two to four lines (14-unit strokes; horizontal, vertical and 45-degree segments only) in contrasting accents. Stations are `--bg-card` squares with `--text` borders; interchanges, where lines share a concept, are rings. Each station's label goes above, below, left or right as set in `ACTIVITIES`, never across a line. A legend row beneath names the lines, the interchange mark and the lit station (`This session: ...`). The lit station fills burnt orange and its label takes `--accent-7-ink`. `r` steps the light through the `ACTIVITIES` order; in a course, reprise the map each session with the step set to that session. Eight to fourteen stations.

**41. Constellation.** `49.5rem 1fr`. Left: SVG nodes as solid accent circles sized by importance, with a `--bg` stroke, and ties as lines beneath them. Labels sit beside each node at a position set in `ACTIVITIES`, with a `--bg` halo (`paint-order: stroke`) so crossing ties do not cut them. Right: a two-column button list (pip, number, name) and a detail panel. Selecting a node (its circle, its button or its number key) thickens its ties in `--text`, dims the other ties to `0.18` and unlinked nodes to `0.3`, and lists its ties. Five to nine nodes. Ties are undirected; a directed relation is a chain.

**42. Branching tree.** An `87.5rem` by `34rem` container: SVG edges beneath, HTML node cards on top (`24rem` by `7.6rem`, with an eyebrow such as `QUESTION` or `METHOD`) positioned by centre and top in rem, and branch labels (`YES`, `NO`) as chips at the edge midpoints. All nodes start solid. From the first step the path taken lights: its edges in the slide accent at 10 units, its nodes with solid borders, and the end node a solid accent fill, while untaken nodes turn dashed with muted text. Maximum three levels and five leaves per slide.

**43. Exploded view.** `49.5rem 1fr`. Left: a solid composite square made of three to five abutting rectangles with `--text` outline seams, each a solid accent with its name in uppercase at `1.4rem` weight 800 and a number square in its bottom-left corner. On `r` each part moves outward by its own `--dx` and `--dy` over `0.7s`, its number appears, and the part list on the right (number chip, name, one line) reveals; `r` again reassembles it, as a synthesis. Each part is at least `7rem` high so its name and number do not collide, and the moves stay inside the left column.

### Evidence

**20. Data exhibit.** The heading is a full-sentence claim that the chart supports ("Attendance fell in every region after 2015"), not a topic label ("Attendance data"). One chart per slide, built as inline SVG or positioned divs (section 12.2). The series or bar the claim is about is in the slide accent; everything else is `--bg-deep` or `--text-muted`. Labels sit directly on the data; no legend unless unavoidable. A `.micro` source line beneath is mandatory. Predict variant: the bars are hidden and the room commits to an ordering or a direction before the reveal (section 9.3).

**21. Photograph.** `g-7-5`. Left: the photograph filling the column height, with a `0.4rem` accent rule beneath. Right: a caption, then two or three `LOOK FOR` prompts that direct attention to what the image shows, then a `.micro` credit line. Photographs are content, never ornament (section 12.1).

**22. Case vignette.** `g-7-5`. Left: the case in a card with a solid accent header bar naming it, a fact strip of three or four label-value pairs, and the narrative (up to 120 words at `1.5rem`). Right: two or three discussion questions on accent-bordered cards, revealed one at a time. A real case uses only supplied facts. An invented case is labelled `FICTIONAL CASE` in its eyebrow, and invented details must not resemble a real organisation or person.

**23. Worked example.** `g-7-5`. Left: the steps of a solution in a vertical stack, revealed one at a time. Right: a `WHY THIS STEP` panel showing the reasoning for the current step. Before each reveal the presenter asks the room to predict the next step, which the notes should prompt. Maximum six steps visible; split longer solutions across slides with a `CARRIED FORWARD` card at the top of the continuation. Pair it with the complete-the-example pattern (section 9.13).

**24. Claim and correction.** `g-2`. Left: a card headed `A COMMON CLAIM` with the claim at `2.1rem`, and a tally of whether the room agrees (section 9.2). Right, revealed after the tally: a card headed `WHAT THE EVIDENCE SHOWS` with the correction, a line on why the claim is attractive, and a source line. Explaining why a misconception is plausible is what distinguishes this from simply stating the correct view. The correction needs a supplied source; without one the slide is not built.

**25. Annotated image.** A screenshot or supplied illustration with numbered parts, for teaching a real interface or picture rather than a model built in markup (that is the annotated model). The image follows section 12.1: supplied by the instructor or captured at their request, embedded as base64 at its display size, alt text on every image. Each part is a box on the image (`x`, `y`, `w`, `h` as fractions of the image) with a name and one line of text, all in `ACTIVITIES`; the legend shows every part's text at all times, so nothing is hidden from the room. Selecting a part (marker, legend entry, its number key, or `r` to step) outlines its box on the image in the part's accent with a `--text` outline, so the box reads on dark screenshots. Three variants. **Portrait** (a phone screen): `auto 1fr`, the image filling the body height with its markers in a gutter to its right, each beside a bracket showing the part's vertical extent, so no marker covers the screenshot; legend in one or two columns. **Landscape** (a projector or desktop screen): the image in a fixed `56rem` column, markers placed on the image at a point given in `ACTIVITIES` (`mx`, `my`) over empty areas, and a one-column legend with the name inline; keep each line to about eight words. **Strip**: two to four screens in sequence, each with one always-visible box and a numbered caption beneath. Crop screenshots to the part that carries the content before encoding; a tall phone screen with empty space shrinks everything on it. Maximum seven parts per image. Marker and legend numerals are large text (at least `1.5rem` bold) so the burnt orange fill passes at 1280x720.

**29. Isotype array.** After Otto Neurath's Isotype, with squares in place of pictograms. `34rem 1fr`. Left: a 10 by 10 grid of hollow squares (`2.7rem`, `0.3rem` muted border); on reveal the counted share fills in the slide accent row by row from the top left, staggered 40ms per square. Right: the count at `17rem` in the accent (shown as `?` until the reveal), an `h3` naming the unit, a key, and a mandatory source line stating what one square stands for. For a total other than 100, choose a column count that divides it. Data only from supplied sources.

**30. Proportional field.** A De Stijl frame: one rectangle cut into areas proportional to the parts, built from nested grids whose `fr` values are the data, with `0.9rem` `--text` gutters (a `gap` over a `--text` background). Each cell is a solid accent holding its name as an `h3` and its value at `4.4rem` (`3.2rem` in small cells); the part the heading's claim is about takes the slide accent. Text on each fill follows section 10; the `h3` at `2rem` bold is large text, so burnt orange passes. Three to seven parts: if the smallest cell cannot hold its `h3`, fold it into an `Other` cell. Source line mandatory.

**31. Scale comparison.** Two or three squares whose sides are proportional to the square root of their values, so their areas are true, standing on one `0.4rem` `--text` baseline, the largest about `30rem` on a side. The smaller squares are labelled above (a muted uppercase name, then the value at `2.6rem` weight 800); the largest is labelled inside, on its fill. A note card states the relation between area and side. Never crop the largest square: cropping breaks the ratio the slide exists to show. Source line mandatory.

**36. Funnel.** Rows of `15rem 1fr 11rem`: the stage name right-aligned in uppercase, a centred bar whose width is that stage's count over the first stage's, and the loss since the previous stage in the gutter, in `--accent-2` over a `LOST` label. Bars are `--bg-deep` with `--text` counts; only the stage the claim is about takes the slide accent, with white text. The losses stay hidden until `r`, so the room can predict where the largest drop is. Three to six stages. Source line mandatory.

**44. Lens.** `49.5rem 1fr`. Left: a fixed scene in a card, its parts as positioned HTML elements with SVG flow lines beneath. Right: one button per lens (number key, name, left border in the lens accent) and a detail panel. Selecting a lens (its button, its number key, or `r` to cycle) fills the parts it highlights in its accent, dims the rest to `--bg-card` with `--border`, recolours the flows it attends to, and relabels parts from `ACTIVITIES`. The default state has no lens and neutral labels. Two to four lenses. Only colour and labels change between lenses; if the scene itself changes, the slide is a comparison.

**45. Before and after.** A scene in two layers inside an `85rem` frame with a `0.3rem` `--text` border. The after layer is clipped with `clip-path: inset(0 0 0 var(--p))`, and a divider bar with a gold diamond handle sits at `--p`. A labelled range input under the frame moves the divider, and `r` steps it through the positions in `ACTIVITIES` (100, 50, 0). `BEFORE` and `AFTER` tags sit in opposite top corners. Up to three differences are marked with numbered red squares on the after layer and explained beside the range. The frame leaves `2.5rem` spare on the right so the handle at 100% stays inside the content box.

---

## 7. Pedagogical design

### 7.1 The session arc

The default structure for a session of 60 to 120 minutes:

1. **Title poster.**
2. **Retrieval warm-up** on earlier sessions (section 9.1). No new content. A standalone deck has no earlier sessions; it opens instead with a prior-knowledge check on what the brief says the audience already knows or believes (a claim tally, spectrum or estimate).
3. **Outcomes.**
4. **Session map.**
5. **Hook**: something the room commits to before any instruction, typically predict and reveal, an estimate or a case.
6. **Sections**, each: a section divider or session-map reprise, three to six exposition or relation slides, then a check or activity.
7. **Consolidation**: an activity that applies the session's ideas to a new case.
8. **Close and bridge.**
9. **Exit ticket.**

Rules:

- **The room responds at least every 10 to 15 minutes of talk**, or after about six exposition slides, whichever comes first. This is a house pacing rule, not a claim about attention spans.
- **Commit before reveal.** Any activity that has an answer collects the room's response before showing it.
- **Every outcome is exercised.** Each outcome has at least one activity that makes the room perform its verb. The deck plan shows the mapping.
- **Retrieval reaches back.** Each course deck includes retrieval of material from earlier sessions, mixing topics rather than drawing only on the previous week. Standalone decks are exempt.
- **Vary the social mode.** Alternate individual, pair and whole-room work across the session.
- **Respect phase constraints** in `COURSE.md`. An activity may not ask for work that belongs to a later phase of the course.

**Interaction level.** Course decks always run the full arc above. A standalone brief sets one of three levels, because some occasions (a keynote to several hundred, a timed conference slot) cannot carry the full arc:

| Level | What applies |
|---|---|
| `full` | The whole arc and every rule above |
| `light` | A hook, at least one check or claim tally in the middle, and a close. The pacing rule is relaxed to one response per 20 minutes. Tallies by show of hands only |
| `none` | No activity slides and no response store. Framing, exposition, relation and evidence archetypes only. Rhetorical questions on slides are still encouraged |

The deck plan states the level and cites the brief.

### 7.2 Principles and the patterns that serve them

| Principle | What the deck does | Patterns |
|---|---|---|
| Retrieval practice | The room recalls before being told | Retrieval warm-up, single-select check, exit ticket |
| Spacing and interleaving | Revisits earlier sessions, mixes topics | Retrieval warm-up |
| Prediction before instruction | The room commits to an expectation, then meets the evidence | Predict and reveal, estimate, data exhibit (predict variant) |
| Generation and self-explanation | The room produces explanations rather than reading them | Stop and jot, think pair share, worked example |
| Worked examples, then fading | Full solutions first, then partial ones to complete | Worked example, complete the example |
| Peer discussion | Neighbours argue answers before the reveal | Peer instruction |
| Calibration | The room rates confidence and confronts confident errors | Confidence check |
| Concept boundaries | Examples set against non-examples | Definition, sort, spot the flaw |
| Words with diagrams | Structure shown spatially while it is explained | Chain, cycle, quadrant, annotated model |

The principle names state design intent. They are not claims about effect sizes for any particular cohort, and no slide presents them to students as findings without a supplied source.

### 7.3 Feedback design

- **Every option explains itself.** Each option in `ACTIVITIES` carries a `why`: for the correct option, the reasoning; for each distractor, the misconception it represents and what is wrong with it. The reveal shows the `why` for the selected option and, after the presenter's full reveal, for all options.
- **The presenter controls timing.** Reveals happen on a click or key, so discussion can run as long as it needs.
- **Wrong answers are recoverable.** A single-select check clears a wrong pick after 2.5s so it can go back to the room.
- **Feedback addresses the reasoning, not the room.** No "Wrong!", no scores for individuals, no emoji.
- **Show the distribution with the answer** whenever the room's responses were tallied, so the presenter can address the most popular error directly.

### 7.4 Writing questions

- One idea per question. A good stem can be answered before the options are read.
- Three or four options. Each distractor maps to a named misconception, recorded in `ACTIVITIES` as `misconception`.
- No "all of the above" or "none of the above". Avoid negative stems; where unavoidable, set `NOT` in capitals.
- Options are similar in length and grammatically parallel, so the answer cannot be spotted by form.
- Prefer application to a new case over recognition of wording from an earlier slide.
- Judgement, opinion and position prompts are labelled as such, carry no key, and display only the distribution.

---

## 8. Interaction primitives and navigation

### 8.1 Primitives

Four primitives underlie every activity pattern in section 9.

**Single-select check.** Click an option (or press its number), it resolves immediately. The correct answer highlights in the correct colour, a wrong pick flags in the incorrect colour, and after 2.5s the wrong state clears and the options re-enable. Do not lock a wrong answer permanently. Options carry a letter in a solid accent square (A, B, C, D) so the room can call out or hold up a letter; the letter, not the colour, carries the meaning.

**Multi-select with an explicit check.** Options toggle freely; a Check button resolves all at once and then hides itself. Use when the exercise is "how many can you find", not "which one is right".

**Independent reveals.** Three or more columns each expanding in place. Use when the items are parallel and several may be open at once. A visible `CLICK TO REVEAL` hint prevents dead air.

**Select-one with a shared detail panel.** Cards select, and one panel fills with the selection. Use when the detail is too long to sit inside a card. Reserve the panel's height with `min-height` and give it a placeholder line, so selecting a card does not make the layout jump.

### 8.2 Keyboard

The keyboard is the primary interface. Presentation clickers send some of these keys.

| Key | Action |
|---|---|
| Right arrow, Space, PageDown | Next slide |
| Left arrow, PageUp | Previous slide |
| Home, End | First, last slide |
| `f` | Toggle full screen |
| `b` or `.` | Blackout: the stage fills with `--text` (light) or `--bg` (dark); any key restores. Some clickers send `.` for their blank-screen button |
| `r` | The slide's primary reveal: resolves a check, reveals the next row, step or argument |
| `t` | Start or pause the timer |
| Shift + `t` | Reset the timer |
| `1` to `9` | The slide's primary control: increments tally option *n* if the slide has a tally, otherwise selects option *n* |
| Shift + `1` to `9` | Decrements tally option *n* |
| Up and down arrows | Reserved for in-slide controls (rank, sort); never navigate |
| Escape | Close any open menu, leave blackout |

Two guards are mandatory:

```js
document.addEventListener('keydown', function (e) {
  var t = e.target;
  var typing = t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName);
  if (typing && e.key !== 'Escape') return;                         // the field keeps its keys
  if (t.tagName === 'BUTTON' && (e.key === ' ' || e.key === 'Enter')) return; // activate, do not advance
  /* ... dispatch ... */
});
```

Without the first guard, typing a space into a live-board entry advances the deck. Without the second, pressing Space on a focused button both activates it and moves on.

**Deep links.** The URL hash tracks the current slide (`#7`). Loading a deck with a hash opens that slide, so a refresh mid-session keeps the place.

### 8.3 Chrome

On-screen controls sit in a bordered plate in the bottom-right corner: previous, counter, next, and a `RESPONSES` menu (Export JSON, Import JSON, Reset with confirm). The plate idles out after 2.5s of no input, returning on any mouse move or keypress:

```js
['mousemove', 'keydown', 'touchstart', 'click'].forEach(function (evt) {
  document.addEventListener(evt, wake);
});
```

This is why the chrome can overlap the content safety margin without being seen during a presentation. A `0.7rem` progress bar across the top of the stage takes the slide accent, so it recolours as the deck advances. When a timer is running and the presenter leaves its slide, a compact timer appears in the chrome plate and stays visible regardless of idle state.

---

## 9. Activity patterns

### 9.0 Shared components

**Activity data.** Every activity reads its content from `ACTIVITIES`, keyed by slide id. Each entry names its `pattern` from the list below. Example:

```js
const ACTIVITIES = {
  // Check after the section on causal pathways. Edit text freely; keep one option with correct: true.
  's-check-pathways': {
    pattern: 'single-select',
    minutes: 2,                     // timer default; 0 hides the timer
    confidence: true,               // adds the confidence step before the reveal (9.4)
    stem: 'PLACEHOLDER: question stem',
    options: [
      { text: 'PLACEHOLDER: option A', correct: true,  why: 'PLACEHOLDER: why this is right' },
      { text: 'PLACEHOLDER: option B', correct: false, why: 'PLACEHOLDER: what is wrong',
        misconception: 'PLACEHOLDER: the misconception this option represents' }
    ]
  }
};
```

Pattern names: `single-select`, `multi-select`, `reveal`, `select-detail`, `retrieval`, `claim-tally`, `predict`, `peer-instruction`, `think-pair-share`, `stop-and-jot`, `sort`, `rank`, `spectrum`, `estimate`, `spot-the-flaw`, `complete-example`, `live-board`, `take-a-side`, `exit-ticket`, `spotlight`.

**Timer.** A bordered plate in the activity head showing `mm:ss` at `3.2rem` with `font-variant-numeric: tabular-nums`, so digits do not jitter. States: idle (shows the configured duration), running, paused, expired. On expiry the plate becomes a solid accent fill reading `TIME` (text colour per section 10). No sound. Under reduced motion, no pulsing. Clicking the plate toggles it, as does `t`. A running timer keeps counting when the presenter leaves the slide (section 8.3).

**Tally.** For recording the room's responses by show of hands or held-up cards. One row per option: the option letter, a `-` button, the count as an editable number input (so a presenter can type a total), a `+` button, and a bar in the option's accent showing its share, with the percentage. A total line beneath. Where there are two rounds, round 1 draws as an outlined bar behind the solid round 2 bar. The tally is a recording tool: it never implies a correct answer by itself.

**Response store.** Tallies, board entries, locked predictions and estimates save to `localStorage` under `slides:<collection>:<deck-file-stem>:v<N>` (`<collection>` is the course slug or `standalone`) on every change, wrapped in `try/catch`. Shape:

```json
{ "version": 1, "deck": "w04-causal-pathways", "savedAt": "2026-10-05T10:42:00Z",
  "activities": { "s-check-pathways": { "round1": [4, 11, 2, 0], "confidence": [5, 9, 3] } } }
```

Export downloads `<collection>-<deck-file-stem>-<YYYY-MM-DD>.json`. Import replaces the current state after a confirm. Reset clears it after a confirm. No field ever holds a participant's name.

### 9.1 Retrieval warm-up

**When:** the opening minutes, before outcomes. **Layout:** three to five prompt cards in `g-3` or a stack, each tagged with the week it comes from (`W2`), prompts at `1.6rem` or larger. **Mechanics:** a stop-and-jot timer runs while the room writes answers individually; then the answers reveal one card at a time (independent reveals). **Content:** drawn only from earlier decks in the course or from `COURSE.md`. Mix weeks. In a standalone deck the same layout serves as the prior-knowledge check, with prompts built from the brief's `What they already know`, and cards tagged `WARM-UP` rather than by week.

### 9.2 Claim tally

**When:** before any reveal where the room's prior view matters (claim and correction, take a side, predict and reveal). **Layout:** two or three options (`AGREE`, `DISAGREE`, `UNSURE` or supplied alternatives) with a tally. **Mechanics:** the presenter tallies, then reveals. The distribution stays visible beside the revealed content.

### 9.3 Predict and reveal

**When:** before introducing a result, a mechanism or a data set. **Layout:** `g-5-7`. Left: the situation and the question. Right: the options with a tally, or an open prompt with a stop-and-jot timer. **Mechanics:** the presenter presses `LOCK PREDICTIONS`, after which the options cannot change; then `r` reveals the actual outcome with its explanation and source line, and a follow-up prompt ("What would explain the gap?"). **Content:** the outcome must be real and sourced.

### 9.4 Confidence check

**A modifier** on any check (`confidence: true`). After options are chosen and before the reveal, a strip appears: `HOW SURE?` with `LOW`, `MEDIUM`, `HIGH` and a tally for each. After the reveal, if the room was confident and the popular answer was wrong, a banner prompts discussion of why that error felt right. Reserve the strip's height from the start.

### 9.5 Peer instruction

**When:** a conceptual question where a substantial part of the room is likely to be wrong. **Layout:** the question and options left, the tally right. **Mechanics:**

1. Round 1: the room votes; the presenter tallies. The round 1 distribution is hidden from the room by default (`showRound1: false`) to avoid herding.
2. The deck computes the round 1 correct share and labels the next action accordingly, without displaying the share. House default: discuss when roughly a third to two-thirds are correct (`discussBand: [0.3, 0.7]`); above the band the action is `REVEAL`; below it, `RETEACH FIRST`. This is a configurable rule of thumb, not a finding.
3. Discussion: `CONVINCE YOUR NEIGHBOUR` with a timer (default 2 minutes).
4. Round 2: the room votes again; the presenter tallies.
5. Reveal: the answer, every option's `why`, and both rounds' distributions together.

### 9.6 Think, pair, share

**Layout:** the prompt at `2.4rem` across the top; beneath it a three-block band (`THINK`, `PAIR`, `SHARE`) in the sequence-band style, each block showing its duration, the current phase solid and taller. **Mechanics:** the timer runs per phase; on expiry the phase highlight advances (the slide does not). Share can hand off to a live board (9.14) or a spotlight (9.17) on the next slide.

### 9.7 Stop and jot

**Layout:** the prompt at statement size, left; the timer and a `WRITE, DO NOT TALK` instruction right. **Mechanics:** 1 to 3 minutes of individual writing. Optional reveal of a model answer or of the criteria a good answer meets.

### 9.8 Sort

**When:** classifying cases into categories, including quadrant cells. **Layout:** a tray of up to ten item chips across the top; two to four bins beneath as columns with solid accent headers. **Mechanics:** click an item, then click a bin (works with touch and a mouse); drag is optional. A placed item takes its bin's colour. `CHECK` resolves each item as correct or incorrect with its `why`. With `key: null` there is no check; the deck shows the placements only. **Fit:** test the worst case, every item in one bin.

### 9.9 Rank

**When:** ordering by importance, size, sequence or strength of evidence. **Layout:** four to seven items in a vertical list, each with up and down buttons. **Mechanics:** select an item, then move it with the buttons or the up and down arrows. `r` reveals the reference order beside the room's, with each item's displacement shown as a number. With `key: null` there is no reveal. A key comes only from a supplied source.

### 9.10 Spectrum

**When:** positions on a contested question. **Layout:** a horizontal band of five (or seven) solid segments between two labelled poles; the poles take contrasting accents, the middle segments `--bg-deep`. **Mechanics:** the presenter adds a unit pip to a segment for each hand; pips stack above the band so the distribution is visible as a shape. An optional second round after discussion shows the shift. No key, ever.

### 9.11 Estimate

**When:** building number sense before a figure is given. **Layout:** the prompt and unit on top; up to eight number inputs for estimates called out by the room; a number line beneath (linear, or logarithmic via `scale: 'log'`). **Mechanics:** each entered estimate appears as a pip on the line, with the room median marked. `r` reveals the true value as a tall accent bar with its source line. Optional Fermi variant: a panel of decomposition steps revealed in turn. **Content:** the true value must be sourced.

### 9.12 Spot the flaw

**When:** evaluating an argument, a method or a solution. **Layout:** a passage of up to 90 words at `1.7rem`, with four to eight candidate segments marked by a dotted `--border` underline (subtle, so the flaws are not given away). **Mechanics:** multi-select on the segments the room calls out; `CHECK` marks each as a flaw or sound, each with its `why`, and shows found over total.

### 9.13 Complete the example

**When:** immediately after a worked example of the same type. **Layout:** the worked-example layout with some steps replaced by `?` cards. **Mechanics:** a timer while the room works; `r` reveals each blank step in turn with its reasoning. Fade across successive slides: one blank step, then most steps blank.

### 9.14 Live board

**When:** collecting the room's contributions after a share. **Layout:** cards flowing in a `g-4` grid, cycling accents; an input and optional tag selector pinned to the bottom of the body. **Mechanics:** the presenter types a contribution and presses Enter to add a card. Cards can be clustered by tag. Clicking a card selects it; deletion needs a confirm. At a configured capacity (default 12) card text drops to `.small`; beyond a second threshold (default 20) the board pages. **Fit:** test at both thresholds with the longest permitted entry (default 90 characters).

### 9.15 Take a side

**When:** a motion or policy question with defensible positions on both sides. **Layout:** the motion across the top; two columns beneath with contrasting solid headers (`FOR`, `AGAINST` or supplied labels). **Mechanics:** a spectrum or claim tally before; argument cards revealed alternately, one side then the other; a second tally after, showing the shift. **Balance:** equal numbers of arguments per side, of comparable strength, unless the instructor specifies otherwise.

### 9.16 Exit ticket

**When:** the final slide. **Layout:** two or three prompts on accent-bordered cards, for example: one thing you can now explain; one question you still have; your confidence on each outcome. **Mechanics:** the room responds on paper. A print-only sheet of A6 cards, four per A4 page with cut lines, carries the same prompts. If the instructor supplies a URL for digital collection, it appears as text on the slide; the deck makes no network call.

### 9.17 Spotlight

**When:** choosing which group shares next. **Mechanics:** picks a label at random from `ACTIVITIES[id].groups` without replacement until all have been picked, and reveals it at `h1` size on a solid fill. The presenter can skip. Group labels only, never individual names.

### 9.18 Fit in every state

Every activity must fit its frame in every state it can reach: all options selected, feedback shown for the longest `why`, the confidence strip open, both tally rounds with three-digit counts, every sort item in one bin, the board at capacity, every reveal open, the timer expired. Section 16 drives these states.

---

## 10. Colour and contrast

Use the eight palette values exactly as `CLAUDE.md` specifies for fills, rules, borders, card accents and decorative shapes. Text is the exception.

**Large text** under WCAG is at least 24px, or at least 18.66px bold. On a deck, pixel size depends on the display: body text at `1.85rem` is 35px at 1080p but 23.7px at 720p, which is below the large threshold. The contrast harness therefore runs at 1280x720, the strictest case.

### Accents as text on light surfaces

| Accent | On `--bg` | On `--bg-card` | Rule |
|---|---|---|---|
| `--accent-1` purple | 6.43:1 | 8.08:1 | Any size |
| `--accent-2` red | 4.83:1 | 6.08:1 | Any size |
| `--accent-5` brown | 4.94:1 | 6.21:1 | Any size |
| `--accent-6` magenta | 4.39:1 | 5.52:1 | Large only on `--bg`; any size on `--bg-card` |
| `--accent-8` lighter purple | 4.18:1 | 5.25:1 | Large only on `--bg`; any size on `--bg-card` |
| `--accent-3` burnt orange | 3.44:1 | 4.32:1 | Large only |
| `--accent-7` orange | 2.88:1 | 3.61:1 | Never on `--bg`; use `--accent-7-ink` (4.77:1) |
| `--accent-4` gold | 1.82:1 | 2.28:1 | Never; use `--accent-4-ink` (5.18:1) |

Give each component a paired custom property with a fallback, so the ink tone is opt-in per element and the default stays the palette colour:

```css
.card .card-name { color: var(--card-ink, var(--card-color)); }
```
```html
<div class="card" style="--card-color: var(--accent-4); --card-ink: var(--accent-4-ink)">
```

### Text on accent fills

| Fill | White on fill | `--text` on fill | Rule |
|---|---|---|---|
| `--accent-1` purple | 8.40:1 | 1.91:1 | White, any size |
| `--accent-2` red | 6.32:1 | 2.54:1 | White, any size |
| `--accent-5` brown | 6.45:1 | 2.49:1 | White, any size |
| `--accent-6` magenta | 5.74:1 | 2.80:1 | White, any size |
| `--accent-8` lighter purple | 5.46:1 | 2.94:1 | White, any size |
| `--accent-3` burnt orange | 4.49:1 | 3.58:1 | White, large only |
| `--accent-7` orange | 3.76:1 | 4.28:1 | `--text`, large only |
| `--accent-4` gold | 2.37:1 | 6.77:1 | `--text`, any size |

So banners, activity tags, timer expiry states and section dividers that carry body-size or smaller text use purple, red, brown, magenta, lighter purple or gold. Burnt orange and orange fills carry headings only.

### Other light-theme pairs

`--text-muted` is 5.07:1 on `--bg` and 6.38:1 on `--bg-card`, but 4.49:1 on `--bg-deep`: never set muted text on `--bg-deep`. Feedback text uses the ink column in `CLAUDE.md` (correct `#1F6A36`, ambiguous `#7A5410`), because the fill values fail as text.

### Dark theme

On `--bg` (`#1A1510`), most accents fail as text: purple 2.16:1, red 2.87:1, brown 2.81:1, magenta 3.16:1, lighter purple 3.32:1. Burnt orange (4.04:1) and orange (4.82:1 on `--bg`, 4.04:1 on `--bg-card`) are large text only. Gold (7.64:1) is the only accent usable as text at any size. In the dark theme, therefore, accents carry fills, rails, rules and borders; text is `--text` or `--text-muted`, or gold. Feedback green and red are also fills and borders only. The text-on-fill table above applies unchanged.

Run the contrast harness (section 16) after any colour change.

---

## 11. Decorative geometry at projection scale

The `CLAUDE.md` geometry rules apply, with deck-specific sizing.

- Background shapes run **`8rem` to `34rem`**. A shape that reads on a laptop disappears on a projector. Think in percentages of the frame, not pixels.
- Opacity stays at **`0.06` to `0.12`** on neutral backgrounds. At projection size a shape at `0.15` competes with the text. On solid fills (section dividers), shapes are `--bg` at `0.10` to `0.15`.
- Two or three shapes per slide, in contrasting hues, bleeding off at least one edge. `.deco { position: absolute; z-index: 1; pointer-events: none; }`, `.slide-inner` at `z-index: 2`, the rail at `4`.
- Activity slides keep their shapes away from the timer plate and the tally, where a shape behind a number reduces legibility.
- The stage has `overflow: hidden`, so rotated shapes clip cleanly at the frame edge.
- Hide all decoration in print.

---

## 12. Photographs and data

### 12.1 Photographs

Decoration is geometric and never figurative. Photographs are content, used where a real case is being discussed and the image carries information the text cannot. They are never background texture.

- **Only images the instructor supplies**, with a credit line on the slide. Screenshots of software the session uses count as supplied when the instructor asks for them; capture them from a staged or practice run with fictional data, never from live participant data, and say so in a caption on the first slide that shows them.
- **Embed as base64 data URIs.** The one-file rule permits no network calls, and a separate image file breaks opening the deck from the filesystem.
- **Resize to the display box before encoding.** Encode at the displayed aspect ratio and let `object-fit: cover` do the final fitting; quality `0.72` to `0.74` JPEG keeps a banner-sized image to a few tens of kilobytes. Encoding at a different aspect ratio and cropping twice wastes bytes and loses control of the framing.
- **Choose the crop deliberately**, so the subject survives a wide crop rather than a centre crop that decapitates people.
- **House treatment:** hard edges, no radius, a `0.4rem` rule beneath in the slide accent.
- **Alt text on every image**, describing what is visible without asserting facts the photograph does not show.
- **Keep them in print** with `print-color-adjust: exact`.

If no image tooling is installed, Chromium via Playwright can resize and re-encode through a canvas.

### 12.2 Charts

- **Inline SVG or positioned divs.** No chart libraries.
- **One claim per chart.** The heading states it; the chart shows it; the highlighted series is the one the claim is about.
- **Direct labels** on bars and line ends. A legend only when direct labelling is impossible.
- **Axes** start at zero for bar charts. Axis labels and tick labels at `1.25rem` or larger at displayed size.
- **Colour** from the accents, with the highlighted series in the slide accent and the rest muted. Meaning never depends on colour alone: labels or position carry it too.
- **Source line** in `.micro` beneath every chart, exactly as supplied.
- **Data only from supplied sources.** Placeholder data is labelled `PLACEHOLDER:` in the source line and in the report.

### 12.3 Constructed illustration

Archetypes 26 to 45 draw pictures from the house shapes. The picture is content: it carries the slide's idea, so it follows these rules rather than those for decoration in section 11.

- **Geometry only.** Squares, rectangles, circles, rings, triangles, bars and lines in the palette at full opacity. No figurative drawing, no icons, no gradients; a person is a square or a circle, never a figure.
- **SVG at ten units per rem.** Give an SVG a rem width and height and a `viewBox` of ten units per rem, so a 14-unit font renders at `1.4rem`. SVG text uses `fill: currentColor` with its colour set through `color`, so the contrast harness reads it.
- **Text on a fill is HTML.** The contrast harness resolves backgrounds through HTML ancestors only, so text that sits on an SVG shape reads as text on the stage. Put such text in an HTML element with its own `background-color` (a chip, a band, a block), or keep SVG text on the stage background.
- **Bleeds live at slide level.** A shape meant to run off the frame (water, a long rule) is a sibling of `.slide-inner`, positioned in stage units, not a child of `.s-body`; anything inside `.s-body` that passes the content box fails the fit check. Hide slide-level bleeds in the narrow layout.
- **Clipped viewports are allowed.** Content inside an ancestor with `overflow: hidden` (a zoom viewport, a plate) is measured only where it is visible.
- **Positions from data.** Compute positions from `ACTIVITIES` in JS (angles, fractions, function samples), never by hand, so content can change without redrawing.
- **True to scale or labelled as argued.** Areas, widths and fractions that encode numbers are exact; a picture whose proportions are judgement (a balance tilt) says so in a source line.
- **Narrow layout.** Figures keep their stage size and scroll sideways inside `.s-body`; grids collapse to one column.

---

## 13. Prose

A deck is read at a glance from twelve metres away.

**No dashes as punctuation.** Not em dashes, not en dashes, not spaced hyphens. Rewrite the sentence with a colon, a comma, brackets or a full stop. Swapping one dash character for another is not a fix. En dashes in numeric ranges go too; use a plain hyphen (`weeks 9-14`).

**No "it is not X, it is Y".** This construction and its variants read as filler. State the positive claim directly:

| Instead of | Write |
|---|---|
| "The literature review is not a summary. It is an argument." | "The literature review makes an argument." |
| "is not preamble, it is the foundation" | "builds the foundation" |
| "the link is hope, not logic" | "the link is only hope" |
| "This step is not optional. It is what makes the result valid." | "This step makes the result valid." |

The exception is where the contrast **is** the content: a question option whose meaning depends on the distinction, feedback explaining why a wrong answer is wrong, a claim-and-correction slide, or a definitional contrast. There, keep the meaning and use "rather than".

**Headings.** Evidence and relation slides take assertion headings: a full sentence stating what the slide shows. Framing slides take short topic headings.

**Instructions on activity slides** are imperative and short: `DISCUSS WITH YOUR NEIGHBOUR`, `WRITE ONE SENTENCE`, `HOLD UP A LETTER`.

Never invent study findings, statistics, citations, quotations or facts about real people, places or organisations. Placeholder content is prefixed `PLACEHOLDER:` and reported.

---

## 14. Speaker notes

Each slide may carry an `aside.notes` with up to 120 words: what to say, the question to ask before a reveal, the timing, likely misconceptions and how to respond to them. Notes are hidden on screen and in the default print. There is no presenter view; notes are for preparation and for the instructor print (section 15).

---

## 15. Print, narrow screens and motion

**Print.** One slide per A4 page:

```css
@media print {
  html { font-size: 8.6pt; }
  .deck { position: static; display: block; }
  .stage { width: auto; height: auto; background: #fff; overflow: visible; }
  .slide { position: static; display: block !important; page-break-after: always; animation: none; }
  .slide-inner { height: auto; padding: 3rem 3rem 3rem 5rem; }
  .progress-track, .deck-chrome, .deco, .timer, .tally-controls, .board-input { display: none !important; }
}
```

Because every dimension is in rem, `html { font-size: 8.6pt }` rescales the whole deck to the page in one line. Wide diagrams need a print-specific column count; a four-column chain becomes two columns on A4. Keep colour with `print-color-adjust: exact` on every filled element.

Two print modes, selected by URL parameter:

- **Student** (default): reveal-style content is forced visible, but answers, keys, `why` feedback, tallies and notes are hidden. Checks print as questions with their options. Select-one detail panels are hidden, since only one could ever print.
- **Instructor** (`?instructor`): answers highlighted, every `why` printed beneath its option, stored tallies printed as numbers, notes printed beneath each slide.

Exit-ticket A6 sheets print in both modes, after the slides.

**Narrow and portrait.** Below `860px` or above square, the stage becomes a scrolling single-column document with a fixed bottom nav bar:

```css
@media screen and (max-width: 860px), screen and (max-aspect-ratio: 1/1) {
  html { font-size: max(3.1vw, 9px); }
  .deck { position: static; display: block; }
  .stage { width: 100%; height: auto; min-height: 100vh; padding-bottom: 8rem; }
  .slide { position: static; }
  ...
}
```

**The `screen and` prefix is load-bearing.** A bare `(max-aspect-ratio: 1/1)` also matches the A4 print viewport, which silently gives printed handouts the mobile layout.

Every multi-column grid collapses to `1fr`, and touch targets (tally steppers, sort items, rank buttons) go to at least 44px. Verify at 360px.

**Motion.** Honour `prefers-reduced-motion: reduce` by flattening all animation and transition durations to `0.001ms`, and by disabling any pulsing on the expired timer.

---

## 16. Verification

A deck cannot be signed off by looking at it. The harnesses below run in headless Chromium via Playwright; use an existing global install if one is present, otherwise install Playwright as a dev dependency. Implement them once in `tests/verify-deck.mjs`, taking the deck path as an argument, and reuse them for every deck. Run them after every significant change, not once at the end.

**Fit.** The most important check. For each slide, measure the lowest point of any element in `.s-body` against the bottom of the content box. A positive number is content intruding into the bottom padding; anything past the padding is clipped.

```js
const r = await page.evaluate(() => {
  const s = document.querySelector('.slide.active');
  const inner = s.querySelector('.slide-inner');
  const pad = parseFloat(getComputedStyle(inner).paddingBottom);
  const limit = inner.getBoundingClientRect().bottom - pad;
  let m = 0;
  s.querySelector('.s-body').querySelectorAll('*').forEach(el => {
    const b = el.getBoundingClientRect();
    if (b.height > 0 && b.bottom > m) m = b.bottom;
  });
  return Math.round(m - limit);
});
```

The harness clips each box to any ancestor inside the slide that hides its overflow, so a zoom viewport or a cropped plate is measured only where it is visible.

Run at 1920x1080, 1440x900 and 1280x720. Because everything is in stage units the three should agree proportionally; if they do not, something is not in rem. Also check that nothing overlaps the timer plate.

**States.** Fit must hold in every state a slide can reach. Drive each activity from `ACTIVITIES` to its worst state (section 9.18), then measure: select every option, check every multi-select, open every reveal, select each card in turn, fill every tally with three-digit counts across both rounds, open the confidence strip, put every sort item in one bin, fill the live board to both thresholds with maximum-length entries, expire the timer.

**Keyboard.** On each slide: tab through every control and confirm a visible focus state; type a space and a digit into every text and number input and confirm the slide does not change; press Space on a focused button and confirm the deck does not advance.

**Persistence.** Record tallies and board entries, reload, and confirm they return. Export, reset, import, and confirm the state matches the export. Confirm the deck still runs with `localStorage` throwing.

**Contrast.** At 1280x720, walk every text node on every slide in every state, resolve its computed colour against the nearest non-transparent ancestor background (including solid fills), and apply the WCAG AA threshold for its rendered size and weight: 3:1 for large text, otherwise 4.5:1. This catches accent text on cream, body text on burnt orange or orange fills, and decorative glyphs such as disclosure arrows.

**Print.** Emulate print media in both modes. Measure each slide's height against the A4 content box (about 1048px at 10mm margins), and render a PDF to confirm the page count equals the slide count plus exit-ticket sheets. Confirm no answer or `why` text appears in student mode.

**Lint.** Run `node tests/lint.mjs` (see `CLAUDE.md`).

Then screenshot every slide in its initial and final states and look at them. The harnesses prove nothing is broken; only your eye tells you whether the composition is any good.

---

## 17. Build order

1. Read the context file (`COURSE.md` or the brief). Note the interaction level for a standalone deck. Write the outcomes and the argument as plain prose.
2. Plan the session arc (section 7.1): slide list with archetype, accent, the one idea per slide, activity pattern, minutes, and the outcome each activity exercises. Get approval.
3. Build the stage, the type scale and the slide skeleton. Verify one slide fits.
4. Assign accents, cycling for contrast or following the course mapping.
5. Lay out each slide against the archetypes in section 6. Measure fit as you go.
6. Write `ACTIVITIES`. Build the shared components (timer, tally, response store), then each activity pattern. Measure fit in every state.
7. Wire the keyboard, including both guards, deep links and blackout.
8. Add decorative geometry, sized in stage units.
9. Run the contrast harness. Apply ink tones and fill pairings where needed.
10. Add print (both modes), exit-ticket sheets and the narrow layout. Confirm page counts and 360px.
11. Write speaker notes.
12. Sweep the prose per section 13.
13. Run every harness in section 16. Screenshot every slide and judge the composition.
14. Add the deck to `index.html` and the `CLAUDE.md` Files section. Record any newly built archetype in the register in section 6.
15. Report results and every `PLACEHOLDER:` string.

---

## 18. Common failures

| Symptom | Cause |
|---|---|
| Content clipped at the bottom on a projector | A slide was never measured in its expanded state |
| Layout correct at 1920 but wrong at 1280 | A dimension in `px`, `vw` or `clamp()` instead of `rem` |
| Printed handout uses the mobile layout | Narrow media query missing the `screen and` prefix |
| Student handout shows the answers | Feedback or key elements not hidden in default print mode |
| Gold or orange labels wash out on screen | Palette colour used as text; needs the ink tone |
| Body text on an orange banner fails contrast | Burnt orange and orange fills carry headings only |
| Accent text unreadable in the dark theme | Only gold may be used as text on dark surfaces |
| Page reads as "beige with text" from the back | Too few accent fills; add colour blocks, not tints |
| Presenter controls sitting on top of the content | Idle-hide not wired, or the slide genuinely overflows |
| Typing into the live board advances the deck | Keyboard guard for input focus missing |
| Pressing Space on a button skips a slide | Keyboard guard for focused buttons missing |
| Tallies lost after a refresh | Response store not written on every change, or storage error swallowed without fallback |
| Stored responses attach to the wrong slide after reordering | Activities keyed by position rather than slide id |
| Timer jitters as it counts | Missing `tabular-nums` |
| Sort bins overflow | Never tested with every item in one bin |
| Diagram unreadable at 19 characters per line | Too many columns; reduce the count or move connectors to their own row |
| A slide needs body text below `1.3rem` | Too much content; split the slide |
| Forty minutes of slides with no response from the room | Session arc not planned against section 7.1 |
| A reveal shows a figure with no source line | Content invented or source omitted; mark `PLACEHOLDER:` and report |
