---
name: aha-design-table
description: "Authoritative rules for the ONE canonical AhaSlides data grid — the Design System V3 table, built as a single shared DataTable component on Ant Design v6, so every table in the product renders identically instead of drifting per screen. Owns: the theme-driven look (WHITE header + secondary-grey labels + bottom divider, horizontal dividers only, no vertical grid lines, no zebra, radius 8, 16px cell padding, brand-tinted row hover), the built-in toolbar (title + actions like Edit columns / Export), pagination (brand-outlined active page + 'N / page' size changer), sorting (a single directional arrow, not AntD's dual caret), filtering (checklist-with-search and Min/Max range popovers, each Reset + Apply), column reorder (drag handle + drop-line), column freeze (right-click, one at a time, pins leftmost), icons from @phosphor-icons/react (never emoji), and colour/radius from tokens (never raw hex/px). Use whenever an agent is building, editing, or reviewing a data grid / table of rows and columns in AhaSlides product UI — a results/leaderboard/participant/admin/dashboard list, an AntD <Table>, a columns=/dataSource= grid, a DataTable, or anything a user would call 'a table'. Trigger on phrases like 'table', 'data grid', 'data table', 'DataTable', 'AntD Table', 'columns', 'dataSource', 'rows and columns', 'sortable column', 'filter column', 'freeze column', 'pin column', 'reorder columns', 'pagination', 'rows per page', 'results table', 'leaderboard table', 'admin list', 'participant list'. Do NOT trigger for a status/state pill (aha-design-status-badges), a plain list/card stack that is not columnar, an editable spreadsheet-style block authored inside slide content, or generic AntD theming unrelated to a table (aha-design-antd)."
---

# AhaSlides data grid (Design System V3 table)

Source of truth: **Design System V3 → Table** (Figma) and the shared `DataTable`
component (`references/DataTable.reference.tsx`). Every data grid in AhaSlides product
UI — a results list, a leaderboard, a participant/admin/dashboard table — renders through
**one** component with **one** look, so tables read as a single system instead of a
patchwork of one-off `<Table>`s each styled by hand.

> **This skill owns the data-grid surface.** For the theme/token mechanics it builds on,
> defer to [[aha-design-antd]] (AntD v6, the `--aha-*`/`theme.useToken()` token system,
> white-background-by-default, the radius scale). For glyphs, [[aha-design-icons]]
> (`@phosphor-icons/react`, never emoji). For a status pill inside a cell,
> [[aha-design-status-badges]]. For the empty/loading/mobile-swap primitives a table
> leans on, [[aha-design-shared-components]].

> **Judge counterpart.** After building or when reviewing a table, self-check with
> [[aha-design-table-judge]] — it scores the grid PASS/FAIL against these rules and feeds
> concrete fixes back, closing a build→judge→fix loop. A table is not done until it passes.

> **Visual + code reference.** `references/table-preview.html` is a runnable, faithful
> reproduction of every DS V3 state (open it in a browser). `references/DataTable.reference.tsx`
> is the canonical component — copy it into the app's shared layer and wire it to the real
> theme/icons. Read the code, don't reinvent it.

---

## The one rule everything else serves

**Reach for the shared `DataTable`. Never hand-roll, never per-call-site restyle.**

- A raw `<table>` / `<div>`-grid is a **FAIL** — it is the ultimate style drift.
- A bare AntD `<Table>` dropped in with its own `bordered` / `size` / `rowClassName` /
  header tint is a **FAIL** — that is how tables diverged in the first place.
- If `DataTable` doesn't do what you need, **extend the shared component**, not the call
  site. Fix it in one place so every table gets the fix.

The look is **theme-driven**: it lives once in the AntD theme (`components.Table` in
`theme/index.ts`), not in any screen. Call sites pass data and columns — never styling.

---

## Anatomy & tokens (DS V3 → `--aha-*`)

DS V3 values mapped to the theme vocabulary the codebase already uses (see
[[aha-design-antd]] `references/theme-tokens.md`). Bind to the token — never the raw hex.

| Part | Rule | Token (`--aha-*` / AntD) | DS V3 value |
|---|---|---|---|
| Container | White surface, 1px border, radius 8 | `colorBgContainer` · `colorBorderSecondary` · `borderRadius` | `#fff` · `#e3e3e3` · `8` |
| **Header** | **WHITE fill**, secondary-grey labels, bottom divider, **no vertical separators** | `headerBg:#fff` · `headerColor→colorTextSecondary` · `headerSplitColor:transparent` | white · `#8a8a8a` |
| Rows | Body text, horizontal dividers only, **no zebra** | `colorText` · `borderColor→colorBorderSecondary` | `#1a1a1a` · `#e3e3e3` |
| Density | ~16px cell padding (one house density) | `cellPaddingBlock/Inline: 16` (`paddingM`) | `16` |
| Row hover | Brand-tinted | `rowHoverBg→colorPrimaryBg` | `#f9f5ff` |

The `components.Table` block that produces this (declare **once** in the theme):

```ts
components: {
  Table: {
    headerBg: '#ffffff',              // white header — NOT AntD's default #fafafa
    headerColor: '#8a8a8a',           // secondary-grey labels
    headerSplitColor: 'transparent',  // no vertical separators in the header
    borderColor: '#e3e3e3',           // horizontal dividers
    rowHoverBg: '#f9f5ff',           // brand-tinted hover
    cellPaddingBlock: 16,
    cellPaddingInline: 16,
    headerBorderRadius: 0,
  },
}
```

> **The header is the load-bearing correction.** DS V3 rejects AntD's grey `#fafafa`
> header: the header is **white**, differentiated by secondary-grey text + a bottom
> divider. A grey/tinted header fill is a FAIL, and it also keeps the grid consistent with
> the white-by-default background rule ([[aha-design-antd]]).

---

## The format, feature by feature

### Toolbar (optional)
Title (18px SemiBold) on the left; actions on the right — e.g. **Edit columns**, **Export**
— rendered as house AntD `<Button>`s (secondary), never bespoke buttons. Omit the whole
toolbar if the table has no title and no actions.

### Pagination
Brand-**outlined** active page + a **page-size selector** (`showSizeChanger`, "N / page").
Don't hide the size changer, don't restyle the pager, don't roll your own footer.

### Sorting
A **single directional arrow** (DS V3): idle (faint down) → descending ↓ → ascending ↑ →
none. Supplied via the component's `sortIcon`. **AntD's default dual up/down caret is a
FAIL** — the shared component overrides it. Header click cycles the states.

### Filtering
A **filter icon** on the header opens a popover. Two canonical shapes only:
1. **Checklist** — a "Search in filters" input + a checkbox list, footer = **Reset** (text
   link, tertiary) left + **Apply** (primary) right.
2. **Min / Max range** — two number inputs, same Reset / Apply footer.

Filter-icon states: default (grey) → hover (brand pill `#f9f5ff`) → active (`#f0e4ff`) →
applied (filled brand, signalling a live filter). Never a bespoke filter UI per column.

### Column reorder
Drag a header (grab handle appears on hover, header greys `#f1f1f1`) → a **purple drop-line**
marks the insertion point and a **ghost** of the dragged header follows → drop to reorder.
Via the shared component's header cell, not a per-table DnD implementation.

### Column freeze
**Right-click a header → Freeze column.** Mechanism (enforce all four):
- **One column frozen at a time** — defreeze before freezing another.
- A frozen column **jumps to leftmost** and **can no longer be reordered**.
- On horizontal scroll it **pins left with a shadow**.
- Right-click the frozen header → **Defreeze**; it stays in the first position.

### Icons
Every glyph — help `(?)`, filter funnel, sort arrow, export, pin, drag handle — comes from
**`@phosphor-icons/react`**. **Emoji as an icon is a FAIL** (a magnifier emoji in the
filter search, a pin emoji in the menu). See [[aha-design-icons]].

### Colour & radius
From tokens only. No raw `#hex` / `rgb()` and no magic `px` radius in columns, cell
renderers, `rowClassName`, or the container — bind to `theme.useToken()` / `--aha-*` and
the radius scale ([[aha-design-antd]]).

### Accessibility
Header sort/filter controls are real buttons; sort state is announced (`aria-sort`); a
frozen/pinned column stays keyboard reachable; never convey a cell's state by colour alone
(pair with text/'icon — e.g. a [[aha-design-status-badges]] pill, not a bare colour).

---

## ✅ GOOD / ❌ BAD

✅ **GOOD** — the shared component, data + columns only, zero styling:

```tsx
<DataTable
  toolbarTitle={t('results.title')}
  toolbarActions={<><Button icon={<PencilSimple size={16} />}>Edit columns</Button>
                    <Button icon={<DownloadSimple size={16} />}>Export</Button></>}
  reorderable freezable rowKey="key" dataSource={rows}
  columns={[
    { key: 'name', title: t('col.name'), dataIndex: 'name', sorter: byName },
    { key: 'team', title: t('col.team'), dataIndex: 'team', filter: { type: 'checklist', options: teams } },
  ]}
/>
```

❌ **BAD** — every one of these is a violation:

```tsx
<table className="my-results-table">…</table>          {/* hand-rolled grid */}
<Table bordered size="small" rowClassName={zebra} />    {/* raw AntD + per-call styling */}
<Table columns={cols} />  // header renders AntD grey #fafafa, dual-caret sort
<div className="filter"><span>🔍</span> Search</div>    {/* emoji icon */}
<td style={{ color: '#6a1ebb' }}>…</td>                 {/* hardcoded hex in a cell */}
```

---

## When NOT to use this skill

- A **status/state pill** rendered inside a cell → [[aha-design-status-badges]] (this skill
  governs the grid; the pill has its own rules).
- A **plain list or card stack** that isn't columnar rows/columns → not a data grid.
- An **editable, spreadsheet-style table authored inside slide content** by an end user →
  that is content, not app-chrome; out of scope.
- Generic **AntD theming / a non-table component** → [[aha-design-antd]].

---

## Test-case assertions

```
TABLE-01: The grid is the shared DataTable (AntD <Table> underneath) — not a hand-rolled <table>/<div> grid, and not a raw AntD <Table> restyled per call site
TABLE-02: The look is theme-driven (components.Table) — no per-table bordered / size / rowClassName-zebra / header tint / inline styling
TABLE-03: Header is WHITE with secondary-grey labels + a bottom divider — never AntD's grey #fafafa fill or a coloured header
TABLE-04: Body has horizontal dividers only — no vertical grid lines, no zebra striping
TABLE-05: Sort uses a single directional arrow (DS V3), not AntD's default dual caret; header click cycles descending → ascending → none
TABLE-06: Filtering uses the canonical popover shapes only — checklist (search + Reset/Apply) or Min/Max range (Reset/Apply); icon shows default/hover/active/applied states
TABLE-07: Freeze is right-click driven, one column at a time, pins leftmost with a shadow on scroll, and disables reorder while frozen
TABLE-08: Pagination shows the brand-outlined active page + the "N / page" size changer (showSizeChanger); the pager is not hidden or restyled
TABLE-09: Every icon comes from @phosphor-icons/react — no emoji used as an icon anywhere in the table
TABLE-10: Colour and radius come from tokens (theme.useToken() / --aha-*) — no raw hex/rgb or magic-px radius in columns, cell renderers, rowClassName, or the container
```
