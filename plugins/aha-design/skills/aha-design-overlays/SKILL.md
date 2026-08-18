---
name: aha-design-overlays
description: "Authoritative rules for modals, drawers, and popovers across AhaSlides products — choosing modal vs drawer vs popover, dismiss behaviour (destructive overlays must not close on outside/mask click — Esc + X only), destroyOnHidden/destroyOnClose state reset, drawer placement and responsive width (useIsMobile → 100% vs fixed), the async-confirm pattern (busy guard, await, stay open on failure), inline error surfacing inside overlays (AntD Alert, never a nested modal), and danger-styled confirm buttons. Use whenever an agent is building, editing, or reviewing any modal, dialog, drawer, side panel, or popover in AhaSlides UI — a confirmation, a delete prompt, a detail drawer, or an overlay with async actions. Trigger on phrases like 'modal', 'drawer', 'dialog', 'popover', 'overlay', 'confirm modal', 'delete confirmation', 'side drawer', 'mask closable', 'destroyOnHidden', 'destroyOnClose', 'outside-click to close', 'focus trap', 'drawer width on mobile'. Do NOT trigger for the paywall/upsell popover (use aha-design-paywall), settings/options drawers and their content (use aha-design-settings), or toasts and transient notifications (use aha-design-feedback)."
---

# AhaSlides Modal, drawer & popover design patterns

Source of truth: the AhaSlides overlay conventions below, as embodied in `DeleteSurveyConfirmModal.tsx` (destructive modal) and `RespondentReportDrawer.tsx` (detail drawer). Overlays built on AntD v6 `Modal`/`Drawer`/`Popover` must follow these house rules so dismiss behaviour, state reset, and error handling are consistent and safe.

> **Judge counterpart.** After building or when reviewing a modal/drawer/popover, self-check with [[aha-design-overlays-judge]] — it scores the overlay PASS/FAIL against these rules and feeds concrete fixes back, closing a build→judge→fix loop.

> **Scope.** Any transient surface layered over the page. Applies to all AhaSlides product UI.
>
> **Companion skills.** Use `aha-design-paywall` for upsell popovers, `aha-design-settings` for options/settings drawers and their content, `aha-design-feedback` for toasts, and `aha-design-shared-components` for `useIsMobile()`.

## 1. Choosing the surface

| Surface     | Use for                                                                                   |
| ----------- | ----------------------------------------------------------------------------------------- |
| **Modal**   | A focused decision or short flow that should block the page — confirmations, destructive actions, one-time config. |
| **Drawer**  | A detail view or medium-complexity panel that supplements the page without fully replacing it — a record's report, distribution settings. |
| **Popover** | A small, anchored, contextual snippet — quick info, a compact input, an upsell. Not for multi-step flows. |

## 2. Dismiss behaviour (safety-critical)

- **Destructive overlays MUST NOT dismiss on outside/mask click.** Set `mask={{ closable: false }}` on the Modal. Keep `keyboard` (Esc) and the X button as the only dismiss paths, so a stray backdrop click can't trigger destruction.
- Non-destructive overlays may allow mask-close.
- While an async action is in flight (`busy`), disable cancel and suppress `onCancel`/`onClose` so the user can't dismiss mid-operation.

## 3. State reset

- Always set `destroyOnHidden` (Modal) / `destroyOnClose` (Drawer) so transient state (form input, error text, busy flag) resets between opens.
- On open, also clear local error and busy state explicitly — don't rely on unmount alone if the instance can stay mounted.

## 4. Drawer conventions

- Default `placement="right"`.
- **Responsive width:** `width={isMobile ? '100%' : 720}` via `useIsMobile()` — full-bleed on mobile, fixed panel on desktop. Do not gate this through CSS; the width is a prop.
- Put navigation/actions (prev/next, retry, position indicator) in the drawer `footer`.
- Use `styles={{ body: { padding: 0 } }}` when the body renders its own padded content.

## 5. Modal conventions

- For confirmations, the **title is a question** ("Delete this survey permanently?").
- Destructive confirm button: `okButtonProps={{ danger: true, loading: busy }}`; the danger styling lives on the action button, never the title or body.
- Disable cancel while busy (`cancelButtonProps={{ disabled: busy }}`).

## 6. Async confirm pattern

`onConfirm` returns a promise. The overlay:

1. Guards re-entry (`if (busy) return`), sets `busy`, clears prior error.
2. `await`s the action.
3. On rejection, **stays open** and surfaces the error inline (see §7), then clears `busy`.
4. On success, the caller closes the overlay.

Never close a destructive overlay before its action resolves, and never fire-and-forget.

## 7. Errors stay inline

- Surface failures inside the overlay with an AntD `Alert type="error" showIcon` (AntD v6 uses `title`, not `message`). Never stack a second modal on top to report an error.
- The overlay remains open on failure so the user can retry without re-opening.

## 8. Test-case assertions

```
OVERLAY-01: Surface choice fits the job — modal (blocking decision), drawer (detail/panel), popover (anchored snippet)
OVERLAY-02: Destructive modals set mask={{ closable: false }}; Esc + X remain the only dismiss paths
OVERLAY-03: Cancel/close is disabled or suppressed while an async action is in flight
OVERLAY-04: destroyOnHidden/destroyOnClose is set so transient state resets between opens
OVERLAY-05: Drawers default to placement="right" with width isMobile ? '100%' : <fixed> via useIsMobile()
OVERLAY-06: Destructive confirm uses okButtonProps danger + loading; danger styling is on the button, not the title/body
OVERLAY-07: Async confirm awaits the promise, stays open and shows an inline Alert on failure, and never closes before it resolves
OVERLAY-08: In-overlay errors use an inline AntD Alert — never a nested modal
```
