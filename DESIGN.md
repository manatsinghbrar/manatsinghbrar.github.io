# DESIGN.md: v2 redesign (2026-10-22)

Supersedes the v1 spec (`.scratch/portfolio-site/spec.md`). The author gave a free hand after
judging v1 "too empty and too dark" and supplying a new resume. The v1 site is kept in
`.scratch/v1-site/` and in git history.

## Brief

- **Subject:** Manat Singh Brar, frontend engineer at Privafy (Senior Software Engineer since
  Aug 2026, an SDE 2 level role). 3+ years of React and TypeScript on an enterprise security
  console.
- **Audience:** recruiters and hiring managers for SDE 2 frontend roles. The recruiter already
  has the CV and gives the site under two minutes. The engineer they forward it to opens devtools.
- **Job:** prove depth fast, then get the email.
- **Source of truth:** the resume (Oct 2026). Every number on the site comes from it. No new
  claims are invented. Case pages add only detail that v1's author-approved copy already stated.
- **Still firm from v1:** no screenshots, mocks or redrawn UI of Privafy's product (NDA,
  author's own risk preference). Figures on the site visualise the real numbers, nothing else.
- **Kept off the site:** phone number, the resume's testing claims.

## Concepts

| | Idea | Anchor | Signature | O / F / Fe / P |
|---|---|---|---|---|
| A. Material | The work index is the data table he built: sort it, search it, open any row | He wrote 64% of the shared table used by 66 screens | Rows re-sort in place; a search lights matches like a search hit; a row expands into its case page | 3 / 5 / 5 / 2 |
| B. Process | The career drawn as a process tree from an EDR console, branches spawning as you scroll | He built the process-tree views for threat investigation | The tree grows a branch per section | 4 / 4 / 3 / 1 |
| C. Formal | Every element labelled with its real transfer size, the page laid out as a network waterfall | The 10.4 MB to 390 KB bundle cut | A waterfall streams the page in | 4 / 4 / 4 / 2 |

**Pick A.** It is the thing he is proudest of building, it reads in one second to a recruiter
(everybody knows a table), and it turns "too empty" into dense, real information. B is legible
only to security people; C celebrates one result out of seven. **Stolen from B:** the 404 is an
empty result set ("0 rows match"), the investigation figure is a tree.

## Concept card

```
Idea:        My work, as the data table I built for 66 screens: sort it, search it, open a row.
Metaphor:    An enterprise data grid. Columns, sort, search highlight, row expand, saved view.
Signature:   The work table on the home page. Headers sort (rows slide to their new order),
             the search box highlights matching cells, and opening a row expands it into the
             case page (shared-element transition, the row becomes the case header).
Emotion:     First 3 s: "this person ships real things, and there is a lot of it". Calm, exact.
Motion verb: Re-sort. Rows lift, slide to their new place and settle. Quick, no bounce.
Screenshot:  The home first frame: the statement over the table, a search hit lit in yellow.
```

## System

**Palette** (light, from a console in daylight; yellow is the search-match highlight)

| Role | Hex | Use |
|---|---|---|
| ground | `#ECEEF1` | page |
| surface | `#FFFFFF` | table and panels |
| ink | `#0B0D12` | text, rules at strength, curtain |
| muted | `#555C6A` | secondary text (5.9:1 on ground) |
| line | `#D3D7DE` | hairlines |
| hit | `#FFD84D` | search match, hover/focus flood, selection only. Never at rest, never as text; text on it is always `#0B0D12` |

Results in figures (the "after" square, bar, cells, final step, store node) are filled yellow
with an ink outline (the user found solid ink too heavy there); this is the one at-rest use of
yellow. Text on them is `--c-on-hit`. The footer finale inverts to ink ground. No other colour.

**Dark appearance** (header toggle, light by default; the system setting is deliberately not
followed, at the author's request; the choice is kept in localStorage): ground `#0F1115`, surface `#171A20`,
ink `#E6E8EC` (15.4:1), muted `#9AA1AD` (7.3:1), line `#2B3039`, footer `#08090C` (stays the
darkest ground instead of flipping light). Hit is unchanged. Increase Contrast has its own
values in both appearances (`tokens.css`).

**Rules.** Only the Work section opens on an ink rule (the table's top edge); every other
section opens on a hairline.

**Type.** Supreme (Fontshare) 400/500 for display and text. IBM Plex Mono 400/500 only
inside the table and figures (column headers, cell data, counters), where mono is the honest
voice of a data grid. Display tracking -0.035em at t-xl, -0.02em at t-l. Body 17 px / 1.55.
Tabular figures everywhere a number sits in a column.

**Grid.** 12 columns, fluid gutter, wrap 1520 px. Three hang lines: col 1, col 4, col 8. Every
text block starts on one of them. Section rhythm: hero airy, table tight, facts normal, career
tight, about airy, footer full.

**Shape.** Radius 0 on structure, 999px only on the search field and the hit marks.

**Motion.** One ease family (expo), no animation library: CSS transitions, Web Animations and
View Transitions only. Text reveals rise out of their own box as one block (no per-line split).
Rows re-sort: 0.6 s `--ease-out`. Page transition:
the curtain arrives as six ink rows staggered from the left (a table filling), 0.7 s, and
leaves the same way. Row to case: the clicked row grows to the case header. Hovers 0.3 s.

**Treatments (one per role).**
- Primary rows and CTAs: the hit colour floods from the left (scaleX), the title slides 6 px,
  the arrow travels.
- Nav: underline draws; the current section keeps it.
- Inline links: underline at rest that rises into a hit band.
- Utility links: colour only.

**Idle.** While the table is on screen and untouched, the search box types an example query
from the real stack (TypeScript, Webpack, SSE…) and highlights the matching cells, then clears.
It stops for good the moment the visitor focuses, types or sorts. Off under reduced motion.
The header clock (Bangalore time, which tells a remote employer the overlap) ticks.

**No loader, no WebGL.** A hiring page must be readable at once; the craft is in type, table
and transitions.

## Composition

```
HOME
┌ name ──────────── Work  Track record  About  Contact ────── Bangalore 21:14 ┐
│ Senior software engineer, frontend. Privafy.                                │
│ I build the frontend security analysts                                      │  statement, t-xl, cols 1-10
│ work in all day, and keep it fast.                                          │
│ [search work…]                           sort: Area  Result  Level          │
│ ┌ # │ Work                  │ Area        │ Level   │ Result            ┐   │  index table (signature)
│ │ 01│ The 10 MB bundle      │ Performance │ SDE     │ 10.4 MB → 390 KB  │   │
│ │ …                                                                     │   │
└──────────────────────────────────────────────────────────────────────────────┘
TRACK RECORD   the table's summary row: 6 cells in one frame, mono label over figure  data / facts
CAREER         a second table: Dates / Role / Scope, same hover flood, no links   table, again
ABOUT          left: facts column (education, recognition); right: paragraph t-m  asymmetric pair
STACK          five groups in a column flow                                     list
FOOTER         ink ground, giant email, CV + LinkedIn, colophon                  finale

CASE /work/<slug>/
  expanded-row header (the row from the table, grown): title t-xl, meta cells (area, level, stack)
  figure: the real numbers drawn (area-true squares, bars, 66-cell grid, tree)
  Context / What I did / Outcome, each a heading on col 1-3 and text on col 4-10
  next case row → continuous transition

404: an empty table, "0 rows match /<path>", clear search → home.
```

## Genericness test

- A generic model would ship dark mode with a gradient hero and three project cards. Here: light
  console ground, a real table as the hero, no cards.
- "Mono for every label" is a tell: mono is confined to the table and figures.
- The yellow is not an accent colour picked for taste; it is the search-hit highlight, so it only
  appears where something matched or is under the pointer.
- No eyebrow above every heading: section headings are plain t-l headings.
