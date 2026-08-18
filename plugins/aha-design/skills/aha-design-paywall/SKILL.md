---
name: aha-design-paywall
description: "Authoritative rules for plan-gated and upsell UI across AhaSlides products — the shared Paywall popover component, the crown badge, the feature label + one-sentence value prop + 'Unlock with the <Plan> plan' line, the single Upgrade CTA, the requiredPlan tiers (essential/pro), the upgrade URL/handler behaviour, and the PAYWALL_SHOWN / PAYWALL_UPGRADE_CLICKED analytics contract. Use whenever an agent is building, editing, or reviewing any pro-gated affordance in AhaSlides UI — locking a feature behind a paid plan, showing an upgrade prompt, adding a crown badge, or wiring an upgrade click. Trigger on phrases like 'paywall', 'upsell', 'upgrade prompt', 'plan-gated', 'pro feature', 'premium feature', 'requiredPlan', 'crown badge', 'lock behind Pro', 'lock behind Plus', 'UpgradePopover', 'gate this feature', 'Upgrade CTA', 'PAYWALL_UPGRADE_CLICKED'. Do NOT trigger for pricing-page marketing copy (use the branding tone skill), plan-gating a single setting row (use aha-design-settings), or generic disabled-button states unrelated to monetisation."
---

# AhaSlides Paywall & upsell design patterns

Source of truth: the shared `Paywall` popover component (`features/paywall/Paywall.tsx`). It mirrors the Presentation app's `UpgradePopover` so the two products feel like one. **Every** pro-gated affordance routes through this one component — when monetisation expands, only this file and the upgrade URL evolve.

> **Judge counterpart.** After building or when reviewing a paywall/upsell, self-check with [[aha-design-paywall-judge]] — it scores the surface PASS/FAIL against these rules and feeds concrete fixes back, closing a build→judge→fix loop.

> **Scope.** Any surface where a feature is locked behind a paid plan: editor affordances, share/distribution options, results features, dashboard actions. Applies to all AhaSlides product UI.
>
> **Companion skills.** Use `aha-design-overlays` for the underlying popover/placement mechanics, `aha-design-settings` for a *single* plan-gated setting row (crown badge in a settings list), and the `aha-branding:*` colour/tone skills for exact tokens and copy voice.

## 1. Always use the shared Paywall component

Do not hand-roll an upgrade prompt, tooltip, or modal for monetisation. Wrap the gated affordance in `<Paywall>` (or use `<PaywallCrownBadge>` as an anchor when the feature has no natural anchor of its own). A bespoke upsell drifts from the presenter app and breaks the single-source-of-truth contract.

## 2. Anatomy

A paywall popover, top to bottom, is always:

1. **Header** — the purple circular crown badge (`CrownBadge`, 16×16, custom SVG — *not* the generic Phosphor Crown) followed by the **feature label**.
2. **Body** — a one-sentence value prop, then the line **"Unlock with the _\<Plan\> plan_."** (plan name bold).
3. **Footer** — a single full-width (`block`) primary **Upgrade** CTA.

No secondary "View plans" button, no dismiss link, no multi-paragraph body inside the popover.

## 3. Props contract

| Prop           | Rule                                                                                          |
| -------------- | --------------------------------------------------------------------------------------------- |
| `featureKey`   | Stable `snake_case` token (e.g. `custom_survey_url`). Drives analytics + DOM hooks. Required.  |
| `featureLabel` | Short title shown next to the crown. Required.                                                 |
| `body`         | One sentence describing what unlocks. Required.                                                |
| `requiredPlan` | `'essential'` or `'pro'`. Defaults to `'pro'`. Drives the "Unlock with the …" line + analytics. |
| `placement`    | Popover side. Defaults to `'top'`.                                                             |
| `trigger`      | `'click'` (default) or `'hover'`.                                                              |
| `onUpgrade`    | Optional. Runs *instead of* opening the pricing page (e.g. an in-app upgrade modal). Analytics still fires first. |

## 4. Copy rules

- **Feature label:** short noun phrase, the name of the locked feature. Not a sentence.
- **Body:** exactly one sentence, describing the *benefit* of unlocking — not "This is a Pro feature." End with a period.
- **Unlock line:** fixed format — "Unlock with the **\<Plan\> plan**." Do not reword.
- **CTA:** "Upgrade" by default. Override via `ctaLabel` only with a clear reason; keep it a verb.

## 5. Analytics contract

- `PAYWALL_SHOWN` fires when the popover opens — props `{ feature: featureKey, plan: requiredPlan }`.
- `PAYWALL_UPGRADE_CLICKED` fires when the CTA is clicked — same props — *before* navigation or `onUpgrade` runs.

Never gate a feature without these events; they are the upsell funnel's denominator and conversion.

## 6. Behaviour

- Default CTA opens `UPGRADE_URL` (`https://ahaslides.com/pricing`) in a new tab (`noopener,noreferrer`) and closes the popover.
- When `onUpgrade` is provided, it runs instead (analytics still fires) and the popover closes.
- The anchor is wrapped in a `<span>` so children don't need to forward refs.

## 7. Visual

- Dark indigo surface (`color="#242442"`), 300px wide, 16px padding, 12px radius.
- The crown badge is the purple-circle custom SVG — do not substitute a Phosphor glyph (it lacks the circular background).

## 8. Crown-badge-only anchor

When a feature has no natural clickable anchor (e.g. a field label), use `<PaywallCrownBadge>` as the visible anchor. It carries `role="img"` and an `aria-label` (default "Upgrade required").

## 9. Test-case assertions

```
PAYWALL-01: Pro-gated affordances use the shared Paywall component — no bespoke upgrade modal/tooltip
PAYWALL-02: Popover header shows the custom CrownBadge (not Phosphor Crown) + a short feature label
PAYWALL-03: Body is exactly one sentence ending in a period; the unlock line uses the fixed "Unlock with the <Plan> plan." format
PAYWALL-04: A single primary block "Upgrade" CTA — no secondary button inside the popover
PAYWALL-05: featureKey is a stable snake_case token reused across analytics and DOM hooks
PAYWALL-06: PAYWALL_SHOWN fires on open and PAYWALL_UPGRADE_CLICKED fires before navigation, both with { feature, plan }
PAYWALL-07: requiredPlan is one of essential|pro and drives both the unlock line and the analytics plan prop
```
