# FEED briefing

## Occasion
- Event, host and date: masterclass session that runs the FEED simulation over Zoom; shown before play, after everyone has arrived and before anyone joins; date not supplied (file dated 2026-10 as assumed first delivery)
- Format and length: assumed 15-minute briefing over Zoom, followed by the session itself (35 to 60 minutes of quarters) and a 20 to 30 minute debrief run from the app's results screen
- Room and audience size: Zoom; size not supplied. Responses are typed in the Zoom chat
- Accent colour for this deck: `--accent-6` (magenta)
- Theme: dark

## Audience
- Who they are: a class of non-experts who will run competing fictional social platforms in FEED
- What they already know: assumed nothing about the simulation, its screens or the economics of social platforms
- What they need to leave with: the three decisions a firm makes each quarter, how public trust, reach and cash feed a firm's valuation, and how to join a firm, commit a decision and read the result on the phone and the shared screen

## Interaction level
- light, with answers typed in the Zoom chat

## Content
- Frameworks and exact terms: the in-app display vocabulary, exactly as the app uses it (FEED spec section 5.0): firm or platform, ticker, PIN, quarter, FEED (1 CHRONO, 2 RANKED, 3 AUTOPLAY, 4 STREAKS; written "FEED 2", never "feed level"), SAFEGUARDS (share of the reference budget, 0% to 30%), card (CLONE, PUBLISH, LOBBY, BLITZ, SHARE, LAUNCH), commit, AUTO, public trust, ad market, share of attention, reach, valuation, public exposure (LOW, MED, HIGH, SEVERE), harm story (HARM), youth design code (YDC-A), wire, board, DESK, BOOK, YDC, WIRE, Office of Platform Safety
- Sources approved for citation on slides: the FEED specification (`docs/spec.md` in the frontier-feed repository), sections 5, 6.4 to 6.7, 9, 14 and 15; the in-app briefing copy (`src/screens/Screen/briefing.ts`) and card effects (`src/screens/Play/model.ts`); screenshots of the app captured from staged sessions against the local emulators (fictional firms and bots, fixed seed), including the facilitator guide's screenshots
- Facts or examples that must not be used:
  anything the spec hides from participants: the crackdown point (tau), the end quarter, other firms' private data, unaudited violations
  any numbers that reveal parameters (spec 14.5), beyond what the app itself shows on a phone or the shared screen
  the purpose of the simulation and the vocabulary banned before the results screen (spec 15.3): commons, tragedy, sustainable or sustainability, cooperate or cooperation, collective, shared resource, tipping point, threshold, collapse, game, player, score, win, level, addictive, addiction, dark pattern, attention economy, externality, lawsuit, mental health crisis, and the names of real platforms
  the terms banned everywhere (spec 15.2)
  real companies, platforms or people, including the case the masterclass is built around; only the fictional entities in spec 15.4 (Office of Platform Safety, the Assembly, Halden Research)

## Voice
- Register, terminology to prefer or avoid: plain English for non-experts, addressed to "you" and "your firm"; app labels quoted exactly in capitals; "shared screen" for what the facilitator shares from the projector view; UK English in deck prose
- Anything else the deck must or must not do: the deck file is public on GitHub Pages, so speaker notes follow the same non-telegraphing rule as the slides; a position prompt at the start may be revisited in the debrief, but nothing in the deck may name or hint at the lesson. The deck is the FRONTIER briefing (`standalone/2026-10-frontier-briefing.html`) adapted to FEED, as the owner asked
