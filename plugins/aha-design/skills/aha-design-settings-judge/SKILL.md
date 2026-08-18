---
name: aha-design-settings-judge
description: "Authoritative judge / verdict-giver for an AhaSlides settings, configuration, or options surface — the evaluation counterpart to aha-design-settings (the build skill). Use whenever an agent reviews, audits, scores, critiques, or self-checks a settings panel, configuration screen, options drawer, preferences page, account/workspace settings, per-block options, or the right-panel config of a slide type: a PR diff touching a settings surface, a 'does this settings panel follow our rules?' question, or the self-check that should run after building or restyling one. Emits a binary PASS / FAIL verdict per criterion (no partial credit) across the settings rules — setting names are noun phrases, correct control (toggle vs checkbox, never mixed), help text is the exception and explanation lives in a ? tooltip, grouping and separation come from --aha-size* spacing (never dividers, never a card around plain settings, groups of 2–6, noun-phrase headers), dependent sub-settings hidden when their parent is off and nested (indented + de-emphasized) when shown, plan-gated settings visible-but-locked (crown → Paywall), dangerous settings last + spacing-separated + danger Button + confirmation modal, correct surface (panel/page/modal/drawer), every object renders at its real height (no empty container / phantom iframe), AND the slide-type right-panel config pattern — the option-list 'Items' component anatomy & states, correctly-handled per-option images, and the Question → options → constraints → timing → Advanced ordering — checked against the shipped @/iframe/settings components and a Figma reference. Trigger on phrases like 'review this settings panel', 'audit my config screen', 'is this settings UI correct', 'judge my settings', 'check this options drawer', 'self-check after building settings', 'review a slide type's right-panel config', 'does my Items list match the reference', 'score my settings surface'. Do NOT trigger while BUILDING (use aha-design-settings), for slide-canvas review (aha-design-canvas-judge), for shared-component look review (aha-design-component-standard-judge), or for non-settings product UI."
---

# Judging a settings / config / options surface

This skill is the **judgment counterpart** to `aha-design-settings` (which guides
building the same surface). Reach for it when reviewing finished settings work — a
PR diff, a review request, or a self-check at the end of a build. Don't reach for
it while building — use `aha-design-settings` for that.

> **Cross-skill reference.** This judge is **settings-only**. Hand off other layers
> to their own judges/skills: the slide **canvas** → `aha-design-canvas-judge`; a
> shared **component's look** → `aha-design-component-standard-judge`; **icons** →
> `aha-design-icons`; the **Paywall** popover a locked setting opens →
> `aha-design-paywall`; the **confirmation modal** a destructive setting triggers →
> `aha-design-overlays`. This judge checks that the setting is correctly *named,
> grouped, gated, and placed*, and — for slide types — that the right-panel config
> matches the reference; it does not re-judge how the resulting popover/modal looks.

---

## How to use

1. Identify what's under review: the settings surface's markup/code (or a
   screenshot) and what it claims to be — a general settings panel/page/drawer, or
   a **slide type's right-panel config** (which additionally must satisfy C10–C12).
2. Read the target rules from the build skill — `aha-design-settings/SKILL.md`
   §1–§10 and its §11 test-case assertions (`SETTINGS-*`). For a slide-type config in
   `slide-type-creator`, the option-list / row / image / number controls are the
   `@/iframe/settings` components (catalogue: `src/iframe/ui-standard.json` →
   `settingsLibrary`); the section ordering is Figma node 9237-9266. Don't judge from
   memory — check the Settings.vue source (imports and markup) against these.
3. For each criterion below, gather evidence, decide **PASS** or **FAIL**, and
   capture a 1-line piece of evidence (`file:line` where possible).
4. Emit the verdict report using the exact template at the bottom.

**The universal FAIL rule (applies to EVERY criterion, C1–C12, and every rule they
cover — not only the ones with a named example).** If the surface **matches a
documented BAD example / anti-pattern, or violates any rule** in `aha-design-settings`,
the criterion it belongs to is a **FAIL** — automatically, no exceptions. This holds
whether or not that specific violation is called out with a screenshot: the worked
examples in this dataset and in the build skill are **illustrations, not the whole
list**, and the rule binds everywhere. Never exempt a violation because it "looks
meaningful," "still works," "is close enough," or "wasn't in the examples." Cross-check
the surface against the build skill's rules and this dataset's BAD examples
(`evals/evals.json`); any match is a FAIL to be reported and fixed.

**Why binary, no partial credit.** A settings surface either honours each rule or it
doesn't — "almost right" is a polite FAIL. Half-credit invites endless argument
about whether a gap is 60% or 70% correct. Binary keeps the judge consistent across
reviewers and runs.

**Burden of proof is on PASS.** Some rules can't be confirmed from static markup — a
sub-setting's hide-on-parent-off needs the toggled state, an empty-height bug needs
the rendered DOM. If you can't verify a criterion, mark **FAIL** and say why in the
notes; don't wave it through. Pretending unclear code passes is how drift reaches
prod.

**Scope the run.** C1–C9 apply to **every** settings surface. **CR** (reuse over
rebuild) applies to any surface whose product ships a settings-component library — mark
it `N/A` for a product that has none. C10–C12 apply **only** to a slide type's
right-panel config — for any other surface, mark them `N/A` (not FAIL) in the table and
say so.

---

## The criteria

### C1. Setting names are noun phrases → PASS / FAIL
Every setting name is a short noun phrase with no leading verb ("Enable", "Allow",
"Turn on", "Show", "Toggle") and no trailing-sentence description. Group headers are
noun phrases in sentence case with no colon or trailing punctuation. **FAIL** on any
verb-phrase label ("Show progress bar") or descriptive header ("Response settings").
**Narrow exception (don't false-FAIL it):** a manual/automatic *mode toggle for an
action* may keep a verb-led label when no clean noun phrase names it unambiguously —
"Show results manually" / "Open submission manually" PASS (noun-only "Results" /
"Submission" would lose the meaning). The exception applies only when removing the
verb leaves an ambiguous fragment **and** the setting is a manual/automatic mode
switch; "Show progress bar" (clean noun "Progress bar" exists) still FAILs. **No
decorative label icon:** a setting label is text (name + optional `?` glyph); **FAIL** a
per-setting **decorative leading icon** (star/trophy/clock etc.) — panel icons are
functional (drag handle, image, delete, `?` help), not per-label ornaments. **A
topically-relevant icon is still decorative — FAIL it:** a **trophy** on "Leaderboard",
a **clock** on "Time limit", a **star** on "Scoring"/"Points" all FAIL; "matches the
setting's topic" does **not** make an icon functional (functional = the four controls
above only). Don't accept the "it's meaningful, so it's fine" rationalization.

### C2. Correct control — toggle vs checkbox, never mixed → PASS / FAIL
A toggle for an immediate, independent binary; a checkbox for grouped/save-together
options or consent (first person). Toggles and checkboxes are **not mixed within one
group**. A **segmented (pill) control only for ≈2–4 short one-line options with room to
fit**; when the options are **long** (multi-word), **many**, or the control is in a
**tight/limited horizontal space** (e.g. sharing a row with an input), a
**dropdown/select** — a cramped or overflowing segmented switch breaks the layout.
**FAIL** if the control type is wrong for the behaviour, a group mixes toggles and
checkboxes, or a **segmented control is used for long/many options or in a cramped
space** where a dropdown is required.

### C3. Help text is the exception; explanation lives in a `?` tooltip → PASS / FAIL
Always-visible help text appears **only** for a must-see consequence the user can't
easily undo — one short sentence (≤90 chars), sentence case, ends with a period,
states the consequence not the feature. All other elaboration is a `?` tooltip
(≤140 chars, opens on hover **and** keyboard focus **and** tap, no links/buttons/
lists), or omitted. A tooltip is **never** the sole home of a must-see consequence
(→ help text) or an error (→ inline copy). **FAIL** on help text used for
description/plan-tier/nice-to-know, on an over-long or hover-only `?` tooltip, or on
a consequence/error buried in a tooltip. **Panel-level (the most common AI failure):**
help text is near-absent across a whole panel — a surface where most or every setting
carries a help-text line is the systematic anti-pattern. Count the help lines; more
than one is almost always wrong. **FAIL** the panel and convert every descriptive
line ("Off means one pick per person", "Display % instead of raw vote counts") into a
`?` tooltip. **Redundancy: FAIL** any setting that carries both a `?` help icon **and**
a help-text line (same explanation twice — keep the tooltip, drop the line). **Glyph:
FAIL** if the help trigger is an info icon (`ⓘ`) instead of a question-mark (`?`) — a
help tooltip uses the shared `?` glyph, never an info circle. **Consistency:** every
`?` in one panel is the same shared-component glyph at the same size with the same
tooltip placement — **FAIL** on mixed help icons, mixed sizes, or inconsistent up/down
tooltip direction (AHA-46489, AHA-46544), and on a value's explanation shown as a
bespoke hover-state instead of the standard `?` tooltip (AHA-46438). **Styling &
arrow: FAIL** a `?` tooltip that isn't the standard/shared tooltip — a custom (non-
default) background instead of the dark-navy tooltip token, an **oversized font**
(body- or heading-size instead of the small tooltip size), or an **arrow not anchored
to the `?` icon** (the pointer floats off to the side instead of landing on the icon).

### C4. Grouping & separation come from spacing — no dividers, no cards → PASS / FAIL
Hierarchy and separation use `--aha-size*` spacing tokens (the monotonic
4/8/16/32/48 scale), **not** divider/rule lines and **not** raw px. Plain settings
and groups are **never** wrapped in a card or **any container with its own
background/tinted fill or border** — a lone toggle/setting row sits directly on the
panel surface, not on a grey/tinted rounded pill. Card/tinted styling is reserved for
genuinely selectable items (option cards, plan cards). Each group holds **2–6**
settings. **Weight hierarchy:** exactly one level is bold per group — the **group
header** (bold/semibold); the **member setting labels are regular weight**. **FAIL** on
any divider line between settings/groups, any card **or filled/tinted background
container** around plain settings or a single toggle row, a group of <2 or >6, or
**setting labels rendered bold (especially small+bold) like the header** so the
group-vs-member hierarchy flattens. **Zero-gap between stacked controls — FAIL:** two
stacked elements that abut with **no spacing token between them** (a `0px` gap) — most
often an **add-action button fused to the bottom of the input/list above it** because it
carries no top-margin utility and its wrapper supplies none (e.g. a `mb-6` field wrapper
inside a **gap-less** `flex flex-col` root, so a child gets vertical spacing only if it
sets its own). A control and the field it follows must be separated by a spacing token —
the reference `ui-standard/Settings.vue` gives its add-action `class="mt-2"` (~8px,
sizeXS). This is a spacing miss **distinct from C10's full-width rule**: a *secondary
inline* add-action may legitimately be content-width, so don't mis-file the missing gap
as a width FAIL — the defect is the absent 8px, not the button's width. **Uneven /
ad-hoc vertical gaps — FAIL:** the panel's rhythm must come from exactly two mechanisms —
one field-gap token **between top-level fields** (in `slide-type-creator`,
`SETTINGS_FIELD_GAP_CLASS`) and the **same** dependent-sub-setting wrapper for **every**
reveal (`SubSettingGroup` — `mt-4 pl-4`, a tighter top gap than between siblings). When
gaps instead come from **hand-added `mt-*`/`mb-*`/`py-*` on individual rows**, or a
sub-setting reveal is spaced differently from field to field, the gaps come out **unequal**
— typically the space *above a revealed sub-setting* (e.g. under a "Custom labels" or
"Speed bonus" toggle) is visibly larger than the space between sibling fields. **FAIL** a
panel whose vertical gaps are uneven because spacing is applied per-row instead of via the
standard field-gap + a single consistent sub-setting wrapper; the fix is to delete the
ad-hoc margins and let the tokens/`SubSettingGroup` set every gap. **Carve-out — don't
false-FAIL a repeatable composite list item.** A repeatable *item* whose each entry is a
**composite** (its own body of fields and/or a nested option list + delete — a Question,
Blank, Card, Hotspot, Round) legitimately sits in the shipped numbered-section wrapper
(`NumberedItem`), whose `contained` variant wraps the **WHOLE item — number chip, label,
delete AND body — on ONE secondary-fill grey card**; that grey fill (incl. behind the
header) is **correct**, not a no-card violation. Its delete is **hover-only** (hidden at
rest) and may be **absent entirely** (`deletable=false`) for a non-removable item — a
hover-hidden or intentionally-absent delete is **not** a FAIL here. The no-container rule
targets **plain settings and lone toggle rows**, not a repeatable composite item
(§SETTINGS-43). Only FAIL the container here if it wraps plain settings/a toggle, or if the
composite item's treatment is off-spec (see CR). **Lone setting on a bold `SectionHeader` —
FAIL:** a single control with a single label is a *setting*, not a group, so it is a
regular-weight `SettingRow`; using the bold `SectionHeader` to title a lone field renders a
group-level bold label with no group beneath it (the flattened hierarchy in reverse). Reserve
`SectionHeader` for a real group header over 2+ settings or a master-toggle row (§SETTINGS-48).
**Control placed on the wrong axis — FAIL:** a single control belongs **inline** with its
label (label left / control right) when it is narrow enough to share the row (a toggle, a
short number+unit field, a compact select); it drops **below** the label (stacked) **only**
when too wide to fit beside it (a multi-line textarea, a wide select, a multi-option
radio/segmented group, an image dropzone). FAIL a **narrow control stacked** below its label
(wasted height, reads as a heavy field) or a **wide control crammed inline** (overflows /
crushes the label) — the test is whether the control fits the label's row at a comfortable
width (§SETTINGS-47).

### C5. Dependent sub-settings — hidden when parent off, nested when shown → PASS / FAIL
A sub-setting that only applies when its parent is on is **hidden** when the parent
is off (not shown disabled — unless the disabled state communicates an upgrade path).
When shown, it reads as **nested under** its parent: indented (`sizeLG`) with a
tighter gap above (`sizeXS`) **and de-emphasized** (lighter label weight/colour), and
it is never bracketed by its own separators on both sides or wrapped in a container.
**FAIL** if a dependent sub-setting is shown disabled instead of hidden, or is
rendered at full top-level weight / carded / double-separated.

### C6. Plan-gated settings are visible but locked → PASS / FAIL
A setting requiring a plan the user isn't on stays **visible** (not hidden), shown
locked with a crown badge that replaces its normal tooltip and opens the shared
Paywall popover (owned by `aha-design-paywall` — one primary Upgrade CTA, not a
bespoke two-CTA one). **FAIL** if a gated setting is hidden, or the badge opens a
custom popover.

### C7. Dangerous settings — last, spacing-separated, danger Button, confirmed → PASS / FAIL
Irreversible/destructive settings sit **last** (bottom of section or a Danger zone
at panel bottom), set apart by the largest spacing gap (`sizeXXL`) — **not** a
divider. The CTA is an AntD `danger` Button (`colorError`, no hardcoded hex); red is
on the button only, never the label/toggle. The action requires a **confirmation
modal** before executing (per `aha-design-overlays`) — never a single click/flip,
even with an undo toast. **FAIL** on a divider-separated danger zone, a hardcoded-hex
or non-danger CTA, red on the label, or a destructive action with no confirmation
modal.

### C8. Correct surface — panel vs page vs modal vs drawer → PASS / FAIL
Per-object/immediate-effect settings live in the inline editor **panel**; workspace/
account-scope in a **page**; one-time action config in a **modal**; medium-complexity
supplements in a **drawer**. **FAIL** if a setting sits in the wrong surface for its
scope (e.g. workspace-wide settings crammed into a per-block panel).

### C9. Every object renders at its real height → PASS / FAIL
No settings object holds space while rendering nothing visible: an empty section,
an empty list wrapper inflating a parent's flex `gap`, or a plugin settings iframe
reporting a non-zero height with an empty body / falling back to `height:100%`. An
always-rendered wrapper around a conditional list renders only when the list is
non-empty; a plugin settings iframe reports its height via `onHeightChange` on mount
and every reflow, and reports `0` (or doesn't mount) when there's nothing to show. A
gap present on a plugin slide type but not its native equivalent is fixed in the
plugin/host iframe layer, **never** by editing a shared editor component. **A third
iframe-height mode — the iframe measures the wrong element:** the plugin reports
faithfully, but its own mount root (`html`/`body`/`#app`) is CSS-stretched to the
viewport (`h-screen` / `100vh` / `height:100%`), so the auto-height reporter reads
`#app.offsetHeight` as a full screen and reports a full-viewport height regardless of
content — a large empty block below the panel. This **slips past the two checks above**
(a height *is* reported, the body *is* non-empty), so when a plugin settings panel shows
a large empty block, check the mount root's CSS height *before* the reporting logic (and
before chasing per-field margins — a trailing field-gap is usually a minor secondary
cause, not the dominant one). The settings-iframe root must shrink-wrap (`height:auto`).
**FAIL** on any empty container holding height, a phantom-height iframe (including a
mount root forced to viewport height), or a shared-component edit used to chase a
plugin-only gap.

### CR. Reuse over rebuild — anything the component library covers uses it → PASS / FAIL
*(Applies to any surface whose product ships a settings-component library; mark `N/A`
for a product that has none.)* Every part of the panel a shipped library component
covers **uses that component**, not a hand-rolled equivalent. Walk the panel element by
element and, for each row / section header / sub-setting group / option or question
list / card-select / number+unit field / help tooltip / dropdown menu / image control /
callout, confirm it is the library component and not re-laid-out markup. **In
`slide-type-creator`** the library is `@/iframe/settings`; check the Settings.vue
imports against its catalogue — `src/iframe/ui-standard.json` → `settingsLibrary` (the
source of truth for what exists and what each is for). **FAIL** any hand-built
duplicate of a component the library provides (a bespoke label+control row instead of
`SettingRow`, a raw `<a-textarea>` option row instead of `OptionRow`, a hand-drawn
callout instead of `InfoBox`, a manual number+unit instead of `NumberWithUnit`, a
hand-rolled **"Add image" / "Replace image" / "Remove image" button set** for a
**standalone full-width image field** instead of `ImageDropzone` — see C11; a **hand-rolled
numbered composite box** (an inline number badge + header + delete wrapping a group of
fields) instead of the shipped **numbered-section** component (`NumberedItem`) for a
repeatable composite item — see §SETTINGS-43, etc.).
Reason: a hand-rolled copy silently drifts from the component's encoded rules, which is
exactly what the library exists to prevent.

**When `NumberedItem` *is* used, its treatment must match or it FAILs:** the `contained`
variant wraps the **WHOLE item — chip + label + delete + body — on ONE secondary-fill grey
card** (a header sitting **above/outside** a body-only grey box is off-spec — **FAIL**); a
**muted grey number chip** (a radical-purple number-badge fill is a FAIL); **no per-item
border**; the grey `contained` fill or no fill (`plain`); a **tertiary** delete
(`type="text"`, borderless) — a **secondary/bordered** or **danger-red** delete on the item
is a FAIL, but a **hover-hidden** delete or one intentionally absent via `deletable=false`
is **correct, not a FAIL**; and the controls composed into its **slot are the theme's
default BORDERED `Input`/`Textarea` — a `:bordered="false"` field inside the card is a
FAIL**. (The grey container itself is correct here, not a C4 no-card violation — see C4's
composite-item carve-out.) A control the library has **no** component for is **not** a FAIL
— it follows the section rules directly.

**A composite item with more than one text field must render them as a matching, labelled, full-width set.** When one item's body holds a Title + Description (or any multi-field composite body), **FAIL** when: the fields mix control types so they read as different components (a single-line `Input` beside a `Textarea` — the giveaway complaint is *"are these two different components?"*); a field is **not full-width** inside the card; a field has **no label**; or a focus char counter is a **width-stealing sibling** in the row rather than an **overlay inside the field** (the `CountedInput` `:focus-within` pattern). Two fields of the same item rendering at **visibly different widths** is the tell — it usually means both faults at once (mixed control + sibling counter). A one-line title implemented as a single-row auto-sizing `Textarea` to match its multi-line sibling is **correct, not a FAIL**. (This is the composite-body companion to C10's full-width rule.)

**When a number carries a UNIT (a duration, points, a per-item count), it uses
`NumberWithUnit` — a hand-rolled number box or a separate stepper is a CR FAIL** (see also
C10). Its shipped behaviour must not be re-invented: the digit input is hard-capped at
`maxDigits` (default 4), the ▲/▼ stepper is a **hover-revealed tertiary** control, and
validation feedback is the built-in **`errorMessage`** prop (red border/ring + a line
below) — a **hand-rolled red validation line** beside a plain number instead of
`errorMessage` is a FAIL. *Reuse-first:* a standard whole-slide countdown is host-native
(`enableTimeLimit`); rebuilding one as a `NumberWithUnit` when the host already provides it
is the wrong call — `NumberWithUnit` is for a number the host does **not** provide.

**Two static lints back the cheap slice of this** (`npm run audit:slide-types`), so
lean on them and spend your judgment on what they can't see: **`settings-compose`**
(WARN) flags a Settings.vue that imports **nothing** from `@/iframe/settings`, and
**`settings-toggle-row`** (WARN) flags a toggle row still built from the legacy
`SETTINGS_TOGGLE_ROW_CLASS`. What they **miss** — and you must catch by reading the
source — is a row hand-rolled from bespoke markup with no known class, and a
component-shaped-but-wrong control that renders like the real one (e.g. a worded
"Image" button where `ImageActionButton` gives an icon). A screenshot reveals none of
this; only the code does.

### C10. Slide-type option list matches the "Items" component → PASS / FAIL
*(Slide-type config only.)* The option list uses the reference row anatomy — drag
handle (only when order matters) + text input + optional image button + **on-hover**
delete — with a full-width **"+ Add"** button beneath and a `?`-tooltipped
noun-phrase section label above. The text input shows a neutral placeholder when
empty, a character counter **only on focus**, wraps to multiple lines, and **scrolls
internally beyond ~4 lines**. **Reuse-first:** when the panel composes the product's
shipped option-row component (in `slide-type-creator`, `@/iframe/settings/OptionRow` /
`QuestionList` — verified to encode this anatomy), confirm it IS that component and
PASS by construction; a full element-by-element check against the anatomy below (and
the build skill's §11 `SETTINGS-*` assertions) is required only when the row is
**hand-rolled** — and a hand-rolled row where a shipped component already exists is
itself the miss to flag.
**The row `<div>` is the single bordered
input** — the drag handle is its **first child inside** that one border, the textarea
is **borderless**, and the delete **floats just outside the top-right** on hover.
These three — **frame, drag handle, delete** — plus the full-width "+ Add" are the
**universal core** and must match the reference anatomy on every slide type. A per-option **image**
(handled per C11), a **correct-answer checkbox** (scored types: Poll, Quiz),
and a **series-colour dot** (types with per-option chart colours) are **legitimate
per-type features — do NOT FAIL them** when the slide type actually has that
capability. **FAIL** an outer card/box wrapping a separately-bordered text field
(box-in-a-box / double border), a drag handle placed **outside/left of** the input, a
bordered image-icon box, an always-present in-row delete slot, or **decoration** (a
number badge on an unordered set, a decorative label icon). Placeholders match an equivalent existing slide
type ("Option 1/2") and are **never** treated as real content (an option still
holding its placeholder isn't rendered downstream). Any **numeric/stepper config
input** (budget, points, step, limit) enforces a length limit, accepts numbers only,
clamps to min/max with an **immediate** fallback (on change/blur, not only on
deliberate misuse), and ships pre-filled with the recommended default. **FAIL** on a
missing/always-visible delete, a missing "+ Add", a "+ Add" hugged to content width
instead of spanning the full panel width, an always-visible or absent char
counter on ANY limited text input in the panel (not just option rows — axis labels,
titles, notes too: the counter shows only on focus, hidden at rest), an
unbounded-growth field, an ad-hoc row shape, a missing/invented
placeholder or one rendered as real content (AHA-46484), an unbounded /
non-numeric / unclamped / defaultless numeric input (AHA-46440), an **"X of Y"
count indicator** next to the section label (e.g. "4 of 8" — redundant; limits are
conveyed by the Add/delete disabling, and the reference has no counter), or a
**per-option number badge (1, 2, 3…) on an unordered set** where position carries no
sequence meaning (reordering is the drag handle's job — numbering falsely implies
order; only number when the sequence is genuinely meaningful), or a **fixed unit
placed in its own separate framed box** beside a numeric input (a non-changeable unit
belongs as an **inline suffix inside the same field** — the shipped `NumberWithUnit`, whose
hover stepper, `maxDigits` cap and `errorMessage` line are used rather than re-invented; a
bordered box makes a fixed unit look selectable — a changeable unit would be a dropdown
per C2, not a static box). **Wrong unit spelling — FAIL:** a **seconds** unit written as
`s` (cryptic) or `seconds` (too long) instead of **`sec`** — every unit is its conventional
short label, and seconds is always `sec` (§SETTINGS-46).

### C11. Image support handled by the right component (per-option vs standalone field) → PASS / FAIL
*(Slide-type config only.)* There are **two** image controls in the library, and the
choice depends on whether the image is one cell of an option row or the field itself —
using the wrong one (or hand-rolling either) is a FAIL.

**Per-option image → `ImageActionButton`.** If the slide type supports per-option images,
each row runs the full state set — empty add-image icon with an "Add image" tooltip →
**filled** replaces the icon with a **thumbnail** in the same trailing slot ("Edit image"
tooltip) → clicking the thumbnail opens a dropdown with **three** items, **Change / Edit /
Delete**. If it does **not** support images, the image button is **omitted entirely** —
**never** a disabled/greyed stub. The control is a **borderless compact icon button**
throughout, never a text button labelled "Image".

**Standalone image field (the image IS the field, not a per-option cell) → `ImageDropzone`.**
When a slide's config has a single main image — a background/hero image, an image the
whole slide is built around (e.g. an interactive-image hotspot base, a picture-reveal) —
it uses the shipped **`ImageDropzone`**: the full-width dashed upload card (empty →
loading → **filled** = the image fitted in a display box with a **Change / Edit / Delete**
overlay), emitting host-modal intents. A hand-rolled **"Add image" / "Replace image"
button + separate "Remove image" danger button** is the exact anti-pattern this component
replaces. (`ImageActionButton` is the *per-option* sibling — do not use it for the whole
field, and do not use `ImageDropzone` inside an option row.)

**FAIL** on: a disabled image-button stub when unsupported; a missing state when
supported; a worded "Image" text button; a bordered image-icon box; a filled per-option
menu missing Change/Edit/Delete; **or a standalone image field built from bespoke
Add/Replace/Remove buttons instead of `ImageDropzone`** (also a CR FAIL). Check the
`@/iframe/ui-standard.json` → `settingsLibrary` catalogue: both `ImageActionButton` and
`ImageDropzone` are listed there with their intended use.

### C12. Slide-type config follows the reference ordering → PASS / FAIL
*(Slide-type config only.)* The panel is ordered **Question** (title + alignment +
optional image + "Add description") → **option list** → **participation constraints**
(placed right after the list) → **Time-limit toggle** revealing its duration select
(dependent sub-setting) → **collapsed Advanced** section for low-frequency toggles.
The standard sections (timing, show/hide results) are **present**, not omitted. Any
select/segmented control pre-selects the recommended default and orders its options
most-relevant-first (default at the top). Diff against Figma node 9237-9266. **FAIL** if the content/constraints/timing/advanced
order is broken, constraints float away from what they constrain, rarely-used
settings sit in the default panel instead of Advanced, a standard section is missing
(AHA-46508), or a select ships without its recommended default / with the default
buried mid-list (AHA-46562).

---

## Output format — the verdict report

Always emit this exact structure (compact, scannable for reviewers and the build
agent that will fix it):

```markdown
# Settings judge report — <surface name or file path>

| # | Criterion | Verdict |
|---|---|---|
| C1 | Setting names are noun phrases | ✅ PASS |
| C2 | Correct control, never mixed | ✅ PASS |
| C3 | Help text is the exception; `?` tooltip otherwise | ❌ FAIL |
| C4 | Spacing-driven grouping — no dividers/cards, groups 2–6 | ❌ FAIL |
| C5 | Sub-settings hidden off / nested when shown | ✅ PASS |
| C6 | Plan-gated visible but locked (crown → Paywall) | ✅ PASS |
| C7 | Danger last, spacing, danger Button, confirmed | ✅ PASS |
| C8 | Correct surface (panel/page/modal/drawer) | ✅ PASS |
| C9 | Every object renders at real height | ✅ PASS |
| CR | Reuse over rebuild — library components used where they exist | ✅ PASS |
| C10 | Option-list "Items" anatomy & states | ➖ N/A |
| C11 | Image control — per-option (ImageActionButton) / standalone field (ImageDropzone) | ➖ N/A |
| C12 | Slide-type config ordering | ➖ N/A |

**Overall: NEEDS FIX** (2 failing criteria)

## Fails

### ❌ C3 — Help text is the exception; `?` tooltip otherwise
**Where:** `SettingsPanel.vue:44`
**Evidence:** "Choose a colour for your theme" rendered as always-visible help text — a description, not a must-see irreversible consequence.
**Fix:** delete the help text; the noun-phrase name "Theme colour" is self-evident. Move any real elaboration into a `?` tooltip.

### ❌ C4 — Spacing-driven grouping
**Where:** `SettingsPanel.vue:60-72`
**Evidence:** the "Access" group is wrapped in a bordered card and separated from "Appearance" by an `<hr>`.
**Fix:** remove the card and the `<hr>`; separate groups with the `sizeXL` (32) spacing token. Cards are only for selectable option/plan cards.

## Passes — brief

C1, C2, C5–C9 — names, controls, nesting, gating, danger, surface, and heights check out.

## Notes / unverifiable / N/A

- C10–C12 marked N/A — this is a workspace settings page, not a slide-type right-panel config.
- (List anything you couldn't verify from the input — e.g. "couldn't confirm the sub-setting hides when its parent is off without the toggled state.")
```

**Overall verdict rule:** any FAIL → `NEEDS FIX`. All applicable criteria PASS (N/A
allowed) → `OK TO SHIP`.

Always include: the verdict table (all 12 rows in order, with `➖ N/A` for
criteria that don't apply); a `## Fails` section with a sub-section per failed
criterion (**Where** `file:line`, **Evidence** 1 line, **Fix** concrete action); a
1-line `## Passes — brief`; and a `## Notes / unverifiable / N/A` section whenever a
judgment was made under uncertainty or a criterion was skipped.

---

## When NOT to use this skill

- The user is **building / editing** a settings surface → use `aha-design-settings`.
- Reviewing the **slide canvas** (the 16:9 stage) → `aha-design-canvas-judge`.
- Reviewing a **shared component's look** against the visual standard →
  `aha-design-component-standard-judge`.
- Reviewing **icon usage** → `aha-design-icons`.
- Reviewing **non-settings product UI** (dashboards, marketing pages) → other
  `aha-design-*` skills.

---

## Closing the build → judge → fix loop

This judge runs at the **end** of a build pass — by a human reviewer or by the build
agent as a self-check. The expected loop:

1. Build with `aha-design-settings` → produces the settings surface.
2. Invoke this judge → emits the verdict report.
3. Any FAIL → fix the specific files cited under `## Fails` → re-invoke this judge.
4. Repeat until the verdict is `OK TO SHIP`.

The reason for the loop: build-time guidance gets diluted under task pressure — an
agent names the settings well but forgets the char counter is focus-only, or reaches
for a divider to separate two groups. The judge gives a final, structured chance to
catch exactly the traps the build skill warned about but the agent dropped
mid-implementation.
