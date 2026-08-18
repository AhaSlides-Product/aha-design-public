---
name: aha-design-audience-judge
description: "Authoritative judge / verdict-giver for AhaSlides slide-type AUDIENCE iframe implementations — the evaluation counterpart to aha-design-audience (the build skill). Use whenever an agent reviews, audits, scores, critiques, or self-checks audience-side slide code: a code review request, a PR diff touching a plugin's audienceUrl entry, a post-build self-verification step, or an explicit 'is this audience UI correct?' question. Emits a binary PASS / FAIL verdict per criterion (no partial credit) across 14 criteria — colour / font read from xprops (palette, lighter palette, textColour, fontFamily, no hard-coded hex / Tailwind / Inter), semantic state colours bundled into the plugin (NOT from palette, NOT from host CSS vars, NOT from AntD useToken, and using the actual function token not a lookalike brand accent), mobile-first single column with height reported via onHeightChange, plugin self-renders submitted / waiting / correct-incorrect / empty states (host doesn't take over), WCAG AA against the chosen background plus touch targets ~44-48px, non-colour cue paired with every colour-bearing signal (icon preferred over word chip, chart geometry stays honest), framed vs full-canvas declared explicitly in the manifest (no duplicate host title), plugin i18n initialised from xprops.presentation.language, the submit button matches the standard spec (full-width, ~44-48px, palette-driven, states wired, data-testid), visual restraint (no pastel wash under same-tone ink, corner radius capped at 8px, no extra-bold weight), a transform / animation that stays inside the reported iframe box (a swipe tilt or drag ghost must not overhang the shrink-wrapped height), and a swipe / drag gesture that stays smooth (expensive blur / shadow dropped while the card moves, only transform / opacity animated, a fast flick committed on velocity not distance), text economy on the audience surface (no label or divider that restates a control, instructions kept to one line of unboxed body text), and host-owned transient notices left to the host (no in-iframe 'Time's up' / deadline card — the host announces expiry). Trigger on phrases like 'review this audience slide', 'audit my audience UI', 'check WCAG on this audience slide', 'judge my audience plugin', 'is this audience layout correct', 'PR review for audience slide', 'self-check after building an audience slide'."
---

# Judging a slide type's audience iframe

This skill is the **judgment counterpart** to `aha-design-audience` (which
guides building the same surface). Reach for it when reviewing finished
audience-side code — a PR diff, a code review request, or a self-check at the
end of a build. Don't reach for it while building — use `aha-design-audience`
for that.

### Scope — hand off to sibling judges where appropriate

This skill is **audience-iframe-only**. The audience UI almost always touches
elements that are owned by sibling skills — when your review finds an issue
in one of those areas, hand off rather than re-judging here:

| The diff includes / your review needs to assess… | Defer to |
|---|---|
| The **presenter slide canvas** (projector view) | `aha-design:aha-design-canvas-judge` |
| The **editor right-panel** (settings the presenter sees) | `aha-design:aha-design-settings` |
| **Icons** — wrong glyph, wrong size, missing aria-label, stroke off | `aha-design:aha-design-icons` |
| **Custom modal / popover** rendering (not just the host's `openPluginModal`) | `aha-design:aha-design-overlays` |
| **Toast / inline post-action feedback** styling beyond `showToastSuccess` | `aha-design:aha-design-feedback` |
| **Copy / microcopy / tone** — wrong tone, jargon, unclear button label, brand voice off | `aha-branding` plugin (tone rules) — and for clarity fixes, `impeccable:clarify` |
| **Plan-gated / pro-only** audience features | `aha-design:aha-design-paywall` |
| **Shared UI primitives** (field error, live region, loading skeleton, empty state) | `aha-design:aha-design-shared-components` |

This judge owns the audience-iframe contract: layout, theme binding,
semantic state, submit button, host-utility wiring, i18n, framed
declaration. When something falls outside that, note it in the
`## Notes / unverifiable` section and point to the right sibling judge —
don't try to re-litigate icon sizes or copy tone here.

---

## What the host exposes to the audience iframe (recap)

Audience plugins run in their own iframe with a smaller theme propagation than
the canvas plugin. The host forwards via `window.xprops`:

| `window.xprops` path | What it is |
|---|---|
| `xprops.slide.textColour` | Primary text colour |
| `xprops.presentation.fontFamily` | Deck's font |
| `xprops.presentation.language` | Deck's locale code |
| `xprops.presentationColorPalette` | Accent palette — array of CSS colour strings |
| `xprops.presentationLighterColorPalette` | Lighter palette sibling |
| `xprops.currentUser.presenterLanguage` | Fallback locale |

**NOT forwarded** (any code that references these is automatic FAIL):
- `baseColour` — plugin chooses own background
- `backgroundImage` — never reaches the audience iframe
- AntD semantic tokens, host CSS variables like `--aha-*`

**Host utilities the plugin can opt into** (not required, but expected when
their use-case fits):

| Utility | Use it for |
|---|---|
| `showToastInfo` / `showToastSuccess` / `showToastError` | Transient feedback |
| `openPluginModal` / `closePluginModal` | Bottom-sheet modal |
| `onSubmitButtonHeightChange(h)` | Sticky "Scroll to submit" pill |
| `timeLimit` countdown | Host provides the number |
| `scrollTo(y)` / `getWindowHeight()` | Layout helpers |
| `onHeightChange(h)` | **Required** — report content height |

---

## How to use

1. Identify the audience-side code — the entry component(s) for the plugin's
   `audienceUrl` route, plus the plugin manifest.
2. for each of the 14 criteria below, search for evidence, decide **PASS** or
   **FAIL**, capture a 1-line piece of evidence (file:line if possible).
3. Emit the verdict report using the exact template at the bottom.

**Why binary, no partial credit.** A shipped audience UI either honours each
contract or it doesn't — "almost right" is just a polite FAIL. Half-credit
invites endless argument. Binary keeps the judge consistent across reviewers
and runs.

**Burden of proof is on PASS.** If you can't verify from the code, mark FAIL
and ask in the report's notes section.

---

## The 14 criteria

### C1. No hard-coded colours or fonts → PASS / FAIL

**Rule.** All colour and font values come from xprops:
- `xprops.slide.textColour`
- `xprops.presentation.fontFamily`
- `xprops.presentationColorPalette[n]`, `xprops.presentationLighterColorPalette[n]`

No hex literals, no Tailwind colour utilities (`bg-red-500`), no
`font-family: 'Inter'`, no `rgba()` literals for tints (use
`color-mix(in srgb, currentColor 10%, transparent)` instead).

**Allowed:** `currentColor` / `inherit`. A sensible plugin-chosen background
(e.g. `#FFFFFF` or `#FAFAFA` for the audience surface) is fine — the audience
iframe doesn't receive `baseColour`, so the plugin has to pick one. Document
the choice with a comment.

✅ **GOOD example**

```vue
<div
  :style="{
    color: xprops.slide.textColour,
    fontFamily: xprops.presentation.fontFamily,
  }"
>
  {{ t('audience.tapToVote') }}
</div>
```

❌ **BAD example**

```css
.audience-canvas {
  color: #313131;
  font-family: 'Inter', sans-serif;
}
.bar-track {
  background: rgba(0, 0, 0, 0.08);  /* hardcoded — fails on dark surfaces */
}
```

**Common failure modes (any one → FAIL):**
- Tailwind colour utilities anywhere (`bg-blue-500`, `text-gray-900`)
- Inline `style="color: #..."` literals
- Hex constants in a `colors.ts` / SCSS file
- `font-family: 'Inter'` instead of `xprops.presentation.fontFamily`
- `rgba(0, 0, 0, X)` for borders / tracks / dividers — use `color-mix(currentColor X%, transparent)`
- **Hex fallback constants for `textColour` / `palette` during cold-start**
  (e.g. `xprops?.slide?.textColour ?? '#1F2937'`, `xprops?.presentationColorPalette
  ?? ['#5B5BD6', '#0EA5E9', ...]`). These flash to the deck's real colours
  when xprops loads — visible drift. Use a skeleton placeholder guarded by
  a `themeReady` check instead. Only `#FFFFFF` (surface) and
  `'Plus Jakarta Sans'` (font) are allowed literals.

---

### C2. Semantic state colours bundled, applied to the indicator → PASS / FAIL

**Rule.** Meaning-bearing state colours (correct/incorrect, success/error,
submission feedback, validation) must come from the plugin's own **bundled**
design-system tokens. They do NOT come from:
- The deck's palette (`xprops.presentationColorPalette[n]`) — a palette may
  not contain a usable red/green, so state would silently shift per deck.
- Host CSS variables (`--aha-colorSuccess` etc.) — these don't cross the
  iframe boundary.
- AntD's `theme.useToken()` — React+v5 API, not available in this stack.

So the plugin imports semantic tokens from the AhaSlides design-system package
into its own build. Same approach as the canvas skill, **so the audience sees
the same success-green and error-red the presenter canvas would show** —
visual consistency across surfaces.

**Use the actual FUNCTION token, not a lookalike brand accent.** The mark must be
the semantic *function* token (`colorSuccess` #16C49A / `colorError` #F5222D /
`colorWarning` / `colorInfo`), not a bright brand accent that merely *looks* the
part — e.g. Bright Teal `#20E8B5` used as a "correct" tick because it reads green.
A lookalike accent isn't the success function (so it drifts per brand) and is
usually too light to clear the contrast floor on the phone surface (Bright Teal on
white is ~1.58:1 — see C5).

**Where to apply state colours — the indicator, NOT the chart.** State colours
go on the **state indicator**: the ✓ icon, the status badge, the validation
border. They do NOT go on the chart bar or visualization element. Bars and
charts use palette colours; state indicators use bundled semantic tokens.

✅ **GOOD example**

```vue
<script setup>
import { semanticTokens } from '@your-design-system/tokens';
const xprops = window.xprops;
</script>

<template>
  <div class="submission-feedback">
    <!-- Indicator carries semantic colour -->
    <Icon
      name="check-circle"
      :style="{ color: semanticTokens.colorSuccess }"
      :aria-label="t('audience.submitted')"
    />
    <span>{{ t('audience.thanks') }}</span>
  </div>
</template>
```

❌ **BAD example**

```js
// hex applied to chart layer
background: option.isCorrect ? '#22C55E' : '#EF4444',

// bundled semantic token applied to BAR (right source, wrong layer)
background: option.isCorrect ? semanticTokens.colorSuccess : semanticTokens.colorError,

// state derived from palette — shifts per deck
background: option.isCorrect
  ? xprops.presentationColorPalette[0]
  : xprops.presentationColorPalette[1],

// host CSS var inside iframe — doesn't resolve
background: 'var(--aha-colorSuccess)',
```

**Common failure modes:**
- Semantic green/red painted onto a chart bar (regardless of source)
- `xprops.presentationColorPalette[0]` used for the correct-answer indicator
- `var(--aha-colorSuccess)` / `var(--aha-colorError)` in audience CSS
- `theme.useToken()` invocation
- A lookalike brand accent (a bright teal/green that isn't the bundled
  `colorSuccess`) used as the correct/success mark — must be the function token
- Plugin author's own ad-hoc green/red constant (not from the design-system
  package) — just a local opinion that drifts from the rest of AhaSlides

---

### C3. Mobile-first single column + height reported via onHeightChange → PASS / FAIL

**Rule.** The audience layout must be:
- **Single column.** No side-by-side panels assuming desktop width.
- **Fluid up to host's max-width** (host enforces ~710–840px in framed mode);
  no fixed device-width assumptions.
- **No horizontal scroll** at the narrowest phone width (~320px).
- **Height reported via `onHeightChange(h)`** whenever content changes size;
  no fixed-height containers that assume a specific device.

**Bounded-card exception (the one sanctioned inner scroll).** A *bounded* card
— a fixed-size swipe / flash / reveal card that must stay one screen and so
cannot grow to fit a long question — MAY scroll its own overflowing content.
The card stays a fixed box, the iframe still shrink-wraps to it, there is **no
page-level scroll**. When such a card scrolls it MUST show a **fade cue** on the
overflowing edge(s), and the fade MUST be a **CSS `mask-image`**, not a coloured
gradient overlay (the audience surface has no forwarded `baseColour`, so a
coloured fade can't match an unknown deck background — a mask fades to true
transparency and works on any surface). The fade shows only while content
overflows and drops when it all fits. A bounded card that scrolls with **no**
fade cue, or fades with a **coloured gradient** instead of a mask, is a FAIL
under this criterion. (A non-bounded, growable layout still must NOT inner-scroll
— it reports height and lets the host shrink-wrap.)

✅ **GOOD example**

```vue
<script setup>
import { ref, watchEffect } from 'vue';

const root = ref(null);

// Report height whenever content reflows.
const observer = new ResizeObserver((entries) => {
  for (const entry of entries) {
    window.xprops.onHeightChange?.(entry.contentRect.height);
  }
});

watchEffect(() => {
  if (root.value) observer.observe(root.value);
});
</script>

<template>
  <div ref="root" class="audience-root">
    <h2>{{ t('quiz.question') }}</h2>
    <ul class="options">
      <!-- vertically stacked options -->
    </ul>
  </div>
</template>

<style scoped>
.audience-root {
  display: flex;
  flex-direction: column;
  /* no fixed height; let content drive */
}
.options {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
</style>
```

❌ **BAD example**

```vue
<template>
  <div class="audience-root">
    <div class="layout">
      <aside class="left-panel">Question</aside>   <!-- side-by-side, fails mobile -->
      <main class="right-panel">Answer</main>
    </div>
  </div>
</template>

<style scoped>
.audience-root {
  height: 600px;        /* fixed device-pixel height — breaks on tall/short phones */
  overflow-y: scroll;   /* inner scroll instead of letting host shrink-wrap */
}
.layout {
  display: grid;
  grid-template-columns: 1fr 1fr;   /* 2-column on every device */
}
</style>
<!-- No call to onHeightChange anywhere → host can't shrink-wrap the iframe -->
```

**Common failure modes:**
- 2-column layout (side panels, sidebar + content) at audience widths
- Fixed `height: 600px` / similar device assumption
- `overflow-y: scroll` inside the iframe instead of letting host shrink-wrap
- Missing `onHeightChange` call — host has to guess
- Horizontal scroll triggered at 320px width
- `media (min-width: ...)` queries pretending the iframe is a desktop
- Bounded card scrolls its content but shows **no fade cue** — audience can't
  tell there's more below/above
- Fade cue painted as a **coloured gradient overlay** instead of a `mask-image`
  — a grey/white smear that can't match an unknown deck background

---

### C4. Plugin self-renders submitted / waiting / correct-incorrect; host utilities used where they fit → PASS / FAIL

**Rule.** For built-in slide types the host overlays a "Waiting…" screen
after submit. **Plugins do not get that** — the iframe stays mounted and the
plugin must render the post-submission UX itself:

- **Just submitted** — ✓ confirmation rendered inside the iframe
- **Waiting for the next slide** — same surface, calm hold state
- **Quiz correct/incorrect** — state colour on indicator (icon), bar in palette
- **Pre-submission empty state** — input affordance with placeholder copy, not
  a giant empty zero

Additionally, the plugin uses **host utilities** instead of reinventing them:

- Toast (`showToastInfo` / `Success` / `Error`) for transient feedback
- Bottom-sheet modal (`openPluginModal`) instead of a custom in-iframe overlay
- Sticky "Scroll to submit" via `onSubmitButtonHeightChange`
- Countdown number via `timeLimit`

✅ **GOOD example**

```vue
<template>
  <div v-if="!submitted">
    <OptionList @select="submit" />
  </div>
  <div v-else-if="!presenterAdvanced" class="submitted-state">
    <Icon name="check-circle" :style="{ color: semanticTokens.colorSuccess }" />
    <span>{{ t('audience.submitted') }}</span>
    <p class="waiting">{{ t('audience.waitingNext') }}</p>
  </div>
</template>

<script setup>
// Use host's toast for errors — no custom banner in iframe
async function submit(option) {
  try {
    await sendVote(option);
    submitted.value = true;
  } catch (e) {
    window.xprops.showToastError?.(t('audience.submitError'));
  }
}
</script>
```

❌ **BAD example**

```vue
<!-- After submit, plugin assumes host will show waiting screen -->
<template>
  <div v-if="!submitted">
    <OptionList @select="submit" />
  </div>
  <!-- Nothing rendered after submit — iframe goes blank, host shows nothing either -->
</template>

<!-- Custom in-iframe error banner instead of toast -->
<div v-if="error" class="custom-error-banner">{{ error }}</div>

<!-- Custom in-iframe modal instead of openPluginModal -->
<div v-if="showModal" class="custom-modal-overlay">...</div>
```

**Common failure modes:**
- Plugin renders nothing after submit (relies on host wait screen — doesn't exist)
- Custom in-iframe modal instead of `openPluginModal`
- Custom in-iframe toast/banner instead of `showToastSuccess` — specifically,
  the **"Submitted" notification should come from `xprops.showToastSuccess(...)`**
  so it stays consistent with built-in slide types; a custom in-iframe
  "Submitted" banner is a FAIL even if it looks fine on its own
- Plugin draws its own "Scroll to submit" sticky bar instead of calling
  `onSubmitButtonHeightChange`
- Plugin runs its own countdown timer instead of consuming `timeLimit` — OR
  renders **any static time text** ("30 seconds", "1 phút", "đếm ngược 30s")
  anywhere in the iframe. If a timer exists in the experience, the displayed
  countdown number MUST be bound to the live `timeLimit` value from the host;
  static labels misrepresent the deadline and drift from reality.
- Pre-submission state renders empty/zero chart instead of input affordance

---

### C5. WCAG AA contrast + touch targets + mobile readability → PASS / FAIL

**Rule.** Three thresholds on the audience surface:

**Contrast** — every meaningful text and shape meets WCAG AA against the
**plugin-chosen background**:
- 4.5:1 floor for text (3:1 for large text ≥18pt / 14pt bold)
- 3:1 floor for meaningful non-text shapes (bar fills, status dots, dividers)

Since the audience iframe doesn't receive `baseColour`, the plugin picks its
own background — and is responsible for clearing the floor against that
choice on both light and dark deck themes.

A *light* semantic token on a *light* surface fails even at full opacity:
`colorSuccess` `#16C49A` on white is only ~2.23:1, under the 3:1 mark floor. A
semantically-correct token is not automatically legible — put a light
success/error glyph on a bounded fill (a filled badge with a contrasting glyph),
not straight onto a light background.

**Touch targets** — interactive elements (vote buttons, tappable options,
submit) are roughly finger-sized: **~44-48px in height**, matching iOS 44pt /
Android 48dp. Treat as a recommended range, not exact px.

Spacing between tappables: at least 8px to avoid mis-taps.

**Mobile readability (fixed-value rules, not just floors).** Built-in
AhaSlides slide types use specific sizes; plugins must MATCH them so a
deck full of mixed slides reads consistently:
- **Body / option / button label text**: **exactly `14px`** — matches
  native slide types. Don't go larger or smaller; the visual rhythm
  drifts the moment a third-party plugin uses 16 or 13.
- **Question / header / primary prompt**: **`22px`**, bold (in the
  host chrome — host paints this, so plugins in framed mode don't set it).
- **Help text / secondary messages / captions / footnotes**: **`12px`**.
- **Form input fields** (`<input>`, `<textarea>`): **exception — `16px`**
  to dodge the iOS auto-zoom-on-focus. Body text labels stay 14px;
  input-typed elements specifically bump to 16. This is the only place
  body deviates from 14.
- **Line-height for body**: `1.5` (cramped line-height also breaks
  readability even when the font size passes).
- **Font** is `xprops.presentation.fontFamily` (or `'Plus Jakarta Sans'`
  fallback) — never a hard-coded `'Inter'` or similar.

Any visible text at a different size is a FAIL — including labels inside
disabled / placeholder / locked states. Match native so the deck reads
as one experience, not five.

✅ **GOOD example**

```vue
<template>
  <button
    class="vote-button"
    @click="vote(option.id)"
  >
    {{ option.label }}
  </button>
</template>

<style scoped>
.vote-button {
  min-height: 48px;       /* finger-sized */
  padding: 12px 16px;
  border-radius: 8px;
  background: var(--audience-surface);   /* plugin-chosen background */
  color: var(--text-on-surface);          /* contrast verified on this surface */
}
.vote-button + .vote-button {
  margin-top: 12px;        /* 12px gap between options */
}
</style>
```

❌ **BAD example**

```vue
<template>
  <button class="tiny-vote" @click="vote(option.id)">{{ option.label }}</button>
</template>

<style scoped>
.tiny-vote {
  height: 24px;            /* too small for finger taps */
  padding: 2px 8px;
}
.tiny-vote + .tiny-vote {
  margin-top: 2px;         /* tappables too close — mis-taps */
}
</style>
```

**Common failure modes:**
- Buttons / tappables under ~40px height
- Less than 8px spacing between adjacent tappables
- Text contrast verified only on white; fails on the dark variant of plugin
  background
- Hover/focus states with contrast < the floor
- Plugin background not explicitly chosen (transparent → unpredictable
  contrast result)
- **Body / option / button label NOT exactly 14px** — drifts from
  native slide types; deck reads as inconsistent across slide kinds
- **Form input fields below 16px** — triggers iOS zoom-on-focus, disrupts
  the audience flow (the only place body deviates from 14)
- **Help / secondary text NOT exactly 12px** — drifts from native
- **Header / question below 22px** — primary prompt loses visual hierarchy
- Cramped line-height on body (< 1.4)
- Hard-coded font like `'Inter'` instead of `xprops.presentation.fontFamily`
  (with `'Plus Jakarta Sans'` fallback)

---

### C6. Non-colour cue paired with every colour-bearing signal → PASS / FAIL

**Rule.** If colour carries meaning (right/wrong, correct/incorrect,
submission state, leader/winner), it MUST be paired with at least one
non-colour cue. **Prefer icon** as the cue — compact, language-neutral.

| Cue | Notes |
|---|---|
| Icon (✓, ✗, crown) | **Preferred** |
| Label ("Correct", "Submitted") | Heavier; brings i18n surface |
| Shape (border, pattern) | OK |
| Position (winner = top) | OK |

**Chart geometry stays honest.** If a row has a decoration sometimes (only
on the leader, only on the correct answer), the decoration must NOT change
the row's track width. Reserve a fixed-width slot for the decoration on
every row, or render as a positioned overlay outside the flex layout — so
all bar tracks share the same width. A 55% bar must visually occupy 55%, not
48% because a chip ate the space.

**Borders are ornament.** Track borders, dividers, hairlines derive from
`color-mix(in srgb, currentColor 10%, transparent)` — subtle and theme-aware.
Never use `textColour` directly as a border source (paints ornament at
body-type intensity).

✅ **GOOD example**

```vue
<!-- ✓ icon next to label; bar fill stays palette colour;
     leader cue lives in a fixed-width slot reserved on every row -->
<div class="row" v-for="(option, i) in options" :key="option.id">
  <span class="label">{{ option.label }}</span>
  <div class="bar-track">
    <div class="bar-fill" :style="{ width: option.pct + '%', background: palette[i] }" />
  </div>
  <span class="pct">{{ pctText(option.pct) }}</span>
  <span class="leader-slot">
    <Icon
      v-if="option.id === leaderId"
      name="trophy"
      :style="{ color: xprops.slide.textColour }"
      :aria-label="t('audience.leading')"
    />
  </span>
</div>

<style scoped>
.leader-slot {
  width: 24px;             /* fixed; empty for non-leaders */
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.bar-track {
  border: 1px solid color-mix(in srgb, currentColor 10%, transparent);
}
</style>
```

❌ **BAD example**

```vue
<!-- only the bar colour distinguishes correct from incorrect — no icon, no label -->
<div class="bar-fill" :style="{ background: option.isCorrect ? '#22C55E' : '#EF4444' }" />

<!-- chip eats track on leader row only — chart visually lies -->
<div class="row leader">
  <span class="label">Vue</span>
  <div class="bar-track"><div class="bar-fill" style="width: 55%" /></div>
  <span class="leading-chip">leading</span>   <!-- inline, no slot reserved on other rows -->
</div>

<!-- track border = textColour, too heavy -->
.bar-track { border: 2px solid var(--textColour); }
```

**Common failure modes:**
- Correct/incorrect distinguished only by green/red fill (no icon)
- Word chip ("leading", "correct") when an icon would do
- Decoration eats the chart track (leader row narrower than others)
- Track border / divider uses `textColour` directly instead of subtle hairline
- Status dot without an accompanying label or icon

---

### C7. Framed vs full-canvas declared explicitly in the manifest → PASS / FAIL

**Rule.** The plugin manifest declares `setting.enableFullScreen` explicitly:

- **Framed** (`setting.enableFullScreen: false`) — host renders question
  image, title, description, audio button, countdown progress *above* the
  iframe. The audience iframe owns the answer area only. **Plugin must NOT
  render its own title** in this mode — duplicates the host's.
- **Full-canvas** (`setting.enableFullScreen: true`) — host hides chrome.
  Plugin renders the entire surface, including its own title.

The choice must be **visible in the manifest** AND coherent with what the
audience page actually renders.

**FAIL if:**
- No `setting.enableFullScreen` field in the manifest (silent default;
  reviewer can't tell whether intentional)
- Framed chosen but audience page also renders its own `<h1>` / question
  title (duplicates host)
- Full-canvas chosen but audience page doesn't render a title (silent loss)

✅ **GOOD example**

```json
// plugin-manifest.json — explicit, framed
{
  "name": "live-poll",
  "audienceUrl": "/join/live-poll/audience",
  "setting": { "enableFullScreen": false },
  "actions": [/* ... */]
}
// AudiencePage.vue does NOT render question title — host owns it.
```

❌ **BAD example**

```json
// no setting block → silent default
{
  "name": "live-poll",
  "audienceUrl": "/join/live-poll/audience"
}
```

```vue
<!-- AudiencePage.vue still renders own title in framed default mode -->
<h1 class="question-title">What's your favourite framework?</h1>
```

---

### C8. Plugin i18n initialised from xprops.presentation.language → PASS / FAIL

**Rule.** The audience iframe has **its own i18n instance** (separate
document, separate bundle). It does NOT inherit the host's locale state. The
plugin must explicitly **initialise its locale from
`xprops.presentation.language` at startup** (fallback
`xprops.currentUser.presenterLanguage`) and update when the host emits a
change.

No hard-coded English in JSX/template/HTML. **Allowed:** developer-facing
strings (`console.warn`, dev-only debug UI), brand names.

**Number formatting:** percentages, vote counts, dates use
`Intl.NumberFormat(locale)` — not `.toFixed()` with assumed `.` decimal.

✅ **GOOD example**

```ts
// src/main.ts — plugin entry
import { createI18n } from 'vue-i18n';
const i18n = createI18n({
  legacy: false,
  locale: window.xprops.presentation.language
    ?? window.xprops.currentUser.presenterLanguage
    ?? 'en',
  fallbackLocale: 'en',
  messages,
});
window.xprops.onPresentationUpdate?.((next) => {
  i18n.global.locale.value = next.language;
});
```

```vue
<template>
  <h2>{{ t('audience.questionPrompt') }}</h2>
  <button>{{ t('audience.submit') }}</button>
  <span>{{ formatPercent(option.pct) }}</span>
</template>
```

❌ **BAD example**

```vue
<template>
  <h2>What's your favourite framework?</h2>
  <button>Submit</button>
  <span>{{ option.pct.toFixed(1) }}%</span>     <!-- toFixed + '%' breaks non-en locales -->
  <div v-if="loading">Loading...</div>
</template>
```

```ts
// i18n hard-coded — never reads xprops
const i18n = createI18n({ locale: 'en', messages: { en: {} } });
```

**Common failure modes:**
- Plugin's i18n defaults to `'en'` and never reads xprops
- "Loading…" / "Submitted" / "Error" hard-coded in fallback states
- `toFixed(1)` + `'%'` concatenation for percentages
- `Date.toLocaleString()` without explicit locale arg
- Tooltips, aria-labels, placeholder text forgotten

---

### C9. Submit button matches the standard spec → PASS / FAIL

**Rule.** Every built-in audience slide type uses one consistent submit-button
look + behaviour (the host design system's `aha-antd-button` in the
"primary-alt" variant). That component doesn't cross the iframe boundary, so
plugin authors build their own — but the in-iframe button MUST match the
shared spec (visual + behaviour + wiring), or audience experience drifts per
slide type.

**Visual checks:**
- Full-width (block)
- Height ~44–48px (within the touch-target range from C5)
- Soft rounded corners
- Background = an accent shade from `xprops.presentationColorPalette` or
  `presentationLighterColorPalette` — NOT a hard-coded brand colour
- Text high-contrast on the chosen background (white on saturated palette
  shades; dark text on light palette shades)
- Positioned at the end of the answer-area block

**Interaction state checks (all four required):**
1. Invalid input → `disabled` with reduced opacity + `aria-disabled`
2. Submitting → inline spinner inside the button; **no layout shift** (no
   width/height change, no position change); button locked against
   double-submit
3. Host `stopSubmission` → swap to a locked state (lock icon + "closed" label
   via i18n), button stays present, becomes uninteractive
4. After submit completes:
   - Scored quiz → ✓/✗ circular badge using bundled semantic tokens
   - Non-scored → `xprops.showToastSuccess(...)` fires AND iframe content
     transitions to a plugin-rendered "submitted/waiting" state

**Wiring checks:**
- `onSubmitButtonHeightChange(h)` called with the submit button's y-offset
- `data-testid` in kebab-case (e.g. `audience-<slidetype>-submit-button`)
- Label via `t(...)` — no hard-coded English

**Secondary actions** (Skip, Start voting, …) use a secondary variant
(lower-contrast background) so the primary submit action stays visually
distinct.

✅ **GOOD example**

```vue
<template>
  <button
    type="button"
    class="submit-button"
    :class="{ 'submit-button--submitting': submitting }"
    :disabled="!hasValidInput || submitting || submissionClosed"
    :aria-disabled="!hasValidInput || submitting || submissionClosed"
    :data-testid="`audience-${slideType}-submit-button`"
    :style="{
      background: xprops.presentationColorPalette[0],
      color: '#FFFFFF',
    }"
    ref="submitBtn"
    @click="handleSubmit"
  >
    <span v-if="submissionClosed" class="submit-button__locked">
      <LockIcon />
      <span>{{ t('audience.submissionClosed') }}</span>
    </span>
    <Spinner v-else-if="submitting" class="submit-button__spinner" />
    <span v-else>{{ t('audience.submit') }}</span>
  </button>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
const submitBtn = ref(null);

// Report button y-offset so host can paint the sticky "Scroll to submit" pill
function reportButtonHeight() {
  if (!submitBtn.value) return;
  const rect = submitBtn.value.getBoundingClientRect();
  window.xprops.onSubmitButtonHeightChange?.(rect.top + window.scrollY);
}
onMounted(reportButtonHeight);
watch(() => [hasValidInput.value, submitting.value], reportButtonHeight);
</script>

<style scoped>
.submit-button {
  width: 100%;
  min-height: 48px;
  border-radius: 8px;
  border: none;
  font: 600 14px var(--fontFamily);
  cursor: pointer;
  /* Spinner sits INSIDE the button; height doesn't change */
}
.submit-button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.submit-button__spinner {
  /* inline, doesn't replace the button's bounding box */
}
</style>
```

❌ **BAD example**

```vue
<!-- Hard-coded brand colour, no disabled, no spinner, no data-testid -->
<button
  class="submit"
  @click="handleSubmit"
  style="background: #4F46E5; color: white"
>
  Submit
</button>

<!-- Spinner REPLACES the button label — layout shifts as text disappears -->
<button v-if="!submitting" @click="submit">Submit</button>
<div v-else class="spinner-only" />

<!-- No locked state when host stops submission — button still says "Submit"
     and tries to fire (host throws, audience confused) -->

<!-- No call to onSubmitButtonHeightChange — sticky "Scroll to submit" pill
     never appears on small phones -->
```

**Common failure modes:**
- Background is a hard-coded brand hex instead of from
  `xprops.presentationColorPalette`
- Button label "Submit" / "Vote" hard-coded — no `t(...)`
- No `disabled` state when input is invalid — user can submit empty
- Spinner replaces the button content → button changes size during submit;
  layout under the button reflows
- No locked state when `xprops.stopSubmission` (or equivalent) fires —
  button still says "Submit"
- Plugin draws its own "Scroll to submit" sticky bar inside the iframe
  instead of calling `onSubmitButtonHeightChange`
- Missing `data-testid` (or non-kebab-case, or not scoped to slide type)
- Secondary action (Skip, Start) painted at the same visual weight as the
  primary submit → audience can't tell which action is "the main one"

---

### C10. Visual restraint — no AI-generated design tells → PASS / FAIL

Three specific choices make the audience UI read as machine-generated. **Any one
→ FAIL.**

**a. Pastel wash + same-tone ink.** A pastel/tinted surface carrying icon + text
in the *same* hue (even a darker shade) — e.g. an option chip at `color-mix(in
srgb, <accent> 14%, white)` with `<accent>`-coloured text. Reads monotone,
low-contrast, "AI". Bind ink to `xprops.slide.textColour` (which tracks and
contrasts), or a tinted surface must carry genuinely high-contrast ink with a
clear hierarchy — not one hue at two brightnesses.

**b. Over-rounded corners.** Content containers — option tiles, cards, the submit
button — use a corner radius **≤ 8px** (the submit-button spec already lands at
8px). `rounded-2xl`, `rounded-3xl`, `border-radius: 20px` on a box is a FAIL.
**Exempt:** intentionally circular elements — pills, chips, badges, avatars, dots,
progress tracks/fills — stay fully rounded; the cap is for rectangular containers.

**c. Extra-bold weight.** Text uses weight **400 or 600 only** (the standard
submit button is 600). A heavy weight — `font-extrabold` / 800, `font-bold` / 700,
`font-black` / 900 — reads heavy and "AI" (a count number or heading at 800 is the
classic tell). FAIL if meaningful text is heavier than 600.

✅ **GOOD example**

```vue
<!-- deck-tracking ink, ≤8px corner, weight 600 -->
<div class="option" :style="{ color: xprops.slide.textColour, borderRadius: '8px' }">
  <span style="font-weight: 600">{{ option.label }}</span>
</div>
```

❌ **BAD example**

```vue
<!-- pastel wash + same-hue ink, over-rounded, extra-bold -->
<div class="option"
     :style="{ background: `color-mix(in srgb, ${accent} 14%, white)`,
               color: accent, borderRadius: '20px' }">
  <span style="font-weight: 800">{{ option.label }}</span>
</div>
```

**Common failure modes (any one → FAIL):**
- Pastel/tinted chip or card with icon + text in the same hue (monotone "AI" look)
- `rounded-2xl` / `rounded-3xl` / `border-radius` > 8px on an option tile / card / button
- `font-extrabold` (800) / `font-bold` (700) / `font-black` (900) on text
- A count number or heading set to weight 800 "for emphasis" — use 600

---

### C11. Transform / animation stays inside the reported box → PASS / FAIL

**Rule.** `onHeightChange` reports the plugin's **resting** box, and the host
shrink-wraps the iframe to that height, painting nothing outside it. Any
transform that lifts content past the reported edges — a swipe tilt, a drag
ghost, a hover pop, a settle bounce (`rotate`, `translateY(-n)`, `scale(>1)`) —
gets **clipped by the iframe**. The transformed element's bounding box, at its
most extreme animation frame, must still fit inside the reported height:
headroom is budgeted for it, and the transform is capped small enough to live
in that headroom. Prefer a cap that costs zero downward shift (a smaller tilt
angle raises the leading corner far less) over a bigger transform that forces a
taller box and pushes content down.

**FAIL if:**
- A swipe / drag / hover / bounce transform can raise a corner above the top
  (or past a side) of the reported box, with no headroom budgeted for it → the
  iframe clips it on the extreme frame.
- The transform magnitude is tuned purely for looks (e.g. a 12–15° swipe tilt)
  with no check that the tilted bounding box still fits the reported height.
- Height is reported from the transformed/animating element's live rect
  (so the reported height oscillates with the animation) instead of from the
  resting box.

✅ **GOOD example**

```vue
<style scoped>
/* Small tilt that fits within the budgeted headroom; the reported box
   already reserves room for the lifted corner. */
.swipe-card { --tilt: 8deg; }
.swipe-card.dragging { transform: rotate(var(--tilt)); }
.card-stage { padding-top: 12px; } /* headroom for the lifted corner */
</style>
<script setup>
// Report the RESTING box, not the tilted element.
const stage = ref(null);
new ResizeObserver(() => {
  window.xprops.onHeightChange?.(stage.value.offsetHeight);
}).observe(stage.value);
</script>
```

❌ **BAD example**

```vue
<style scoped>
/* Big tilt tuned for feel; the top corner lifts ~35px past the reported top
   and the iframe clips it on a hard swipe. No headroom reserved. */
.swipe-card.dragging { transform: rotate(14deg) scale(1.04); }
</style>
<script setup>
// Reports the tilted card's live rect → reported height jitters with the
// animation, and still doesn't reserve headroom for the overhang.
new ResizeObserver(() => {
  window.xprops.onHeightChange?.(card.value.getBoundingClientRect().height);
}).observe(card.value);
</script>
```

**Common failure modes (any one → FAIL):**
- Swipe/drag tilt or pop with no headroom above the card → top corner clipped
- Transform angle/scale tuned only for aesthetics, not checked against the
  reported box
- Height reported from the animating element's live rect (jittery height)
  instead of the resting box
- A settle/bounce that overshoots past the reported bottom edge

---

### C12. Swipe / drag gesture stays smooth (60 fps) → PASS / FAIL

**Rule.** A card the audience drags or flings re-renders every frame while it
moves. Two things reliably make that laggy on a real phone, and both are FAILs:

1. **An expensive continuous effect stays on the moving element.** A
   `backdrop-filter: blur()`, a large `box-shadow`, or any `filter` on the
   dragged / flung element is re-sampled every frame → dropped frames. It must
   be **dropped while the element is moving** (a `dragging || flinging ||
   settling` flag nulls it out) and restored when it settles. Only `transform`
   and `opacity` may animate (compositor-only); no per-frame `width` / `height`
   / `top` / `left` / `margin`, and `will-change: transform` on the element.
2. **Commit is distance-only.** A fast flick that hasn't crossed the distance
   threshold springs back — reads as an unresponsive / laggy swipe. The release
   must commit on **distance past the threshold OR a flick-velocity** (pointer
   px/ms) in that direction.

**FAIL if:**
- A `backdrop-filter` / big `box-shadow` / `filter` stays applied to the element
  while it is dragged or flung (no "drop while moving" flag).
- The drag animates layout properties (`width` / `height` / `top` / `left` /
  `margin`) instead of `transform` / `opacity`, or there's no
  `will-change: transform`.
- Release commits on distance only — a quick flick under the threshold springs
  back instead of flinging.

✅ **GOOD example**

```vue
<script setup>
// The card is MOVING during drag / fling / spring-back. While it moves, drop
// the per-frame-expensive backdrop blur; restore it when the card settles.
const cardMoving = computed(() => dragging.value || flinging.value || resetting.value)

function onPointerMove(e) {
  const dt = e.timeStamp - lastMoveTime
  if (dt > 0) velocityX = (e.clientX - lastMoveX) / dt   // px/ms, signed
  lastMoveX = e.clientX; lastMoveTime = e.timeStamp
  dragX.value = e.clientX - startX
}
function onPointerUp() {
  // commit on DISTANCE past the threshold OR a quick FLICK in that direction
  const commit = Math.abs(dragX.value) > SWIPE_THRESHOLD
    || (Math.abs(velocityX) > FLICK_VELOCITY && Math.abs(dragX.value) > 24)
  commit ? fling(dragX.value < 0 ? 'true' : 'false') : springBack()
}
</script>

<template>
  <div
    class="swipe-card"
    :style="{
      transform: `translate(${dragX}px) rotate(${tilt}deg)`,
      // blur only while resting — dropped every frame the card moves
      ...(cardMoving ? { backdropFilter: 'none', WebkitBackdropFilter: 'none' }
                     : { backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }),
    }"
  />
</template>

<style scoped>
.swipe-card { will-change: transform; } /* transform/opacity only — no layout props */
</style>
```

❌ **BAD example**

```vue
<template>
  <!-- Frosted blur stays on through the whole drag → the browser re-samples the
       blurred backdrop every frame → visible jank on a phone. -->
  <div
    class="swipe-card"
    :style="{ left: dragX + 'px', backdropFilter: 'blur(16px)' }"
  />
</template>

<script setup>
// Distance-only commit: a fast flick under SWIPE_THRESHOLD springs back, so a
// natural quick swipe feels laggy / unresponsive ("swipe bị giật lại").
function onPointerUp() {
  Math.abs(dragX.value) > SWIPE_THRESHOLD ? fling() : springBack()
}
</script>

<style scoped>
/* animates `left` (layout) every frame instead of `transform`; no will-change */
.swipe-card { transition: left 0.2s; }
</style>
```

**Common failure modes (any one → FAIL):**
- Frosted / blurred card keeps its `backdrop-filter` during the drag → jank on
  phones (no "drop while moving" flag)
- A large `box-shadow` or `filter` re-painted every frame under the moving card
- Drag driven by `left` / `top` / `width` instead of `transform`; no
  `will-change: transform`
- Release commits on distance only — a fast flick under the threshold springs
  back instead of flinging

---

### C13. Text economy — no redundant text; instructions are unboxed body text → PASS / FAIL

**Rule.** Every word on the audience surface must add information the controls
don't, and instructions stay quiet. Two facets:

1. **No label, header, or connective that merely restates an adjacent control.**
   If the choices are already on labelled controls ("True" / "False" buttons), a
   header repeating them ("True or False") and a divider word between them
   ("OR") are pure redundancy — the buttons are the prompt and a binary choice
   is self-evidently one-or-the-other. Delete them.
2. **Micro-instructions are the shortest phrase, in plain body text, not in a
   prominent container.** A hint ("Tap or swipe to answer") is one line of
   **body-size** text in **muted deck ink** — never a full-width pill, tinted
   card, shadowed chip, or button-shaped box. Prominent chrome makes the hint
   compete with the controls it describes.

**FAIL if:**
- A header / title restates the choices already shown on the controls
  ("True or False" above True/False buttons).
- A connective word ("OR", "vs") sits between two already-labelled, mutually
  exclusive options.
- An idle instruction is wrapped in a pill / tinted card / shadow / full-width
  button, or uses larger-than-body text or a saturated accent colour.
- The instruction is longer than it needs to be ("Tap your answer — or swipe
  it" where "Tap or swipe to answer" says the same).

✅ **GOOD example**

```vue
<!-- The two labelled buttons ARE the prompt — no restating header, no OR. -->
<button ...>{{ displayTrue }}</button>
<button ...>{{ displayFalse }}</button>
<!-- One short body-text hint in muted deck ink; no container. -->
<div class="flex items-center justify-center" aria-live="polite" data-testid="tof-hint">
  <span v-if="phase === 'idle'" class="font-semibold"
        :style="{ fontSize: BODY_TEXT, color: ink(62) }">
    {{ labels.tapOrSwipe }}   <!-- "Tap or swipe to answer" -->
  </span>
</div>
```

❌ **BAD example**

```vue
<!-- Redundant "OR" divider between two already-labelled options... -->
<div class="absolute inset-0 flex items-center justify-center">
  <span class="rounded-full px-3 font-black uppercase tracking-widest shadow-aha-md"
        :style="{ background: ahaBrand.white, color: accents.ink }">
    {{ labels.orDivider }}   <!-- "OR" -->
  </span>
</div>
<!-- ...and the idle hint boxed in a full-width, tinted, shadowed pill. -->
<div class="flex w-full items-center justify-center rounded-full font-bold"
     :style="{ background: cardSurface(ahaBrand.purple, 8), color: ahaBrand.purple }">
  {{ statusText }}   <!-- "Tap your answer — or swipe it" -->
</div>
```

**Common failure modes (any one → FAIL):**
- A header repeating the control labels; an "OR" between two labelled options.
- The idle hint rendered as a pill / tinted card / shadowed box / full-width
  button rather than one quiet body-text line.
- Over-long instruction copy where a shorter phrase carries the same meaning.

---

### C14. Host-owned transient notices not re-rendered in the iframe → PASS / FAIL

**Rule.** The host owns the countdown **and its expiry**: when time runs out it
announces "Time's up" in its own chrome (framed mode), the same way it paints
the "Submitted" toast. The plugin must **not** draw its own "Time's up" /
deadline notice inside the iframe — it double-announces and, being iframe-local,
drifts from the host's real clock. Use `xprops.timeLimit` as **logic** (lock
input at `<= 0`); let the round-end state the plugin *does* own (reveal / result)
carry the meaning.

**FAIL if:**
- The plugin renders its own "Time's up" / "Temps écoulé" / deadline card or line
  inside the iframe (in framed mode) instead of leaving it to the host.
- A visible expiry notice is driven by an in-iframe `setInterval` / local clock
  rather than the host.

(Full-canvas mode is the exception — the host hides its chrome, so a plugin that
needs a visible expiry notice renders one, bound to live `xprops.timeLimit`.)

✅ **GOOD example**

```vue
<!-- No in-iframe "Time's up": the host announces expiry. The reveal state the -->
<!-- plugin owns carries the round-end; timeLimit is used as LOGIC only.        -->
<script setup>
const submittable = computed(() => roundOpen.value && xprops.timeLimit > 0)
</script>
<template>
  <!-- revealed state shows the correct answer; no separate "Time's up" copy -->
  <TofReveal v-if="phase === 'revealed'" :correct="correctAnswer" />
</template>
```

❌ **BAD example**

```vue
<!-- Plugin draws its OWN "Time's up" notice inside the iframe when the round -->
<!-- revealed and this phone never answered — the host already announced it.  -->
<span v-else-if="phase === 'revealed' && !answered"
      class="font-semibold" data-testid="tof-timesup"
      :style="{ fontSize: BODY_TEXT }">
  {{ labels.timesUp }}   <!-- "Time's up" -->
</span>
```

**Common failure modes (any one → FAIL):**
- An in-iframe "Time's up" / deadline card or line in framed mode.
- A local `setInterval` countdown or expiry banner duplicating the host's.

---

## Output format — the verdict report

Always emit this exact structure (compact, scannable for PR reviewers):

```markdown
# Audience judge report — <slide name or file path>

| # | Criterion | Verdict |
|---|---|---|
| C1 | No hard-coded colours/fonts | ✅ PASS |
| C2 | Semantic state bundled, on indicator (not chart) | ❌ FAIL |
| C3 | Mobile-first single column + onHeightChange (bounded-card scroll needs mask fade) | ✅ PASS |
| C4 | Self-rendered submitted/waiting; host utilities used | ✅ PASS |
| C5 | WCAG AA + touch targets ~44-48px | ✅ PASS |
| C6 | Non-colour cue paired; chart geometry honest | ✅ PASS |
| C7 | Framed vs full-canvas in manifest | ✅ PASS |
| C8 | Plugin locale initialised from xprops | ✅ PASS |
| C9 | Submit button matches the standard spec | ✅ PASS |
| C10 | Visual restraint (no pastel-monotone, radius ≤8px, no extra-bold) | ✅ PASS |
| C11 | Transform / animation stays inside the reported box | ✅ PASS |
| C12 | Swipe / drag gesture stays smooth (60fps) | ✅ PASS |

**Overall: NEEDS FIX** (1 failing criterion)

## Fails

### ❌ C2 — Semantic state bundled, on indicator (not chart)
**Where:** `src/AudienceQuiz.vue:42-48`
**Evidence:** correct-answer bar fill uses
`semanticTokens.colorSuccess` directly on the chart bar — applies state
colour to the visualisation layer instead of to the ✓ indicator.
**Fix:** move the semantic colour to the ✓ icon (state indicator); bar fill
stays as `xprops.presentationColorPalette[colorIndex]` for visualisation. The
two layers must stay separated.

## Passes — brief

C1, C3, C4, C5, C6, C7, C8 — bindings clean, no other issues observed.

## Notes / unverifiable

- (If anything was unclear from the code, list here so the reviewer can
  follow up — e.g. "couldn't verify whether the plugin-chosen background
  reaches WCAG floor on a dark deck theme — manual test recommended.")
```

**Overall verdict rule:** any FAIL → `NEEDS FIX`. All PASS → `OK TO SHIP`.

Always include:
- Verdict table (all 11 rows, in order)
- `## Fails` section with sub-section per failure: **Where** (file:line),
  **Evidence**, **Fix**
- 1-line `## Passes — brief` summary
- `## Notes / unverifiable` section if anything was uncertain

---

## When NOT to use this skill

- The user is **building** a new audience slide → use `aha-design-audience`
  instead (the build skill).
- Reviewing the **presenter slide canvas** → use
  `aha-design:aha-design-canvas-judge`.
- Reviewing the **right-panel settings form** →
  `aha-design:aha-design-settings`.
- Reviewing **icon usage** → `aha-design:aha-design-icons`.
- Reviewing **non-slide product UI** (dashboards, account settings, marketing
  pages) → use other `aha-design-*` skills.

---

## Closing the build → judge → fix loop

This judge is designed to be invoked at the **end** of a build pass — either
by a human reviewer or by the build agent itself as a self-check. The
expected loop:

1. Build with `aha-design-audience` → produces audience-side code
2. Invoke this judge → emits the verdict report
3. Any FAIL → fix the specific files cited under `## Fails` → re-invoke this
   judge
4. Repeat until the verdict is `OK TO SHIP`

The reason for the loop: build-time guidance gets diluted under task
pressure. The judge gives the build agent a final, structured chance to
catch violations the build skill warned about but the agent "forgot"
mid-implementation.
