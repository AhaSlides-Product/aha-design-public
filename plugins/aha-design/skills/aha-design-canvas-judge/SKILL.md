---
name: aha-design-canvas-judge
description: "Authoritative judge / verdict-giver for AhaSlides slide-type canvas implementations — the evaluation counterpart to aha-design-canvas (the build skill). Use whenever an agent reviews, audits, scores, critiques, or self-checks slide canvas code: a code review request, a PR diff touching a slide type's iframe app, a post-build self-verification step, or an explicit 'is this slide correct?' question. Emits a binary PASS / FAIL verdict per criterion (no partial credit) across 10 criteria — theme tokens read from xprops (not hard-coded), semantic state colours bundled by the plugin (not derived from the deck's presentation palette, and using the actual function token rather than a lookalike brand accent), action buttons declared via the plugin manifest (not rendered in the iframe), the declared action shape is correct (no function values for disabled/loading — host Boolean-coerces them), text legible against the real composited background (WCAG AA contrast plus a readable size — not tiny viewport-collapsed type), non-colour cue paired with every colour-bearing signal, framed vs full-canvas chosen intentionally via the manifest's setting, the plugin initialises its i18n locale from the presentation.language xprop, and visual restraint (no pastel wash under same-tone ink, corner radius capped at 8px, no extra-bold weight), and keyboard-shortcut affordances for controls the canvas renders itself (an opening overlay traps focus and returns it on close, a labelled button shows its shortcut inline as a square single-character chip rather than a 'Press X' tooltip, and an icon-only button carries a name-plus-shortcut tooltip). Trigger on phrases like 'review this slide canvas', 'audit my plugin slide', 'check WCAG on this slide', 'judge my canvas', 'is this slide correct', 'PR review for slide type', 'self-check after building a slide', 'score my slide canvas'."
---

# Judging a slide type's canvas

This skill is the **judgment counterpart** to `aha-design-canvas` (which guides building
the same surface). Reach for it when reviewing finished canvas code — a PR diff, a code
review request, or a self-check at the end of a build. Don't reach for it while building
— use `aha-design-canvas` for that.

> **Cross-plugin reference:** when you also need to verify settings/icons/overlays on the
> slide, hand those off to `aha-design:aha-design-settings`, `aha-design:aha-design-icons`,
> `aha-design:aha-design-overlays`. This skill is **canvas-only** (the visual surface +
> presenter control bar).

---

## How the host talks to a slide plugin

A slide plugin runs in its **own iframe** (separate document, separate bundle). It reads
the host's state via Zoid **xprops** — an object the host injects on `window.xprops`.
Because the iframe is a separate document, **CSS custom properties from the host page
do not cross the boundary**, and the host's AntD theme object isn't directly reachable.
Anything design-system-shaped that the plugin needs (e.g. semantic state colours) must
live in the plugin's own bundle.

The xprops the host actually exposes (verified against `slidePluginIframeMixin.js` /
`slidePluginZoid.js`):

| Where on `window.xprops` | What it gives |
|---|---|
| `xprops.slide.baseColour` | Slide background colour |
| `xprops.slide.textColour` | Primary text colour |
| `xprops.slide.backgroundImage` | Optional background image **URL string** (largest variant) |
| `xprops.presentation.fontFamily` | Deck's font |
| `xprops.presentation.language` | Deck's locale code |
| `xprops.presentationColorPalette` | Accent palette — array of CSS colour strings, padded to 30 |
| `xprops.presentationLighterColorPalette` | Lighter-shade accent palette — same shape |
| `xprops.currentUser.presenterLanguage` | Presenter's preferred language |

Fallback when unset: `baseColour #ffffff`, `textColour #313131`.

**Not exposed to the iframe** (don't expect them):
- `visibility` (the background-overlay opacity — host-only model state)
- Any AntD semantic token, any host CSS variable

---

## How to use

1. Identify the canvas code — the iframe app for a slide type, usually a Vue/React
   component tree that renders into the 16:9 stage, plus the plugin manifest the slide
   declares for the host.
2. For each of the 10 criteria below, search for evidence in the code, decide **PASS** or
   **FAIL**, capture a 1-line piece of evidence (file:line if possible).
3. Emit the verdict report using the exact template at the bottom — same shape every
   time so reviewers can scan it.

**Why binary, no partial credit.** A shipped slide either honours each contract or it
doesn't — "almost right" is just a polite FAIL. Half-credit invites endless argument
about whether something is 60% or 70% there. Binary keeps the judge consistent across
reviewers and across runs.

**Burden of proof is on PASS.** If you can't verify from the code, mark FAIL and ask in
the report's notes section. Pretending unclear code passes is how things slip to prod.

---

## The 10 criteria

### C1. No hard-coded colours or fonts → PASS / FAIL

**Rule.** All colour and font values come from xprops:
- `xprops.slide.baseColour`, `xprops.slide.textColour`, `xprops.slide.backgroundImage`
- `xprops.presentation.fontFamily`
- `xprops.presentationColorPalette[n]`, `xprops.presentationLighterColorPalette[n]`

No hex literals, no Tailwind colour utilities (`bg-red-500`), no
`font-family: 'Inter'`.

**Allowed:** `currentColor` / `inherit`. The host-side fallback constants
(`baseColour #ffffff`, `textColour #313131`) appearing **only** as a fallback
(e.g. `xprops.slide.baseColour ?? '#ffffff'`) — not as the primary paint path.

✅ **GOOD example**

```vue
<div
  :style="{
    background: xprops.slide.baseColour,
    color: xprops.slide.textColour,
    fontFamily: xprops.presentation.fontFamily,
  }"
>
  {{ t('quiz.resultsTitle') }}
</div>
```

❌ **BAD example**

```css
.quiz-canvas {
  background-image: url('/assets/quiz-bg.jpg');
  color: #FFFFFF;
  font-family: 'Inter', sans-serif;
}
.title {
  color: #313131;
  font-size: 28px;
}
```

**Common failure modes (any one → FAIL):**
- Tailwind colour utilities anywhere in the canvas tree (`bg-blue-500`, `text-gray-900`)
- Inline `style="color: #..."` literals
- Hex constants in a `colors.ts` / SCSS file used by the canvas instead of xprops
- Conditional override (`isDark ? '#fff' : '#000'`) that bypasses `xprops.slide.textColour`
- Custom `font-family: 'Inter'` instead of `xprops.presentation.fontFamily`

---

### C2. Semantic state colours applied to the indicator, NOT the chart → PASS / FAIL

**Two different colour jobs on a canvas — keep them separated:**

1. **Chart / visualization layer** (bar fills, ring segments, area shading, plot dots).
   These pull from `xprops.presentationColorPalette` so the chart feels native to the
   deck's brand. They carry magnitude/proportion, NOT meaning.
2. **State indicator layer** (the ✓ / ✗ icon, status badge, border accent, label chip
   that announces correctness). This carries meaning. It pulls from semantic tokens
   that the plugin has bundled into its own build.

**Rule.** Apply semantic state colours (success-green, error-red, warning, info) to the
**indicator** — not to the chart. Painting the bar itself in `colorSuccess` /
`colorError` (or hard-coded `#22C55E` / `#EF4444`) is the violation, even when the
intent is correct, because:

- The bar fights the deck's brand colour identity on any non-green/non-red palette.
- The state is conveyed by colour layered onto a visualization, not by a dedicated
  signal — collapses the "non-colour cue" criterion (C6) into the chart.

Conversely, **never** derive the state indicator from `xprops.presentationColorPalette`
— that may not contain a usable red or green, so "correct" silently shifts to whatever
shade is at `palette[0]` on a given deck and loses its meaning.

**Nor a lookalike brand accent.** The mark must be the actual semantic *function*
token (`colorSuccess` #16C49A / `colorError` #F5222D / `colorWarning` /
`colorInfo`), not a bright brand accent that merely *looks* the part — e.g. Bright
Teal `#20E8B5` used as a "correct" tick because it reads green. A lookalike accent
isn't the success function (so its meaning drifts per brand) and is usually too
light to clear the contrast floor (Bright Teal on white is ~1.58:1 — see C5).

**The mechanism (why this isn't AntD or CSS-vars).** AntD's `theme.useToken().colorSuccess`
is a React+AntD-v5 API not available in this Vue stack, and CSS variables from the host
page do not cross the iframe boundary — `--aha-colorSuccess` etc. are not reachable inside
the plugin. The host doesn't forward semantic colours via xprops either.

So the plugin must **bundle its own semantic state tokens** — typically by importing from
the AhaSlides design-system package into its own build (consult the design-system team
for the actual package), or by defining a small set of plugin-local constants that match
the design-system's success / error / warning / info values:

| Token | Where it goes |
|---|---|
| `colorSuccess` | ✓ icon, correct-answer badge, validation-passed border |
| `colorError` | ✗ icon, incorrect-answer badge, destructive-action chip |
| `colorWarning` | caution icon, "are you sure?" prompt |
| `colorInfo` | informational badge |

**Emphasis (no right/wrong axis) is NOT state.** The most-voted option in a poll, the
leading entry on a leaderboard, the featured item in a list — these are accents, not
state. Palette colours all the way through (bar fill AND any decorating icon). Don't
paint poll-leader bars with `colorSuccess`; that falsely implies "correct".

✅ **GOOD example**

```vue
<script setup lang="ts">
import { semanticTokens } from '@your-design-system/tokens';
const xprops = window.xprops;
</script>

<template>
  <div class="quiz-row" v-for="option in options" :key="option.id">
    <!-- State indicator: semantic colour from bundled tokens -->
    <Icon
      :name="option.isCorrect ? 'check-circle' : 'x-circle'"
      :style="{ color: option.isCorrect
        ? semanticTokens.colorSuccess
        : semanticTokens.colorError }"
      :aria-label="option.isCorrect ? t('quiz.correct') : t('quiz.incorrect')"
    />

    <!-- Bar (chart layer): always from the deck's palette -->
    <div class="bar-track">
      <div
        class="bar-fill"
        :style="{
          width: `${option.votePercent}%`,
          background: xprops.presentationColorPalette[option.colorIndex],
        }"
      />
    </div>

    <span class="row-meta">{{ option.label }} · {{ formatPercent(option.votePercent) }}</span>
  </div>
</template>
```

❌ **BAD example**

```js
// hex applied to the chart — bar fights the deck brand on every non-green/non-red deck
background: option.isCorrect ? '#22C55E' : '#EF4444',

// bundled semantic token applied to the BAR — still wrong, right source on wrong layer
background: option.isCorrect
  ? semanticTokens.colorSuccess
  : semanticTokens.colorError,

// state derived from the deck's palette — meaning shifts per deck
background: option.isCorrect
  ? xprops.presentationColorPalette[0]
  : xprops.presentationColorPalette[1],

// assuming a host CSS variable inside the iframe — won't resolve
background: 'var(--aha-colorSuccess)',  // doesn't cross iframe boundary
```

**Common failure modes:**
- Semantic green/red painted directly onto the bar fill (regardless of source — hex,
  CSS var, bundled token, or AntD token) — the violation is the *layer*, not the value
- `xprops.presentationColorPalette[0]` used for the correct-answer indicator or bar
- `var(--aha-colorSuccess)` / `var(--aha-colorError)` referenced from canvas CSS
  (these vars don't exist inside the iframe — they're host-only)
- `theme.useToken()` invocation (React AntD v5 API — not present in this stack)
- A custom token like `theme.colors.green` that isn't actually imported from the
  design-system package (just a local opinion)
- A lookalike brand accent (a bright teal/green that isn't the bundled
  `colorSuccess`) used as the correct/success mark — must be the function token
- Poll-leader bar tinted with `colorSuccess` — emphasis is not state, palette is correct

---

### C3. Action buttons declared, NOT rendered inside the canvas → PASS / FAIL

**Rule.** Previous / Next / Summarise / Reset and any other slide-specific actions are
**declared** via the plugin manifest's `actions` array and **painted by the host** in
the presenter control bar (`PresenterControlBarNew.vue`, region `ncb-center` portal,
rendered through `NcbPluginActions.vue`). The canvas iframe never contains the action
buttons themselves.

Note: the "presenter control bar" name is a bit misleading — the NCB **also renders on
the projector during presenting**, just outside the iframe. The issue with in-canvas
buttons isn't audience visibility; it's that **the plugin would re-implement the button
styling**, drifting from the design-system and losing the consistent theming, keyboard
shortcuts, and sound effects the host bakes into the wrapper component.

This is the criterion the build skill emphasises most and the one models most often get
wrong — be strict.

**Feature-flag caveat (don't get caught out).** The plugin-declared action-button feature
is gated behind `canUsePluginActionButtons` (ticket AHA-43142-plugin-buttons). When the
flag is off, the host does not expose `setActionButtons` / `onActionInvoke` to the plugin,
and a sensible fallback IS in-canvas buttons. If the project is verifiably running with
the flag off, in-canvas buttons are an acceptable fallback (note this in the report's
`Notes / unverifiable` section). When the flag is on, in-canvas buttons are a FAIL.

✅ **GOOD example**

```json
// plugin-manifest.json — host picks this up and paints actions in the NCB
{
  "name": "quiz-result",
  "setting": {
    "enableFullScreen": false
  },
  "actions": [
    { "id": "prev",      "icon": "arrow-left", "variant": "secondary" },
    { "id": "next",      "label": "common.next",      "variant": "primary",   "shortcut": "Enter" },
    { "id": "summarise", "label": "quiz.summarise",   "variant": "secondary" }
  ]
}
// QuizResultCanvas.vue contains NO action <button> elements.
```

❌ **BAD example**

```vue
<!-- src/QuizResultCanvas.vue — sticky footer renders buttons inside the iframe -->
<template>
  <div class="quiz-canvas">
    <!-- ...result bars... -->

    <footer class="action-bar">
      <button class="btn btn--secondary" @click="prev">← Previous</button>
      <button class="btn btn--primary"   @click="next">Next</button>
      <button class="btn btn--primary"   @click="summarise">Summarise</button>
    </footer>
  </div>
</template>
```

**Common failure modes (each one → FAIL when the flag is on):**
- Sticky `<footer>` inside the canvas with custom buttons
- Floating toolbar / FAB in any corner of the canvas
- Reimplementing primary/secondary button styling inside the slide
- "It's just one button so I'll put it on the canvas" — still FAIL
- A "Submit" or "Reset" button hidden inside the canvas because the dev didn't know
  about the NCB

---

### C4. Action shape correct, with sensible variant hierarchy → PASS / FAIL

**Rule.** Slide plugins do NOT pick a button size — the host renders every declared
action via the `<aha-antd-button>` design-system wrapper at whatever size the host
configures. The plugin's job is to declare the right **data**.

A declared action's accepted shape (verified against `NcbPluginActions.vue`):

| Field | Type | Notes |
|---|---|---|
| `id` | `string` | Required, used for action callbacks |
| `label` | `string` (optional) | i18n key or literal; **NOT** a function |
| `icon` | `string` (optional) | Design-system glyph name |
| `iconViewBox` | `string` (optional) | For non-square icons |
| `variant` | `'primary' \| 'secondary'` (optional, default `'secondary'`) | `secondary` = solid **white-background** button (the default resting style for slide actions); `primary` = filled accent. Never a transparent/ghost look. |
| `shortcut` | `'Enter' \| 'Shift+Enter'` (optional) | Host renders a glyph chip for these |
| `disabled` | `boolean` (optional) | **NOT** a function — see footgun below |
| `loading` | `boolean` (optional) | **NOT** a function — same footgun |

**Footgun — `disabled` / `loading` are NOT function-typed.** The host coerces them
with `Boolean(action.disabled)`. A function literal is truthy in JavaScript, so passing
`disabled: () => votes === 0` makes the button **permanently disabled** regardless of
state. Always pass a reactive boolean (Vue ref / computed value, evaluated at declaration
time and updated reactively) — never a function.

**Variant hierarchy.** Exactly one `variant: 'primary'` per slide = the obvious next
step. Everything else is `'secondary'` (or omitted — `'secondary'` is the default). Two
primaries leave the presenter guessing which is the actual next move.

**What `secondary` actually looks like — and why ghost buttons are a FAIL.** In the
AhaSlides design system, `secondary` is a **solid white-background button** (white fill,
subtle border, dark label) — *not* a transparent "ghost" / outline button that lets the
slide background show through. This is the correct resting style for almost every slide
action: the poll slide's **Show correct answer**, or **Group by themes** on Open-Ended /
Word Cloud, are the reference — each is a solid white secondary button. When one of these
actions reads as a see-through button instead, it has drifted off the design system: it no
longer matches every other button in the product, and it loses the guaranteed label
contrast the white fill provides over any theme colour or background image.

The plugin never paints this itself — it declares `variant: 'secondary'` (or omits
`variant`, since secondary is the default) and the host renders the white-background
`<aha-antd-button>`. So the violation shows up in code as either an action styled with a
ghost/transparent intent, or (worse) a button hand-rendered **inside** the canvas with
transparent-background CSS (`background: transparent`, `bg-transparent`, border-only) —
which also trips **C3** (rendered, not declared). If a slide action reads as a
ghost/outline button anywhere, mark this criterion FAIL.

**Reuse the library component — never hand-roll a control (FAIL even if pixel-perfect).**
Whenever a slide renders its OWN control — the in-canvas action fallback used when
`canUsePluginActionButtons` is off, or any button / input / select / toggle / tooltip /
modal on the canvas — it must come from the project's component **library** (this app
ships **Ant Design Vue**, themed through its `ConfigProvider` design tokens), NOT a bespoke
`<button>` / `<div>` / `<input>` styled with hand-written CSS. A hand-rolled control is a
**FAIL even when it looks correct**, because it drifts from the design system the moment a
token changes and it can't inherit the shared states (hover/focus/disabled, keyboard, a11y
roles). The host's native buttons (Idea board, Short Answer, Poll — the non-marketplace
ones) are the `<aha-antd-button>` secondary; the iframe can't call that host component, so
it reproduces the look with its **own** Ant `<Button>` under `ConfigProvider`, not with a
raw element. Judge on HOW it is built, not how it looks: a raw `<button class="…">` with
bespoke fill/border/radius CSS where an Ant `<Button>` is available is a FAIL (this mirrors
the settings judge's rebuilt-≠-reused rule and `aha-design-component-standard`).

✅ **GOOD example**

```ts
// One primary; functions on disabled/loading are NOT used — pass a reactive boolean.
actions: [
  { id: 'prev',      icon: 'arrow-left', variant: 'secondary' },
  { id: 'next',      label: 'common.next',     variant: 'primary',   shortcut: 'Enter',
    disabled: votes.value === 0 },
  { id: 'summarise', label: 'quiz.summarise',  variant: 'secondary',
    loading: isSummarising.value },
];
```

❌ **BAD example**

```ts
// two primaries → ambiguous "next step"
actions: [
  { id: 'next',      label: 'common.next',     variant: 'primary' },
  { id: 'summarise', label: 'quiz.summarise',  variant: 'primary' },
];

// FOOTGUN — a function on disabled is silently truthy; button is permanently disabled
actions: [
  { id: 'next', label: 'common.next', variant: 'primary',
    disabled: () => votes.value === 0 },  // ❌ should be `votes.value === 0`
];

// label as a function → renders as source code, not the result
actions: [
  { id: 'next', label: () => t('common.next'), variant: 'primary' },  // ❌
];
```

✅ **GOOD example — secondary actions render as solid white buttons, one accent primary**

```json
// plugin-manifest.json — Idea board's NCB (the real reference bar).
// "←" and "Hide votes" declared secondary → host paints them as solid WHITE buttons.
// "Tiếp theo: Kết quả" is the single primary → accent-filled next step.
{
  "name": "idea-board",
  "actions": [
    { "id": "prev",      "icon": "arrow-left",                        "variant": "secondary" },
    { "id": "hideVotes", "label": "ideaBoard.hideVotes", "icon": "eye-off", "variant": "secondary" },
    { "id": "next",      "label": "ideaBoard.nextResults",            "variant": "primary", "shortcut": "Enter" }
  ]
}
// IdeaBoardCanvas.vue renders NO action buttons and NO custom button CSS —
// the host paints white secondaries + one accent primary.
```

❌ **BAD example — a slide action shipped as a transparent ghost button**

```vue
<!-- src/PollResultCanvas.vue — "Show correct answer" hand-rolled with a see-through fill.
     Reads as a ghost/outline button, not the design-system white-background secondary. -->
<template>
  <div class="poll-canvas">
    <!-- ...result bars... -->
    <button class="poll-action" @click="showCorrect">
      {{ t('poll.showCorrectAnswer') }}
    </button>
  </div>
</template>

<style scoped>
.poll-action {
  background: transparent;          /* ❌ ghost fill — the slide background shows through */
  border: 1px solid currentColor;   /* ❌ hand-rolled outline instead of the DS secondary */
  color: inherit;
}
</style>
<!-- Should be declared { id: 'showCorrect', label: 'poll.showCorrectAnswer',
     variant: 'secondary' } and painted as a solid white button by the host. This
     also trips C3 (rendered in-canvas, not declared). -->
```

**Common failure modes:**
- Two or more primaries (only the "obvious next" is primary)
- `disabled` / `loading` declared as a function (silently always-on bug)
- `label` declared as a function (renders as source, not output)
- All actions secondary (no primary at all — leaves the presenter guessing)
- Custom button styled inside the canvas instead of declared — that's C3, not C4
- **Slide action rendered as a transparent / ghost / outline button** (`background: transparent`,
  `bg-transparent`, border-only) instead of the design-system solid **white-background**
  secondary — e.g. a poll's "Show correct answer" that lets the slide colour show through
- A slide action (e.g. "Show correct answer", "Group by themes", "Hide votes") styled as
  anything other than the solid white `secondary` (unless it's the single accent primary)

---

### C5. Legible against the REAL background — WCAG AA contrast, readable size, AND real text → PASS / FAIL

Three failure axes, one goal: the slide is read from a distance, so meaningful text and
shapes must **contrast enough**, be **big enough**, AND **read as normal running text**
(not a decorative treatment) to be understood from the worst seat. Any one axis failing
→ C5 FAIL.

**Rule (contrast).** Every meaningful text and shape meets WCAG AA against the **composited**
background — `xprops.slide.baseColour` with `xprops.slide.backgroundImage` blended on
top (the host has already composed the overlay; the iframe receives only the resulting
image URL):
- **Text:** 4.5:1 floor (3:1 for large text ≥18pt / 14pt bold)
- **Meaningful non-text shapes** (bar chart bars, status dots, dividers): 3:1 floor

Passing against `baseColour` alone is NOT enough. Photo backgrounds are the hard case
— busy areas of the image can drop contrast far below the floor.

If contrast cannot be measured from the code (no preview, no scrim, no defensive layer),
it's a **FAIL** (burden of proof on PASS). A scrim, a card background, or a guaranteed
**opaque** container behind the text counts as a pass.

**Slide-painted surfaces re-anchor the contrast check (chips, cards, badges, scrims).**
When the slide paints its own surface behind content, contrast is measured against **that
composited surface**, not the deck — and two things that read as "safe" are not:

- **A translucent tint is NOT a guarantee.** A fill like `color-mix(in srgb, currentColor
  26%, transparent)` (or any `bg-current` + `opacity-*` layer) lets the deck show through,
  so its effective colour — and the contrast of anything on it — shifts with the deck. Only
  an **opaque** surface auto-passes. Text that itself derives from `currentColor` over a
  `currentColor` tint is roughly self-consistent across polarities; anything else on that
  surface is not.
- **Fixed-colour marks on the surface must clear the floor on BOTH polarities.** A bundled
  semantic glyph (the ✓/✗ success/error token), a `presentationColorPalette` accent, or a
  border painted in either — sitting on a slide-painted fill — must hold **text 4.5:1 /
  shape 3:1 against that fill on a light AND a dark deck**. A teal ✓ on a light tint, or a
  palette-accent border on a dark deck, is the classic miss. **FAIL** if a fixed-colour mark
  on a slide-painted (especially translucent) surface isn't verified on both polarities.
  A *light* semantic token on a *light* surface fails even at full opacity:
  `colorSuccess` `#16C49A` on white is only ~2.23:1, under the 3:1 mark floor. A
  semantically-correct token is not automatically legible — it must sit on a
  bounded fill (a filled badge with a contrasting glyph) or a dark surface.

✅ **GOOD example**

```vue
<template>
  <div class="quiz-canvas" :style="{ background: xprops.slide.baseColour }">
    <!-- Translucent scrim guarantees contrast over busy photo backgrounds -->
    <div
      v-if="xprops.slide.backgroundImage"
      class="scrim"
      :style="{ background: xprops.slide.baseColour, opacity: 0.6 }"
      aria-hidden="true"
    />

    <div class="content">
      <h2 :style="{ color: xprops.slide.textColour }">
        {{ t('quiz.resultsTitle') }}
      </h2>
    </div>
  </div>
</template>
```

❌ **BAD example**

```css
/* white text directly on a photo — no scrim, no card, no defensive layer */
.quiz-canvas {
  background-image: url('/assets/quiz-bg.jpg');
  background-size: cover;
  color: #FFFFFF;
  /* on a bright photo region this can drop to ~2.8:1 — fails AA */
}
```

**Rule (readable size — the canvas type-scale).** The host renders the slide on a **fixed
1280×720 logical stage and `transform: scale()`s the whole thing as one unit** to fit any
screen. So a **fixed logical px** size scales proportionally with everything else on every
screen — a phone embed and a projector scale identically. Meaningful text (labels, list
items, data values, status lines, titles) must therefore use a **fixed-px type-scale role**,
never below the 16px floor:

| role | class | px @720 |
|---|---|---|
| caption (floor) | `text-base` | 16 |
| body (default) | `text-lg` | 18 |
| subhead | `text-2xl` | 24 |
| title | `text-5xl` | 48 (≈ native `SlideTitle`) |
| hero | `text-7xl` | 72 |

Two things are a **FAIL** on the canvas, both because they defeat that model:

- **A `vh` / `vw` / `clamp()` font-size.** `vh` resolves against the *framed iframe
  viewport* (~498px, not the 720 stage), so `text-[2.3vh]` renders **~11px** and its basis
  wobbles by framing. The stage transform already scales the text — `vh` is redundant and
  wrong.
- **A `clamp()` px floor** (`clamp(16px, …)`). A px floor pins an absolute size while
  siblings scale, which **breaks proportion** — that is a responsive behaviour for a
  *reflowing* surface (the **audience** phone view), not this transform-scaled canvas. On
  the canvas a plain fixed px needs no floor.

Also FAIL: `text-xs`/`text-sm` (12/14px, below the floor) and any arbitrary `text-[…]`
font-size (bypasses the scale). `em` is allowed — a relative multiplier of a role-sized
parent.

✅ **GOOD example — a fixed-px role; the stage transform does the scaling**

```html
<span class="text-lg font-semibold">New product line</span>   <!-- body, 18px logical -->
<h2 class="text-5xl font-extrabold">What is the capital?</h2>  <!-- title, 48px logical -->
```

❌ **BAD example — a `vh` font-size collapses against the framed iframe viewport**

```html
<!-- 2.3vh resolves against the ~498px framed iframe viewport → ~11px. Also wrong: a
     clamp(16px,…) floor would fix the size but break proportion vs the scaling siblings. -->
<span class="t-90 truncate text-[2.3vh] font-semibold">New product line</span>
```

**Rule (real text — no decorative treatment of legible words).** A real word must render
as normal running text. Stacking a word's letters vertically (one glyph per line),
rotating a word 90°, or stretching its letter-spacing so far the word's silhouette breaks
are all **FAIL**, even when the surrounding contrast and font-size are otherwise correct
— the treatment itself is what destroys legibility at distance. This is decoration
pretending to be a label: it can look intentional in a small editor preview and still be
unreadable from the back of a room. If a compact divider or badge is the goal, keep the
word horizontal and use a smaller in-scale role (never below the 16px floor) or let it
wrap — never stack or rotate the letters.

✅ **GOOD example — a divider label stays horizontal**

```html
<span class="divider-pill text-base font-semibold">OR</span>
```

❌ **BAD example — a True/False "OR" divider with letters stacked vertically**

```vue
<!-- src/TrueFalseCanvas.vue — the divider between the two answer boxes renders "OR"
     as two stacked letters instead of horizontal running text. -->
<template>
  <div class="or-divider">
    <span class="or-letter">O</span>
    <span class="or-letter">R</span>
  </div>
</template>

<style scoped>
.or-divider {
  display: flex;
  flex-direction: column;   /* ❌ stacks the letters into a mini logo, not a word */
  align-items: center;
}
.or-letter {
  font-size: 14px;          /* also below the 16px floor */
  line-height: 1;
}
</style>
<!-- Reads as a tiny decorative glyph, not the word "OR" — illegible from across the
     room even though colour/contrast is otherwise fine. Fix: render `<span
     class="text-base font-semibold">OR</span>` as normal horizontal text. -->
```

**Common failure modes:**
- Light text directly on `xprops.slide.backgroundImage` (no scrim layer)
- Bar charts with thin coloured outlines (no fill) on busy backgrounds
- Passes on white theme but fails on dark theme — only one theme tested
- Hover/focus states with contrast < the floor (often forgotten)
- Disabled-state text at 40% opacity that drops below 4.5:1
- **A light semantic mark (`colorSuccess` / `colorError`) painted straight onto a
  light surface** — semantically right but ~2:1 contrast; needs a bounded fill or a
  dark surface
- **`textColour` used directly as a border / divider / hairline source.** It passes
  shape contrast (≥3:1 against `baseColour` by theme contract) but paints the ornament
  at body-type intensity — heavier than any design-system border. AntD's borders sit
  around `#d9d9d9` / ~15% of text intensity. Borders should derive from
  `color-mix(in srgb, currentColor 10%, transparent)` (subtle, theme-aware). When the
  shape-contrast floor is hard to clear, fix at the bar (pick the palette shade that
  actually contrasts against the composited background — saturated
  `presentationColorPalette[i]` on light backgrounds, `presentationLighterColorPalette[i]`
  on dark backgrounds where saturated shades blend in) or the scrim (opacity), not by
  darkening the border.
- **A `vh` / `vw` / `clamp()` font-size on the canvas** (`text-[2.5vh]`, `text-[clamp(…)]`)
  — resolves against the framed iframe viewport, not the stage, so it renders tiny; use a
  fixed-px type-scale role instead
- **`text-xs` / `text-sm`** (12/14px) or an arbitrary sub-16 `text-[Npx]` — below the 16px
  floor; pick a scale role (caption `text-base` 16 at minimum)
- **A `clamp()` px floor** used on the canvas to "guarantee 16px" — that is an audience
  (reflow) fix; on the transform-scaled canvas it breaks proportion vs the scaling siblings
- **A legible word treated as decoration** — its letters stacked vertically (one per
  line), rotated, or over-tracked so far the word's silhouette breaks. A "OR" divider
  rendered as "O" over "R" in a tiny pill is the canonical case: readable up close on a
  laptop, illegible from across the room. FAIL even when the contrast and font-size are
  otherwise fine — keep the word horizontal.

---

### C6. Non-colour cue paired with every colour-bearing signal → PASS / FAIL

**Rule.** If colour carries meaning (right/wrong, winner/loser, warning/normal,
correct/incorrect), it MUST be paired with at least one of:
- An **icon** (✓, ✗, crown, alert) — **preferred**: compact, language-neutral
- A **label** ("Correct", "Incorrect", "Winner") — heavier, brings an i18n surface
- A **shape** (border style, pattern, outline)
- **Position** (winner = top of list)

Pure colour is FAIL. Reason: colour-blind viewers (~8% of men) + presenter projector
glare + room distance all degrade colour discrimination simultaneously.

**Preference: icon-only over word-chips.** A trophy 🏆 conveys "leading" more cleanly
than a `<chip>leading</chip>`. A ✓/✗ conveys "correct"/"incorrect" more cleanly than
"Correct"/"Incorrect" labels. Reach for words only when no glyph captures the meaning
("Closed", "Beta") and almost never stack icon + word together.

One cue is enough — don't pile up icon + label + position to the point of busyness;
choose whichever reads cleanest.

✅ **GOOD example**

```vue
<!-- colour + icon = two independent cues for "correct"; clean and not busy -->
<div
  class="bar-fill"
  :style="{ background: option.isCorrect ? semanticTokens.colorSuccess : ... }"
/>
<Icon
  v-if="option.isCorrect"
  name="check-circle"
  :aria-label="t('quiz.correct')"
/>
```

❌ **BAD example**

```vue
<!-- only the fill colour tells the audience which one is correct -->
<div
  class="bar-fill"
  :style="{ background: option.isCorrect ? '#22C55E' : '#9CA3AF' }"
/>
<!-- no icon, no label, no border, no position change -->
```

**Common failure modes:**
- Quiz result bars distinguished only by green/red fill
- Winner highlighted only by a slightly brighter shade
- Status dot with no accompanying label
- "Live" indicator that's only a red dot, no text
- Sentiment chip coloured but unlabelled
- **Verbose word chip when an icon would do.** `<chip>leading</chip>` / `<chip>correct</chip>`
  next to the row spells out what a 🏆 / ✓ glyph would convey more cleanly. Word chips
  add visual weight and an i18n string for no semantic gain. Replace with an icon (with
  `aria-label`).
- **Decoration eats the chart track.** The non-colour cue is added (good) but only
  renders on some rows — e.g. only the leader has a `<chip>leading</chip>` in the
  same flex row. That row's track is narrower than the rest, so a 55% bar visually
  lands at ~48%. The chart geometry must stay honest: reserve a fixed-width slot for
  the cue on **every** row, or render the cue as a positioned overlay outside the
  flex layout.

---

### C7. Framed vs full-canvas chosen intentionally in the manifest → PASS / FAIL

**Rule.** The plugin's manifest declares `setting.enableFullScreen` explicitly:
- **Framed** (`setting.enableFullScreen: false`): host renders the question title /
  description / question image at the top of the stage; the canvas iframe only renders
  the answer/interaction area.
- **Full-canvas** (`setting.enableFullScreen: true`): host hides its chrome; the canvas
  iframe renders its own title and full layout, still honouring theme and accessibility.

The host maps this `setting.enableFullScreen` to the `fullCanvas` xprop the plugin
receives — but the plugin's source of truth is the manifest entry.

The choice must be **visible in the manifest** (explicit setting) AND coherent with what
the canvas actually renders.

**FAIL if:**
- Full-canvas chosen but the canvas doesn't render a title (silent loss of the title)
- Framed chosen but the canvas ALSO renders its own title (duplicate)
- No `setting.enableFullScreen` in the manifest (silent default — reviewer can't tell
  whether that's intentional or accidental)
- Full-canvas slide skips chrome rules entirely (e.g. no padding budget for the stage)

✅ **GOOD example**

```json
// plugin-manifest.json — explicit, framed
{
  "name": "quiz-result",
  "setting": { "enableFullScreen": false },
  "actions": [/* ... */]
}
// QuizResultCanvas.vue does NOT render its own <h1>/title — host owns it.
```

```json
// or explicitly full-canvas — canvas takes responsibility for its own header
{
  "name": "branded-intro",
  "setting": { "enableFullScreen": true },
  "actions": [/* ... */]
}
// BrandedIntroCanvas.vue MUST then render its own <h2>{{ t('intro.title') }}</h2>.
```

❌ **BAD example**

```vue
<!-- no plugin-manifest.json setting → defaults silently
     AND the canvas component still does this: -->
<template>
  <div class="quiz-canvas">
    <h2 class="title">What is the capital of France?</h2>
    <!-- duplicates the host's title rendered from presentation.title -->
  </div>
</template>
```

---

### C8. Plugin initialises its locale from `presentation.language` xprop → PASS / FAIL

**Rule.** Every user-visible string passes through i18n. The plugin runs in its own
iframe with **its own i18n instance** — it does NOT inherit the host's locale state.
The plugin must explicitly **initialise its locale from `xprops.presentation.language`
(or `xprops.currentUser.presenterLanguage`) at startup, and react to changes**.

No hard-coded English in JSX/template literals.

**Allowed:** developer-facing strings (`console.warn`, dev-only debug UI), brand
names (e.g. "AhaSlides") that are intentionally untranslated.

**Number formatting:** percentages, vote counts, dates use locale-aware formatting
(`Intl.NumberFormat` keyed on the plugin's current locale), not `.toFixed()` with
assumed `.`-as-decimal-separator.

✅ **GOOD example**

```ts
// At plugin entry — set i18n locale from xprops, watch for changes
import { createI18n } from 'vue-i18n';
const i18n = createI18n({
  legacy: false,
  locale: window.xprops.presentation.language,
  fallbackLocale: 'en',
  messages: { /* ... */ },
});
window.xprops.onPresentationUpdate?.((next) => {
  i18n.global.locale.value = next.language;
});
```

```vue
<template>
  <h2>{{ t('quiz.resultsTitle') }}</h2>
  <Icon name="check-circle" :aria-label="t('quiz.correct')" />
  <span>{{ formatPercent(option.votePercent) }}</span>
  <div v-if="loading">{{ t('common.loading') }}</div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
const { t, locale } = useI18n();

const formatPercent = (n: number) =>
  new Intl.NumberFormat(locale.value, {
    style: 'percent',
    maximumFractionDigits: 0,
  }).format(n / 100);
</script>
```

❌ **BAD example**

```vue
<template>
  <h2 class="title">What is the capital of France?</h2>
  <button>Previous</button>
  <button>Next</button>
  <div v-if="loading">Loading...</div>
  <span>{{ option.votePercent.toFixed(1) }}%</span>
</template>
<!-- hard-coded English everywhere; toFixed assumes '.' decimal separator;
     plugin's i18n never initialised from xprops.presentation.language -->
```

**Common failure modes:**
- "Loading..." / "Error" hard-coded in fallback states
- Plugin's i18n instance defaults to `'en'` and is never set from xprops
- Button label string in code instead of in a translation file
- `toFixed(1)` + `'%'` concatenation (some locales use `,` not `.`)
- Date / time using `Date.toLocaleString()` with no explicit `locale` arg
- Tooltips, aria-labels, placeholder text forgotten in the i18n sweep

---

### C9. Visual restraint — no AI-generated design tells → PASS / FAIL

Three specific choices make a canvas read as machine-generated rather than
designed. **Any one → FAIL.**

**a. Pastel wash + same-tone ink.** A pastel/tinted surface carrying icon + text
in the *same* hue (even a darker shade) — e.g. a card at `color-mix(in srgb,
<accent> 14%, white)` with `<accent>`-coloured text. Reads monotone, low-contrast,
"AI". The surface should be deck-owned (transparent, ink from
`xprops.slide.textColour`) or a tinted surface must carry genuinely high-contrast
ink with a clear hierarchy — not one hue at two brightnesses.

**b. Over-rounded corners.** Content containers — cards, answer boxes, option
tiles, panels, buttons — use a corner radius **≤ 8px** (the design-system
`borderRadius` default is 8 / `rounded-lg`). `rounded-2xl`, `rounded-3xl`,
`border-radius: 20px` on a box is a FAIL. **Exempt:** intentionally circular
elements — pills, chips, badges, avatars, dots, progress-bar tracks/fills — stay
fully rounded (`999px` / `rounded-full`); the cap is for rectangular containers.

**c. Extra-bold weight.** Display text uses weight **400 or 600 only**. A heavy
weight — `font-extrabold` / 800, `font-bold` / 700, `font-black` / 900 — reads
heavy and "AI" (a count number or heading at 800 is the classic tell). FAIL if
meaningful display text is heavier than 600.

✅ **GOOD example**

```html
<!-- deck-owned ink, ≤8px corners, weight 600 -->
<div class="rounded-lg" :style="{ color: xprops.slide.textColour }">
  <span class="text-5xl" style="font-weight: 600">42%</span>
</div>
```

❌ **BAD example**

```html
<!-- pastel wash + same-hue ink, over-rounded, extra-bold -->
<div class="rounded-3xl"
     :style="{ background: `color-mix(in srgb, ${accent} 14%, white)` }">
  <span class="text-5xl font-extrabold" :style="{ color: accent }">42%</span>
</div>
```

**Common failure modes (any one → FAIL):**
- Pastel/tinted card with icon + text in the same hue (monotone "AI" look)
- `rounded-2xl` / `rounded-3xl` / `border-radius` > 8px on a card / box / button
- `font-extrabold` (800) / `font-bold` (700) / `font-black` (900) on display text
- A count number or heading set to weight 800 "for emphasis" — use 600

---

### C10. Keyboard-shortcut affordances → PASS / FAIL

**Scope.** This criterion is about controls the **canvas renders itself** — a
bespoke overlay the host control bar (NCB, §C3) doesn't paint: an animated
game's play / pause, a reveal toggle, a music-mute button, a settings popover.
Host-painted NCB actions get their shortcut chips, focus order, and sound from
the host and are out of scope here. A canvas that renders **no** interactive
controls of its own PASSes vacuously. Four sub-rules; **any one violated → FAIL.**

**a. A modal / overlay / popover traps focus.** When it opens, keyboard focus
moves to an element **inside** it, `Tab` / `Shift+Tab` stay **contained within**
it (a focus trap), and focus **returns to the trigger** on close. An overlay that
opens without moving focus in, lets `Tab` escape to the page behind, or drops
focus on close is a FAIL.

**b. Every actionable button carries a shortcut indicator; a single character is
a SQUARE.** Each control shows the key that triggers it in a small chip, and a
**one-character** indicator is rendered as a **square** — equal width and height,
small rounded corners — **not a wide pill** (`border-radius: 9999px` / a chip
padded wider than it is tall).

**c. A labelled button shows its shortcut inline.** If the button has visible
text, the shortcut sits **inline next to the label** (an always-visible chip),
**not** hidden in a separate `title="Press X"` / hover-only tooltip.

**d. An icon-only button carries a name + shortcut tooltip.** An icon button has
no inline chip, so its tooltip (and `aria-label`) is the button's **name plus the
shortcut in parentheses** — e.g. `Mute music (M)`. A bare icon with no tooltip,
or one that drops the name or the `(shortcut)`, is a FAIL.

✅ **GOOD example**

```vue
<!-- labelled button: inline SQUARE chip; icon button: name + (shortcut) tooltip -->
<button>Play <kbd class="key">P</kbd></button>
<button aria-label="Mute music (M)" title="Mute music (M)"><IconMute /></button>

<!-- overlay focuses in, traps Tab, restores focus on close -->
<div v-if="open" ref="dialog" role="dialog" aria-modal="true" @keydown="trapTab">…</div>

<style scoped>
.key { display: inline-grid; place-items: center;
       min-width: 1.5rem; height: 1.5rem; border-radius: 4px; }  /* square, not a pill */
</style>
```

❌ **BAD example**

```vue
<!-- labelled button hides the shortcut in a tooltip; 1-char chip is a wide pill -->
<button title="Press P to play">Play</button>
<button>Next <kbd style="border-radius: 9999px; padding: 2px 12px">N</kbd></button>

<!-- icon button: no name, no shortcut in the tooltip -->
<button aria-label="Mute"><IconMute /></button>

<!-- overlay opens but never moves focus in; Tab walks out to the page behind -->
<div v-if="open" role="dialog">…</div>
```

**Common failure modes (any one → FAIL):**
- A modal / overlay / popover opens without moving focus inside it, `Tab` escapes
  it, or focus isn't returned to the trigger on close
- An actionable button has no shortcut indicator at all
- A single-character indicator is a wide pill (`9999px` / padded wider than tall)
  instead of a square
- A labelled button hides its shortcut in a "Press X" tooltip instead of an
  inline chip
- An icon-only button has no tooltip, or a tooltip missing the name or the
  `(shortcut)`

---

### C11. Deck-ink fallback reads on the surface it lands on → PASS / FAIL

**Scope.** Ink written as `xprops.slide.textColour ?? <fallback>` (or `textColour
|| …`). The default deck leaves `slide.textColour` **unset** — the host paints
body text itself and forwards nothing — so the fallback is the **real paint path
on the most common deck**, not an edge case. This criterion checks the fallback
branch specifically; C5's contrast axis measures the `textColour`-**set** path.
A canvas that never falls a deck ink back onto a bounded surface PASSes vacuously.

**Rule.** **FAIL** when the fallback is a **fixed colour** (`?? '#fff'`,
`?? ahaBrand.white`, `?? '#313131'`, `?? colorError`, any constant) **AND** that
ink sits on a **bounded filled surface whose fill can be either polarity** — a
disabled-grey / state-tinted box, a coloured chip, a card. A fixed fallback clears
contrast on one polarity and **vanishes on the other** the moment the deck is a
default theme (`textColour` unset): a `?? white` label disappears on a light box,
a `?? '#313131'` label on a dark one. **PASS** when the fallback is **derived from
that surface's own background** via a luminance flip — `readableInkOn(fill)` /
`luminance(bg) > 0.45 ? dark : light` — so it reads whichever way the box is
painted. Ink that falls back on the **deck background itself** (not a bounded
surface) may keep the flat `#313131` / `#ffffff` deck fallback — this criterion is
about ink on a *slide-painted surface*.

**Why it slips past C1 and C5.** A `?? fallback` is a legitimate default, not a
hard-coded colour — so **C1 passes**. And C5's contrast axis is naturally read
against the *rendered* (`textColour`-set) colour, which can be perfectly legible
while the fallback branch is invisible — so **C5 can pass while this fails**. The
defect lives on the fallback path only, and only a reviewer who thinks to evaluate
the `??` branch on a default deck catches it. That reviewer is this criterion.

✅ **GOOD example**

```ts
// The fallback is derived from the box's OWN fill: readable ink on that
// background (dark ink on the light-grey loser box, light ink on a dark fill),
// so the default-deck (textColour unset) case still reads.
const LOSER_FILL = '#E8E8EC'
const loserInk = computed(
  () => slideProps.value?.textColour ?? readableInkOn(LOSER_FILL),
)
```

❌ **BAD example**

```ts
// Fixed white fallback. On a default black-text deck slide.textColour is UNSET,
// so deckInk = white — a white label on the light-grey loser box is invisible.
const deckInk = computed(() => slideProps.value?.textColour ?? ahaBrand.white)
const color = isLoser(side) ? deckInk.value : readableInkOn(accent)
```

**Common failure modes (any one → FAIL):**
- Ink on a bounded filled surface falls back to a fixed colour (`?? white`,
  `?? '#313131'`, `?? colorX`) instead of one derived from that surface's fill
- The `??` fallback is verified only on the polarity the author happened to test,
  not on the opposite-polarity deck the unset-`textColour` default produces
- One side of a two-box / two-state surface derives its ink from its own fill
  (`readableInkOn(fill)`) while the other reaches for a fixed deck constant — a
  half-applied fix that reads on one box and vanishes on the other

---

## Output format — the verdict report

Always emit this exact structure (compact, scannable for PR reviewers):

```markdown
# Canvas judge report — <slide name or file path>

| # | Criterion | Verdict |
|---|---|---|
| C1 | No hard-coded colours/fonts | ✅ PASS |
| C2 | Semantic state colours bundled, not from palette | ❌ FAIL |
| C3 | Action buttons declared, not in canvas | ✅ PASS |
| C4 | Action shape correct, 1 primary | ✅ PASS |
| C5 | Legible against real background (contrast + size) | ❌ FAIL |
| C6 | Non-colour cue paired with colour | ✅ PASS |
| C7 | Framed vs full-canvas intentional in manifest | ✅ PASS |
| C8 | Plugin locale initialised from xprops | ✅ PASS |
| C9 | Visual restraint (no pastel-monotone, radius ≤8px, no extra-bold) | ✅ PASS |
| C10 | Keyboard-shortcut affordances (in-canvas controls) | ✅ PASS |
| C11 | Deck-ink fallback reads on its surface | ✅ PASS |

**Overall: NEEDS FIX** (2 failing criteria)

## Fails

### ❌ C2 — Semantic state colours bundled, not from palette
**Where:** `src/QuizResult.vue:42-48`
**Evidence:** uses `xprops.presentationColorPalette[0]` for the correct-answer bar fill.
**Fix:** import semantic state tokens into the plugin's own bundle (consult the
design-system team for the package) and bind `option.isCorrect` to
`semanticTokens.colorSuccess`. The presentation palette is the deck's accent set — it
carries no guarantee of a usable red or green.

### ❌ C5 — WCAG AA against real background
**Where:** `src/QuizResult.vue:60` (question text)
**Evidence:** text uses `xprops.slide.textColour` directly while the slide allows a
`xprops.slide.backgroundImage`. On image-heavy decks the composited contrast drops to
~2.8:1 against busy regions.
**Fix:** add a translucent scrim layer (`xprops.slide.baseColour` at ~60% opacity)
behind the text, or render the text inside a card with `baseColour` background.

## Passes — brief

C1, C3, C4, C6, C7, C8 — bindings clean, no other issues observed.

## Notes / unverifiable

- (If anything was unclear from the code, list here so the reviewer can follow up —
  e.g. "couldn't tell whether `canUsePluginActionButtons` flag is on for this slide.")
```

**Overall verdict rule:** any FAIL → `NEEDS FIX`. All PASS → `OK TO SHIP`.

Always include:
- The verdict table (all 11 rows, in order)
- A `## Fails` section with a sub-section per failed criterion: **Where** (file:line),
  **Evidence** (1 line), **Fix** (concrete action)
- A 1-line `## Passes — brief` summary
- A `## Notes / unverifiable` section if any judgment was made under uncertainty

---

## When NOT to use this skill

- The user is **building** a new slide canvas → use `aha-design-canvas` instead (the build
  skill). This judge is for evaluating finished work.
- Reviewing the **right-panel settings form** → use `aha-design:aha-design-settings`.
- Reviewing **icon usage** on a slide → use `aha-design:aha-design-icons`.
- Reviewing **modals/drawers/popovers** inside the slide → use
  `aha-design:aha-design-overlays`.
- Reviewing **non-slide product UI** (dashboards, account settings, marketing pages) →
  use other `aha-design-*` skills.

---

## Closing the build → judge → fix loop

This judge is designed to be invoked at the **end** of a build pass — either by a human
reviewer or by the build agent itself as a self-check. The expected loop:

1. Build with `aha-design-canvas` → produces canvas code
2. Invoke this judge → emits the verdict report
3. Any FAIL → fix the specific files cited under `## Fails` → re-invoke this judge
4. Repeat until the verdict is `OK TO SHIP`

The reason for the loop: build-time guidance gets diluted under task pressure. The judge
gives the build agent a final, structured chance to catch the violations the build skill
warned about but the agent "forgot" mid-implementation.
