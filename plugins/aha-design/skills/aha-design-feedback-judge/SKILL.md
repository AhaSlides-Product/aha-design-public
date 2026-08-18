---
name: aha-design-feedback-judge
description: "Authoritative judge / verdict-giver for transient and post-action feedback UI in AhaSlides product code — the evaluation counterpart to aha-design-feedback (the build skill). Use whenever an agent reviews, audits, scores, critiques, or self-checks a feedback surface: a PR diff that ships a toast/notification, an inline correct/incorrect result panel, a CSAT thumbs widget, or an inline Alert banner, plus the 'did I put this in a toast when I shouldn't have?' question. Emits a binary PASS / FAIL verdict per criterion (no partial credit) across 5 criteria — (C1) toasts are transient bottom-right pills, ~3s auto-dismiss with the timer cleared on unmount, carry role=status, and are portalled to document.body to escape transformed/overflow ancestors; (C2) inline post-answer correct/incorrect uses role=status + aria-live=polite and the --aha-colorSuccess/Error border + --aha-colorSuccessBg/ErrorBg tokens (no hardcoded hex); (C3) the CSAT prompt uses the shared Csat widget with a required source from the CsatSource union and best-effort csat.* tracking that never breaks render or blocks the thank-you toast; (C4) inline banners use the DS V3 Alert (surface/border/icon token + distinct glyph per type + size), not a bare AntD Alert; (C5) actionable errors, field validation, destructive confirms, and full-page failures do NOT live in a toast. Burden of proof is on PASS: a feedback surface you cannot justify is a FAIL. Trigger on phrases like 'review this toast', 'is this notification correct', 'judge my feedback UI', 'check the CSAT widget', 'audit inline correct/incorrect', 'self-check after building a toast', 'is my Alert banner right', 'does this snackbar follow our rules', 'score my success message'. Do NOT trigger for BUILDING feedback in the first place (use aha-design-feedback), for modals/drawers/popovers (use aha-design-overlays), or for form-field/validation errors and screen-reader live-region announcements — those are accessibility primitives owned by aha-design-shared-components even though 'announce' or 'error' may sound like feedback."
---

# Judging a feedback / notification surface

This skill is the **judgment counterpart** to `aha-design-feedback` (which guides
building the same surface). Reach for it when reviewing finished feedback work — a
PR diff, a code-review request, or a self-check at the end of a build — to decide
whether a toast, inline correct/incorrect panel, CSAT prompt, or Alert banner follows
the house rules. Don't reach for it while building — use `aha-design-feedback` for that.

> **Scope.** *Visible result/confirmation UI* — toasts, inline post-answer
> correct/incorrect panels, the shared CSAT thumbs widget, and DS V3 Alert banners.
> Hand off other layers: modals/drawers/popovers → `aha-design-overlays`; form-field /
> validation errors and screen-reader live regions → `aha-design-shared-components`;
> full-page failures → `aha-design-shared-components` `ErrorPage`; the copy voice of any
> message → the `aha-branding:*` tone skill.

---

## How to use

1. **Find every feedback surface in the diff/code** — every `message.*` / `notification.*`
   call, bespoke fixed-position toast pill, inline result panel rendered after an answer,
   `Csat` mount, and `Alert` banner. Note which of the five criteria each one touches.
2. **Read the target rules from the build skill** — `aha-design-feedback/SKILL.md` §1–§6
   (especially the §6 *Test-case assertions*) and, for Alert, its
   **`references/alert.md`**. Don't judge from memory; diff against these.
3. For each criterion, decide **PASS** or **FAIL**, and capture a 1-line piece of evidence
   (`file:line` where possible).
4. **Scope the run.** A criterion only applies if that surface is present. If the diff has
   no CSAT, mark **C3 `N/A`** (not FAIL) and say so; likewise C2/C4 when their surface is
   absent. C1 and C5 apply whenever any toast/notification exists.
5. **Emit the verdict report** using the exact template at the bottom — same shape every
   time so reviewers can scan it.

**Why binary, no partial credit.** A feedback surface either honours each rule or it
doesn't — "mostly correct" is a polite FAIL. A toast that auto-dismisses but forgets to
clear its timer on unmount, or an inline panel with the right colours but no `role=status`,
is a FAIL, not 80%. Binary keeps the judge consistent across reviewers and runs.

**Burden of proof is on PASS.** Some rules can't be confirmed from static markup — whether
the dismiss timer is cleared on unmount, whether `track()` is genuinely wrapped so a throw
can't break render, whether the toast actually escapes a transformed ancestor at runtime. If
you cannot verify a criterion, mark **FAIL** and say why under `## Notes / unverifiable`;
don't wave it through. An unexplained-yet-plausible feedback surface passing is how a toast
clipped inside a `transform` container reaches prod.

---

## The 5 criteria

### C1. Toasts are transient bottom-right pills — auto-dismiss, role=status, portalled → PASS / FAIL

**Rule.** A toast is a **transient, non-actionable confirmation** ("Thanks for your
feedback", "Copied"). It is a small `position: fixed` pill at the **viewport bottom-right**
that rises from below (never shifting surrounding layout), **auto-dismisses after ~3s** with
the timer **cleared on unmount**, carries **`role="status"`** (announced without stealing
focus), and — because a `fixed` toast is clipped by any ancestor that establishes a
containing block (`transform`, `filter`, `backdrop-filter`, `will-change`) — is **portalled
via `createPortal(node, document.body)`** so it stays truly viewport-fixed from every mount
point. For ordinary app-level success/info, prefer AntD's `message` / `notification`; the
bespoke fixed pill is reserved for custom bottom-right content.

✅ **GOOD**

```tsx
// ordinary success — AntD handles placement, dismiss, role, portalling
message.success('Copied');

// bespoke bottom-right pill — portalled + role + timer cleared on unmount
useEffect(() => {
  const id = setTimeout(onDismiss, 3000);
  return () => clearTimeout(id);          // cleared on unmount
}, []);
return createPortal(
  <div role="status" className="toast toast--bottom-right">Thanks for your feedback</div>,
  document.body,                          // escapes transformed ancestors
);
```

❌ **BAD**

```tsx
// fixed toast rendered in-tree, no portal — clipped by a transformed ancestor
return <div style={{ position: 'fixed', bottom: 16, right: 16 }}>Saved</div>;

// no role=status; timer never cleared → fires after unmount
setTimeout(() => setOpen(false), 3000);   // leak, silent to screen readers
```

**Common failure modes (any one → FAIL):** a fixed toast rendered in-tree instead of
portalled to `document.body`; no `role="status"`; no ~3s auto-dismiss or a timer not cleared
on unmount; placement other than bottom-right that shifts layout; rolling a bespoke pill
where plain AntD `message`/`notification` would do.

---

### C2. Inline correct/incorrect uses the a11y + semantic-token contract → PASS / FAIL

**Rule.** Result feedback shown in place after an answer carries **`role="status"` with
`aria-live="polite"`** (informational, not urgent), and colours its container from **semantic
tokens** — border `var(--aha-colorSuccess)` / `var(--aha-colorError)` and background
`var(--aha-colorSuccessBg)` / `var(--aha-colorErrorBg)`, **never a hardcoded hex**. It leads
with a strong correct/incorrect label, shows the correct answer and explanation below when
incorrect, and exposes stable `data-*` hooks (`data-correct`, `data-element-id`) for testing.

✅ **GOOD**

```tsx
<div
  role="status"
  aria-live="polite"
  data-correct={isCorrect}
  data-element-id={id}
  className="answer--incorrect"   // border var(--aha-colorError); bg var(--aha-colorErrorBg)
>
  <strong>Incorrect</strong>
  <p>Correct answer: {answer}</p>
</div>
```

❌ **BAD**

```tsx
<div className="answer" style={{ border: '1px solid #ff4d4f', background: '#fff1f0' }}>
  Wrong                          {/* no role/aria-live; raw hex instead of tokens */}
</div>
```

**Common failure modes (any one → FAIL):** missing `role="status"` or `aria-live="polite"`;
`aria-live="assertive"` for a non-urgent result; hardcoded hex (even the *right* colour)
instead of the `--aha-colorSuccess/Error(+Bg)` tokens; no correct/incorrect label or missing
`data-*` hooks.

---

### C3. CSAT uses the shared widget, a required source, and best-effort tracking → PASS / FAIL

**Rule.** A satisfaction prompt uses the shared **`Csat`** widget — a binary thumbs rating
with an optional follow-up on thumbs-down; **never** a bespoke rating control. It passes a
**required `source`** token from the closed **`CsatSource`** union (one per placement) so
Mixpanel gets stable, typo-proof segmentation; adding a placement means adding a union member.
It emits `CSAT_SHOWN` (once per mount — the response-rate denominator), `CSAT_RATED`, and
`CSAT_FEEDBACK_SUBMITTED`, and tracking is **best-effort**: a throwing or uninitialised
`track()` must **never** break rendering or block the thank-you toast.

✅ **GOOD**

```tsx
<Csat source={CsatSource.PostSurveyExport} />   // shared widget, source from the union

function track(evt: CsatEvent) {
  try { analytics.track(evt); } catch { /* best-effort — never break render */ }
}
```

❌ **BAD**

```tsx
<MyStarRating onChange={…} />                    // bespoke control, no source, no csat.* events
<Csat source="post-export" />                    // raw string, not a CsatSource union member
analytics.track(CSAT_RATED);                     // unguarded — a throw breaks the thank-you toast
```

**Common failure modes (any one → FAIL):** a hand-rolled rating control instead of `Csat`; a
missing `source` or a raw string not drawn from the `CsatSource` union; wrong/missing
`csat.*` events; an unguarded `track()` that can throw and break render or block the
thank-you toast.

---

### C4. Inline banners use the DS V3 Alert, not a bare AntD Alert → PASS / FAIL

**Rule.** A persistent, in-context message the user may need to act on is a **Design System
V3 Alert** — the thin `AhaAlert` wrapper from **`references/alert.md`**, **not** a bare
`<Alert>` with default styling. Each of the five types — `success`, `error`, `info`,
`warning`, `branding` — carries its own DS `bg-surface` / `border` / `icon` token **and a
distinct glyph** (colour is never the only signal), in one of two sizes — `regular` (12/16
padding, 8px radius, 14px text) or `small` (8px padding, 4px radius, 12px text). Text uses
only Plus Jakarta Sans 400 (message/inline link) and 600 (title); the title is **sentence
case**. Use an Alert for persistent in-context messages; a toast (C1) for transient
auto-dismissing ones.

✅ **GOOD**

```tsx
<AhaAlert type="warning" size="regular" title="Changes not saved">
  Save before you leave.
</AhaAlert>   {/* DS surface/border/icon token + distinct warning glyph, sentence-case title */}
```

❌ **BAD**

```tsx
<Alert type="warning" message="CHANGES NOT SAVED" />
// bare AntD Alert: default styling, no DS branding type, no distinct-glyph guarantee,
// ALL CAPS title
```

**Common failure modes (any one → FAIL):** a bare AntD `<Alert>` shipped for an inline
banner; colour carried without a distinct glyph; wrong/missing DS surface/border/icon token
per type or size; a font weight other than 400/600; a Title Case or ALL CAPS title.

---

### C5. When NOT to use a toast is respected → PASS / FAIL

**Rule.** A toast that auto-dismisses must **never** be the only place a required message
lives. Route by situation:

| Situation | Belongs in |
|---|---|
| Error the user must act on | inline **Alert** banner in context (C4) or an overlay Alert |
| Field validation error | `FieldErrorDisplay` / a11y `FieldError` (shared-components) |
| Destructive confirmation | a modal (`aha-design-overlays`) |
| Full-page failure (not found, expired) | `ErrorPage` (shared-components) |

✅ **GOOD**

```tsx
<AhaAlert type="error" title="Upload failed">Retry or pick a smaller file.</AhaAlert>
// actionable error stays in context, not a toast that vanishes in 3s
```

❌ **BAD**

```tsx
message.error('Delete this survey? This cannot be undone');   // destructive confirm in a toast
notification.error({ message: 'Email is required' });         // field validation in a toast
```

**Common failure modes (any one → FAIL):** an actionable error, a field validation message,
a destructive confirmation, or a full-page failure delivered as a toast; a required message
that only ever appears in an auto-dismissing toast.

---

## Verdict report (emit exactly this shape)

```markdown
# Feedback judge report — <surface name or file path>

| # | Criterion | Verdict |
|---|---|---|
| C1 | Toasts — bottom-right, ~3s auto-dismiss, role=status, portalled | ✅ PASS |
| C2 | Inline correct/incorrect — role=status aria-live=polite + --aha tokens | ❌ FAIL |
| C3 | CSAT — shared Csat, required source, best-effort csat.* | ➖ N/A |
| C4 | Inline banner — DS V3 Alert, not bare AntD Alert | ✅ PASS |
| C5 | When NOT to use a toast is respected | ❌ FAIL |

**Overall: NEEDS FIX** (2 failing criteria)

## Fails

### ❌ C2 — Inline correct/incorrect a11y + token contract
**Where:** `features/respondent/shared/InlineFeedback.tsx:31`
**Evidence:** result panel styled with `border: '1px solid #ff4d4f'; background: '#fff1f0'` and no `role="status"`/`aria-live`.
**Fix:** add `role="status" aria-live="polite"`; replace the hex with `var(--aha-colorError)` border and `var(--aha-colorErrorBg)` background.

### ❌ C5 — When NOT to use a toast
**Where:** `features/survey/Delete.tsx:18`
**Evidence:** `message.error('Delete this survey? This cannot be undone')` — a destructive confirmation delivered as a transient toast.
**Fix:** move the confirmation into a modal (`aha-design-overlays`); a 3s toast can't gate an irreversible action.

## Passes — brief

C1, C4 — toasts are portalled bottom-right role=status pills; the inline banner is a DS V3 AhaAlert.

## Notes / unverifiable / N/A

- C3 marked N/A — no CSAT prompt in this diff.
- (List anything judged under uncertainty — e.g. "couldn't confirm the toast timer is cleared on unmount from static markup; marked FAIL per burden-of-proof.")
```

**Overall verdict rule:** any FAIL → `NEEDS FIX`. All applicable criteria PASS (`N/A`
allowed) → `OK TO SHIP`.

Always include: the verdict table (all 5 rows in order, with `➖ N/A` for criteria whose
surface is absent); a `## Fails` section with a sub-section per failed criterion (**Where**
`file:line`, **Evidence** 1 line, **Fix** concrete action); a 1-line `## Passes — brief`; and
a `## Notes / unverifiable / N/A` section whenever a judgment was made under uncertainty or a
criterion was skipped.

---

## When NOT to use this skill

- **Building or editing** feedback in the first place → use `aha-design-feedback`. This judge
  evaluates finished work.
- **Modals, drawers, popovers** (including destructive confirmation dialogs) →
  `aha-design-overlays`.
- **Form-field / validation errors** and **screen-reader live-region announcements** →
  `aha-design-shared-components` (it owns `FieldError` / `LiveRegion`), even though 'error' or
  'announce' can sound like feedback.
- **Full-page failure states** (not found, expired) → `aha-design-shared-components`
  `ErrorPage`.
- Judging the **copy voice** of a message → the `aha-branding:*` tone skill.

---

## Closing the build → judge → fix loop

This judge runs at the **end** of a build pass — by a human reviewer or by the build agent as
a self-check. The expected loop:

1. Build the feedback surface with `aha-design-feedback`.
2. Invoke this judge → emits the verdict report.
3. Any FAIL → fix the specific files cited under `## Fails` → re-invoke this judge.
4. Repeat until the verdict is `OK TO SHIP`.

Build-time guidance gets diluted under task pressure — an agent gets the toast colours right
but forgets to portal it to `document.body`, or reaches for `message.error` on a destructive
confirm. The judge gives a final, structured chance to catch exactly the traps the build skill
warned about but the agent dropped mid-implementation.
