---
name: aha-design-feedback
description: "Authoritative rules for transient and post-action feedback across AhaSlides products — toasts/notifications (fixed bottom-right, ~3s auto-dismiss, role=status, portal to body to escape transformed ancestors), the Design System V3 Alert inline banner (5 types incl. branding × regular/small sizes, DS surface/border/icon tokens, system glyphs — NOT a bare AntD Alert), inline post-answer feedback (correct/incorrect with role=status aria-live=polite and --aha-colorSuccess/Error border + Bg tokens), the shared CSAT thumbs widget (required source token, csat.* analytics, best-effort tracking), and when NOT to use a toast. Use whenever an agent is building, editing, or reviewing transient or post-action feedback in AhaSlides UI — a success toast, a thank-you message, an error/info notification, an inline alert banner, an inline correct/incorrect result, or a satisfaction (CSAT) prompt. Trigger on phrases like 'toast', 'notification', 'snackbar', 'success message', 'error toast', 'auto-dismiss', 'thank-you message', 'alert', 'alert banner', 'inline alert', 'warning banner', 'info banner', 'AntD Alert', 'inline feedback', 'correct/incorrect state', 'CSAT', 'thumbs rating', 'message.success', 'notify the user'. This skill owns *visible result/confirmation UI* (toasts, Alert banners, correct/incorrect result panels, CSAT). Do NOT trigger for form-field validation errors or screen-reader live-region announcements — those are accessibility primitives owned by aha-design-shared-components even though 'announce' or 'error' may sound like feedback. Also do NOT trigger for modals and dialogs (use aha-design-overlays) or full-page error states (use aha-design-shared-components ErrorPage)."
---

# AhaSlides Feedback & notification design patterns

Source of truth: the AhaSlides feedback conventions below, as embodied in the `Csat` widget (`components/csat/Csat.tsx`) and `InlineFeedback` (`features/respondent/shared/InlineFeedback.tsx`). "Feedback" here means transient confirmations (toasts), in-context result feedback (correct/incorrect), and satisfaction prompts (CSAT) — not validation errors or blocking dialogs.

> **Judge counterpart.** After building or when reviewing feedback UI, self-check with [[aha-design-feedback-judge]] — it scores the surface PASS/FAIL against these rules and feeds concrete fixes back, closing a build→judge→fix loop.

> **Scope.** Any non-blocking signal that an action happened or how it turned out. Applies to all AhaSlides product UI.
>
> **Companion skills.** Use `aha-design-overlays` for modals/drawers/popovers, `aha-design-shared-components` for field errors and full-page error states, and the `aha-branding:*` tone skill for the copy voice of any message.

## 1. Toasts (transient confirmations)

- Use a toast for a **transient, non-actionable confirmation** ("Thanks for your feedback", "Copied").
- Position: small fixed pill at the **viewport bottom-right**; it rises up from below so it never shifts surrounding layout.
- **Auto-dismiss after ~3s** (the cross-product convention; clear the timer on unmount).
- Carry `role="status"` so it is announced without stealing focus.
- **Portal to `document.body`.** A `position: fixed` toast is clipped by any ancestor that establishes a containing block (`transform`, `filter`, `backdrop-filter`, `will-change`). Rendering through `createPortal(node, document.body)` is required so the toast stays truly viewport-fixed from every mount point.

For ordinary app-level success/info toasts, prefer AntD's `message`/`notification` APIs; reach for the bespoke fixed pill only when you need the specific bottom-right placement and custom content.

## 2. Alert (inline banner)

The **Design System V3 Alert** — an inline banner for feedback that stays in the layout (unlike a
toast). Full spec, tokens, size metrics, and Figma node IDs: **[`references/alert.md`](references/alert.md)**.

- **Do not ship a bare AntD `<Alert>`.** It cannot express the DS `branding` type, the
  `regular`/`small` sizes, the DS surface/border tokens, or the DS system glyphs. Build the thin
  `AhaAlert` wrapper the reference specifies.
- Five types — `success`, `error`, `info`, `warning`, `branding` — each with its own DS
  `bg-surface` / `border` / `icon` token **and a distinct glyph** (colour is never the only signal).
- Two sizes — `regular` (12/16 padding, 8px radius, 14px text) and `small` (8px padding, 4px
  radius, 12px text).
- The spec is **token/role based**, so it applies unchanged to AntD, Vue, or plain CSS — wire the
  DS `--p-color-*` tokens onto whatever token layer the target app uses.
- Alert vs toast: use an Alert for a **persistent, in-context** message the user may need to act
  on; use a toast (§1) for a transient auto-dismissing confirmation.

## 3. Inline post-action feedback (correct/incorrect)

For result feedback shown in place after an answer:

- `role="status"` with `aria-live="polite"` (it's informational, not urgent).
- Colour the container with **semantic tokens**: border `var(--aha-colorSuccess)` / `var(--aha-colorError)` and background `var(--aha-colorSuccessBg)` / `var(--aha-colorErrorBg)`. Never hardcode hex.
- Lead with a strong correct/incorrect label; show the correct answer and any explanation below when incorrect.
- Expose stable `data-*` hooks (`data-correct`, `data-element-id`) for testing.

## 4. CSAT (satisfaction) prompts

- Use the shared **`Csat`** widget — a binary thumbs rating with an optional follow-up on thumbs-down. Do not build a bespoke rating control.
- Pass a **required `source`** token from the closed `CsatSource` union (one per placement) so Mixpanel sees a stable, typo-proof segmentation. Add a union member when adding a placement.
- It emits `CSAT_SHOWN` (once per mount — the response-rate denominator), `CSAT_RATED`, and `CSAT_FEEDBACK_SUBMITTED`. Tracking is **best-effort**: a throwing/uninitialised `track()` must never break rendering or block the thank-you toast.

## 5. When NOT to use a toast

| Situation                                    | Use instead                                              |
| -------------------------------------------- | ------------------------------------------------------- |
| Error the user must act on                   | Inline **Alert** banner in context (§2) or an overlay Alert |
| Field validation error                       | `FieldErrorDisplay` / a11y `FieldError` (shared-components) |
| Destructive confirmation                     | A modal (`aha-design-overlays`)                          |
| Full-page failure (not found, expired)       | `ErrorPage` (shared-components)                          |

A toast that auto-dismisses must never be the only place a required message lives.

## 6. Test-case assertions

```
FEEDBACK-01: Toasts are transient, non-actionable confirmations — fixed bottom-right, ~3s auto-dismiss, timer cleared on unmount
FEEDBACK-02: Toasts carry role="status" and are portalled to document.body to escape transformed/overflow ancestors
FEEDBACK-03: Standard success/info uses AntD message/notification; the bespoke fixed pill is reserved for custom bottom-right content
FEEDBACK-04: Inline result feedback uses role="status" aria-live="polite" with --aha-colorSuccess/Error(+Bg) tokens — no hardcoded hex
FEEDBACK-05: Satisfaction prompts use the shared Csat widget with a required source from the CsatSource union
FEEDBACK-06: CSAT analytics is best-effort — a failing track() never breaks render or blocks the thank-you toast
FEEDBACK-07: Actionable errors, validation, destructive confirms, and full-page failures do NOT use toasts
FEEDBACK-08: Alert banners follow references/alert.md — DS surface/border/icon tokens per type + size (regular/small), not a bare AntD Alert with default styling
FEEDBACK-09: Every Alert type pairs its colour with a distinct glyph (success/error/info/warning/branding); colour is never the only signal
FEEDBACK-10: Alert text uses only Plus Jakarta Sans 400 (message/inline link) and 600 (title) — no other font weight
FEEDBACK-11: Alert title/heading is sentence case — first letter only (plus proper nouns); never Title Case or ALL CAPS
```
