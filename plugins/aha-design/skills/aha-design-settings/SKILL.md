---
name: aha-design-settings
description: "Authoritative rules for settings, configuration, and options UI across AhaSlides products — setting-name format, toggle vs checkbox, help text, tooltips, grouping, plan-gated/locked settings, dangerous/irreversible actions, panel vs page vs modal vs drawer placement, AND the mandatory pattern for a slide type's config in the editor right panel (the option-list 'Items' component — drag handle, text input, char counter, optional per-option image add/edit/delete, on-hover row delete, '+ Add' — and the Question → options → constraints → timing → Advanced section ordering, §10, reused from the shipped slide-settings components and backed by a Figma reference). Use whenever an agent is building, editing, or reviewing any settings panel, configuration screen, options drawer, preferences page, account/workspace settings, per-block/object options, or the right-panel config/options of a slide type in AhaSlides UI — naming a setting, adding a toggle or checkbox, writing help text or a tooltip, grouping options, gating a feature behind a plan, placing a destructive action, designing an item/option list, or arranging a slide type's settings. Any slide type that needs right-panel config MUST be run through this skill and diffed against its Figma reference. Trigger on phrases like 'settings panel', 'add a toggle', 'setting name', 'help text', 'tooltip', 'options drawer', 'preferences', 'config screen', 'group these settings', 'plan-gated', 'locked setting', 'danger zone', 'block settings', 'slide type config', 'right panel options', 'options for a slide', 'items list', 'add option', 'option list', or any moment a configuration control is named, labelled, grouped, or placed. Do NOT trigger for generic form design unrelated to settings, marketing-page copy, or non-AhaSlides product UI."
---

# AhaSlides Settings design patterns

Source of truth: the AhaSlides settings UX conventions below. Settings panels are the most-repeated UI pattern in the product — without shared rules, copy and layout drift compound across teams. These rules define the pattern once so every settings surface reads as one product.

> **Scope.** All surfaces where a user configures behaviour: editor settings panels, workspace settings, account settings, block options, distribution settings. Applies to any AhaSlides product UI.
>
> **Companion skills.** Use `aha-design-icons` for any glyph in a settings row, `aha-design-paywall` for the upgrade popover a plan-gated setting opens (§6), `aha-design-overlays` for the confirmation modal a destructive setting triggers (§7), and the `aha-branding:*` colour/typography/tone skills for exact tokens and copy voice. This skill owns *where* a locked or destructive setting sits in the panel; those skills own *how* the resulting popover/modal behaves — defer to them rather than re-specifying.
>
> **Judge counterpart.** After building or when reviewing a settings surface, self-check with `aha-design-settings-judge` — it scores the surface PASS/FAIL against these rules and feeds concrete fixes back, closing a build→judge→fix loop.
>
> **Slide-type config.** §10 governs the one specific, high-frequency case: the config a **slide type** exposes in the editor right panel (the option-list "Items" component and its section ordering). It is **mandatory** for that case and is backed by a Figma reference — see §10.

When you add or review a setting, conform to the rules below; if a design mock asks for something outside them, flag it rather than silently introducing a new pattern.

> **How to read this whole skill (applies to EVERY section, §1–§10 — not just the ones with a named screenshot).** Each rule has two sides: a **correct pattern to match** and a **"do not" / anti-pattern to avoid**. Both are **hard requirements**. Reproducing a **GOOD** example is required; matching any **BAD** example / anti-pattern is a **hard FAIL** that must be fixed before the surface is done — no partial credit, no "close enough," no rationalising a deviation because it "looks meaningful" or "still works." The **worked BAD/GOOD examples are catalogued in the judge's dataset** (`aha-design-settings-judge/evals/evals.json`); **refer to them while building**. The named examples in this doc are illustrations of the rule, never the full list — the rule binds even where no screenshot is shown.

## 1. Setting name format

A setting name is a **short noun phrase** that identifies what is being configured. It is not a sentence, not a verb phrase, and not a description of the toggle state.

| Correct               | Incorrect                                | Why incorrect                                               |
| --------------------- | ---------------------------------------- | ----------------------------------------------------------- |
| "Progress bar"        | "Show progress bar"                      | Verb phrase — the toggle communicates on/off, not the label |
| "Email notifications" | "Enable email notifications"             | "Enable" is redundant with the toggle                       |
| "Guest access"        | "Allow guests to access this workspace"  | Too long; reads as a description, not a name                |
| "Response limit"      | "Limit the number of responses"          | Verb phrase                                                 |
| "Auto-advance"        | "Automatically advance to next question" | Description, not a name                                     |

**The test:** if removing the first verb from the label makes it a clean noun phrase, the verb was redundant.

The toggle, checkbox, or select communicates the action. The label communicates what is being acted on.

**Narrow exception — mode toggles for an action.** A toggle whose whole purpose is to switch *how or when an action happens* — a manual-vs-automatic mode — may keep a verb-led label when no clean noun phrase names it unambiguously. "Show results manually" and "Open submission manually" (§10) are the canonical cases: the noun-only forms ("Results", "Submission") lose the manual/automatic meaning entirely. This is deliberately narrow — it does **not** license "Show progress bar" (→ "Progress bar") or "Enable email notifications" (→ "Email notifications"), where a clean noun already exists. Apply it only when **both** are true: removing the verb leaves an ambiguous fragment, **and** the setting is a manual/automatic mode switch for an action.

**No decorative leading icon on the label.** A setting label is **text** — a noun-phrase name with at most the `?` help glyph after it. Do **not** prefix each setting with a **decorative leading icon** (a star, trophy, clock, etc.). Icons in a settings panel are **functional** — the drag handle, the per-option image button, the delete, and the `?` help glyph — not per-label ornaments. Giving every row its own decorative glyph adds visual noise and reads as inconsistent; the noun-phrase name alone identifies the setting.

> **"But the icon matches the setting" is exactly the trap — it is still decorative.** An icon that merely *illustrates the label's topic* — a **trophy** on "Leaderboard", a **clock** on "Time limit", a **star** on "Scoring"/"Points" — is **decorative, not functional**, and must be **removed**. Topically relevant ≠ functional. "Functional" means the icon *is a control the user operates or that changes state* — and the complete allowed set is exactly four: the **drag handle**, the per-option **image** button, the **delete**, and the **`?` help** glyph. Anything else next to a label — however on-topic — comes out. (This is the specific rationalization that has let star/trophy/clock icons survive a "compliant" review: don't make it.)

## 2. Toggle vs checkbox

### Use a toggle when

- The setting takes effect immediately on change, without a save action.
- The setting represents a binary on/off for a single, independent feature.
- Examples: "Progress bar", "Time limit", "Require login".

### Use a checkbox when

- The setting is part of a group of options that are saved together (e.g. a settings form with a "Save" button).
- Multiple related options can be selected independently within a group.
- The setting represents agreement to terms or consent — in which case, use first person: "I agree to the terms of service."
- Examples: A block-type picker where multiple types can be enabled, notification preference checklists.

### Never mix toggles and checkboxes in the same group. Pick one pattern per section.

## 3. Help text — the exception, not the default

Help text is an always-visible line below a setting name. Every line adds permanent weight to the panel, so a panel full of help text reads as heavy and complicated. Help text is therefore the **exception**: use it only when the user must see a consequence *before* acting that they cannot easily undo. Anything else that needs explaining goes in a **`?` tooltip** (§4), and most settings need neither.

> **⚠️ The single most common AI failure in a settings panel — read this before adding any help text.** Agents reflexively give **every** setting a one-line description under its name. That is the exact panel you must never ship. Help text is rare *per setting*, so across a whole panel it is **near-absent**: a right panel of ~6 settings usually has **zero** help lines, occasionally one. Every descriptive line in the mock below is the anti-pattern — each is a `?` tooltip, or nothing, **never** help text:
>
> - "Off means one pick per person." → `?` tooltip (behaviour, not a consequence)
> - "Display % instead of raw vote counts." → `?` tooltip
> - "Optional context shown under the question on the canvas." → `?` tooltip
> - "Reveal the right choice after the vote." → `?` tooltip
> - "Only bar charts show option images." → `?` tooltip
> - "Put the starter options back." → nothing, or, if Reset discards the creator's edits, help text that states *that consequence* ("Replaces your current options — your edits are lost."), not this feature description
>
> **The ship gate — count the lines.** Before shipping, count the help-text lines in the panel. More than **one** is almost always the anti-pattern: re-examine each and move the descriptive ones into the `?` tooltip. Default to **zero**.
>
> **Never both channels on one setting.** A setting must not carry a `?` help icon **and** a help-text line — that is the same explanation twice. If a `?` is present, the explanation lives inside it and the help line is deleted. One channel per setting.

### Reach for the lightest option that works

1. **Name only** — the default. A clear noun-phrase name (§1) carries the large majority of settings.
2. **`?` tooltip** — for any "what exactly does this do / why it exists / how it interacts" elaboration. Hidden until the user asks for it, so it costs no standing panel weight.
3. **Help text** — only for a must-see consequence that is hard to reverse.

### Use help text ONLY when both are true

- Acting without the information risks a consequence the user **cannot easily reverse** — data loss, responses blocked or dropped, charges incurred, an irreversible state change.
- That consequence is **not already obvious from the name**.

If the information is merely clarifying, contextual, or nice-to-know → a `?` tooltip, not help text. If the name already implies it → nothing.

### Never use help text for

- Restating the setting name in a longer form, or describing the feature ("Choose a colour for your theme").
- Plan-tier explanation — that lives in the Paywall popover (§6).
- General "why this exists" context or non-critical interactions between settings — `?` tooltip.

### How to write it (when it is warranted)

- One short sentence, aim for **≤ 90 characters**. If it will not fit, the setting is probably mis-scoped or misnamed.
- Sentence case. Ends with a period.
- States the **consequence**, not the feature. Does not start with the setting name.

| Setting                       | Right channel                          | Copy                                                      |
| ----------------------------- | -------------------------------------- | --------------------------------------------------------- |
| "Response limit"              | **Help text** — responses get blocked  | "New responses are blocked once the limit is reached."    |
| "Reset all responses"         | **Help text** — unrecoverable          | "Permanently clears every collected response."            |
| "Auto-advance"                | **`?` tooltip** — behaviour, not a risk | "Each question advances automatically after a selection." |
| "Theme colour"                | **Nothing** — self-evident             | —                                                         |

## 4. Tooltips — the `?` icon carries secondary explanation

Two kinds of tooltip appear in a settings panel:

- A **`?` help tooltip** — a small help glyph right after a setting name. This is the **default home for any explanation a setting needs beyond its name**: what it does in detail, why it exists, how it interacts with another setting. It keeps that copy out of the standing layout so the panel stays light, and it is what you reach for instead of help text in every case that is not a must-see, hard-to-undo consequence.
- A **label tooltip** on an icon-only control — names the action a glyph alone does not make obvious.

A tooltip is **never the only place** a must-see consequence (→ help text, §3) or an error (→ inline copy) lives.

### The `?` help tooltip

- **Glyph:** a small **question-mark help icon (`?`)** from the shared icon component, sized to the setting-name text and placed right after the name with the standard icon-to-text gap (see `aha-design-icons`). It is a **question mark, NOT an info icon (`ⓘ`)** — an info circle is the wrong glyph for a help tooltip and is a recurring AI mistake. If the mock shows `ⓘ` next to setting names, swap it for the shared `?` help glyph.
- **Trigger:** opens on hover, on keyboard focus, **and** on tap — it must be reachable by keyboard and touch, never hover-only.
- **Consistency across the panel.** Every `?` in one panel is the **same glyph at the same size** with the **same tooltip placement**. Mixing two different help icons, two sizes, or a tooltip that points up on one row and down on the next is a common slide-config bug (AHA-46489, AHA-46544) and reads as unfinished — always pull the glyph from the shared icon component rather than hand-placing a one-off.
- **Styling & arrow — use the standard tooltip, don't restyle it.** The tooltip is the **shared/default tooltip** (AntD `a-tooltip` / the DS tooltip): the **default dark-navy background token** (not a custom grey/black fill), the **default small tooltip font size** (never body- or heading-size text), and default padding. Its **arrow points directly at the `?` icon** it belongs to — anchor the placement to the icon so the pointer lands on it, not floating off to the side. Reuse the shared component so every `?` looks identical; a bespoke background, an oversized font, or a mis-anchored arrow is a FAIL.
- **Reach for it** over help text for anything that is not a must-see, hard-to-undo consequence — this is how the panel avoids a wall of always-visible copy.

### Do NOT put it in a tooltip

- A consequence the user must see before acting → help text (§3).
- An error or validation result → always inline, never hover-gated.
- A confusingly-named setting → rename it; a tooltip is not a patch for a bad name.
- Anything needing a link, a button, or more than two short sentences → it does not belong in a tooltip.

### Copy format

- Sentence case. One to two short sentences, **≤ 140 characters**.
- Period on a full sentence; none on a bare fragment.
- No links, no bold, no lists.

### Where does the information go?

| The information is…                                          | Put it in…                                       |
| ------------------------------------------------------------ | ------------------------------------------------ |
| Self-evident from the setting name                           | Nothing                                          |
| Helpful elaboration — what it does, why, how it interacts    | **`?` tooltip**                                  |
| A consequence the user must see before acting, hard to undo  | **Help text**                                    |
| An error, warning, or validation result                      | Inline copy (or a modal) — never a tooltip       |
| The action of an icon-only control                           | Label tooltip on the icon                        |

## 5. Grouping settings

### Hierarchy comes from spacing, not dividers

Settings hierarchy is communicated by the **size of the gap between elements**, not by rule lines. Do **not** use dividers to separate settings, groups, or the danger zone — the bigger the conceptual break, the bigger the gap. Every value is a `--aha-size*` spacing token (no raw px, no divider borders):

| Relationship | Token | Value |
| ------------------------------------------ | ------------ | ----- |
| Setting name → its help text               | `sizeXXS`    | 4     |
| Sub-setting → its parent (vertical)        | `sizeXS`     | 8     |
| Sub-setting indent (horizontal inset)      | `sizeLG`     | 24    |
| Between sibling settings in a group        | `size` / `sizeMS` | 16 |
| Between groups                             | `sizeXL`     | 32    |
| Danger zone from the rest of the panel     | `sizeXXL`    | 48    |

The scale is monotonic — 4 < 8 < 16 < 32 < 48 — so the layout reads as a hierarchy from whitespace alone. A tighter gap binds elements into one unit (a setting and its help text, a sub-setting and its parent); a wider gap signals a stronger break (a new group, the danger zone).

### Two spacing-application traps

- **Repeatable rows of one control are not sibling settings.** The options of a poll, the two answers of a True/False — rows of a *single* control — bind with the tight `sizeXS` (8px) gap, not the `size`/`sizeMS` (16px) between-*settings* gap. 16px between the rows of one option list makes them read as separate settings; 8px reads as one control. (Reserve 16px for the gap between *distinct* settings.)
- **A between-fields gap belongs *between* fields — never trailing the last one.** Put the field gap on the parent (`flex flex-col gap-*`), which only ever sits *between* children, rather than as a bottom-margin on each field. A per-field bottom-margin (e.g. a `SETTINGS_FIELD_GAP_CLASS`/`mb-*` utility) leaves a trailing gap after the **sole or last** field — dead space at the panel bottom that reads as a mystery gap (§9). A field-gap utility on the only/last field is always a bug.

### Separate with spacing, never a container

Section-to-section separation comes from the spacing scale above — **not** from wrapping a setting or group in a **card, or any container with its own background/tinted fill or border**. A card or filled panel is a strong signal that its contents are a *single, self-contained, selectable object* — a radio/checkbox option, a plan card, a template tile. Wrap plain settings or a toggle row in one and the panel mis-reads as a set of selectable choices rather than a configuration surface, and the group is boxed off from the settings around it.

**A single toggle/setting row especially must not sit on its own filled background.** The setting sits **directly on the panel surface**, separated from its neighbours by spacing alone — no grey/tinted rounded pill behind the row, no bordered box. (Real BAD example: a lone "Multiple submissions" toggle wrapped in a tinted rounded container. The fix is to drop the container and let the row sit on the panel with normal spacing.)

**This holds for a whole group/section too.** Don't put a set of settings on a **coloured/tinted panel** (e.g. a "Game rules" section and its sub-settings sitting on a light-purple rounded card). A section is separated from its neighbours by the group gap (`sizeXL`, 32) and its header — never by a filled/coloured container wrapping the whole block. The group header + spacing already communicates "these belong together"; a coloured box on top of that makes the section read as one selectable object.

Reserve card and tinted-container styling for genuinely **selectable** items. For everything else, group with spacing.

**The one carve-out — a repeatable composite list item.** A repeatable *item* in a list whose each entry is itself a **composite** — its own body of fields and/or a nested option list, plus its own delete (a Question, a Blank, a Card, a Hotspot, a Round) — is a genuinely self-contained object, so it MAY sit in the shipped **numbered-section wrapper** (in `slide-type-creator`, `@/iframe/settings` → `NumberedItem`). Its `contained` variant (the default) puts the **WHOLE item — number chip, `<Label> N` header, delete AND body — inside ONE secondary-fill grey card** (`#F7F7F7`, rounded, no border); the grey wraps the header too, *not* a bare header sitting above a separately-grey body. The number chip is a **muted grey** circle (never a radical-purple badge). The delete is a **tertiary** (`type="text"`, borderless, non-danger) trash **shown only on hover** of the item (hidden at rest, its space reserved so nothing shifts) and **hideable entirely** for an item that must not be removed (`deletable=false`); use `canDelete=false` to *disable* it at the minimum item count. The `plain` variant drops the fill for single-field items. **Inputs you compose into its slot stay the theme's default BORDERED `Input`/`Textarea` — never `:bordered="false"`**; a borderless field inside the grey card is wrong. This is the exception to "never a container" above — it wraps a **repeatable composite item**, *not* plain settings or a lone toggle, which still sit directly on the panel. The wrapper also **standardises the number chip** (one muted size) so numbered lists don't drift slide to slide. A flat list of *single values* is **not** wrapped in it — that stays an `OptionRow` list, numbered only when order carries real meaning (§11 SETTINGS-39).

**Multiple fields inside one composite item must read as a matching set.** When a composite item's body holds more than one text field (a Hotspot's *Title* + *Description*, a Card's *front* + *back*), the fields are **one component family, each labelled, each full-width** — never a single-line `Input` for one and a `Textarea` for the other, which reads as two unrelated controls (the reviewer's tell is literally *"are these two different components?"*). Give each field its own label (label-on-top — a `SettingRow`/stack row, in `slide-type-creator` `@/iframe/settings` → `SettingRow layout="stack"`), let each **span the card's full width**, and render a focus-only char counter as an **overlay inside the field** (absolute, revealed on `:focus-within` — the shared `CountedInput` pattern) — **never as a sibling element beside the field**, because a counter sitting in the row steals horizontal space and makes the two fields render at visibly different widths. A title that is naturally one line can be a single-row auto-sizing `Textarea` so it still matches its multi-line sibling exactly.

When a section feels like it needs more separation, the answer is always more spacing — never a heavier separator or container:

| Rank | Mechanism | When |
| ---- | --------- | ---- |
| 1 | **Spacing** | The default and correct answer (the scale above) — more conceptual distance, a wider gap. |
| 2 | **A card / tinted / bordered container** | **Never**, around plain settings or a toggle row. |

If spacing alone doesn't feel like enough, the fix is almost always clearer grouping or a group header (below) — not a heavier separator.

### Consistent control styling

Controls within one settings panel — inputs, selects, buttons, and any genuinely selectable choice cards — should draw their corner radius (and other shape styling) from the product's own established **design-token scale**, applied consistently, not ad hoc per-component values. A panel where each control rounds its corners differently reads as unfinished. This skill deliberately sets no radius numbers — those are per-product tokens; take them from your product's design-token / theme documentation (for AhaSlides Ant Design surfaces, the border-radius scale in `aha-design-antd`).

### Group by functional relationship

Settings that affect the same feature, behaviour, or outcome belong in the same group. Do not group by component type (all toggles together, all selects together) and do not group alphabetically.

### Group size

- Minimum: 2 settings per group. A group of one is just a setting — no group header needed.
- Maximum: 6 settings per group before splitting. More than 6 settings under one label creates a panel that is hard to scan.
- If a group would exceed 6 items, look for a natural sub-grouping or move to a separate section or tab.

### Group header format

- Short noun phrase. Sentence case. No colon. No punctuation.
- 1–3 words. The header names the domain, not the settings within it.
- Examples: "Responses", "Appearance", "Access", "Notifications", "Scoring", "Timing".
- Do not write: "Response settings", "Configure appearance", "Options for access" — the context already implies "settings".

### Weight hierarchy — only the group header is bold

Emphasis marks the **parent**, not its members. The **group/section header** carries the weight (bold / semibold, and typically a touch larger); the **individual setting labels within the group are regular weight**. That contrast is what makes the header read as the container and the settings as its contents.

- **Correct** (image-2 GOOD): "Points" (group header, bold) over "Total" and "Increment" (setting labels, **regular**).
- **Wrong** (image-1 BAD): every setting label in a "Game rules" group rendered **small and bold** — the same emphasis as the header, so the hierarchy flattens and nothing reads as the parent.

Make **exactly one** level bold per group: the header. Don't bold the member setting labels (and don't shrink them to a caption size to compensate — regular weight at the normal label size is right).

**Not every label is bold.** Bold is reserved for **section / group headers**; **toggle rows and member setting labels are regular weight**. A panel where *every* setting label is bold (headers and individual toggles alike — "Scoring", "Faster answers get more points", "Leaderboard", "Partial scoring", "Time limit" all bold) is the anti-pattern: with nothing regular, there's no hierarchy and the whole list reads as one flat wall of emphasis. Keep the section headers emphasised and set the member/toggle rows to regular.

**A lone setting is a `SettingRow`, never a `SectionHeader`.** One control with one label is a *single setting*, not a group — so its label is **regular weight** (`SettingRow`, which lays the label out beside or above its control), never the **bold** `SectionHeader`. Reserve `SectionHeader` for a real **group header over 2+ settings** (or a master-toggle row that owns the settings beneath it). Titling a lone field with `SectionHeader` renders that one label bold like a group header and invents a group that isn't there — the flattened-hierarchy failure above, in reverse. (In `slide-type-creator`: `@/iframe/settings` → `SettingRow` for the lone setting; `SectionHeader` only for an actual group.)

### Control placement — inline when it fits, stacked only when it's wide

A single control sits on the **same row as its label** — label left, control right (`SettingRow`'s default `inline` layout) — **whenever the control is narrow enough to share the row**: a toggle, a short number-and-unit field, a compact stepper, a small select. Only drop the control **below** the label (`SettingRow layout="stack"`, or an equivalent stacked field) when it is **too wide to sit beside the label** and needs the whole row — a multi-line `Textarea`, a wide select, a radio/segmented group of several options, an image dropzone.

- **Don't stack a narrow control.** A toggle or a 4-character number field pushed onto its own line under the label wastes vertical space and makes a lightweight setting read as a heavy stacked field.
- **Don't cram a wide control inline.** A long select or a multi-option radio group squeezed to the right of the label overflows or crushes the label to an unreadable width — give it its own row.

The test is simply whether the control **fits on the label's row at a comfortable width**: if yes, inline; if it must wrap, stack.

### Ordering within a group

1. Most-used settings first.
2. Dependent settings immediately after the setting they depend on (a sub-setting that only activates when its parent is on must sit directly below it, indented `sizeLG` with an `sizeXS` gap to the parent).
3. Dangerous or irreversible settings last within a group, set apart by a wider gap (`sizeXL`, 32) — not a divider.

### Ordering of groups

1. Settings that affect the primary function of the feature come first.
2. Settings that affect presentation or appearance come after.
3. Settings that restrict or gate access come after that.
4. Danger zone settings (delete, reset, archive) always come last, set apart from the rest by the largest gap (`sizeXXL`, 48) — not a divider.

### Defaults and option order inside a control

A select/dropdown or a segmented control is itself ordered, and it ships with a
pre-selected value:

- **Pre-select the recommended default** so a first-time creator gets a good result
  with no interaction. The default is the option most creators should use, not
  whatever happens to be first alphabetically or first in the enum.
- **Order the options most-relevant-first** — the recommended default sits at the
  top of the list, not buried mid-list. (AHA-46562: percent was the intended
  default and belonged first in the measurement-unit select, but shipped neither
  default nor first.)
- Match the convention an equivalent existing slide type already uses rather than
  inventing a new default/order.

**Segmented control vs dropdown — pick by option length, count, and available space.**
A segmented (pill) control is only for a **small set (≈2–4) of short, one-line
options** that comfortably fit side by side in the space available. Use a
**dropdown/select** instead when any of these holds:

- the options are **long** (multi-word labels) — they wrap or overflow the pills;
- there are **many** options;
- the control sits in a **tight/limited horizontal space** — e.g. sharing a row with
  an input — so several pills get cramped.

BAD examples: "Time runs out" / "A hunter reaches a gold target" forced into a
segmented switch (long labels → broken layout); a "% / pts / Custom" segmented control
squeezed next to a "Total" number input on the same row (many choices, limited width).
GOOD: render each as a dropdown ("Type: QR code ▾"; "% ▾" beside the Total input).

### Sub-settings (dependent settings)

When a setting only applies if a parent setting is enabled, show it indented beneath the parent (`sizeLG` horizontal inset, `sizeXS` gap above — a tighter gap than between siblings, so the child visibly binds to its parent). Hide it completely when the parent is off — do not show it in a disabled state. A disabled sub-setting implies the user could interact with it. A hidden sub-setting correctly communicates that it does not apply.

Exception: if showing the sub-setting while disabled meaningfully communicates what the user will unlock by enabling the parent, show it disabled with a brief explanation ("Enable [parent setting] to configure this.").

**When it is shown, a dependent sub-setting must read as *nested under* its parent — never as an independent, top-level setting.** Hiding it when the parent is off (above) is only half the job; the other half is how it looks when visible. Two things create the nesting:

- The indent and the tighter gap above bind it to the parent (already in the spacing scale).
- **De-emphasis relative to top-level settings** — a lighter label weight and/or a lower-emphasis label colour, so the eye ranks the child *below* the parent it belongs to. Giving it the same full visual weight as a top-level setting is the mistake: it then reads as a peer, not a child.

Do **not** bracket a sub-setting with section-level separation on both sides — a rule line above *and* below it, or a card/tinted box around it (see "Separate with spacing, never a container" above). That reframes the child as its own standalone section and severs it from the parent it depends on. A visible sub-setting sits *inside* the parent's block, subordinate to it; separation belongs *between* groups, never *around* a single dependent setting.

## 6. Locked and plan-gated settings

When a setting requires a paid plan the user is not on:

- Show the setting in the panel — do not hide it.
- Display it in a visually distinct locked state: setting name at full opacity, with a small crown badge that replaces the setting's normal tooltip.
- Clicking the crown badge opens the shared Paywall popover.
- The popover's contents, CTA, and analytics are owned by `aha-design-paywall` — do not redefine them here. (It renders one primary **Upgrade** CTA to the pricing page; there is no secondary "View plans" button.) This skill's rule is only that the setting stays **visible and locked**, not hidden.

## 7. Dangerous and irreversible settings

A setting is dangerous if it cannot be undone or if acting on it affects data, access, or content in a way the user cannot reverse.

### Visual treatment

- Place at the bottom of the relevant section or in a dedicated "Danger zone" group at the bottom of the panel.
- Separate from other settings with the largest spacing gap (`sizeXXL`, 48) above — not a divider line. Hierarchy in a settings panel comes from spacing, never rule lines (see §5).
- The associated CTA is a **danger Button** — AntD's `danger` prop, which resolves to `colorError`; do not hardcode a hex. Danger styling lives on the action button only, never on the label (matches the destructive-button rule in `aha-design-overlays`).
- Do not use red on the toggle or setting name itself — red on a label reads as an error state.

### Confirmation requirement

Any irreversible action triggered from a settings panel must require a confirmation modal before executing. The modal follows the destructive-confirmation pattern in `aha-design-overlays` — a question title, a danger confirm button, `mask={{ closable: false }}` so a stray backdrop click can't destroy anything, and the async-confirm flow that stays open on failure.

Never execute a destructive action on a single click or toggle flip, even with an undo toast as a safety net. The modal is required.

## 8. Settings in context: panel vs page vs modal vs drawer

Not all settings belong in the same surface. Putting the wrong type of setting in the wrong surface creates cognitive mismatch.

| Surface                                       | Use for                                                                                        | Examples                                                                          |
| --------------------------------------------- | ---------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| **Inline settings panel** (editor right pane) | Per-object settings that apply only to the selected item. Immediate effect on the canvas.      | Block settings: required toggle, choice count, media position                     |
| **Settings page** (dedicated route)           | Workspace or account-level settings. Affect all users or all content in a scope.               | Workspace name, billing, member permissions, integrations                         |
| **Modal settings**                            | Settings for a one-time action or a short configuration flow. Not persisted independently.     | Export options, share settings for a specific link, one-time import configuration |
| **Drawer**                                    | Settings that supplement a primary view without replacing it. Medium complexity, 3–8 settings. | Distribution settings, results filter configuration                               |

If a settings panel in the editor is growing beyond 8–10 settings for a single block, that is a signal the block is either too complex or the settings are not well-grouped. Audit before adding more.

## 9. Every settings object renders at its real height — no empty containers

**The rule.** Every object in a settings panel must occupy **only its own real content height**. A container that renders **nothing visible** — an empty section, an empty list wrapper, a settings iframe with an empty body — must be **detected and removed** (unmounted, `v-if`'d out, or collapsed to zero height), never left in the layout holding space. Whitespace in a settings panel is meaningful (it encodes hierarchy — §5); an empty element injects whitespace that means nothing, so the panel reads as broken or padded. This is the single most common source of "mystery gaps" in the editor right panel.

When you review or build a settings surface, walk each object and ask: *does this render visible content right now?* If not, it must not be in the DOM taking height. Two structures break this rule most often:

- **An always-rendered wrapper around a conditional list.** A wrapper inside a flex column with a `gap` still contributes that gap even when the wrapper itself is 0px tall, because the flex gap sits *between* siblings regardless of their height. Render the wrapper **only when the list is non-empty** (`v-if`) — don't rely on the empty child collapsing on its own.
  - *Concrete case (AHA-283):* `section.display-fields` (the "Collect audience info" block) is `flex flex-col gap-4` (16px). Its second child `section.selected-fields` wraps `SelectedParticipantFields`, which renders an **empty `<ul>`** when zero fields are selected. The section is 0px tall but the parent's 16px gap still paints between the header row and it — measured: hiding the empty section drops `.display-fields` from **52px → 36px** (16px reclaimed). Fix: render `section.selected-fields` only when `selectedParticipantFields.length > 0`. Note this wrapper is a **shared** host component (`SlideParticipantFields.vue`), so the 16px appears on *every* slide type that shows Collect audience info — including native ones like Idea Board — and fixing it there is correct for all of them.
- **A plugin settings iframe** — the separate, plugin-specific cause; covered in detail below.

### Plugin settings render in a host iframe — the plugin owns its height

A **native** slide type renders its editor right-panel settings as host Vue components, which shrink-wrap automatically. A **marketplace / plugin** slide type does not: the host mounts the plugin's settings entry inside an **iframe** (`SlidePluginSetting` → `SlidePluginIframeConfig`), and sizes that iframe from the height the plugin reports back via **`onHeightChange(h)`** — the same host↔plugin channel the canvas and audience iframes use (see `aha-design-canvas`, `aha-design-audience`). This is the one settings surface whose height the panel does **not** control; the plugin does.

Because of that, two failure modes are unique to plugin settings and produce dead space no amount of spacing-token tuning will fix:

### The iframe must report its real content height

The host container computes its style as `iframeHeight ? { height: iframeHeight + 'px' } : { height: '100%' }`. `iframeHeight` starts **null**, so until the plugin calls `onHeightChange`, the container is `height: 100%` and expands to fill the panel — a large empty div. **Report height on mount and on every reflow** (content change, section expand/collapse, async load). A settings iframe that never reports height, or reports stale height, leaves a gap the host cannot correct.

### An empty settings surface must not mount a non-empty iframe

If the plugin has nothing to show — no plugin-specific settings, or a section that is empty because the user selected no options (e.g. "Collect audience info" with zero additional fields) — report height **0**, or do not register the settings entry at all. An iframe that reports a **non-zero height with an empty body** paints a phantom empty box, and the host still adds the `.form-group` wrapper's 16px bottom margin on top of it.

> **Real bug (AHA-283).** The ~80px gap under "Collect audience info" on Draw Answer was **two** empty containers stacked: (1) the shared 16px empty-`selected-fields` wrapper above (previous bullet), plus (2) a Draw Answer settings iframe reporting `height: 48px` with an empty `<body>` → a 48px empty box + 16px `.form-group` margin ≈ **64px**. Only cause (2) is Draw-Answer-specific: a native slide type (Idea Board) never mounts the plugin iframe, so it shows only the shared 16px, not the 64px. The fix that shipped first touched only the 16px shared wrapper and missed the dominant 64px iframe — fix **both**, each at its own layer.

### The iframe's own root must shrink-wrap — never `h-screen` / `100vh`

The two modes above are about the plugin *reporting* height. This third mode is subtler and is the most common self-inflicted one: the plugin reports height faithfully, but it **measures the wrong element** — its own mount root was CSS-stretched to the viewport, so the height it reports is a full screen of mostly-empty space. The host's autoResize reads the height of the iframe's mount root (`document.body` / `#app`); if the plugin's `settings.html` forces that root to a viewport height, the plugin dutifully reports a full-viewport height no matter how little content it holds. It produces the same phantom empty box as a null report — but self-inflicted, and it **slips past both checks above** (a height *is* reported, and the body is *not* empty).

A settings-iframe root **shrink-wraps its content** — `height: auto` on `html` / `body` / `#app`, never `h-screen`, `100vh`, or `height: 100%`. A viewport-height root is a canvas/audience habit (those surfaces are *meant* to fill their frame); settings are sized by their content, so the root must collapse to it.

```html
<!-- ✗ BAD — #app stretched to the viewport; autoResize measures #app.offsetHeight
     as a full screen and reports it, leaving a large empty block below the content -->
<body class="h-full bg-transparent">
  <div id="app" class="h-screen"></div>
</body>

<!-- ✓ GOOD — the root shrink-wraps, so the reported height equals the content height -->
<head><style>html, body, #app { height: auto; min-height: 0; }</style></head>
<body class="bg-transparent">
  <div id="app" class="aha-iframe-root"></div>
</body>
```

> **Real bug (AHAM-463).** The True/False settings panel showed a large empty block under its one field on every deck. The Vue was correct and the iframe *did* report a height — but `settings.html` set `#app` to `h-screen` (100vh), so the auto-height reporter measured `#app.offsetHeight` as a full viewport and reported that. It took several rounds because both modes above looked fine and an early fix chased a small trailing margin instead (a real but minor ~24px — see §5's between-fields-gap trap); the reporter kept flagging "khoảng trống rất to" (a very large empty space). The dominant cause was one line of mount-root CSS (`height: auto`), matching every healthy settings panel. When a plugin settings iframe reports a height far larger than its content, check the mount root's CSS height **before** the reporting logic or any per-field margin.

### Debugging rule — find the layer before you touch it

Before touching anything, run a **differential diagnosis**: reproduce the gap on the plugin slide type, then compare against a **native** slide type (e.g. Idea Board) with the same section. Where the space appears tells you which layer owns it — and there is often **more than one**, so account for the full measured height, not just the first cause you find:

- **Present on both plugin and native** → a **shared host component** (e.g. the empty `selected-fields` wrapper). Fix it there with a `v-if`; it is correct for every slide type at once.
- **Present only on the plugin type** → the **plugin settings iframe**. Do **not** edit a shared editor component to chase it — that changes every type and still won't match the native reference. Fix it where it lives:
  1. **In the plugin** (preferred) — report the correct height, and report `0` / don't mount when there is nothing to render.
  2. **In the host** — collapse an empty plugin iframe: drop the `.form-group` bottom margin (and any `height: 100%` fallback) when the reported height is `0`.

The AHA-283 miss was diagnosing only the shared 16px and calling it done; the differential would have shown a residual 64px present only on the plugin type, pointing straight at the iframe.

Verify empirically in the real editor (the standalone playground re-mounts differently and hides this): open the slide and measure each container's rendered height against its content — any element with height but no visible content is a bug. An empty-body iframe with non-zero height, and a 0px wrapper inflating its parent's flex gap, are the two shapes to look for.

## 10. Slide-type config in the editor right panel

This section governs one specific, high-frequency surface: **the config a slide type
exposes in the editor right panel** (the inline settings panel from §8). It is
**mandatory** for any slide type (native or plugin) that needs right-panel config. All
the general rules (§1–§9) apply here unchanged; this section adds only what is specific
to a slide-type panel — **which components to reuse** and **how to order the panel**.

> **Reuse the slide-settings components — don't re-implement or re-specify the row.**
> In `slide-type-creator`, a slide type's right-panel settings are built by **composing
> the shipped `@/iframe/settings` component library** — a component for the section
> header, the setting row, the sub-setting group, the option / question list, the
> per-option image control (`ImageActionButton`), the **standalone full-width image
> field** (`ImageDropzone` — when the image IS the field: a background/hero image, an
> interactive-image base, a picture reveal — NOT a hand-rolled Add/Replace/Remove button
> set), the **number-with-a-unit field** (`NumberWithUnit` — a number + a unit written in
> full, with a hover stepper, a hard digit cap and a built-in `errorMessage` line; see the
> selection rule below), and so on. Those components already
> **encode the row anatomy, states and behaviour** (single-bordered borderless-textarea
> row, drag handle inside, on-hover delete, full-width "+ Add", focus-only counter,
> combo-input image, unit-suffix stepper, …), so this section deliberately **does not
> re-inline that anatomy** — reusing the component is what gets it right.
>
> **The catalogue is the source of truth, not this skill.** Match your need to a
> component by its role in `src/iframe/ui-standard.json` → **`settingsLibrary`** (each
> entry names a component and what it is for; `settingsRulebook` gives the canonical
> pattern per recurring setting), import it, and compose it — never re-lay-out its
> internals. Because the catalogue is where components are listed, **adding a new
> component updates that file, not this skill** — this section never needs a
> component-by-name list to stay current. **This component reuse is specific to
> slide-type-creator slide settings.**

**A number that carries a unit → `NumberWithUnit`, not a hand-rolled number box.** When a
setting is a **number with a unit** — a duration in seconds, a points value, a per-item
count — reach for the shipped `NumberWithUnit` (a fixed-width digit input, the unit written as its
**conventional short label** after it — a **seconds** unit is always **`sec`**, never the
cryptic `s` and never the long `seconds` — an 8px corner). It already ships the behaviour you'd otherwise
re-invent: a **hover-revealed ▲/▼ tertiary stepper**, a **hard digit cap** (`maxDigits`,
default 4 — a 5th keystroke/paste is simply ignored), and an **`errorMessage`** prop that
renders a red border/ring plus a message line below. **Use `errorMessage` for validation
feedback** ("Maximum is 6000 seconds.") rather than hand-rolling a red line, and **don't
rebuild a stepper or a bare number box.** *Reuse-first:* a slide's standard whole-slide
**countdown is host-native** — turn on `enableTimeLimit` and read the host's time value
(see `reuse-host-capabilities`); `NumberWithUnit` is for a number the **host does not
provide** (a per-item timer, a spin duration, a points-per-answer). See §11 SETTINGS-45.

### 10.1 Panel arrangement / ordering

The controls themselves come from the components above; the one slide-specific *layout*
rule this section adds is the order. Arrange the panel to match the creator's authoring
flow:

1. **Question** — title textarea (+ alignment, optional image, an "Add description"
   affordance for optional secondary text).
2. **The option list ("Items")** — the reusable option / question list, with a
   full-width **"+ Add"** beneath and a `?`-tooltipped noun-phrase section label above.
   When each item is a **single value** (an option / answer), that item is an `OptionRow`.
   When each item is a **composite** — its own fields and/or a nested option list (a
   Question, Blank, Card, Hotspot) — wrap it in the numbered-section component
   (`NumberedItem`) and compose the inner controls (`OptionRow`, `ModeField`, …) in its
   slot; don't hand-roll a numbered box. See §5's composite-item carve-out and §11
   SETTINGS-43.
3. **Participation constraints** — settings that shape responses ("Picks per
   participant"), placed **right after** the list they constrain.
4. **Timing** — a "Time limit" toggle that reveals its duration select when on (a
   dependent sub-setting, hidden when off — §5).
5. **Advanced** — a **collapsed** section for lower-frequency settings ("Show results
   manually", "Open submission manually"), so the default panel stays short.

The principle: **content → constraints → timing → advanced**; constraints sit
immediately after what they constrain; rare / power-user settings go into the collapsed
Advanced section. The general rules (§1–§9) still apply on top of this order — this
section adds the ordering and the component reuse, it does not override them.

### 10.2 Before you ship — run the judge

Reading this section **biases** the design; it does not by itself **guarantee** the
result matches the reference. Invoke **`aha-design-settings-judge`**, fix **every** FAIL
it reports, and **re-judge until the verdict is `OK TO SHIP`**. A build is not done
until it has passed the judge. For a hand-built panel (no component to reuse), additionally
check it element-by-element against the option-row assertions in §11; for a high-stakes
surface, screenshot-diff the built panel against the reference frame in the real editor.

## 11. Test-case assertions

Use these as review / regression targets:

```
SETTINGS-01: Setting names are noun phrases — no leading verb ("Enable", "Allow", "Turn on", "Toggle"); narrow exception: a manual/automatic mode toggle for an action may keep a verb-led label when no clean noun phrase exists (e.g. "Show results manually", "Open submission manually")
SETTINGS-02: Help text is used only for a must-see consequence the user can't easily undo — one short sentence (≤90 chars), ends with a period, states the consequence not the feature; all other explanation is a ? tooltip or omitted
SETTINGS-03: Tooltips (incl. the ? help tooltip) contain no links, buttons, or lists and are ≤140 characters; the ? tooltip opens on hover, keyboard focus, AND tap
SETTINGS-04: A tooltip is never the sole location of a must-see consequence (→ help text) or an error (→ inline copy)
SETTINGS-05: No settings group contains fewer than 2 or more than 6 items
SETTINGS-06: Group headers are noun phrases in sentence case with no colon or trailing punctuation
SETTINGS-07: Dependent sub-settings are hidden (not disabled) when their parent setting is off — unless the disabled state communicates an upgrade path
SETTINGS-08: Plan-gated settings are visible but locked (crown badge) — not hidden; the badge opens the shared Paywall popover (per aha-design-paywall), not a bespoke two-CTA one
SETTINGS-09: Dangerous or irreversible settings are positioned last and set apart by spacing (sizeXXL) — never a divider line
SETTINGS-10: Destructive actions in settings require a confirmation modal before executing (per aha-design-overlays)
SETTINGS-11: Toggles and checkboxes are not mixed within the same settings group
SETTINGS-12: Danger CTA uses the AntD danger Button (colorError) — no hardcoded hex
SETTINGS-13: Hierarchy and separation use --aha-size* spacing tokens — no divider lines and no raw px between settings, groups, or the danger zone
SETTINGS-14: A visible dependent sub-setting reads as nested under its parent — indented AND de-emphasized (lighter label weight/colour) relative to top-level settings; it is never given equal top-level weight, never bracketed by its own separators on both sides, and never wrapped in a container
SETTINGS-15: Plain settings and groups are separated by spacing — never wrapped in a card or any container with its own background/tinted fill or border (a lone toggle row must sit directly on the panel surface, not on a grey/tinted rounded pill); card/tinted styling is reserved for genuinely selectable items (option cards, plan cards) and the one repeatable-composite-list-item exception (the numbered-section wrapper — SETTINGS-43)
SETTINGS-16: A plugin slide type's editor settings iframe reports its height via onHeightChange on mount and every reflow — the host container never falls back to height:100% (phantom full-panel div)
SETTINGS-17: A plugin settings surface with nothing to show reports height 0 (or is not mounted) — no empty-body iframe leaves a phantom box plus its .form-group margin
SETTINGS-18: A blank gap present on a plugin slide type but not its native equivalent is fixed in the plugin iframe (or host iframe-collapse) — never by editing a shared editor component
SETTINGS-19: Every settings object occupies only its real content height — a container that renders nothing visible (empty section, empty list wrapper, empty-body iframe) is removed from the DOM or collapsed to zero, never left holding space; an always-rendered wrapper around a conditional list renders only when the list is non-empty
SETTINGS-20: A slide type's option list ("Items") uses the option-row anatomy — drag handle (only when order matters) + text input + optional image button + on-hover delete — with a full-width "+ Add" button beneath and a ?-tooltipped noun-phrase section label above (per §10)
SETTINGS-21: The option-row text input shows a neutral placeholder when empty, a character counter only on focus (hidden at rest), wraps to multiple lines, and scrolls internally beyond ~4 lines rather than growing unbounded
SETTINGS-22: Per-option image support is either present with its full state set (empty → "Add image" tooltip → filled thumbnail → hover pencil overlay → click Edit/Delete popover) OR the image button is omitted entirely — never rendered as a disabled/greyed stub when unsupported

SETTINGS-44: A standalone MAIN image field — where the image IS the field, not a per-option cell (a background/hero image, an interactive-image base, a picture reveal) — is the shipped `ImageDropzone` (full-width dashed upload card, 8px corners; empty → loading → filled = the image fitted in a display box with a Change/Edit/Delete overlay; the loading state matches the empty card's height so the panel doesn't jump; host-modal intents), NOT `ImageActionButton` (that is the per-option sibling) and NOT a hand-rolled "Add image"/"Replace image" button + separate "Remove image" danger button
SETTINGS-23: The option-row delete button is on-hover (not always visible), highlights with a "Delete" tooltip, and is disabled on every row at the minimum required item count
SETTINGS-24: A slide-type right-panel config follows the reference ordering — Question (title + alignment + optional image + Add description) → option list → participation constraints → Time-limit toggle (revealing its duration select) → collapsed Advanced section (per §10 / node 9237-9266); the standard sections (timing, show/hide results) are present, not omitted (AHA-46508)
SETTINGS-25: Numeric/stepper config inputs enforce a length limit, accept numbers only, clamp to their min/max with an immediate fallback (on change/blur, not only on deliberate misuse), and ship pre-filled with the recommended default — mirroring the equivalent existing slide type (AHA-46440)
SETTINGS-26: Every ? help glyph in one panel is the same shared-component icon at the same size with the same tooltip placement — no mixed glyphs, sizes, or up/down tooltip directions (AHA-46489, AHA-46544)
SETTINGS-27: A select/segmented control pre-selects the recommended default and orders its options most-relevant-first (the default at the top), matching the convention of an equivalent existing slide type (AHA-46562)
SETTINGS-28: Help text is near-absent across a whole panel — a surface where most or every setting carries a help-text line is the systematic anti-pattern; count the lines, default to zero, and move every descriptive line into a ? tooltip (more than one help line in a panel is almost always wrong)
SETTINGS-29: No single setting carries both a ? help icon and a help-text line (the same explanation twice) — keep the ? tooltip, drop the standing help line
SETTINGS-30: The help-tooltip trigger is a question-mark glyph (?), not an info icon (ⓘ) — the shared ? help glyph from aha-design-icons, never an info circle
SETTINGS-35: The ? help tooltip uses the standard/shared tooltip styling — default dark-navy background token, default small font size, and an arrow anchored to (pointing directly at) the ? icon; not a custom background, an oversized font, or a mis-anchored arrow
SETTINGS-36: The option-list section label shows no "X of Y" count (e.g. "4 of 8") — item limits are conveyed by the "+ Add" button disabling at max and the delete disabling at min, not a textual counter
SETTINGS-37: Within a group, only the group header is bold/semibold; the member setting labels are regular weight — setting labels are not rendered bold (or small+bold) like the header, which would flatten the group-vs-member hierarchy
SETTINGS-38: A segmented (pill) control is used only for ~2–4 short one-line options with room to fit; long (multi-word) options, many options, OR a tight/limited horizontal space (e.g. sharing a row with an input) use a dropdown/select instead — a cramped or overflowing segmented switch breaks the layout
SETTINGS-39: Option rows carry a per-option number badge (1, 2, 3…) ONLY when the option's position carries real sequence meaning; an unordered set (categories, poll options) is not numbered — reordering is afforded by the drag handle, not a number badge
SETTINGS-40: Setting labels carry no decorative leading icon (star, trophy, clock, etc.) — the label is text (noun-phrase name + optional ? glyph); panel icons are functional only (drag handle, image, delete, ? help). A topically-relevant icon is still decorative and must be removed (a trophy on "Leaderboard", a clock on "Time limit", a star on "Scoring/Points") — "matches the topic" does not make it functional
SETTINGS-41: A fixed (non-changeable) unit on a numeric input is an inline suffix inside the same field (the shipped `NumberWithUnit`), with a stepper on the number — not a separate framed box beside the input (a bordered box implies the unit is selectable); a changeable unit is a dropdown instead (see SETTINGS-45)
SETTINGS-42: A character/limit counter on ANY text input (option rows, axis labels, titles, notes) shows only while the input is focused and is hidden at rest — never a permanently-visible counter on every input by default
SETTINGS-31: The "+ Add" list button (and any primary action button in the right panel) spans the full panel width — not hugged to content width on one side
SETTINGS-32: The per-option image control is a compact image icon button — not a text button labelled "Image"
SETTINGS-33: A slide-type config reuses the product's shipped option-row component (slide-type-creator: `@/iframe/settings` — OptionRow/QuestionList; a row is hand-built only where no component exists, then checked against the §11 option-row assertions), follows the arrangement frame node 9237-9266 for ordering, and passed aha-design-settings-judge (all FAILs fixed, re-judged to OK TO SHIP) before being considered done
SETTINGS-34: Each option row's UNIVERSAL CORE matches the shipped option-row component / reference spec on every slide type — a single bordered input (row div carries the one border, textarea inside borderless; NOT a box-in-a-box / double border), the drag handle as the first child INSIDE that border (not a column to its left), and the delete floating just outside the top-right on hover. Per-type extras are allowed only when the type has them (per-option image handled per §10.2 / the reference; a correct-answer checkbox for scored types; a series-colour dot) and must not break the core; decoration (number badge on an unordered set, decorative icon) is not allowed
SETTINGS-43: A repeatable COMPOSITE item in a settings list — each item = its own body of fields and/or a nested option list plus a delete (Question, Blank, Card, Hotspot, Round) — uses the shipped numbered-section wrapper (slide-type-creator: `@/iframe/settings` — NumberedItem), composing OptionRow/ModeField/etc. in its slot rather than a hand-rolled numbered box. Its treatment is fixed: the `contained` variant (default) wraps the WHOLE item — number chip + label + delete + body — inside ONE secondary-fill grey card (NOT a header sitting above a separately-grey body); a muted grey number chip (NEVER a radical-purple badge fill); no per-item border; `plain` = no fill, for single-field items; and a TERTIARY delete (type="text", borderless, NOT a secondary/bordered button and NOT danger/red) shown ONLY on hover of the item and hideable entirely via `deletable=false` for a non-removable item (`canDelete=false` merely disables it at the minimum count). Inputs composed into its slot are the theme's default BORDERED Input/Textarea — NOT `:bordered="false"`. A hover-hidden or intentionally-absent delete is correct, not a defect. A flat list of single values is NOT wrapped in it — that stays OptionRow, numbered only when order carries real meaning (SETTINGS-39). This composite-item wrapper is the single exception to SETTINGS-15's no-container rule
SETTINGS-45: A number that carries a UNIT (a duration, points, a per-item count) uses the shipped `NumberWithUnit` — a fixed-width digit input with the unit written as its conventional short label — a seconds unit is always `sec`, never `s` or `seconds` (8px corner) — a hover-revealed ▲/▼ tertiary stepper, a hard digit cap (`maxDigits`, default 4 — a 5th keystroke is ignored), and an `errorMessage` prop (red border/ring + a message line below) — NOT a hand-rolled number box or a separate stepper, and validation feedback uses `errorMessage` rather than a hand-rolled red line. Reuse-first: a standard whole-slide countdown is host-native (`enableTimeLimit`), so `NumberWithUnit` is only for a number the host does NOT provide
SETTINGS-46: A seconds unit is always written `sec` — never the cryptic `s` and never the long `seconds`; every unit uses its conventional short label (`sec` being the standard seconds case), applied to `NumberWithUnit`'s unit and any unit suffix
SETTINGS-47: A single control sits INLINE with its label (label left / control right — `SettingRow`'s default `inline`) when it is narrow enough to share the row (a toggle, a short number+unit field, a compact stepper, a small select); it drops BELOW the label (`SettingRow layout="stack"` or an equivalent stacked field) ONLY when too wide to fit beside it (a multi-line textarea, a wide select, a multi-option radio/segmented group, an image dropzone). A stacked narrow control or an inline wide control is wrong — the test is whether the control fits the label's row at a comfortable width
SETTINGS-48: A lone setting (one control + one label) is a regular-weight `SettingRow`, never a bold `SectionHeader`; `SectionHeader` is reserved for a real group header over 2+ settings (or a master-toggle row). Titling a single field with `SectionHeader` falsely renders a group-level bold label and invents a group that isn't there
SETTINGS-49: A plugin settings iframe's mount root (html/body/#app) shrink-wraps its content (height:auto; never h-screen/100vh/height:100%) — a viewport-height root makes the auto-height reporter measure #app.offsetHeight as a full viewport and report a full-screen height regardless of content, leaving a large empty block. This is a distinct THIRD iframe-height failure mode: unlike SETTINGS-16 (never reports) and SETTINGS-17 (empty body), a height IS reported and the body is NOT empty — the plugin measured the wrong (CSS-stretched) element. When a settings iframe reports a height far larger than its content, check the mount root's CSS height before the reporting logic
```
