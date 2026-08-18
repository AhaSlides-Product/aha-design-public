# aha-design-public

A **public extract** of the AhaSlides `aha-design` Claude Code plugin — design-system
guidelines and paired PASS/FAIL judges for building and reviewing product UI.

It is a Claude Code **plugin marketplace**: add it, then install the `aha-design` plugin.

> ⚠️ **Not cleared for release yet.** This directory is prepared for review. Publishing it
> publicly (making the repo public / pushing to a public remote) requires **AhaSlides design +
> legal sign-off** first. It contains AhaSlides design IP (brand colours, exact type scale,
> component specs). Do not push public until approved.

## What's included (23 skills)

Each build skill ships a paired `-judge` that scores a finished implementation PASS/FAIL per
rule and suggests fixes (a build → judge → fix loop). Every judge ships an `evals.json` review
gate.

| Area | Build skill | Judge |
|---|---|---|
| Ant Design v6 conventions (tokens, Button system, WCAG AA) | `aha-design-antd` | `aha-design-antd-judge` |
| Surface background colour (white-by-default) | — | `aha-design-background-judge` |
| Settings / config UX + slide-type right-panel config | `aha-design-settings` | `aha-design-settings-judge` |
| Slide-type **canvas** (16:9 stage, framed vs full-canvas, **iframe**) | `aha-design-canvas` | `aha-design-canvas-judge` |
| **Audience** screen (join/response/results/leaderboard iframe) | `aha-design-audience` | `aha-design-audience-judge` |
| Product typography (18-role type scale) | `aha-design-typography` | `aha-design-typography-judge` |
| Canonical data grid (shared DataTable) | `aha-design-table` | `aha-design-table-judge` |
| Modal / drawer / popover overlays | `aha-design-overlays` | `aha-design-overlays-judge` |
| Paywall / upsell UI | `aha-design-paywall` | `aha-design-paywall-judge` |
| Feedback & notifications (toasts, alerts, inline) | `aha-design-feedback` | `aha-design-feedback-judge` |
| Status badges | `aha-design-status-badges` | `aha-design-status-badges-judge` |
| Shared UI primitives (field errors, a11y, useIsMobile, empty/loading) | `aha-design-shared-components` | `aha-design-shared-components-judge` |

## What was intentionally left out (internal-only)

These skills depend on resources an outside user can't reach, or are internal data, so they
are **not** part of this public extract:

- `aha-design-icons` (+ judge) — the icon inventory comes from the internal AhaSlides Storybook.
- `aha-design-component-standard` (+ judge) — measured visual TARGET screenshots from the
  internal Storybook.
- `aha-user-research` — reads the internal AhaSlides Confluence / wiki.

Some included skills still contain **"see also"** pointers to those names, and to the internal
`aha-branding:*` token plugin. Treat those pointers as optional — map them to your own icon set
and brand tokens.

## Adapting to your brand

The colour tokens (e.g. `colorPrimary #6a1ebb`), the exact type scale, and component measurements
are **AhaSlides' own**. Swap `--aha-*` vars / token values for your brand before relying on the
visual specifics; the *structure and rules* (toggle vs checkbox, help-text discipline, iframe/canvas
framing, WCAG AA, Button-system discipline) are brand-neutral and reusable as-is.

## Install (once published)

```
/plugin marketplace add AhaSlides-Product/aha-design-public
/plugin install aha-design
```

Then the skills load automatically when you design, build, or review product UI, or invoke one by
name, e.g. `/aha-design-settings`.

## License

MIT (as declared by the source plugin manifest) — subject to the sign-off note above.
