---
name: aha-design-overlays-judge
description: "Authoritative judge / verdict-giver for modals, drawers, and popovers across AhaSlides product UI — the evaluation counterpart to aha-design-overlays (the build skill). Use whenever an agent reviews, audits, scores, critiques, or self-checks an overlay: a PR diff that adds or edits a modal / dialog / drawer / side panel / popover, a 'is this overlay correct?' question, or the self-check that should run after building one. Emits a binary PASS / FAIL verdict per criterion (no partial credit) across the overlay rules — (C1) the right surface is chosen (modal for a blocking decision, drawer for a detail/panel, popover for an anchored snippet); (C2) dismiss behaviour is safety-critical — destructive / data-loss overlays MUST NOT close on outside/mask click (mask={{ closable: false }}), leaving Esc + explicit X as the only dismiss paths, and dismissal is disabled/suppressed while busy; (C3) state reset via destroyOnHidden (Modal) / destroyOnClose (Drawer) so transient input, error, and busy flags clear between opens; (C4) drawers default placement=right with responsive width isMobile ? '100%' : <fixed> via useIsMobile(); (C5) the async-confirm pattern — busy re-entry guard, await the promise, stay open on failure, never fire-and-forget; (C6) errors surface inline via an AntD Alert, never a nested modal on top; (C7) destructive confirm uses a danger-styled okButton, with danger on the button not the title/body. Burden of proof is on PASS: an overlay you cannot justify against these rules is a FAIL. Trigger on phrases like 'review this modal', 'is this drawer correct', 'judge my overlay', 'check dismiss behaviour', 'audit the confirm modal', 'is this delete prompt safe', 'self-check after building a drawer', 'does this popover follow our rules', 'review this dialog', 'PR review for an overlay'. Do NOT trigger while BUILDING an overlay (use aha-design-overlays), for the paywall/upsell popover (use aha-design-paywall), for settings/options drawers and their content (use aha-design-settings), or for toasts and transient notifications (use aha-design-feedback)."
---

# Judging a modal, drawer, or popover

This skill is the **judgment counterpart** to `aha-design-overlays` (which guides
building the same surface). Reach for it when reviewing finished overlay work — a
PR diff, a review request, or a self-check at the end of a build — to decide whether a
modal, drawer, or popover follows the house rules. Don't reach for it while building —
use `aha-design-overlays` for that.

> **Scope.** Any transient surface layered over the page — a modal, dialog, drawer,
> side panel, or popover in AhaSlides product UI. It is **not** for the paywall/upsell
> popover (hand to `aha-design-paywall`), settings/options drawers and their content
> (`aha-design-settings`), or toasts and transient notifications (`aha-design-feedback`).
>
> **Cross-skill reference.** This judge checks that the overlay picks the right surface,
> dismisses safely, resets state, sizes responsively, confirms asynchronously, and
> surfaces errors inline. It does not re-judge the *content* inside a settings drawer
> (`aha-design-settings-judge`) or how a paywall popover looks (`aha-design-paywall`).

---

## How to use

1. Identify what's under review — the overlay's markup/code (or a screenshot) and what
   it claims to be: a **modal** (blocking decision), a **drawer** (detail/panel), or a
   **popover** (anchored snippet). Note whether it is **destructive / data-loss** — that
   raises the bar on C2 and C7.
2. Read the target rules from the build skill — `aha-design-overlays/SKILL.md` §1–§8,
   grounded in `DeleteSurveyConfirmModal.tsx` (destructive modal) and
   `RespondentReportDrawer.tsx` (detail drawer). Don't judge from memory; diff against
   these.
3. For each criterion below, gather evidence, decide **PASS** or **FAIL**, and capture a
   1-line piece of evidence (`file:line` where possible).
4. **Emit the verdict report** using the exact template at the bottom — same shape every
   time so reviewers can scan it.

**Why binary, no partial credit.** An overlay either honours each rule or it doesn't —
"mostly safe" dismiss behaviour is a polite FAIL. Half-credit invites endless argument
about whether a gap is 60% or 70% correct. Binary keeps the judge consistent across
reviewers and runs.

**Burden of proof is on PASS.** Some rules can't be confirmed from static markup — a
"stays open on failure" needs the rejection path exercised, a "busy disables cancel"
needs the in-flight state. If you cannot verify a criterion, mark **FAIL** and say why in
the notes; don't wave it through. Pretending unclear code passes is how a stray backdrop
click deletes a survey in prod.

---

## The 7 criteria

### C1. The right surface is chosen — modal vs drawer vs popover → PASS / FAIL

**Rule.** The surface fits the job: a **modal** for a focused, blocking decision or short
flow (confirmations, destructive actions, one-time config); a **drawer** for a detail
view or medium-complexity panel that supplements the page (a record's report,
distribution settings); a **popover** for a small, anchored, contextual snippet (quick
info, a compact input, an upsell) — never for a multi-step flow.

✅ **GOOD**

```tsx
<Modal title="Delete this survey permanently?" …>   {/* blocking decision */}
<Drawer placement="right" title="Respondent report" …>  {/* detail panel */}
```

❌ **BAD**

```tsx
<Popover content={<MultiStepWizard />} />  {/* multi-step flow crammed into a popover */}
<Modal>{/* a passive detail view that should be a drawer */}</Modal>
```

**Common failure modes (any one → FAIL):**
- A multi-step flow shoved into a popover.
- A blocking, must-decide confirmation rendered as a dismissible popover.
- A detail/report panel forced into a modal that blocks the whole page.

---

### C2. Dismiss behaviour is safety-critical → PASS / FAIL

**Rule.** **Destructive / data-loss overlays MUST NOT dismiss on outside/mask click** —
set `mask={{ closable: false }}` so a stray backdrop click can't trigger destruction,
leaving `keyboard` (Esc) and the explicit **X** button as the only dismiss paths.
Non-destructive overlays may allow mask-close. While an async action is in flight
(`busy`), cancel/close is **disabled or suppressed** (`onCancel`/`onClose` suppressed) so
the user can't dismiss mid-operation.

✅ **GOOD**

```tsx
<Modal
  mask={{ closable: false }}          // no backdrop-click dismissal on a destructive modal
  keyboard                            // Esc still works
  onCancel={busy ? undefined : onClose}
  cancelButtonProps={{ disabled: busy }}
/>
```

❌ **BAD**

```tsx
<Modal maskClosable>{/* destructive delete — a stray backdrop click destroys data */}</Modal>
<Modal onCancel={onClose} />  {/* closable mid-flight while busy — dismissable during the op */}
```

**Common failure modes (any one → FAIL):**
- A destructive/data-loss overlay left mask-closable (backdrop click destroys).
- Esc or the X button removed so there's no explicit dismiss path.
- Cancel/close still live while `busy`, letting the user bail mid-operation.
- **Unverifiable:** can't tell whether the overlay is destructive or whether mask-close is
  set → FAIL + note (burden on PASS).

---

### C3. State resets between opens → PASS / FAIL

**Rule.** The overlay sets `destroyOnHidden` (Modal) / `destroyOnClose` (Drawer) so
transient state — form input, error text, busy flag — resets between opens. If the
instance can stay mounted, local error and busy state are also cleared explicitly on open
rather than relying on unmount alone.

✅ **GOOD**

```tsx
<Modal destroyOnHidden … />
<Drawer destroyOnClose … />
```

❌ **BAD**

```tsx
<Modal … />  {/* no destroyOnHidden — stale error/input bleeds into the next open */}
```

**Common failure modes (any one → FAIL):**
- Neither `destroyOnHidden`/`destroyOnClose` set nor state cleared on open.
- Wrong prop for the surface (e.g. `destroyOnHidden` on a `Drawer`).
- A persistently-mounted overlay that never clears its error/busy on open.

---

### C4. Drawers use placement=right and responsive width → PASS / FAIL

**Rule.** Drawers default to `placement="right"` with **responsive width**
`width={isMobile ? '100%' : <fixed>}` (e.g. `720`) driven by `useIsMobile()` — full-bleed
on mobile, fixed panel on desktop. The width is a **prop**, not gated through CSS.

✅ **GOOD**

```tsx
const isMobile = useIsMobile();
<Drawer placement="right" width={isMobile ? '100%' : 720} … />
```

❌ **BAD**

```tsx
<Drawer width={720} />                {/* fixed width — overflows / clips on mobile */}
<Drawer className="responsive-width" /> {/* width gated through CSS instead of the prop */}
```

**Common failure modes (any one → FAIL):**
- A fixed drawer width with no mobile branch (clips on small screens).
- Responsive width faked in CSS instead of the `width` prop via `useIsMobile()`.
- A non-`right` placement with no reason.
- *(N/A for modals and popovers — mark this criterion `N/A` and say so.)*

---

### C5. Async confirm follows the busy-guard / await / stay-open pattern → PASS / FAIL

**Rule.** When `onConfirm` returns a promise, the overlay: (1) guards re-entry
(`if (busy) return`), sets `busy`, clears prior error; (2) `await`s the action; (3) on
rejection **stays open** and surfaces the error inline (see C6), then clears `busy`; (4)
on success the caller closes the overlay. Never close a destructive overlay before its
action resolves, and never fire-and-forget.

✅ **GOOD**

```tsx
const onConfirm = async () => {
  if (busy) return;                   // re-entry guard
  setBusy(true); setError(null);
  try { await onDelete(); onClose(); } // await, then caller closes on success
  catch (e) { setError(e); }           // stays open, surfaces error inline
  finally { setBusy(false); }
};
```

❌ **BAD**

```tsx
const onConfirm = () => { onDelete(); onClose(); };  // fire-and-forget, closes before it resolves
```

**Common failure modes (any one → FAIL):**
- Fire-and-forget: the promise isn't `await`ed.
- Overlay closes before the destructive action resolves.
- No re-entry guard — a double-click fires the action twice.
- On failure the overlay closes (forcing a re-open) instead of staying open.
- **Unverifiable:** the rejection path can't be confirmed from static code → FAIL + note.

---

### C6. Errors surface inline, never a nested modal → PASS / FAIL

**Rule.** Failures are surfaced **inside** the overlay with an AntD
`Alert type="error" showIcon` (AntD v6 uses `title`, not `message`). **Never** stack a
second modal on top to report an error. The overlay stays open on failure so the user can
retry without re-opening.

✅ **GOOD**

```tsx
{error && <Alert type="error" showIcon title={error.message} />}
```

❌ **BAD**

```tsx
catch (e) { Modal.error({ title: 'Failed' }); }  // a nested modal stacked on the overlay
message.error(e.message);                          // a toast instead of an inline Alert
```

**Common failure modes (any one → FAIL):**
- A nested `Modal.error` / second dialog stacked on top to report the failure.
- The error shown only as a transient toast, so it's gone before the user reads it.
- `message` prop used where AntD v6 Alert expects `title`.

---

### C7. Destructive confirm uses a danger-styled button → PASS / FAIL

**Rule.** A destructive confirmation uses `okButtonProps={{ danger: true, loading: busy }}`
— the **danger styling lives on the action button**, never on the title or body. For
confirmations the title is a **question** ("Delete this survey permanently?"), and cancel
is disabled while busy (`cancelButtonProps={{ disabled: busy }}`).

✅ **GOOD**

```tsx
<Modal
  title="Delete this survey permanently?"
  okButtonProps={{ danger: true, loading: busy }}
  cancelButtonProps={{ disabled: busy }}
/>
```

❌ **BAD**

```tsx
<Modal title={<span style={{ color: 'red' }}>Delete</span>}
       okButtonProps={{ type: 'primary' }} />  {/* danger on the title, plain confirm button */}
```

**Common failure modes (any one → FAIL):**
- A destructive confirm with a plain/primary OK button (no `danger`).
- Red applied to the title or body instead of the action button.
- The confirm button shows no `loading` state while the async action runs.
- *(N/A for non-destructive overlays — mark this criterion `N/A` and say so.)*

---

## Output format — the verdict report

Always emit this exact structure (compact, scannable for reviewers and the build agent
that will fix it):

```markdown
# Overlays judge report — <surface name or file path>

| # | Criterion | Verdict |
|---|---|---|
| C1 | Right surface — modal vs drawer vs popover | ✅ PASS |
| C2 | Dismiss behaviour is safety-critical | ❌ FAIL |
| C3 | State resets between opens (destroyOnHidden/Close) | ✅ PASS |
| C4 | Drawer placement=right + responsive width | ➖ N/A |
| C5 | Async confirm — busy guard, await, stay open | ❌ FAIL |
| C6 | Errors surface inline, never a nested modal | ✅ PASS |
| C7 | Destructive confirm uses a danger button | ✅ PASS |

**Overall: NEEDS FIX** (2 failing criteria)

## Fails

### ❌ C2 — Dismiss behaviour is safety-critical
**Where:** `DeleteSurveyConfirmModal.tsx:31`
**Evidence:** the delete modal is left `maskClosable` — a stray backdrop click destroys the survey.
**Fix:** set `mask={{ closable: false }}`; keep `keyboard` (Esc) and the X button as the only dismiss paths, and suppress `onCancel` while `busy`.

### ❌ C5 — Async confirm — busy guard, await, stay open
**Where:** `DeleteSurveyConfirmModal.tsx:44`
**Evidence:** `onConfirm` fires `onDelete()` then `onClose()` without awaiting — fire-and-forget that closes before the delete resolves.
**Fix:** `await` the action inside a busy-guarded try/catch; close only on success; on rejection stay open and set an inline error (C6).

## Passes — brief

C1, C3, C6, C7 — surface choice, state reset, inline error, and danger button check out.

## Notes / unverifiable

- C4 marked N/A — this is a modal, not a drawer.
- (List anything you couldn't verify from the input — e.g. "couldn't confirm the overlay stays open on rejection without exercising the failure path; marked FAIL per burden-of-proof.")
```

**Overall verdict rule:** any FAIL → `NEEDS FIX`. All applicable criteria PASS (`N/A`
allowed) → `OK TO SHIP`.

Always include: the verdict table (all 7 rows in order, with `➖ N/A` for criteria that
don't apply — C4 for non-drawers, C7 for non-destructive overlays); a `## Fails` section
with a sub-section per failed criterion (**Where** `file:line`, **Evidence** 1 line,
**Fix** concrete action); a 1-line `## Passes — brief`; and a `## Notes / unverifiable`
section whenever a judgment was made under uncertainty or a criterion was skipped.

---

## When NOT to use this skill

- The user is **building / editing** an overlay → use `aha-design-overlays` (the build
  skill). This judge evaluates finished work.
- Reviewing the **paywall / upsell popover** → `aha-design-paywall`.
- Reviewing a **settings / options drawer** and its content → `aha-design-settings-judge`.
- Reviewing **toasts or transient notifications** → `aha-design-feedback`.

---

## Closing the build → judge → fix loop

This judge runs at the **end** of a build pass — by a human reviewer or by the build agent
as a self-check. The expected loop:

1. Build the overlay with `aha-design-overlays` → produces the modal/drawer/popover.
2. Invoke this judge → emits the verdict report.
3. Any FAIL → fix the specific files cited under `## Fails` → re-invoke this judge.
4. Repeat until the verdict is `OK TO SHIP`.

The reason for the loop: build-time guidance gets diluted under task pressure — an agent
gets the surface right but forgets to lock the mask on a destructive modal, or
fire-and-forgets the confirm. The judge gives a final, structured chance to catch exactly
the safety traps the build skill warned about but the agent dropped mid-implementation.
