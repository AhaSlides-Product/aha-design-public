---
name: aha-design-canvas
description: "Use when designing HOW a slide type LOOKS on the canvas and presenting/casting screen — colours and theme, fonts, the slide container and full-canvas layout, responsive sizing, accessibility (WCAG contrast & readability for an audience viewing from across a large room), and the presenter control-bar action buttons (the Next / Summarise / Previous buttons shown bottom-center), plus the keyboard-shortcut affordances for controls the canvas renders itself (focus-trapping overlays, inline shortcut chips, icon-button tooltips). Trigger when laying out or styling a slide type's visual surface. NOT for the right-panel settings form (use aha-design-settings)."
---

# Designing a slide type's canvas

This skill is about the **visual surface** of a slide type — what the audience and presenter
see. A slide type (an embedded iframe app) renders into the same canvas in two states: the
**editor preview** and the **live presenting/casting screen**. They share one iframe and
differ only by the `presentation.presenting` flag. Design for both at once.

Out of scope:
- the **right-panel settings form** → use **`aha-design-settings`**
- design-system **icons** on the slide (optional) → see **`aha-design-icons`**
- the technical wiring behind the visuals (how height is reported, how action buttons are
  delivered, how `setting` flags are declared) — this skill is purely about the look.

> Cross-plugin skills are referenced by their fully-qualified `plugin:skill` name once the
> `aha-design` plugin name is confirmed (e.g. `aha-design:aha-design-settings`).

---

## 1. The canvas is a 16:9 stage

Slides render inside a **16:9 stage** (1280×720 reference) that the host scales to fit any
screen. Design against the proportions, not a monitor's pixels — use responsive layout so it
holds up scaled large (projector) or small (preview), and don't let content overflow or get
clipped.

## 2. Colours & fonts come from xprops — never hard-code

The slide plugin runs in its **own iframe** (separate document, separate bundle) and reads
the host's state via Zoid xprops on `window.xprops`. CSS variables from the host page do
not cross the iframe boundary, and AntD's theme object is not directly reachable — so
"read the theme" really means "read xprops".

The values the host actually forwards:

| xprops path | What it is |
|---|---|
| `xprops.slide.baseColour` | Slide background colour |
| `xprops.slide.textColour` | Primary text colour |
| `xprops.slide.backgroundImage` | Background image as a single URL string (largest variant); already composited with the host's overlay |
| `xprops.presentation.fontFamily` | Deck's font |
| `xprops.presentationColorPalette` | Accent palette — array of CSS colour strings, auto-padded to 30 entries |
| `xprops.presentationLighterColorPalette` | Lighter-shade accent palette |

- ❌ Don't hard-code hex colours, Tailwind colour utilities, or font families.
- ✅ Must look right on every theme — light, dark, and image backgrounds.
- ✅ Use the palette for accents so the slide feels part of the deck, not a foreign widget.

Fallback when unset: `baseColour #ffffff`, `textColour #313131`.

**The `textColour` fallback fires on the COMMON case — so it must read on the surface it
lands on.** Default themes leave `xprops.slide.textColour` **unset** (the host paints body
text itself), so `slide.textColour ?? <fallback>` runs the fallback on the *most common*
deck, not a rare one. On the **deck background** the flat `#313131` fallback is fine. But
when the ink sits on a **bounded filled surface whose own fill can be either polarity** — a
disabled-grey box, a state-tinted card, a coloured chip — a *fixed* fallback is right on one
polarity and **invisible on the other**: a `?? '#fff'` label vanishes on a light box, a
`?? '#313131'` label on a dark one. Derive the fallback from that surface's own background
with a luminance flip (`readableInkOn(fill)` → dark ink on a light fill, light ink on a dark
fill), so the unset-deck case still reads. ❌ concrete example: a True/False result whose
"incorrect" box carries a light-grey fill and falls its label back to white — invisible on
every default black-text deck. The fix is `slide.textColour ?? readableInkOn(boxFill)`, not a
constant. (And if the same ink is derived in more than one place — the box `color` and a
label helper — bind both to one computed source, or the fix ships half-applied.)

Note: the host's `visibility` (background-overlay opacity) is **not** forwarded to the
iframe — the host has already composited the overlay into the `backgroundImage` you
receive.

### 2a. Semantic state colours — apply to the indicator, NOT the chart

A canvas has two distinct colour jobs. Confusing them is the #1 mistake.

**Job 1 — chart / visualization layer.** Bar fills, ring segments, plot dots, area
shading. These convey magnitude/proportion. They pull from
`xprops.presentationColorPalette` (and its lighter sibling) so the chart feels native
to the deck's brand. Charts NEVER carry state meaning directly — that's a separate job.

**Job 2 — state indicator layer.** The ✓ / ✗ icon, status badge, border accent, label
chip that *announces* correctness. This is where right/wrong, success/error,
warning/info actually lives. It pulls from **semantic tokens that the plugin has
bundled into its own build**:

| Token | Where it goes |
|---|---|
| `colorSuccess` | ✓ icon, correct-answer badge, validation-passed border |
| `colorError` | ✗ icon, incorrect-answer badge, destructive-action chip |
| `colorWarning` | caution icon, "are you sure?" prompt |
| `colorInfo` | informational badge |

**The mechanism (why bundled, not host-supplied).**
- AntD's `theme.useToken()` is a React-AntD-v5 API not available in this Vue stack.
- CSS variables like `--aha-colorSuccess` exist only in the host page; they **don't
  cross the iframe boundary**.
- The host doesn't forward semantic colours via xprops either.

So the plugin must bundle its own — typically by importing from the AhaSlides
design-system package into its build, or by defining a small set of plugin-local
constants that match the design-system's success / error / warning / info values.

**Use the actual FUNCTION token, not a lookalike brand accent.** `colorSuccess`
(#16C49A), `colorError` (#F5222D), `colorWarning`, `colorInfo` are the
design-system's semantic *functions*. A bright brand accent that merely *looks*
the part — Bright Teal `#20E8B5` used as a "correct" tick because it reads green
— is wrong even though it's green: it isn't the success function (so it drifts
per brand), and a light accent like that usually fails contrast (Bright Teal on
white is ~1.58:1). Bind the mark to the function token, then verify it actually
clears the contrast floor on the surface it sits on (see §3).

**The common mistake — applying state colours to the chart.** Painting the "correct"
bar fill green-success (or hard-coded `#22C55E`) feels intuitive but is wrong on two
counts: (1) the bar fights the deck's brand on any non-green palette, and (2) the
state is conveyed *through* the chart instead of by a dedicated indicator. Move the
green to a ✓ icon next to the bar; leave the bar in palette colours.

**Job 2 ≠ "any colour-bearing emphasis".** Poll-leader, leaderboard-winner, featured
item — these are accents *without* a right/wrong axis. They stay in palette colours
all the way through (bar AND any decorating icon). Don't tint the poll-leader bar
with `colorSuccess`; that falsely implies "correct".

Colour alone still isn't enough (see §3). The indicator's colour must be paired with a
non-colour cue — the icon shape (✓/✗, trophy), a label, or position — so a
colour-blind viewer or someone at the back of the room still gets the signal.

### 2b. Visual restraint — three tells that read as "AI-generated"

Three specific choices make a slide look machine-generated rather than designed.
Avoid all three:

- **No pastel wash under same-hue ink.** Don't pair a pastel/tinted background
  with icon + text in the *same* hue (even a darker shade of it). A card at
  `color-mix(in srgb, <accent> 14%, white)` with `<accent>`-coloured text reads
  monotone, low-contrast, and distinctly "AI". Instead let the surface be
  deck-owned (transparent, ink from `xprops.slide.textColour` so it tracks and
  contrasts), or pair a tinted surface with genuinely high-contrast ink and a
  clear type hierarchy — not one hue at two brightnesses.
- **Corner radius tops out at 8px.** The design-system `borderRadius` default is
  8 (`rounded-lg`). Content containers — cards, answer boxes, option tiles,
  panels, buttons — use **≤ 8px**; `rounded-2xl` / `rounded-3xl` /
  `border-radius: 20px` reads toy-like and over-rounded. Intentionally circular
  elements — pills, chips, badges, avatars, dots, and progress-bar tracks/fills
  — stay fully rounded (`999px` / `rounded-full`); the cap is for rectangular
  containers, not those.
- **No extra-bold weight.** Display text uses weight **400 or 600 only**. Heavy
  weights (`font-extrabold` / 800, `font-bold` / 700, `font-black` / 900) read
  heavy and "AI" — a count number or heading at 800 is the classic tell. Use 400
  for body and 600 (`font-semibold`) for emphasis.

## 3. Accessibility — readable from across the room (WCAG)

AhaSlides follows **WCAG**. A slide is read from a distance — often far across a hall, on a
glare-washed projector — so something legible on your laptop can be unreadable at the back.
Design for the worst seat. The **same bar applies to the editor canvas preview**, since the
presenter designs there at small scale.

- **Contrast:** meet **WCAG AA as the floor — 4.5:1 for text, 3:1 for large text and
  meaningful shapes** — and go higher when you can. Check against the *real* background:
  `baseColour` blended with `backgroundImage` (the host has already composited any overlay
  into the URL you receive). Busy photo backgrounds are the hard case — add a scrim behind
  text if needed.
  - **A slide-painted surface re-anchors the check (chips, cards, badges, scrims).** When
    you paint your own surface behind content, contrast is measured against **that
    composited surface**, not the deck. Two traps: (1) a **translucent tint**
    (`color-mix(currentColor 26%, transparent)`, `bg-current` + `opacity-*`) is **not** a
    contrast guarantee — only an opaque surface is; and (2) any **fixed-colour mark** on that
    surface — a semantic `✓`/`✗` token, a `presentationColorPalette` accent, a border in
    either — must clear the floor **on both a light AND a dark deck**. A teal ✓ on a light
    tint, or a palette-accent border on a dark deck, is the classic miss. Text that derives
    from `currentColor` over a `currentColor` tint is self-consistent; fixed-colour marks are
    not — verify them.
  - **A light semantic token on a light surface still fails.** `colorSuccess`
    `#16C49A` on white is only ~2.23:1 — below the 3:1 mark floor. A
    *semantically* correct token is not automatically *legible*: don't paint a
    light success/error glyph straight onto a light surface. Put it on a bounded
    fill (a `colorSuccess` circle with a white ✓) or use it on a dark surface.
- **Readability & the canvas type-scale.** The host renders the slide on a **fixed
  1280×720 logical stage and `transform: scale()`s the whole thing as one unit** to fit any
  screen (the presenter app sizes `#slide-container` to 1280×720 and scales it). So a
  **fixed logical px** size scales proportionally with everything else on every screen — a
  phone embed and a projector scale identically, and proportion is preserved for free. Size
  **every meaningful text with a fixed logical px** — use the Tailwind preset roles (rem =
  fixed logical px), never a `vh`/`vw`/`clamp()` font-size and never below the 16px floor:

  | role | class | px @720 |
  |---|---|---|
  | caption (floor) | `text-base` | 16 |
  | body (default) | `text-lg` | 18 |
  | subhead | `text-2xl` | 24 |
  | title | `text-5xl` | 48 (≈ native `SlideTitle` 47px) |
  | hero | `text-7xl` | 72 |

  - **Never a `vh`/`vw` font-size on the canvas.** `vh` resolves against the *framed iframe
    viewport* (~498px, not the 720 stage), so `text-[2.3vh]` renders **~11px**, and its
    basis wobbles by framing. The stage transform already does the scaling — `vh` is
    redundant *and* wrong.
  - **No `clamp()` px floor either.** A px floor pins an absolute size while siblings scale,
    which **breaks proportion** — that is a responsive-web behaviour for a *reflowing*
    surface (the **audience** phone view), not this transform-scaled canvas. On the canvas a
    plain fixed px needs no floor.
  - **Never `text-xs`/`text-sm`** (12/14px, below the floor) and no arbitrary `text-[…]`
    font-size — pick a role. (`em` is fine: a relative multiplier of a role-sized parent.)
- **Text is for reading, not decorating.** A real, legible word must render as normal
  running text — never stack its letters vertically, rotate it, or stretch its
  letter-spacing so far the word's silhouette breaks. Those treatments trade legibility
  for a decorative flourish, and decoration is exactly what fails at distance: something
  that reads as a little logo up close is unreadable from the back of the room. ❌ concrete
  example: a True/False divider that renders the word "OR" as two letters stacked
  vertically — "O" over "R" — in a tiny boxed pill between the answer boxes. It looks
  designed on a laptop and is illegible across a hall. If a divider needs to be compact,
  keep the word horizontal and shrink it to a smaller in-scale role (never below the 16px
  floor) or let it wrap — never stack or rotate the letters. Legibility from across the
  room beats decoration, every time.
- **Don't rely on colour alone** (audience is colour-blind *and* far away): pair colour with
  an icon, label, or shape. **Prefer an icon** as the non-colour cue — a trophy 🏆 or a
  ✓/✗ communicates "leading" / "correct" / "incorrect" more cleanly than a chip that
  spells the word out. Words add visual clutter and an i18n surface; icons stay compact
  and language-neutral. Use words only when the meaning isn't obvious from any glyph
  (e.g. "Closed", "Beta"), and almost never stack icon + word together — that's
  belt-and-braces busy.
- **Chart geometry must stay honest.** When you add a decorative indicator (leader chip,
  status badge, trophy icon) to a chart row, it must NOT change the chart's spatial
  accuracy. Reserve a fixed-width slot for the decoration on **every** row (empty for
  non-decorated rows) — or render the decoration as a positioned overlay. If only one
  row carries the chip and the others don't, that row's track is narrower than the rest
  and the chart visually lies: a 55% bar shows up as ~48% because the chip ate 7%.
- **Borders are ornament — never derive them directly from `textColour`.** Design-system
  convention: track borders, dividers, hairlines, card edges all sit at low intensity
  (around 10–15% of text intensity, e.g. AntD's `#d9d9d9`-equivalent). `textColour` is
  the intensity of body type — using it directly as a border source paints a chart edge
  as boldly as paragraph text, which looks heavy and un-system-like regardless of how
  many pixels wide it is. For a subtle theme-aware hairline, use
  `color-mix(in srgb, currentColor 10%, transparent)` — derives from inherited
  `textColour` at 10% intensity, stays subtle on both light and dark themes.

  If a contrast check is marginal, fix it at the bar or the scrim — not by reaching for
  a darker border colour. The right palette shade depends on the composited background:
  on a light theme, `xprops.presentationColorPalette[i]` (saturated) usually contrasts
  best; on a dark theme, `xprops.presentationLighterColorPalette[i]` is often the one
  that pops while saturated shades blend in. Pick the shade that actually clears the
  contrast floor for the current background — don't lock yourself to one source by
  default. A well-chosen bar next to a subtle 1px hairline reads cleaner than a 3px slab
  trying to do the contrast work for it.
- **Motion:** don't depend on fast or subtle motion to convey meaning.

## 4. Framed vs full-canvas — pick your container in the plugin manifest

The host can wrap your slide in shared chrome so it matches built-in types, or hand you
the whole stage. The choice lives in the **plugin manifest** (`plugin-manifest.json`)
under `setting.enableFullScreen`:

- **Framed** (`setting.enableFullScreen: false`): the host renders the **title**,
  **description**, and **question image**; your iframe fills the rest. Choose this when
  the slide is "a question + an answer area" and should look like every other AhaSlides
  slide. Your canvas must NOT render its own title in this mode — it would duplicate the
  host's.
- **Full-canvas** (`setting.enableFullScreen: true`): the host hides its chrome and
  exposes `xprops.fullCanvas = true`. Choose this for bespoke layouts — but then **you**
  render the title/header yourself, still honouring the theme and the accessibility bar.

Make the choice explicit in the manifest — the absent-by-default setting reads to a
future reviewer as "we forgot", not "we chose".

## 5. The presenter control bar (bottom-center actions)

Slide-specific actions — e.g. Idea board's **Previous**, **Next: vote**, **Summarise** —
don't live inside your canvas. They render in the presenter control bar
(`PresenterControlBarNew.vue`, internal "NCB"), centre region `ncb-center`, via
`NcbPluginActions.vue`. Your slide declares the actions in the **plugin manifest**; the
host paints each one with the design-system wrapper component `<aha-antd-button>` — you
don't pick the button component, the size, or the styling. **Declare the action data, the
host does the rest.**

The NCB also renders on the projector during presenting — it sits just outside the
iframe. So the reason for declaring (rather than rendering in-canvas) is **consistency,
not audience visibility**: the host's wrapper handles theming, keyboard shortcut chips,
and sound effects uniformly across every slide; re-implementing buttons inside the
iframe means your slide would drift from that.

Visual levers per declared action:

| Lever | Type | Use it for |
|---|---|---|
| `id` | `string` | Required, used for action callbacks. |
| `label` | `string` (optional) | Short verb-first text ("Summarise"). Omit for an **icon-only** square button (compact actions like Previous). **NOT a function** — host renders `{{ action.label }}` raw. |
| `icon` (+ `iconViewBox`) | `string` (optional) | A design-system glyph; set `iconViewBox` for non-square icons so they don't ride high. |
| `variant` | `'primary' \| 'secondary'` (optional, default `'secondary'`) | At most one primary = the obvious next step; the rest secondary (or omitted). |
| `disabled` / `loading` | `boolean` (optional) | Reflect state. **NOT a function** — see footgun. |
| `shortcut` | `'Enter' \| 'Shift+Enter'` (optional) | Keyboard hint chip; host renders a glyph for these. |

**`secondary` is a solid WHITE button, never a ghost/outline.** In the AhaSlides design
system `secondary` renders as a solid white-background button (white fill, subtle border,
dark label) — *not* a transparent "ghost"/outline button that lets the slide background
show through. This is the correct resting style for almost every slide action (the poll's
**Show correct answer**, **Group by themes** on Word Cloud, Idea board's **Hide votes** are
the reference — each a solid white secondary). You don't paint it yourself: declare
`variant: 'secondary'` (or omit it — secondary is the default) and the host renders the
white `<aha-antd-button>`. Two ways this drifts off-system, both wrong: styling an action
with a transparent/ghost intent, or (worse) hand-rendering a button **inside** the canvas
with `background: transparent` / border-only CSS — which also breaks §5's "declare, don't
render" rule and loses the label-contrast guarantee the white fill gives over any theme
colour or background image.

**Footgun — `disabled` / `loading` are NOT function-typed.** The host coerces them with
`Boolean(action.disabled)`. A function literal is always truthy in JavaScript, so
`disabled: () => votes === 0` makes the button **permanently disabled**. Always pass a
reactive boolean value, not a function.

**Feature-flag caveat.** Plugin-declared action buttons are gated behind
`canUsePluginActionButtons` (ticket AHA-43142-plugin-buttons). When the flag is off, the
host does not expose `setActionButtons` / `onActionInvoke`, and the slide must keep its
own in-canvas buttons as a fallback. The default position is "declare in the manifest"
— deviate only when you've confirmed the flag state. **When you DO render that fallback,
build it from the component library, not by hand** (next rule).

**Reuse the library component — never hand-roll a control.** Any control you render
yourself — the in-canvas action fallback above, or any button / input / select / toggle /
tooltip / modal on the canvas — must come from the project's component **library** (this
app ships **Ant Design Vue**, themed via its `ConfigProvider` design tokens — see the
`aha-design:aha-design-antd` / `slide-type-styling` guidance), NOT a bespoke `<button>` /
`<div>` / `<input>` with hand-written fill/border/radius CSS. A hand-rolled control drifts
off the design system the instant a token changes and loses the shared states
(hover/focus/disabled, keyboard, a11y roles). The host's native buttons (Idea board, Short
Answer, Poll — the non-marketplace ones) are the `<aha-antd-button>` secondary; your iframe
can't call that host component, so reproduce the look with your **own** Ant `<Button>`
under `ConfigProvider`, never a raw element. Place the fallback where the host bar would
be — **bottom-centre** — so it reads as a slide action, not page content.

Order the actions in the flow the presenter moves through, and don't rebuild this bar
inside your canvas — using it keeps theming, spacing, sound and keyboard behaviour
consistent across every slide.

## 6. Keyboard-shortcut affordances — for the controls you render in-canvas

§5's actions are painted by the host, so their shortcut chips, focus order, and
sound come for free. But a slide that renders its **own** interactive controls —
a bespoke overlay the NCB doesn't cover, e.g. an animated game's play / pause, a
reveal toggle, a music-mute button, a settings popover — owns those affordances
itself. Four rules make an in-canvas control cluster usable from the keyboard and
self-documenting; skipping any one is a defect.

**a. A modal / overlay / popover traps focus.** When it opens, move keyboard
focus to an element **inside** it, keep `Tab` / `Shift+Tab` cycling **within** it
(a focus trap — the presenter can't tab out to the page behind), and **return
focus to the trigger** when it closes. An overlay that opens but leaves focus on
the page behind is invisible to keyboard and screen-reader users.

❌ **BAD** — opens, but focus never enters the dialog and Tab walks out behind it

```vue
<script setup>
const open = ref(false)
</script>
<template>
  <button @click="open = true">Settings</button>
  <div v-if="open" role="dialog">
    <button @click="open = false">Close</button>
  </div>
</template>
```

✅ **GOOD** — focus moves in on open, is trapped, and returns to the trigger on close

```vue
<script setup>
const open = ref(false)
const dialog = ref(null)
let trigger = null

async function openDialog(e) {
  trigger = e.currentTarget                    // remember what to restore focus to
  open.value = true
  await nextTick()
  dialog.value.querySelector('button, [href], input, [tabindex]')?.focus()
}
function closeDialog() {
  open.value = false
  trigger?.focus()                             // return focus to the trigger
}
function onKeydown(e) {                         // keep Tab / Shift+Tab inside
  if (e.key !== 'Tab') return
  const f = dialog.value.querySelectorAll(
    'button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])')
  const first = f[0], last = f[f.length - 1]
  if (e.shiftKey && document.activeElement === first) { last.focus(); e.preventDefault() }
  else if (!e.shiftKey && document.activeElement === last) { first.focus(); e.preventDefault() }
}
</script>
<template>
  <button @click="openDialog">Settings</button>
  <div v-if="open" ref="dialog" role="dialog" aria-modal="true" @keydown="onKeydown">
    <button @click="closeDialog">Close</button>
  </div>
</template>
```

**b. Every actionable button carries a shortcut indicator; a single character is
a SQUARE.** Show the key that triggers the control in a small `<kbd>` chip. A
**one-character** key renders as a **square** — equal width and height, small
rounded corners — not a wide pill. A pill reads as a tag/label; a square reads as
a key.

❌ **BAD** — one-character key drawn as a wide pill

```vue
<button>Play <kbd style="border-radius: 9999px; padding: 2px 12px">P</kbd></button>
```

✅ **GOOD** — one-character key drawn as a square

```vue
<button>Play <kbd class="key">P</kbd></button>

<style scoped>
.key {                                    /* a single character is a SQUARE, not a pill */
  display: inline-grid; place-items: center;
  min-width: 1.5rem; height: 1.5rem;      /* equal box; multi-char keys grow wider */
  padding: 0 0.25rem; border-radius: 4px; /* small corners, never 9999px */
}
</style>
```

**c. A labelled button shows its shortcut inline — never a "Press X" tooltip.**
If the button has visible text, the shortcut chip sits **inline next to the
label**, always visible. Hiding it in a hover-only `title="Press X"` tooltip
makes the presenter hunt for it and hides it from touch entirely.

❌ **BAD** — shortcut buried in a hover tooltip

```vue
<button title="Press P to play">Play</button>
```

✅ **GOOD** — shortcut chip inline next to the label

```vue
<button>Play <kbd class="key">P</kbd></button>
```

**d. An icon-only button carries a name + shortcut tooltip.** An icon button has
no room for an inline chip, so its **tooltip** (and `aria-label`) is the button's
**name plus the shortcut in parentheses** — e.g. `Mute music (M)`. A bare icon
with no tooltip, or a tooltip that drops the name or the `(shortcut)`, leaves the
control undiscoverable.

❌ **BAD** — no name, shortcut-only

```vue
<button aria-label="Mute" title="Press M"><IconMute /></button>
```

✅ **GOOD** — name plus the shortcut in parentheses

```vue
<button aria-label="Mute music (M)" title="Mute music (M)"><IconMute /></button>
```

(The buttons above still come from the component library per §5 — the snippets
show only the shortcut affordance, not the button element.)

## 7. Language

Display in the **presentation's language**, not a fixed one. The plugin runs in its own
iframe with **its own i18n instance** — it does NOT inherit the host's locale state. The
plugin must initialise its locale from `xprops.presentation.language` (or
`xprops.currentUser.presenterLanguage`) at startup, and update it when the host emits a
change. No hard-coded English in the UI; use `Intl.NumberFormat(locale)` for
percentages and counts, not `.toFixed()` with an assumed `.`-as-decimal-separator.

## 8. Pre-ship design checklist

- [ ] Looks right on light, dark, and image-background themes
- [ ] WCAG AA contrast as the floor, checked against the real composited background
- [ ] Readable from the back of a large room — verified at presenting scale, not just the small editor preview
- [ ] Every meaningful text is a fixed-px type-scale role (`text-base` 16 / `text-lg` 18 / `text-2xl` 24 / `text-5xl` 48 / `text-7xl` 72) — no `vh`/`vw`/`clamp()` font-size, no `text-xs`/`text-sm`, no arbitrary `text-[…]` size
- [ ] Text reads as normal running text — no word's letters stacked vertically, rotated, or over-tracked into a decorative mark
- [ ] Meaning never carried by colour alone
- [ ] Colours/fonts read from `xprops.slide.*` / `xprops.presentation.*` / `xprops.presentationColorPalette` — nothing hard-coded
- [ ] Semantic state colours imported from a bundled design-system package, not from the deck palette
- [ ] Semantic ✓/✗/status marks use the function token (`colorSuccess` / `colorError` / …), not a lookalike brand accent — and each clears the contrast floor on the surface it sits on (a light token on a light surface needs a bounded fill)
- [ ] No pastel background paired with same-hue icon/text (monotone "AI" look); surfaces are deck-owned or genuinely high-contrast
- [ ] Corner radius ≤ 8px on content containers (pills / bars / avatars may stay fully rounded); display-text weight is 400 or 600 only (no 700 / 800 / 900)
- [ ] Responsive to the scaled 16:9 stage; nothing clipped
- [ ] `setting.enableFullScreen` declared explicitly in the plugin manifest
- [ ] Actions declared in the manifest with boolean `disabled` / `loading`, one primary; in-canvas buttons only as a fallback when the feature flag is off
- [ ] Every action reads as a solid button (one accent primary, the rest solid white secondaries) — no transparent/ghost/outline action buttons
- [ ] Controls the canvas renders itself advertise their keyboard shortcut — an opening overlay traps focus and returns it to the trigger on close; a labelled button shows its shortcut inline (a single-character chip is a square, not a pill); an icon-only button's tooltip is its name plus the shortcut in parentheses (`Mute music (M)`)
- [ ] Plugin's i18n locale initialised from `xprops.presentation.language` (and updated on change)
- [ ] Right panel handed off to `aha-design-settings`

## 9. Self-check before claiming done

After implementing, run the verdict pass via **`aha-design:aha-design-canvas-judge`** — it
emits a binary PASS/FAIL across the same contracts above (theme tokens, semantic state
colours, NCB control bar, AntD button size, WCAG, non-colour cues, framed-vs-full-canvas,
i18n, keyboard-shortcut affordances) plus a structured `Where / Evidence / Fix` block for
each failure. Fix every FAIL,
re-judge, and only declare the work done when the verdict reads `OK TO SHIP`.

The canonical correct pattern this skill recommends lives as a single shared fixture,
`aha-design-canvas-judge/evals/fixtures/good-fill-in-the-blanks/` — the same file the judge
uses as its `good-control`. Diff a new canvas against it. Because both skills point at one
fixture, they cannot silently drift: **every FAIL the judge can raise must be teachable from
a rule above** (`Cn` ⇄ a rule in §2–§7 ⇄ a §8 checklist item). If you change a criterion in
one skill, update the other so that mapping stays 1:1 — the judge-eval harness
(`plugins/aha-design/evals-harness/`) is what catches the drift.
