---
name: aha-design-shared-components
description: "Registry of canonical shared AhaSlides UI primitives an agent must reach for instead of rolling its own. This skill is the OWNER of accessible form-field/validation error display and screen-reader live-region announcements — reach here for those even though an 'error' or an 'announce X to screen readers' request may sound like feedback. It also owns the a11y components (LiveRegion, Progressbar, FieldError), the useIsMobile() viewport hook for responsive shape switches (e.g. swap a table for a card list on mobile, render a different layout below 768px), full-page ErrorPage, the AntD Empty empty-state pattern, and loading skeletons. Use whenever an agent is about to build something that already has a house primitive — an accessible field/validation error, a screen-reader live region or progress indicator, a mobile-vs-desktop layout swap, a loading/skeleton placeholder, an empty state, or a full-page error. Trigger on phrases like 'field error', 'validation error', 'accessible error', 'aria-live', 'live region', 'progressbar', 'announce to screen readers', 'screen-reader announce', 'aria-describedby', 'is mobile', 'responsive breakpoint', 'useIsMobile', 'table to card list', 'card list on mobile', 'different layout below 768px', 'skeleton', 'loading state', 'empty state', 'error page'. Do NOT trigger when a dedicated skill owns the surface — overlays/drawers (aha-design-overlays), toasts and correct/incorrect result panels (aha-design-feedback), paywall (aha-design-paywall), settings (aha-design-settings), AntD theming/components (aha-design-antd), or icons (aha-design-icons)."
---

# AhaSlides Shared UI component registry

Source of truth: the shared primitives below. These already encode the AhaSlides accessibility and responsiveness contracts. **Reach for the existing component instead of writing a new one** — a fresh-but-correct reimplementation still fragments the design system and drops house conventions (ARIA wiring, i18n, AntD `Typography` wrappers, the canonical breakpoint).

> **Judge counterpart.** After building or when reviewing UI that should reuse a house primitive, self-check with [[aha-design-shared-components-judge]] — it scores the code PASS/FAIL against these rules and feeds concrete fixes back, closing a build→judge→fix loop.

> **Scope.** The cross-cutting primitives most product UI needs. Applies to all AhaSlides product UI.
>
> **Companion skills.** Surface-specific patterns live in `aha-design-overlays`, `aha-design-feedback`, `aha-design-paywall`, `aha-design-settings`, `aha-design-antd`, and `aha-design-icons`. This skill is the "use our primitive" fallback.

## 1. Registry

| Need                                   | Component / hook                          | Notes                                                                                          |
| -------------------------------------- | ----------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Inline field error (respondent renderers) | `FieldErrorDisplay`                     | `role="alert"`, `aria-live="assertive"`; renders i18n `messageKey`. Wire the field's `aria-describedby` to its `id`. |
| Validation error (AntD form fields)    | a11y `FieldError`                         | Stable `id` for `aria-describedby`, wraps `Typography.Text type="danger"`, renders nothing when empty. |
| Screen-reader announcements            | a11y `LiveRegion`                         | `aria-live="assertive"` + `aria-atomic="true"`; stays in the DOM when empty. No `role="alert"` (avoids double-announce). |
| Accessible progress                    | a11y `Progressbar`                        | `role="progressbar"` + `aria-valuenow/min/max` + `aria-label`; wraps AntD `Progress`.            |
| Viewport shape switch (< 768px)        | `useIsMobile()`                           | For renders that change *shape* (table → card list, sidebar → drawer). **Not** for pure styling. |
| Full-page respondent error             | `ErrorPage`                               | Maps an error code → i18n title/body; `role="alert"`, optional action button, fires telemetry.   |
| Empty state                            | AntD `Empty` pattern                      | `Empty` + a strong title + secondary body, actions in a `Space` (secondary then `type="primary"`). |
| Loading placeholder                    | layout-mirroring skeleton                 | `role="status"` + `aria-busy`, mirrors the real layout (e.g. `EditorGeneratingSkeleton`).        |

## 2. Pick the right field-error component

Two exist on purpose — choose by context:

- **`FieldErrorDisplay`** (respondent element renderers): assertive `role="alert"`, i18n `messageKey` + interpolation values. Used by every respondent input renderer.
- **a11y `FieldError`** (AntD-form contexts): a stable `id` you point `aria-describedby` at, returns `null` when empty, wraps `Typography.Text type="danger"`.

Set `aria-invalid` on the input and `aria-describedby` to the error's `id` either way.

## 3. Responsiveness rule

`useIsMobile()` is for component swaps that genuinely change shape. **Pure CSS styling must use `@media (max-width: 767.98px)` directly** — do not gate styling through the hook. The breakpoint is `767.98px` (avoids a sub-pixel gap at fractional DPR).

## 4. Accessibility house rules

- Wrap text in AntD `Typography` (`Text`/`Paragraph`/`Title`), not raw `<span>`/`<p>`, so it inherits theme tokens.
- Don't convey state by colour alone — pair every status colour with text or an ARIA label.
- Live regions stay mounted even when empty so screen readers track updates.

## 5. Test-case assertions

```
SHARED-01: Field errors use FieldErrorDisplay (respondent renderers) or a11y FieldError (AntD forms) — not a hand-rolled error node
SHARED-02: The input sets aria-invalid and aria-describedby pointing at the error component's id
SHARED-03: Screen-reader announcements use LiveRegion (assertive + atomic, stays mounted when empty) — not an ad-hoc div
SHARED-04: Progress uses the a11y Progressbar wrapper with role=progressbar + aria-valuenow/min/max + aria-label
SHARED-05: useIsMobile() gates shape-changing renders only; pure styling uses @media (max-width: 767.98px)
SHARED-06: Full-page errors use ErrorPage (code → i18n, role=alert); empty states use the AntD Empty pattern with actions in a Space
SHARED-07: Loading placeholders carry role=status + aria-busy and mirror the real layout
SHARED-08: Visible text is wrapped in AntD Typography, not raw span/p
```
