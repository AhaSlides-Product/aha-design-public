---
name: aha-design-table-judge
description: "Authoritative judge / verdict-giver for an AhaSlides data grid — the evaluation counterpart to aha-design-table (the build skill). Use whenever an agent reviews, audits, scores, critiques, or self-checks a table of rows and columns in AhaSlides product UI: a PR diff that adds or edits an AntD <Table> / columns= / dataSource= grid, a DataTable, a results/leaderboard/participant/admin list, a 'is this table correct?' question, or the self-check that should run after building a grid. Emits a binary PASS / FAIL verdict per criterion (no partial credit) across the DS V3 table rules — (C1) it is the shared DataTable, not hand-rolled or a raw restyled AntD Table; (C2) the look is theme-driven with no per-table styling; (C3) the header is white with secondary-grey labels, not AntD's grey fill or a coloured header; (C4) body has horizontal dividers only, no zebra/vertical grid lines; (C5) sort is a single directional arrow, filtering uses the canonical checklist/range popovers, freeze is right-click one-at-a-time pinned-left, pagination shows the size changer; (C6) every icon is @phosphor-icons/react, never emoji; (C7) colour/radius come from tokens, never raw hex/px. Burden of proof is on PASS: a table you cannot justify against the rules is a FAIL. Trigger on phrases like 'review this table', 'is this data grid correct', 'judge my table', 'check the results/leaderboard table', 'audit the AntD Table', 'does this grid follow our design system', 'self-check after building a table'. Do NOT trigger while BUILDING a table (use aha-design-table), for a status pill inside a cell (aha-design-status-badges), a non-columnar list/card stack, an end-user editable spreadsheet block in slide content, or generic AntD theming unrelated to a table (aha-design-antd)."
---

# Judging an AhaSlides data grid

This skill is the **judgment counterpart** to `aha-design-table` (which guides building the
same grid). Reach for it when reviewing finished table work — a PR diff, a review request,
or a self-check at the end of a build — to decide whether a data grid follows the DS V3
house rules. Don't reach for it while building — use `aha-design-table` for that.

> **Scope.** Any table of rows and columns in AhaSlides **product UI** — a results,
> leaderboard, participant, admin, or dashboard grid; an AntD `<Table>`; a `DataTable`. It
> is **not** for a status pill inside a cell (→ `aha-design-status-badges`), a plain
> non-columnar list/card stack, an end-user editable spreadsheet block authored inside
> slide content, or generic AntD theming (→ `aha-design-antd`).
>
> **Cross-skill reference.** Hand other layers to their owners: token/colour mechanics →
> `aha-design-antd`; glyph choice → `aha-design-icons`; a state pill in a cell →
> `aha-design-status-badges`; empty/loading/mobile-swap primitives →
> `aha-design-shared-components`. This judge checks the grid is *the shared component,
> themed, shaped, and behaving* the DS V3 way — nothing else.

---

## How to use

1. Locate the table under review — a `DataTable`, an AntD `<Table>`, or any rows/columns
   grid in the diff. Read the target rules from the build skill —
   `aha-design-table/SKILL.md` (the format sections + "Test-case assertions" TABLE-01..10)
   and, for exact values, the `components.Table` block. Don't judge from memory; diff
   against them. `references/table-preview.html` and `references/DataTable.reference.tsx`
   are the ground truth for the look and the code.
2. Confirm it is genuinely an app-chrome **data grid**. If it's a status pill, a
   non-columnar list, or an end-user content table, this judge does **not** apply — say so
   and route it (see *When NOT to use*).
3. For each criterion below, gather evidence, decide **PASS** or **FAIL**, and capture a
   1-line piece of evidence (`file:line` where possible).
4. **Emit the verdict report** using the exact template at the bottom — same shape every
   time so reviewers can scan it.

**Why binary, no partial credit.** A table either honours each rule or it doesn't —
"mostly right" is a polite FAIL. Binary keeps the judge consistent across reviewers and runs.

**Burden of proof is on PASS.** Some rules can't be confirmed from a diff alone — whether
the look is truly theme-driven needs the `components.Table` block or a rendered check;
"single-arrow sort" needs the `sortIcon` override visible. If you cannot verify a criterion,
mark **FAIL** and say why under `## Notes / unverifiable`; don't wave it through. Pretending
unclear code passes is how a hand-rolled, grey-header, emoji-iconed table reaches prod.

---

## The 7 criteria

### C1. It is the shared DataTable — not hand-rolled, not a restyled raw Table → PASS / FAIL
**Rule.** The grid renders through the shared `DataTable` (AntD `<Table>` underneath). A raw
`<table>`/`<div>` grid, or a bare AntD `<Table>` dropped in with its own styling, is a FAIL.
**Common failure modes (any one → FAIL):** a hand-built `<table>`/`<div>` grid; a raw
`<Table>` not going through `DataTable`; a "temporary" custom grid that duplicates the
component.

### C2. The look is theme-driven — no per-table styling → PASS / FAIL
**Rule.** The appearance comes from the theme (`components.Table`), not the call site. A
per-table `bordered`, `size`, `rowClassName` zebra, inline header/cell style, or ad-hoc
container styling is a FAIL.
**Common failure modes:** `bordered` / `size="small"` on the instance; `rowClassName`
striping; inline `style` tinting a header or cell; a wrapper re-rounding/re-bordering the grid.

### C3. Header is white with secondary-grey labels → PASS / FAIL
**Rule.** The header is **white** (`headerBg:#fff`) with **secondary-grey** labels
(`colorTextSecondary`) and a bottom divider — never AntD's default grey `#fafafa` fill, and
never a coloured/tinted header.
**Common failure modes:** the AntD default grey header left in place; a brand-tinted header;
black/`colorText` header labels instead of secondary-grey.

### C4. Body has horizontal dividers only — no zebra, no vertical grid lines → PASS / FAIL
**Rule.** Rows are separated by horizontal dividers (`#e3e3e3`) only. No zebra striping, no
vertical cell borders (`bordered`).
**Common failure modes:** `bordered` full grid lines; alternating-row background; a coloured
row fill that isn't a sanctioned semantic state.

### C5. Behaviour matches DS V3 — sort arrow, filter popovers, freeze, pagination → PASS / FAIL
**Rule.** Where the feature is present it must match DS V3: **sort** = a single directional
arrow (not AntD's dual caret); **filter** = the canonical checklist (search + Reset/Apply) or
Min/Max range (Reset/Apply) popover; **freeze** = right-click, one column at a time, pins
leftmost with a shadow, disables reorder while frozen; **pagination** = brand-outlined active
page + the "N / page" size changer (`showSizeChanger`). Judge only the features the table
actually ships; mark a feature **N/A** if absent — but a shipped feature done a non-DS-V3 way
is a FAIL.
**Common failure modes:** AntD's default dual-caret sort left in; a bespoke per-column filter
UI; multi-column freeze or a freeze that still reorders; `showSizeChanger` disabled / a
hand-rolled footer.

### C6. Every icon is @phosphor-icons/react — never emoji → PASS / FAIL
**Rule.** All glyphs (help, filter funnel, sort arrow, export, pin, drag handle) come from
`@phosphor-icons/react`. An emoji used as an icon, or a glyph from `@ant-design/icons` /
another set, is a FAIL (see `aha-design-icons`).
**Common failure modes:** a `🔍`/`📌`/`⚙️` emoji in the toolbar, filter search, or menu; an
`@ant-design/icons` import; an inline one-off SVG where a Phosphor glyph exists.

### C7. Colour & radius come from tokens — no raw hex/px → PASS / FAIL
**Rule.** Colour and radius in columns, cell renderers, `rowClassName`, and the container
bind to `theme.useToken()` / `--aha-*` and the radius scale — never a raw `#hex` / `rgb()` /
magic-`px` radius.
**Common failure modes:** `style={{ color: '#6a1ebb' }}` in a cell; `borderRadius: 12` on the
container; a hardcoded status colour in a renderer instead of a token / a status pill.

---

## Verdict report (emit exactly this shape)

```markdown
# Data-grid judge report — <component name or file path>

| # | Criterion | Verdict |
|---|---|---|
| C1 | Shared DataTable, not hand-rolled / restyled raw Table | ✅ PASS |
| C2 | Look is theme-driven, no per-table styling | ❌ FAIL |
| C3 | White header + secondary-grey labels | ❌ FAIL |
| C4 | Horizontal dividers only, no zebra/grid lines | ✅ PASS |
| C5 | DS V3 sort / filter / freeze / pagination | ✅ PASS |
| C6 | Icons from @phosphor-icons/react, no emoji | ✅ PASS |
| C7 | Colour & radius from tokens, no raw hex/px | ✅ PASS |

**Overall: NEEDS FIX** (2 failing criteria)

## Fails

### ❌ C2 — Theme-driven look
**Where:** `features/results/ResultsTable.tsx:41`
**Evidence:** `<Table bordered size="small" rowClassName={zebra}>` — appearance set on the
instance, not the theme.
**Fix:** render through the shared `DataTable` and delete the per-table `bordered` / `size` /
`rowClassName`; the look comes from `components.Table`.

### ❌ C3 — White header
**Where:** `features/results/ResultsTable.tsx:41`
**Evidence:** raw AntD `<Table>` renders the default grey `#fafafa` header.
**Fix:** use `DataTable` / the `components.Table` theme (`headerBg:#fff`,
`headerColor:colorTextSecondary`, `headerSplitColor:transparent`).

## Passes — brief

C1, C4, C5, C6, C7 — shared component, dividers-only, DS V3 behaviour, Phosphor icons, and
tokenised colour all check out.

## Notes / unverifiable

- (List anything judged under uncertainty — e.g. "couldn't see the theme block from the diff;
  marked C2 FAIL per burden-of-proof" — and any criterion marked N/A because the feature is
  absent.)
```

**Overall verdict rule:** any FAIL → `NEEDS FIX`. All PASS (N/A allowed for absent features)
→ `OK TO SHIP`.

Always include: the 7-row verdict table (in order); a `## Fails` section with a sub-section
per failed criterion (**Where** `file:line`, **Evidence** 1 line, **Fix** concrete action); a
1-line `## Passes — brief`; and a `## Notes / unverifiable` section whenever a judgment was
made under uncertainty or a feature was N/A.

---

## When NOT to use this skill

- **Building or editing** a table in the first place → use `aha-design-table` (the build
  skill). This judge evaluates finished work.
- A **status/state pill** rendered inside a cell → `aha-design-status-badges`.
- A **plain non-columnar list or card stack** → not a data grid; this judge doesn't apply.
- An **end-user editable spreadsheet-style block authored inside slide content** → content,
  not app-chrome; out of scope.
- Generic **AntD theming / a non-table component** → `aha-design-antd`.

---

## Closing the build → judge → fix loop

This judge runs at the **end** of a build pass — by a human reviewer or by the build agent as
a self-check. The expected loop:

1. Build the grid with `aha-design-table` (shared `DataTable`, theme-driven look, DS V3
   behaviour, Phosphor icons, tokenised colour).
2. Invoke this judge → emits the verdict report.
3. Any FAIL → fix the specific files cited under `## Fails` → re-invoke this judge.
4. Repeat until the verdict is `OK TO SHIP`.

Build-time guidance gets diluted under task pressure — an agent reaches for a raw `<Table>`
because it was faster, or leaves AntD's grey header because it "looked fine". The judge gives
a final, structured chance to catch exactly the drift the build skill warned about but the
agent dropped mid-implementation.
