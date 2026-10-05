# FRONTIER briefing

## Occasion
- Event, host and date: class session that runs the FRONTIER simulation; shown before play, after the room has arrived and before anyone joins; date not supplied (file dated 2026-10 as assumed first delivery)
- Format and length: assumed 15-minute briefing, followed by the session itself (35 to 60 minutes of quarters) and a 20 to 30 minute debrief run from the app's results screen
- Room and audience size: not supplied
- Accent colour for this deck: `--accent-4` (gold)
- Theme: dark

## Audience
- Who they are: a class of non-experts who will run competing AI firms in FRONTIER
- What they already know: assumed nothing about the simulation, its screens or AI industry economics
- What they need to leave with: the three decisions a firm makes each quarter, how public trust, capability and cash feed a firm's valuation, and how to join a firm, commit a decision and read the result on the phone and the projector

## Interaction level
- light

## Content
- Frameworks and exact terms: the in-app vocabulary, exactly as the app uses it: firm, ticker, PIN, quarter, pace (Cautious, Standard, Aggressive, Breakneck), safety spend (share of the reference budget, 0% to 30%), card (POACH, PUBLISH, LOBBY, BLITZ), commit, AUTO, public trust, market, share, valuation, public exposure (LOW, MED, HIGH, SEVERE), pact, wire, board, DESK, BOOK, PACTS, WIRE
- Sources approved for citation on slides: the FRONTIER specification (`docs/spec.md` in the frontier repository), sections 5, 6.4, 6.5, 6.6, 9, 14 and 15; the in-app briefing copy (`src/screens/Screen/briefing.ts`) and card effects (`src/screens/Play/model.ts`); screenshots of the app captured from a staged session against the local emulators (fictional firms and bots, fixed seed)
- Facts or examples that must not be used:
  anything the spec hides from participants: the collapse point (tau), the end quarter, other firms' private data, unaudited violations
  any numbers that reveal parameters (spec 14.5), beyond what the app itself shows on a phone or the projector
  the purpose of the simulation and the vocabulary banned before the results screen (spec 15.3): commons, tragedy, sustainable or sustainability, cooperate or cooperation, collective, shared resource, tipping point, threshold, collapse, game, player, score, win, level
  the terms banned everywhere (spec 15.2)
  real companies or people; only the fictional entities in spec 15.4 (Office of Frontier Systems, the Assembly, Halden Research)

## Voice
- Register, terminology to prefer or avoid: plain English for non-experts, addressed to "you" and "your firm"; app labels quoted exactly in capitals; UK English in deck prose
- Anything else the deck must or must not do: the deck file is public on GitHub Pages, so speaker notes follow the same non-telegraphing rule as the slides; a position prompt at the start may be revisited in the debrief, but nothing in the deck may name or hint at the lesson
