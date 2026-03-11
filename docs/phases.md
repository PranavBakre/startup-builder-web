# Game Phases

## Phase Overview

| # | Phase | Summary | Key Systems Needed | Status |
|---|-------|---------|--------------------|--------|
| 1 | **Problem Discovery** | Player walks the map, talks to NPCs to surface real-world problems, collects them in a notebook, and chooses one as their startup direction. | MovementSystem, DialogueSystem, NotebookSystem, HUD, Minimap | Complete (tagged `phase-1`) |
| 2 | **Build Product Website** | After selecting a problem, the player enters a mini-game to build a website for their product. The website affects perception, customer acquisition, and launch success. | Website builder UI (drag-and-drop templates), product data model, customer perception score | Not started |
| 3 | **Hiring** | A job board becomes available. The player creates job postings, reviews NPC applicants (with experience, salary, skills), and selects hires. | Job board UI, applicant generation system, employee data model, salary/budget tracking | Not started |
| 4 | **Office Setup** | The player visits the Office building on the map and sets it up with furniture, equipment, and infrastructure. Setup costs deducted from capital. Hired employees are assigned here. | Building interior scene, office layout UI, cost system, employee assignment | Not started |
| 5 | **Team Management & Product Development** | Employees are assigned roles and focus on product aspects. Player directs feature development, prioritizes work, iterates on product. Daily revenue trickle begins. | Role assignment, feature pipeline UI, product iteration loop, revenue/burn rate system, funding mechanics | Not started |
| 6 | **Product Launch Event** | An in-game launch event triggers a customer spike. Post-launch, interest declines over time, pressuring continuous iteration and expansion. | Launch event system, customer growth/decay model, feature impact scoring | Not started |
| 7 | **Growth Cycles** | Recurring endgame loop: market upturns/downturns, funding rounds (pitch-based with LLM evaluation), investor events, scaling challenges. Player navigates cycles toward $1B valuation. | Market cycle engine, pitch/funding UI, investor AI, valuation formula, equity dilution tracker, employee scaling | Not started |

## Economy Summary

| Item | Details |
|------|---------|
| Starting Capital | $100,000 |
| Revenue Sources | Daily customers, funding rounds, grants, product sales |
| Costs | Employee salaries, office setup, office rent, operations, marketing |
| Win Condition | Company valuation reaches $1,000,000,000 |
| Fail Condition | Bankruptcy without recovery within 24 in-game hours (48 real minutes) |

## Key Mechanics

### Bankruptcy
- If the player runs out of money, they have 24 in-game hours (48 real-world minutes) to secure new funding or pivot to a new idea.
- Failure to recover forces a new game.
- **Loyalty Bonus**: On restart, a percentage of previous employees return at reduced salaries.

### Pivot
- The player can change their startup direction at any time.
- NPCs react to the pivot ("Oh, you're working on _this_ now?").
- Costs: lost momentum, possible employee turnover.
- Benefits: access to new problem spaces and customer segments.

### Time Scale
- 24 in-game hours = 48 real-world minutes.
- 1 in-game month = ~24 real-world hours.
- The game has idle-time elements: employees keep building, customers keep arriving, market shifts happen while the player is away.
- Auto-pause after 7 real-world days of inactivity to prevent passive bankruptcy.

### Valuation & Funding
- Valuation follows real-world formulas: revenue, growth rate, user base, market size, team quality.
- Funding rounds are pitch-based. An LLM evaluates the pitch in real-time.
- Investors have personalities and preferences. Equity dilution is tracked.
