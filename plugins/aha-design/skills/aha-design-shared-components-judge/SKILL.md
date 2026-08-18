---
name: aha-design-shared-components-judge
description: "Authoritative judge / verdict-giver for whether AhaSlides product-UI code reaches for the canonical shared primitive instead of rolling its own — the evaluation counterpart to aha-design-shared-components (the build skill). Use whenever an agent reviews, audits, scores, critiques, or self-checks code that should reuse a house primitive: a PR diff that shows an inline field/validation error, a screen-reader live region, a progress indicator, a mobile-vs-desktop layout swap, a full-page error, an empty state, or a loading skeleton — or the self-check that should run after building one of those. Emits a binary PASS / FAIL verdict per criterion (no partial credit) across the registry rules — (C1) the code reaches for the canonical registry primitive (FieldErrorDisplay / a11y FieldError, LiveRegion, Progressbar, ErrorPage, AntD Empty, layout-mirroring skeleton) instead of a hand-rolled reimplementation; (C2) the correct field-error component is chosen per context (FieldErrorDisplay for respondent renderers, a11y FieldError for AntD forms) with aria-invalid + aria-describedby wired to its id; (C3) responsive shape switches use useIsMobile() while pure styling uses @media (max-width: 767.98px) directly; (C4) the accessibility house rules are honoured (live regions stay mounted + assertive/atomic, Progressbar carries role=progressbar + aria-valuenow/min/max + aria-label, skeletons carry role=status + aria-busy, visible text is wrapped in AntD Typography). Burden of proof is on PASS: a hand-rolled primitive you cannot justify is a FAIL. Trigger on phrases like 'review this field error', 'did they roll their own primitive', 'judge my shared-component usage', 'check useIsMobile responsiveness', 'audit the live region', 'is this the right field-error component', 'self-check after building a field error / empty state / skeleton', 'review this progressbar', 'audit this error page'. Do NOT trigger for BUILDING/choosing a primitive in the first place (use aha-design-shared-components), for modals/drawers/popovers (use aha-design-overlays), for toasts or correct/incorrect result panels (use aha-design-feedback), for the paywall/upsell (use aha-design-paywall), or for settings/options surfaces (use aha-design-settings)."
---

# Judging shared-component reuse

This skill is the **judgment counterpart** to `aha-design-shared-components` (which
guides building the same code). Reach for it when reviewing finished product-UI code — a
PR diff, a code-review request, or a self-check at the end of a build — to decide whether
the code reached for the canonical house primitive instead of rolling its own. Don't reach
for it while building — use `aha-design-shared-components` for that.

> **Scope.** The cross-cutting primitives most product UI needs: accessible field/
> validation errors, screen-reader live regions, progress indicators, the `useIsMobile()`
> responsive shape switch, full-page `ErrorPage`, the AntD `Empty` empty-state pattern, and
> loading skeletons. It is **not** for surfaces a dedicated skill owns — overlays/drawers
> (`aha-design-overlays`), toasts and correct/incorrect result panels
> (`aha-design-feedback`), the paywall (`aha-design-paywall`), or settings
> (`aha-design-settings`).

---

## The rule being judged

From `aha-design-shared-components`:

> **Reach for the existing component instead of writing a new one** — a fresh-but-correct
> reimplementation still fragments the design system and drops house conventions (ARIA
> wiring, i18n, AntD `Typography` wrappers, the canonical breakpoint).

A hand-rolled node is a **FAIL even when it looks correct**. The whole point of the
registry is that the primitives already encode the accessibility and responsiveness
contracts; a bespoke reimplementation re-derives them and drifts. The judge must **fail** a
rolled-own primitive and **pass** only genuine reuse of the canonical component/hook.

**The registry (reach for these):**

| Need | Canonical primitive |
|---|---|
| Inline field error (respondent renderers) | `FieldErrorDisplay` |
| Validation error (AntD form fields) | a11y `FieldError` |
| Screen-reader announcements | a11y `LiveRegion` |
| Accessible progress | a11y `Progressbar` |
| Viewport shape switch (< 768px) | `useIsMobile()` |
| Full-page respondent error | `ErrorPage` |
| Empty state | AntD `Empty` pattern |
| Loading placeholder | layout-mirroring skeleton |

---

## How to use

1. **Find every place in the diff/code** that implements a need the registry already
   covers: an inline field/validation error, a screen-reader announcement, a progress
   indicator, a mobile-vs-desktop layout swap, a full-page error, an empty state, or a
   loading placeholder.
2. **Read the target rules from the build skill** — `aha-design-shared-components/SKILL.md`
   §1–§5 — for the exact component/hook names and their ARIA/i18n contracts. Don't judge
   from memory; diff against the registry.
3. For each criterion below, gather evidence, decide **PASS** or **FAIL**, and capture a
   1-line piece of evidence (`file:line` where possible).
4. **Emit the verdict report** using the exact template at the bottom — same shape every
   time so reviewers can scan it.

**The universal FAIL rule.** If the code implements a registry need by hand instead of
reaching for the canonical primitive, or violates any of that primitive's contracts in
`aha-design-shared-components`, the criterion it belongs to is a **FAIL** — automatically,
no exceptions. "It works," "it's basically the same," and "it wasn't in the examples" are
not exemptions. The registry binds everywhere.

**Why binary, no partial credit.** The code either reaches for the canonical primitive with
its contract intact or it doesn't — "mostly reused" is a polite FAIL. Half-credit invites
endless argument about whether a bespoke node is 60% or 70% faithful. Binary keeps the
judge consistent across reviewers and runs.

**Burden of proof is on PASS.** Some contracts can't be confirmed from static markup — a
live region's "stays mounted when empty" needs the empty-state render, a field's
`aria-describedby` wiring needs both nodes in view. If you cannot verify a criterion, mark
**FAIL** and say why in the notes; don't wave it through. Pretending unclear code passes is
how hand-rolled primitives creep back into a registry-first product.

---

## The 4 criteria

### C1. Reaches for the canonical registry primitive, not a hand-rolled one → PASS / FAIL

**Rule.** A need the registry covers is met by its canonical primitive — inline field
error → `FieldErrorDisplay` (respondent renderers) or a11y `FieldError` (AntD forms);
screen-reader announcement → a11y `LiveRegion`; progress → a11y `Progressbar`; full-page
respondent error → `ErrorPage` (error code → i18n title/body, `role="alert"`, telemetry);
empty state → the AntD `Empty` pattern (strong title + secondary body, actions in a `Space`,
secondary then `type="primary"`); loading placeholder → a layout-mirroring skeleton. A
fresh reimplementation of any of these — even a correct one — **fails here**.

✅ **GOOD**

```tsx
<LiveRegion message={announcement} />          {/* canonical a11y primitive */}
<Progressbar value={n} min={0} max={total} label={t('progress.label')} />
if (isError) return <ErrorPage code={code} onRetry={retry} />;
```

❌ **BAD**

```tsx
<div aria-live="assertive">{announcement}</div>   {/* rolled-own live region */}
<div className="progress"><div style={{ width: `${pct}%` }} /></div>  {/* ad-hoc bar */}
{isError && <div className="error-page">{t('generic.error')}</div>}   {/* not ErrorPage */}
```

**Common failure modes (any one → FAIL):**
- A hand-rolled `<div aria-live>` / `role="alert"` node instead of `LiveRegion` or the
  field-error component.
- A bespoke progress bar instead of the a11y `Progressbar` wrapper.
- A custom full-page error instead of `ErrorPage` (loses the code → i18n map and telemetry).
- A bespoke empty state instead of the AntD `Empty` pattern (missing the title/body/`Space`
  action structure).
- A spinner or arbitrary block instead of a **layout-mirroring** skeleton.
- **Unverifiable:** you can't tell whether the canonical primitive was used → FAIL + note.

---

### C2. Correct field-error component chosen and wired → PASS / FAIL

**Rule.** Two field-error components exist on purpose — choose by context.
`FieldErrorDisplay` in respondent element renderers (assertive `role="alert"`,
`aria-live="assertive"`, renders the i18n `messageKey` + interpolation); a11y `FieldError`
in AntD-form contexts (stable `id`, wraps `Typography.Text type="danger"`, returns `null`
when empty). Either way the input sets `aria-invalid` and `aria-describedby` points at the
error component's `id`. **FAIL** on the wrong component for the context, or on a missing
`aria-invalid` / `aria-describedby` wiring.

✅ **GOOD**

```tsx
// respondent renderer
<input aria-invalid={!!error} aria-describedby="q3-err" />
<FieldErrorDisplay id="q3-err" messageKey={error} />

// AntD form
<Input aria-invalid={!!msg} aria-describedby="email-err" />
<FieldError id="email-err" message={msg} />   {/* null when empty */}
```

❌ **BAD**

```tsx
<Input status="error" />
<span className="err">{msg}</span>             {/* hand-rolled; no id, no aria-describedby */}

<FieldErrorDisplay id="email-err" messageKey={msg} />  {/* wrong component in an AntD form */}
```

**Common failure modes (any one → FAIL):**
- A hand-rolled `<span>`/`<p>` error node instead of either canonical component (also C1).
- `FieldErrorDisplay` used in an AntD form, or a11y `FieldError` used in a respondent
  renderer.
- The input missing `aria-invalid`, or `aria-describedby` not pointing at the error's `id`.
- **Unverifiable:** the input and error node aren't both in view to confirm the wiring →
  FAIL + note.

---

### C3. Responsive shape switches use `useIsMobile()`; pure styling uses the media query → PASS / FAIL

**Rule.** A render that genuinely changes *shape* below 768px (table → card list, sidebar →
drawer) is gated on `useIsMobile()`. **Pure CSS styling must use
`@media (max-width: 767.98px)` directly** — never gate styling through the hook, and never
invent an ad-hoc breakpoint. The canonical breakpoint is `767.98px` (avoids a sub-pixel gap
at fractional DPR). **FAIL** on an ad-hoc breakpoint for a shape switch, on the hook used to
gate pure styling, or on a raw/wrong media-query value.

✅ **GOOD**

```tsx
const isMobile = useIsMobile();
return isMobile ? <CardList data={rows} /> : <Table data={rows} />;  // shape switch
```
```css
.toolbar { gap: 16px; }
@media (max-width: 767.98px) { .toolbar { gap: 8px; } }   /* pure styling */
```

❌ **BAD**

```tsx
const isMobile = useMediaQuery('(max-width: 600px)');  // ad-hoc breakpoint
```
```tsx
if (useIsMobile()) el.style.padding = '8px';   // hook gating pure styling
```
```css
@media (max-width: 768px) { … }   /* wrong value — sub-pixel gap at fractional DPR */
```

**Common failure modes (any one → FAIL):**
- A shape switch gated on an ad-hoc `useMediaQuery`/`window.innerWidth` check instead of
  `useIsMobile()`.
- `useIsMobile()` used to drive pure styling that belongs in a media query.
- A media query at `768px`, `767px`, or another value instead of `767.98px`.

---

### C4. Accessibility house rules honoured → PASS / FAIL

**Rule.** The primitives' a11y contracts hold: `LiveRegion` is `aria-live="assertive"` +
`aria-atomic="true"`, has **no** `role="alert"` (avoids a double-announce), and **stays
mounted when empty** so screen readers track updates; `Progressbar` carries
`role="progressbar"` + `aria-valuenow`/`aria-valuemin`/`aria-valuemax` + `aria-label`;
loading skeletons carry `role="status"` + `aria-busy`; visible text is wrapped in AntD
`Typography` (`Text`/`Paragraph`/`Title`), not raw `<span>`/`<p>`, and state is never
conveyed by colour alone (pair every status colour with text or an ARIA label). **FAIL** on
any missing/incorrect attribute, a live region unmounted when empty, a `role="alert"` on
the live region, or visible text in a raw tag.

✅ **GOOD**

```tsx
<LiveRegion />                                  {/* stays mounted; assertive + atomic, no role=alert */}
<Progressbar value={n} min={0} max={total} label={t('quiz.progress')} />
<div role="status" aria-busy>{skeleton}</div>
<Typography.Text>{label}</Typography.Text>
```

❌ **BAD**

```tsx
{msg && <div aria-live="assertive" role="alert">{msg}</div>}  {/* unmounts empty; double-announce */}
<div className="bar" style={{ width: pct }} />                 {/* no role/aria-value* */}
<div className="skeleton" />                                   {/* no role=status / aria-busy */}
<span>{label}</span>                                          {/* raw tag, drops theme tokens */}
```

**Common failure modes (any one → FAIL):**
- Live region unmounted when empty, or given `role="alert"`, or missing `aria-atomic`.
- `Progressbar` missing `role="progressbar"`, any `aria-valuenow/min/max`, or `aria-label`.
- Skeleton missing `role="status"` or `aria-busy`.
- Visible text in raw `<span>`/`<p>` instead of AntD `Typography`.
- State conveyed by colour alone with no paired text/ARIA label.

---

## Verdict report (emit exactly this shape)

```markdown
# Shared-components judge report — <surface name or file path>

| # | Criterion | Verdict |
|---|---|---|
| C1 | Reaches for the canonical registry primitive, not hand-rolled | ✅ PASS / ❌ FAIL |
| C2 | Correct field-error component chosen and wired | ✅ PASS / ❌ FAIL |
| C3 | Shape switches use useIsMobile(); styling uses @media 767.98px | ✅ PASS / ❌ FAIL |
| C4 | Accessibility house rules honoured | ✅ PASS / ❌ FAIL |

**Overall: OK TO SHIP / NEEDS FIX**

## Fails

### ❌ C1 — Reaches for the canonical registry primitive
**Where:** `src/quiz/Progress.tsx:22`
**Evidence:** a bespoke `<div className="progress"><div style={{ width }} /></div>` bar
instead of the a11y `Progressbar` — drops `role="progressbar"` and the `aria-value*` set.
**Fix:** replace with `<Progressbar value={n} min={0} max={total} label={…} />`.

## Passes — brief

C2, C3, C4 — right field-error component, canonical breakpoint, a11y contracts intact.

## Notes / unverifiable

- (List anything judged under uncertainty — e.g. "couldn't confirm the LiveRegion stays
  mounted when `message` is empty without the empty-state render; marked FAIL per
  burden-of-proof.")
```

**Overall verdict rule:** any FAIL → `NEEDS FIX`. All PASS → `OK TO SHIP`.

Always include: the 4-row verdict table (in order); a `## Fails` section with a sub-section
per failed criterion (**Where** `file:line`, **Evidence** 1 line, **Fix** concrete action);
a 1-line `## Passes — brief`; and a `## Notes / unverifiable` section whenever a judgment was
made under uncertainty.

---

## When NOT to use this skill

- **Building / choosing** a primitive in the first place → use
  `aha-design-shared-components` (the build skill). This judge evaluates finished work.
- **Modals, drawers, popovers** → use `aha-design-overlays`.
- **Toasts and correct/incorrect result panels** → use `aha-design-feedback`. (This judge
  owns *field-validation* errors and *live-region* announcements — those are a11y
  primitives, not feedback.)
- **Paywall / upsell** affordances → use `aha-design-paywall`.
- **Settings / options** surfaces → use `aha-design-settings`.

---

## Closing the build → judge → fix loop

This judge runs at the **end** of a build pass — by a human reviewer or by the build agent
as a self-check. The expected loop:

1. Build with `aha-design-shared-components` → produces code that should reuse a primitive.
2. Invoke this judge → emits the verdict report.
3. Any FAIL → fix the specific files cited under `## Fails` → re-invoke this judge.
4. Repeat until the verdict is `OK TO SHIP`.

Build-time guidance gets diluted under task pressure — an agent reaches for the registry on
the first field but hand-rolls the second, or drops `aria-atomic` off a live region. The
judge gives a final, structured chance to catch exactly the drift the build skill warned
about but the agent dropped mid-implementation.
