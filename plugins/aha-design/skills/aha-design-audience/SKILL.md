---
name: aha-design-audience
description: "Authoritative design guide for the AUDIENCE side of AhaSlides slide-type plugins — what the audience sees inside their own browser when they join via app.ahaslides.com/join/<code>. Counterpart to aha-design-canvas (which handles the presenter projector view). Use whenever an agent designs, builds, or styles the audience-facing iframe of a slide-type plugin: layout, theme binding, input UI (tap-to-vote, multi-select, text input, scale slider, drag), submitted / waiting / correct-incorrect feedback, host utility integration (toast, bottom-sheet modal, sticky 'scroll to submit', countdown timer), height reporting via onHeightChange, framed vs full-canvas decision in the plugin manifest. The audience iframe is a SEPARATE entry from the canvas — declared via the manifest's audienceUrl (not canvasUrl), loaded at a separate route, rendered by a separate page; same plugin repo but separate entry files. Mobile-first, single column, height reported via onHeightChange. Theme propagation is a subset of canvas — only presentationColorPalette + presentationLighterColorPalette, textColour, fontFamily, presentation.language reach the audience iframe (no baseColour, no backgroundImage, no host CSS variables like --aha-*). Semantic state colours (correct/incorrect, success/error, warning, info) must be bundled into the plugin's own build via the AhaSlides design-system package — same approach as the canvas skill, so the audience sees the same success-green and error-red the presenter canvas would show. Trigger on phrases like 'build audience UI for a slide type', 'design audience view for poll / quiz / word cloud / idea board', 'audience iframe layout', 'mobile slide for AhaSlides audience', 'how audience submits a vote', 'after-submit feedback for audience', 'audience-side post-submission UX', 'show waiting state to audience', 'render correct/incorrect to audience'. Do NOT trigger for the presenter slide canvas (use aha-design-canvas), the editor right-panel (use aha-design-settings), or modal/popover patterns owned by other surfaces (use aha-design-overlays)."
---

# Designing a slide type for the audience iframe

This skill is about the **audience-facing** iframe of a slide-type plugin — what
the audience sees in their own browser when they join via
`app.ahaslides.com/join/<code>`. It's the **counterpart** to
`aha-design-canvas` (which is for the presenter canvas / projector view).

A plugin declares **three separate URLs** in its manifest (`canvasUrl`,
`editorUrl`, `audienceUrl`); each URL is its own entry page. **This skill
targets the `audienceUrl` entry, only.** Don't write
`if (audience) mobile else canvas` in one shared component — the host loads
completely separate pages for each context. Same plugin repo, separate entry
files.

### Out of scope — handed off to sibling skills

This skill is the **orchestrator** for the audience iframe layout, theme,
state flow, and submit-button spec. When the work zooms into a specific
element type, hand off:

| When you're working on… | Hand off to |
|---|---|
| The **presenter slide canvas** (projector view) | `aha-design:aha-design-canvas` |
| The **editor right-panel** (settings the presenter sees) | `aha-design:aha-design-settings` |
| **Icons** — picking a glyph, sizing, stroke, accessibility (a ✓ icon on submit, a 🏆 trophy for leader, etc.) | `aha-design:aha-design-icons` |
| **Custom modals / popovers** beyond the host's `openPluginModal` bottom-sheet | `aha-design:aha-design-overlays` |
| **Toast / inline post-action feedback** styling beyond just calling `showToastSuccess` (e.g. designing a custom inline correct/incorrect banner) | `aha-design:aha-design-feedback` |
| **Copy / microcopy / tone of voice** — button labels, prompts, empty-state copy, error messages, helper text | the `aha-branding` plugin (tone of voice rules) — and for clarity/conciseness fixes, `impeccable:clarify` |
| **Plan-gated / pro-only features** on the audience side (e.g. a "submit answer" gated on the host's plan) | `aha-design:aha-design-paywall` |
| **Shared UI primitives** (field-validation errors, accessible live-region announcements, loading skeletons, empty states) | `aha-design:aha-design-shared-components` |

This skill stays focused on the audience-iframe contract (layout, theme,
states, submit, host-utility integration). For every "how should THIS
specific element look?" question, the answer almost always lives in one of
the sibling skills above — load it and follow.

---

## How the host talks to an audience plugin

The audience plugin runs in its **own iframe** in the audience-app (separate
document, separate bundle). It reads host state via `window.xprops` — same
Zoid model as the canvas plugin, **but the host forwards a smaller subset** to
the audience iframe.

**Theme tokens / raw materials forwarded to the audience iframe:**

| `window.xprops` path | What it is |
|---|---|
| `xprops.slide.textColour` | Primary text colour |
| `xprops.presentation.fontFamily` | Deck's font |
| `xprops.presentation.language` | Deck's locale code |
| `xprops.presentationColorPalette` | Accent palette — array of CSS colour strings |
| `xprops.presentationLighterColorPalette` | Lighter-shade palette sibling |
| `xprops.currentUser.presenterLanguage` | Fallback locale |

**NOT forwarded** (don't expect them):
- `baseColour` — you choose your own background. The deck's background colour
  does NOT propagate to the audience iframe.
- `backgroundImage` — never reaches the audience iframe. Don't try to render
  the deck's background photo here.
- Any AntD semantic token, any host CSS variable. `--aha-colorSuccess` and
  friends do not exist inside this iframe.

**Host UI utilities the plugin can opt into** (host renders them outside the
iframe):

| Utility | Use it for |
|---|---|
| `showToastInfo` / `showToastSuccess` / `showToastError` | Transient feedback ("Vote received") — host renders the toast outside the iframe |
| `openPluginModal` / `closePluginModal` | Bottom-sheet modal — host renders the chrome, your slot is the body |
| `onSubmitButtonHeightChange(h)` | Tell the host the y-offset of your submit button so it paints a sticky "Scroll to submit" pill at the bottom |
| `timeLimit` countdown | Host provides the number; you render it inside the iframe wherever fits |
| `scrollTo(y)` / `getWindowHeight()` | Layout helpers |
| `onHeightChange(h)` | **Required** — report your content height so the host shrink-wraps the iframe |

**The plugin author builds their own input components.** There is no shared
UI kit injected into the iframe — no `<TapToVoteButton>`, `<MultiSelectChip>`,
`<ScaleSlider>` etc. ship across the iframe boundary. The host's primitives
(`AhaCheckbox`, `AhaRadio`, etc.) live in the host app and run only there.
Build your own with your stack — but **paint them with the palette / textColour
/ fontFamily the host hands you** so they look native to AhaSlides.

---

## How to use this skill

Each section below is a design rule. Apply them when designing the
audience-facing slide UI. The pre-ship checklist at the end is the explicit
pass/fail; the sister judge skill (`aha-design-audience-judge`) emits a
binary verdict report you can iterate against.

---

## 1. Shape — mobile-first, single column, height-by-content

The audience iframe lives in a vertical mobile-first column.

- **Width**: host enforces a max-width (~710–840px in framed mode). You don't
  need to set or fight it — just be fluid up to that cap.
- **Height**: report via `onHeightChange(h)` whenever your content changes
  size. The host shrink-wraps the iframe to your reported height. Wrong
  reports = visible scrollbar inside the iframe or empty padding around it.
- **One column.** Don't lay out side-by-side panels — audience phones are
  narrow. Stack vertically: question on top, answer area beneath, action
  feedback after.
- **No fixed pixel heights** that assume a specific device. Use `min-height`
  for affordance and let content drive total height.
- **No horizontal scroll** at any width. Test at the narrowest phone width
  (~320px) — anything wider than that should fit without overflow.
- **Cold-start handling** — during the brief moment before `window.xprops`
  is populated (Zoid handshake), do NOT render the full UI with hex
  fallback colours. A hex-fallback flash that switches to the deck's real
  palette when xprops loads creates visible drift the audience perceives
  as a glitch. Instead, guard the colour-bearing UI behind a `themeReady`
  check (`!!textColour && palette.length > 0`) and render a neutral
  **skeleton placeholder** while waiting — `color-mix(currentColor X%,
  transparent)` blocks for option rows, timer pills, and the submit
  button work well. The only literals the skill explicitly allows are
  `#FFFFFF` for the audience surface (since `baseColour` isn't forwarded)
  and `'Plus Jakarta Sans'` for the font fallback.
- **Mobile readability — match native sizes, don't drift.** Built-in
  AhaSlides slide types use a specific type scale, and plugins should match
  it so a deck mixing built-ins and plugins reads as one experience. Use
  these values exactly (not "at least"):
  - **Body / option / button label**: `14px`
  - **Help text / captions / secondary**: `12px`
  - **Question / header**: `22px` bold (typically host-painted in framed
    mode — plugin doesn't set this)
  - **Form input** (`<input>` / `<textarea>`): `16px` — this single
    exception dodges the iOS auto-zoom-on-focus
  - **Line-height for body**: `1.5`

  Font defaults to `xprops.presentation.fontFamily` with **`'Plus Jakarta
  Sans'`** as the fallback when the deck hasn't set one. Spacing follows
  a multiple-of-8 rhythm (8 / 16 / 24) so the layout feels grounded.

---

## 1a. Transforms and bounded scrolling stay inside the reported box

`onHeightChange` reports your **resting** layout box. Two things routinely
escape that box and get clipped by the host iframe — because the host
shrink-wraps the iframe to the height you reported and paints nothing outside
it.

- **A transform that paints outside the box.** A swipe tilt, a drag ghost, a
  hover pop, a settle bounce (`rotate`, `translateY(-n)`, `scale(>1)`) lifts a
  corner *above* the reported top (or past a side), and the iframe clips the
  overhang. You reported the resting height, not the tilted one. So **budget
  the headroom the transform needs and keep the transform small enough to live
  inside it.** Prefer a cheap cap that costs zero downward shift — e.g. an 8°
  swipe tilt instead of 12° raises the leading corner far less — plus a few px
  of headroom above the card, over a bigger transform that would force a taller
  reported box and push the content down. Rule of thumb: the transformed
  element's bounding box, at its most extreme animation frame, must still fit
  within the height you report.

- **A card that scrolls internally.** The default is "no inner scroll — let the
  host shrink-wrap" (see §1). The **one sanctioned exception** is a *bounded*
  card: a fixed-size swipe / flash / reveal card that must stay one screen and
  therefore can't grow to fit a long question. Such a card MAY scroll its own
  overflowing content — the card itself stays a fixed box, the iframe still
  shrink-wraps to it, and there is **no page-level scroll**. When it scrolls it
  MUST show a **fade cue** so the audience knows there's more:
  - Fade the top and/or bottom edge — whichever direction still has hidden
    content — and drop the fade entirely when everything fits.
  - Fade with a **CSS `mask-image`**, **never a coloured gradient overlay.**
    The audience surface has no forwarded `baseColour`, so a coloured fade
    can't match an unknown deck background — it would show as a grey smear on
    the wrong surface. A `mask` fades the content to true transparency, so it
    works on any deck background.

  ```css
  /* fade whichever edge still has hidden content; none when it all fits */
  .bounded-card__scroll {
    overflow-y: auto;
    --fade: 24px;
    -webkit-mask-image: var(--mask, none);
            mask-image: var(--mask, none);
  }
  /* --mask is set reactively from scrollTop / scrollHeight, e.g.
     both edges hidden →
     linear-gradient(transparent 0, #000 var(--fade),
                     #000 calc(100% - var(--fade)), transparent 100%) */
  ```

---

## 1b. Swipe / drag gestures must stay smooth (60 fps)

A card the audience drags or flings — a Tinder-style swipe, a draggable token,
a slider thumb — re-renders every frame while it moves. Two things make that
feel laggy on a real phone; both cost re-open rounds on the True/False swipe
card ("swipe sang xong bị giật lại" = a fast swipe that springs back).

- **Don't leave an expensive continuous effect on the moving element.** A
  `backdrop-filter: blur()`, a large `box-shadow`, or any `filter` on the
  dragged element forces the browser to **re-sample it every frame** — the
  single biggest cause of a janky swipe. **Drop the effect while the element is
  moving and restore it when it settles.** Track a `moving` flag
  (`dragging || flinging || springing-back`) and null the blur / shadow out
  while it's true. Animate **only compositor properties** — `transform` and
  `opacity`, never `width` / `height` / `top` / `left` / `margin` (they
  relayout every frame). Put `will-change: transform` on the moving element.

- **Commit on velocity, not distance alone.** If the card only commits when the
  drag passes a fixed *distance* threshold, a fast **flick** that hasn't
  travelled far springs back — which reads as "the swipe didn't work / it's
  laggy." Track pointer velocity (px/ms across `pointermove`s) and commit when
  the gesture passes **either** the distance threshold **or** a flick-velocity
  threshold in that direction, so a quick natural flick flings instead of
  bouncing back.

```js
// Drop the per-frame-expensive blur while the card moves; restore on settle.
const cardMoving = computed(() => dragging.value || flinging.value || resetting.value)
// :style => ...(cardMoving.value ? { backdropFilter: 'none' } : { backdropFilter: 'blur(16px)' })

// Commit on distance OR a quick flick.
const dt = e.timeStamp - lastMoveTime
if (dt > 0) velocityX = (e.clientX - lastMoveX) / dt          // px/ms, signed
const commit = Math.abs(dragX) > SWIPE_THRESHOLD
  || (Math.abs(velocityX) > FLICK_VELOCITY && Math.abs(dragX) > 24)
```

---

## 2. Theme — palette for chart, bundle semantic for state

The same two-jobs split as the canvas skill applies, with the constraint that
the audience iframe receives **less theme**.

**Job 1 — chart / visualization layer.** Bar fills, ring segments, plot dots,
selection highlights. These carry magnitude/proportion. Pull from
`xprops.presentationColorPalette` (or `presentationLighterColorPalette`) so the
chart feels native to the deck's brand. Pick the shade that contrasts against
your chosen background (saturated on light, lighter on dark).

**Job 2 — state indicator layer.** Submitted ✓, error ✗, correct / incorrect for
a quiz, validation warning. State colours must **not depend on the deck's
palette** — a palette without a usable red/green would silently lose the
meaning. Bundle semantic state tokens into the plugin's own build — same
approach as the canvas skill, so the audience sees **the same success-green
and error-red the presenter canvas would show**. Visual consistency across
canvas and audience matters: a "correct answer" on the projector must read as
the same "correct" on the phone.

| Token | Where it goes |
|---|---|
| `colorSuccess` | ✓ icon, "submitted" badge, correct-answer indicator |
| `colorError` | ✗ icon, validation error, incorrect-answer indicator, destructive |
| `colorWarning` | caution, "are you sure?" prompt body |
| `colorInfo` | informational note |

**Use the actual FUNCTION token, not a lookalike brand accent.** `colorSuccess`
(#16C49A), `colorError` (#F5222D), `colorWarning`, `colorInfo` are the semantic
*functions*. A bright brand accent that merely *looks* green/red — Bright Teal
`#20E8B5` used as a "correct" tick — is wrong: it isn't the success function, and
a light accent like that fails contrast on the phone's light surface (Bright Teal
on white is ~1.58:1). And even the correct `colorSuccess` on a light surface is
only ~2.23:1 — below the 3:1 mark floor — so put a light success/error glyph on a
bounded fill (a filled badge with a white ✓), not straight onto a light background.

**Why bundled, not derived from the host.** No host CSS vars cross the iframe
boundary. The host doesn't forward semantic colours via xprops. AntD's
`useToken()` is a React+v5 API not available here. → Plugin imports semantic
tokens from the AhaSlides design-system package into its own build (consult the
design-system team for the exact package name).

**`textColour` is for text, not borders.** Bind body text to
`xprops.slide.textColour`. **Don't** use `textColour` directly as a border /
divider / hairline source — that paints ornament at body-type intensity.
Borders should be subtle hairlines: `color-mix(in srgb, currentColor 10%,
transparent)` derives from inherited text colour at 10% intensity and stays
theme-aware.

**You choose your own background.** No `baseColour` is forwarded.
Recommended defaults:
- white / very light surface for most audience UIs (works on both light and
  dark presenter decks)
- alternatively, derive a surface from the luminance of `textColour` (light
  text → dark surface; dark text → light surface)

### 2a. Visual restraint — three tells that read as "AI-generated"

Same three tells as the canvas skill, on the phone. Avoid all three:

- **No pastel wash under same-hue ink.** Don't pair a pastel/tinted background
  with icon + text in the *same* hue. A chip at `color-mix(in srgb, <accent> 14%,
  white)` with `<accent>`-coloured text reads monotone, low-contrast, and "AI".
  Bind ink to `xprops.slide.textColour` (which tracks and contrasts), or pair a
  tint with genuinely high-contrast ink and a clear hierarchy — not one hue at
  two brightnesses.
- **Corner radius tops out at 8px.** Content containers — option tiles, cards,
  the submit button — use **≤ 8px** (the submit-button spec already lands at 8px).
  `rounded-2xl` / `rounded-3xl` / `border-radius: 20px` on a box reads toy-like.
  Intentionally circular elements — pills, chips, badges, avatars, dots, progress
  tracks/fills — stay fully rounded; the cap is for rectangular containers.
- **No extra-bold weight.** Text uses weight **400 or 600 only** (the standard
  submit button is 600). Heavy weights — `font-extrabold` / 800, `font-bold` /
  700, `font-black` / 900 — read heavy and "AI"; a count or heading at 800 is the
  classic tell.

---

## 2b. Text economy — say it once, in plain body text

The audience surface is a phone held at arm's length mid-presentation. Every
word competes with the controls for the one glance you get. Two rules:

- **Don't label a control with text the control already states.** If the two
  choices are already on labelled buttons ("True" / "False"), a header that
  restates them ("True or False") and a connective word between them ("OR") add
  nothing — the buttons *are* the prompt, and a binary choice is self-evidently
  "one or the other". Delete any label, header, or divider that merely repeats
  an adjacent control. A word earns its place only if it says something the
  controls don't.
- **Micro-instructions are the shortest possible phrase, in plain body text,
  never wrapped in a highlighted container.** A hint like "Tap or swipe to
  answer" is one quiet line of **body-size** text in **muted deck ink**
  (`color-mix` the deck ink down to ~60%) — not a full-width pill, a tinted
  card, a shadowed chip, or a button-shaped box. Prominent chrome makes the
  *instruction* compete with the *controls* it's describing; keep it a whisper.
  Prefer the shortest wording ("Tap or swipe to answer", not "Tap your answer
  — or swipe it").

```vue
<!-- ❌ BAD — a redundant "OR" divider between two already-labelled buttons, -->
<!--         and the idle hint wrapped in a full-width, tinted, shadowed pill. -->
<div class="absolute inset-0 flex items-center justify-center">
  <span class="rounded-full px-3 font-black uppercase tracking-widest shadow-aha-md"
        :style="{ background: ahaBrand.white, color: accents.ink }">
    {{ labels.orDivider }}          <!-- "OR" — the buttons already say True / False -->
  </span>
</div>
<div class="flex w-full items-center justify-center rounded-full font-bold"
     :style="{ height: OPTION_ROW_HEIGHT, background: cardSurface(ahaBrand.purple, 8), color: ahaBrand.purple }">
  {{ statusText }}                  <!-- "Tap your answer — or swipe it" in a pill -->
</div>
```
```vue
<!-- ✅ GOOD — no OR divider, no restating header: the two labelled buttons ARE -->
<!--          the prompt. The instruction is ONE short body-text line, no box. -->
<button ...>{{ displayTrue }}</button>
<button ...>{{ displayFalse }}</button>
<div class="flex items-center justify-center" aria-live="polite" data-testid="tof-hint">
  <span v-if="phase === 'idle'" class="font-semibold"
        :style="{ fontSize: BODY_TEXT, color: ink(62) }">
    {{ labels.tapOrSwipe }}         <!-- shortened: "Tap or swipe to answer" -->
  </span>
</div>
```

---

## 3. Framed vs full-canvas — declare in the manifest

`setting.enableFullScreen` in the plugin manifest (same field as the canvas
skill — applies to both contexts):

- **Framed (default)** — host renders the question image, title, description,
  audio button, and countdown progress *above* your iframe. Your iframe owns
  the answer area only. Choose this for most slide types — it keeps the
  audience experience consistent across decks.
- **Full-canvas** (`enableFullScreen: true`) — host hides its chrome. You
  render the entire surface, including the question title. Choose this only
  when the slide type needs a bespoke header (an intro slide, a branded
  reveal, a fullscreen quote).

Make the choice **explicit in the manifest**. Mixed mode (framed + your own
title) duplicates the host's title and looks broken.

---

## 4. Plugin self-renders submitted / waiting / correct-incorrect

For built-in slide types the host shows a generic "Waiting…" screen after the
audience submits. **Plugins do not get that** — your iframe stays mounted, and
**you render** the post-submission UX yourself.

States the plugin must draw inside the iframe:

- **Just submitted** — **call `xprops.showToastSuccess(t('audience.submitted'))`**
  for the "Submitted" notification itself; the host paints a consistent toast
  outside the iframe so every slide type announces submission the same way.
  Don't re-implement your own "Submitted" banner inside the iframe — that
  toast is the canonical signal. After the toast fires, transition the
  iframe content to whatever fits the slide (results bars / quiz feedback /
  waiting state).
- **Waiting for the next slide** — a calm holding state on the same surface.
  Use gentle motion if any; avoid noisy spinners.
- **Quiz correct / incorrect** — pair the semantic colour with a non-colour
  cue (✓ / ✗ icon at minimum, plus the answer text). Bar fills stay in palette
  colour; the indicator carries the state.
- **Pre-submission empty state** — don't show a giant "0" or empty chart;
  that reads as broken. Show the input affordance with placeholder copy
  ("Tap an option to vote").

State transitions must be **smooth**. Re-report height via `onHeightChange`
when the state change legitimately changes content height — but avoid layout
jumps of >16px between adjacent states.

---

## 5. The standard submit button — match the spec, don't import the component

Every built-in audience slide type (OpenEnded, Scale, WordCloud, Ideas, ...)
uses ONE consistent submit-button look from the host design system: the
`aha-antd-button` component in the **"primary-alt" variant**. **That component
does NOT cross the iframe boundary** — plugin authors can't import it. So this
section is "imitation law": you build your own button inside the iframe, but
match the shared spec so the audience experience stays uniform across slide
types.

### Visual spec

- **Full-width** (block) — fills the answer-area horizontally.
- **Height**: roughly finger-sized, ~44–48px — match the touch-target range
  (see §8).
- **Soft rounded corners** — match the deck's button-radius convention (no
  sharp 0px corners, no fully-pill unless that's the deck style).
- **Background colour**: an accent shade pulled from
  `xprops.presentationColorPalette` (or `presentationLighterColorPalette`).
  **Never hard-code a brand colour** — the deck owns its accent. Built-in
  slides use the "primary-alt" variant which paints from the palette.
- **Text**: white on a saturated palette shade (or `currentColor` if the
  palette is light enough to need dark text). Semi-bold weight.
- **Position**: at the end of the answer-area block, with ~16px breathing
  room below (the host may paint a sticky "Scroll to submit" pill above
  this position when you opt in via `onSubmitButtonHeightChange`).

### Interaction states — this is the part that breaks if you skip it

1. **Input not valid** → button **disabled** (lower opacity, no pointer
   cursor, `aria-disabled="true"`). Don't let the user submit until they've
   actually picked / typed something. The disabled visual should still be
   readable, not invisible.
2. **Submitting** → an **inline spinner** appears inside the button. The
   button does **not** disappear, change height, or move; layout must not
   jump. Lock the button while in-flight to prevent double-submit.
3. **Host calls `stopSubmission`** → swap to a **locked state**: lock icon
   + label "submission closed" (via i18n), replacing the submit label.
   Button stays present (so layout doesn't reflow) but is uninteractive.
4. **After submit completes**:
   - **Scored quiz**: swap to a **circular badge** — green ✓ for correct,
     red ✗ for incorrect, using the bundled semantic colours (same source
     as the canvas skill).
   - **Non-scored slide**: trigger `xprops.showToastSuccess(...)` for the
     "Submitted" announcement (consistent across slide types) and
     transition the iframe content to the plugin-rendered "submitted /
     waiting" state. Host doesn't show a wait screen for plugins — you do.

### Secondary actions (Skip, Start voting, ...)

Use a **secondary variant**: lower-contrast background (surface + border,
or a desaturated palette shade), same height, same i18n discipline. The
visual hierarchy must read clearly as "this is the main action; that's a
side option." Don't paint two visually equal buttons — the audience needs
to know what to tap.

### Wiring you must include

- **`onSubmitButtonHeightChange(h)`** — call with the y-offset of the
  submit button so the host can paint the floating "Scroll to submit" pill
  when the button sits below the fold. Without this, users on small phones
  may not see the button.
- **`data-testid`** on every interactive element, kebab-case, scoped to the
  slide type: e.g. `audience-<slidetype>-submit-button`,
  `audience-<slidetype>-option-3`. Lets QA target the button reliably
  across slide types and across releases.
- **Label via `t(...)`** — never hard-coded "Submit" / "Send" / "Vote".
  Text translates per `xprops.presentation.language`.

---

## 6. Host utilities — use them, don't reinvent

Five host utilities are available. Use them instead of building your own
equivalents inside the iframe:

- **Toast** (`showToastInfo` / `showToastSuccess` / `showToastError`) for
  any transient confirmation or lightweight error. **If you need a toast,
  use the host's — never build your own in-iframe banner.** The host
  paints toasts in a consistent visual layer across every slide type, with
  built-in dismiss timing, ARIA announcements, and motion-preference
  handling. Recommended specifically for the "Submitted" notification:
  call `showToastSuccess(t('audience.submitted'))` after every successful
  submit so the audience sees the same confirmation regardless of which
  slide type took the vote.
- **Bottom-sheet modal** (`openPluginModal` / `closePluginModal`) for any
  modal interaction. The host paints the modal chrome; you fill the body. Do
  not build a custom modal overlay inside the iframe — it would render in the
  wrong layer.
- **Sticky "Scroll to submit"** — call `onSubmitButtonHeightChange(h)` with
  the y-offset of your submit button. The host paints a floating pill at the
  bottom that scrolls the user to it. Saves you a sticky-bar implementation.
- **Countdown timer** (`timeLimit`) — `xprops.timeLimit` is the live
  countdown number from the host. **In framed mode the host already paints
  the countdown progress bar in its chrome above the iframe** — your
  plugin should NOT duplicate it with its own pill / widget inside the
  iframe. The `xprops.timeLimit` value is still useful as **logic** (e.g.
  lock the submit button when `timeLimit <= 0`); just don't render a
  second visible countdown.
  - **The host also owns the countdown's EXPIRY notice.** When time runs
    out the host announces it ("Time's up") in its own chrome, outside the
    iframe — the same way it paints the "Submitted" toast (§4). Do **not**
    draw your own "Time's up" / deadline card inside the iframe: it
    double-announces, and being iframe-local it drifts from the host's real
    clock. Let the round-end state your plugin *does* own (the reveal, the
    result) carry the meaning; the deadline itself is the host's to announce.
  - **Full-canvas mode** (rare): the host hides its chrome, so if the
    slide needs a visible countdown, the plugin renders it — bound to the
    live `xprops.timeLimit` value, never to static text or its own
    `setInterval`.
  - **Never** write static time text ("30 seconds", "1 phút", "đếm ngược
    30s") anywhere — description, label, helper text. Static labels drift
    from reality the moment the timer starts ticking.
- **Layout helpers** — `scrollTo(y)`, `getWindowHeight()` for positioning
  affordances within your iframe.

If a feature you want overlaps with one of these utilities, lean toward the
utility — it stays consistent across slide types automatically and the host
can evolve it without each plugin needing changes.

---

## 7. Out of reach — don't reinvent or assume

These are owned by the host. The audience plugin must not try to render them,
and must not assume they're broken if it can't reach them:

- **Edge states**: lost connection, poll closed, kicked from the room, last
  slide, slide skipped — the host overlays its own screen on top of the
  iframe. **Don't draw your own "Disconnected" / "Poll closed" UI** — you'll
  duplicate or conflict with the host overlay.
- **Logo / watermark / branding / plan-gating** — host applies these at a
  layer outside the iframe.
- **Locale source** — locale is `xprops.presentation.language` (presenter's
  choice), NOT the audience's browser. Don't override; just translate.
- **RTL layout flip** — the host does not flip layout direction by language.
  If your slide type needs RTL (Arabic, Hebrew), handle it yourself inside
  the iframe (e.g. `dir="rtl"` on the root, logical CSS).
- **Background**: `baseColour` and `backgroundImage` don't reach the audience
  iframe. The deck's background is invisible from here.

---

## 8. Touch targets + accessibility

- **Touch targets** should be **roughly finger-sized**. AhaSlides codebase
  averages **~44–48px in height**, matching iOS 44pt / Android 48dp standards.
  Treat as a recommended range, not an exact rule.
- **Spacing between tappables**: at least 8px to avoid mis-taps when the user
  is reading at speed.
- **WCAG AA contrast** against your chosen background — 4.5:1 for text, 3:1
  for large text and meaningful shapes. Verify against the **real** background
  you've chosen (since `baseColour` isn't forwarded, you have to make and
  defend that choice).
- **Focus visible** — keyboard users on tablets / laptops still join. Don't
  remove the default focus ring without replacing it.
- **No motion to convey meaning** — fast / subtle motion can be lost on bad
  connections or for `prefers-reduced-motion` users.
- **Non-colour cue paired with every colour-bearing signal** (state, error,
  correct / incorrect, leader). **Prefer icon over verbose chip** — a ✓ / ✗
  reads more cleanly than "Correct" / "Incorrect" text, and stays compact and
  language-neutral.
- **Chart geometry stays honest** — if a row has an indicator only sometimes
  (e.g. leader trophy), reserve a fixed-width slot on every row so all bar
  tracks share the same width. A 55% bar must visually occupy 55%, not 48%
  because the chip ate the difference.

---

## 9. Language — initialise from xprops, never browser

The audience iframe has **its own i18n instance** (separate from host). It
does NOT inherit the host's locale automatically.

- Initialise the plugin's locale from `xprops.presentation.language` at
  startup, with `xprops.currentUser.presenterLanguage` as the fallback.
- Subscribe to host updates if the presenter changes language mid-session
  (`xprops.onPresentationUpdate` or equivalent — verify with the host SDK).
- Format numbers / percentages with `Intl.NumberFormat(locale)` — not
  `.toFixed(...)` + `'%'` (some locales use `,` as the decimal separator).
- All user-visible text via `t(...)` — no hard-coded English in templates,
  buttons, placeholders, aria-labels, or tooltips.

---

## 10. Pre-ship design checklist

- [ ] Layout is single-column, mobile-first, no horizontal scroll at any
      phone width (verified at ~320px)
- [ ] Height reported via `onHeightChange`; no fixed-height container assumes
      a specific device
- [ ] Any transform (swipe tilt, drag ghost, pop, settle bounce) stays within
      the reported box — transform capped, headroom budgeted — so the iframe
      doesn't clip the overhang
- [ ] A draggable / swipeable card stays smooth: expensive effects
      (`backdrop-filter`, big `box-shadow`, `filter`) are dropped while it moves
      and restored on settle; only `transform` / `opacity` animate; a fast flick
      commits on velocity, not distance alone
- [ ] A bounded card that scrolls its own content shows a `mask-image` fade cue
      on the overflowing edge(s) (never a coloured gradient); the card stays a
      fixed box with no page-level scroll
- [ ] All colour and font reads from xprops (`xprops.slide.textColour`,
      `xprops.presentation.fontFamily`, `xprops.presentationColorPalette`,
      `xprops.presentationLighterColorPalette`)
- [ ] Semantic state colours come from a bundled design-system package, NOT
      from the deck palette and NOT from `--aha-*` CSS vars (which don't
      exist in this iframe)
- [ ] Semantic ✓/✗/status marks use the function token (`colorSuccess` /
      `colorError` / …), not a lookalike brand accent — and a light token sits
      on a bounded fill so it clears contrast on the phone surface
- [ ] No pastel background paired with same-hue icon/text (monotone "AI" look)
- [ ] Corner radius ≤ 8px on content containers (pills / bars / avatars may stay
      fully rounded); text weight is 400 or 600 only (no 700 / 800 / 900)
- [ ] Bar / chart fill uses palette; state goes on the indicator (icon /
      badge), not on the chart
- [ ] Non-colour cue paired with every colour-bearing signal — prefer icon
      over word chip
- [ ] Chart geometry stays honest (decorations sit in fixed-width slots or
      positioned overlays, never shrink the row's track)
- [ ] Borders / dividers / hairlines derive from `color-mix(currentColor 10%,
      transparent)` — never from `textColour` directly
- [ ] `setting.enableFullScreen` declared explicitly in the manifest
- [ ] Submitted / waiting / correct-incorrect / empty-state UIs all drawn
      inside the iframe (no expectation that the host takes over)
- [ ] Submit confirmation uses `xprops.showToastSuccess(...)` for the
      "Submitted" notification (consistent across slide types) — NOT a
      custom in-iframe banner
- [ ] **Submit button** matches the spec: full-width, ~44–48px tall, rounded,
      background from palette (not hard-coded), label via `t(...)`,
      `data-testid` in kebab-case
- [ ] **Submit button states wired**: disabled when invalid, inline spinner
      (no layout shift) while submitting, lock icon + closed label on
      `stopSubmission`, post-submit ✓/✗ for scored quizzes or
      submitted/waiting for non-scored
- [ ] `onSubmitButtonHeightChange(h)` called so host can paint the sticky
      "Scroll to submit" pill
- [ ] Touch targets ~44–48px; spacing ≥ 8px between tappables
- [ ] WCAG AA contrast against your chosen background — verified on light
      AND dark deck themes (since you choose your own background, it must
      meet the floor on whatever you picked)
- [ ] Plugin's i18n initialised from `xprops.presentation.language`; numbers
      formatted via `Intl.NumberFormat`; no hard-coded English
- [ ] Edge states (lost connection, poll closed, kicked, slide skipped) NOT
      drawn by the plugin — host handles those overlays
- [ ] Host utilities (toast, bottom-sheet modal, sticky submit, countdown)
      used where they fit — no in-iframe re-implementation

## 11. Self-check before claiming done

After implementing, run the verdict pass via
**`aha-design:aha-design-audience-judge`** — it emits a binary
PASS/FAIL across the same contracts (xprops theme tokens, bundled semantic
state colours, chart-vs-indicator separation, mobile-first single column,
height reporting, host utility usage, plugin self-rendered states,
framed-vs-full-canvas, i18n initialised from xprops) with a structured
`Where / Evidence / Fix` block for each failure. Fix every FAIL, re-judge,
and only declare the work done when the verdict reads `OK TO SHIP`.
