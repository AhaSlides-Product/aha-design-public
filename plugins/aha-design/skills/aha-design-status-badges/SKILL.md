---
name: aha-design-status-badges
description: "Authoritative rules for status/state indicators on domain objects across AhaSlides products — the status pill (dot + localised label), the aha-status-pill / aha-status-pill--{status} class convention, the role=status + aria-label accessibility contract, status labels sourced from i18n (never hardcoded), and colour driven by the status modifier class (semantic tokens, no inline hex). Use whenever an agent is building, editing, or reviewing an indicator that reflects an object's lifecycle state — a survey/presentation status, draft/published/closed/archived state, active/inactive label, or any enum-driven state pill. Trigger on phrases like 'status badge', 'status pill', 'status indicator', 'draft badge', 'published badge', 'closed badge', 'archived state', 'SurveyStatus', 'active/inactive label', 'show the state of', 'colour-code the status'. Do NOT trigger for generic AntD Tag/Badge unrelated to a domain status enum, notification/count badges, or the plan-gating crown badge (use aha-design-paywall)."
---

# AhaSlides Status badge design patterns

Source of truth: the `StatusBadge` component and the `aha-status-pill` class family (`features/dashboard/StatusBadge.tsx`). A status pill communicates the **lifecycle state of a domain object** — a survey, presentation, or collector — in one glanceable, screen-reader-announced token.

> **Scope.** Any indicator whose job is "what state is this object in?" Applies to all AhaSlides product UI.
>
> **Companion skills.** Use `aha-design-icons` for any glyph rendered beside a status, the `aha-branding:*` colour skill for the semantic colour each state maps to, and `aha-design-paywall` for the crown badge (that is upsell, not status).

> **Judge counterpart.** After building or when reviewing a status pill, self-check with [[aha-design-status-badges-judge]] — it scores the badge PASS/FAIL against these rules and feeds concrete fixes back, closing a build→judge→fix loop.

## 1. When to use a status pill

Use it to reflect a value from a known **status enum** (e.g. `SurveyStatus`: draft / published / closed / archived). Do not use it for free-form labels, counts, or notification dots — those are AntD `Badge`/`Tag` territory.

## 2. Anatomy

A status pill is a single inline element containing:

1. A **dot** (`aha-status-pill__dot`) carrying the state colour.
2. The **localised label** text.

```tsx
<span
  className={`aha-status-pill aha-status-pill--${status}`}
  aria-label={label}
  role="status"
  data-testid={`status-badge-${status}`}
>
  <span className="aha-status-pill__dot" />
  {label}
</span>
```

## 3. Class convention

- Base class `aha-status-pill` plus a **modifier per state**: `aha-status-pill--{status}`.
- The modifier — not an inline style or prop — controls the colour of the pill and its dot. This keeps every state's colour in one stylesheet and on semantic tokens. Never set the colour inline with hardcoded hex.

## 4. Labels come from i18n

- The label is always `t(\`survey_status.${status}\`)` (or the equivalent namespace for the object). Never hardcode the visible string.
- Adding a new state means adding both a translation key and a `--{status}` modifier class.

## 5. Accessibility

- `role="status"` and an `aria-label` equal to the visible label, so the state is announced and not conveyed by colour alone.
- The dot is decorative — the text label is the source of truth, never the dot colour by itself.

## 6. Test-case assertions

```
STATUS-01: Status pills render only for values from a known status enum — not free-form labels or counts
STATUS-02: Markup is aha-status-pill + aha-status-pill--{status}, with a dot span and a text label
STATUS-03: Colour is driven by the --{status} modifier class — no inline/hardcoded hex
STATUS-04: The visible label is sourced from i18n (t('<namespace>.<status>')), never a hardcoded string
STATUS-05: The element carries role="status" and an aria-label matching the visible label
STATUS-06: State is not conveyed by dot colour alone — the text label is always present
```
