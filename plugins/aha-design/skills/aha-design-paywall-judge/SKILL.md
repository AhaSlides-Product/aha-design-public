---
name: aha-design-paywall-judge
description: "Authoritative judge / verdict-giver for a plan-gated / upsell affordance in AhaSlides product UI — the evaluation counterpart to aha-design-paywall (the build skill). Use whenever an agent reviews, audits, scores, critiques, or self-checks a paywall / upgrade prompt: a PR diff that gates a feature behind a paid plan, an 'is this upsell correct?' question, or the self-check that should run after building or restyling a pro-gated surface. Emits a binary PASS / FAIL verdict per criterion (no partial credit) across the paywall rules — the gated affordance routes through the shared Paywall component (not a bespoke modal/tooltip), the popover anatomy is exactly crown badge + feature label + one-sentence value prop + fixed 'Unlock with the <Plan> plan.' line + a single primary block Upgrade CTA, the props contract is honoured (featureKey a stable snake_case token, requiredPlan one of essential|pro), the copy rules hold (one-sentence benefit body, fixed unlock line, verb CTA), the PAYWALL_SHOWN / PAYWALL_UPGRADE_CLICKED analytics contract is wired with { feature, plan } and fires before navigation, the upgrade URL/handler behaviour is correct, and a feature with no natural anchor uses the crown-badge-only anchor. Burden of proof is on PASS: a gated affordance you cannot confirm routes through the shared component and fires both events is a FAIL. Trigger on phrases like 'review this paywall', 'is this upsell correct', 'judge my upgrade prompt', 'check the crown badge', 'audit the paywall analytics', 'does this upgrade prompt follow our rules', 'self-check after gating a feature', 'PR review for a pro-gated feature', 'is this the shared Paywall component'. Do NOT trigger while BUILDING a paywall (use aha-design-paywall), for pricing-page marketing copy (use the branding tone skill), for plan-gating a single setting row (use aha-design-settings), or for generic disabled-button states unrelated to monetisation."
---

# Judging a paywall / upsell affordance

This skill is the **judgment counterpart** to `aha-design-paywall` (which guides
building the same surface). Reach for it when reviewing finished pro-gated work — a
PR diff, a review request, or a self-check at the end of a build — to decide whether an
upgrade prompt is built correctly. Don't reach for it while building — use
`aha-design-paywall` for that.

> **Scope.** Any surface where a feature is locked behind a paid plan and an upgrade
> prompt is shown: editor affordances, share/distribution options, results features,
> dashboard actions. This judge checks the **paywall popover itself** — that it is the
> shared component, correctly shaped, correctly wired, and correctly instrumented.
>
> **Cross-skill reference.** Hand off adjacent layers: the underlying popover/placement
> mechanics → `aha-design-overlays`; a *single* plan-gated setting **row** in a settings
> list → `aha-design-settings` / `aha-design-settings-judge`; exact colour tokens and
> copy voice → the `aha-branding:*` skills. This judge does not re-judge how the
> settings row that opens the paywall is grouped, nor the pricing page it links to.

---

## How to use

1. **Find every pro-gated affordance** in the diff/code — every place a feature is
   locked behind a paid plan and an upgrade prompt is shown: a `<Paywall>` wrapper, a
   `<PaywallCrownBadge>` anchor, or any hand-rolled upgrade modal/tooltip/popover that
   is doing a paywall's job.
2. **Read the target rules from the build skill** — `aha-design-paywall/SKILL.md`
   §1–§9 (the RULES and the **Test-case assertions** PAYWALL-01…07). Don't judge from
   memory; diff the surface against these — the exact event names
   (`PAYWALL_SHOWN` / `PAYWALL_UPGRADE_CLICKED`), tier names (`essential` / `pro`), and
   prop names (`featureKey`, `featureLabel`, `body`, `requiredPlan`, `onUpgrade`) are
   load-bearing and must match verbatim.
3. For each criterion below, gather evidence, decide **PASS** or **FAIL**, and capture a
   1-line piece of evidence (`file:line` where possible).
4. **Emit the verdict report** using the exact template at the bottom — same shape every
   time so reviewers and the build agent that will fix it can scan it.

**The universal FAIL rule.** If the surface matches a documented BAD pattern, or
violates any rule in `aha-design-paywall`, the criterion it belongs to is a **FAIL** —
automatically, no exceptions. The worked examples are illustrations, not the whole
list; the rule binds everywhere. Never exempt a violation because it "looks fine,"
"still converts," or "wasn't in the examples."

**Why binary, no partial credit.** A paywall either routes through the shared component,
carries the exact anatomy, and fires both events — or it doesn't. "Mostly there" is a
polite FAIL. Binary keeps the judge consistent across reviewers and runs, and stops
endless argument about whether a gap is 60% or 70% correct.

**Burden of proof is on PASS.** Some rules can't be confirmed from static markup — that
`PAYWALL_UPGRADE_CLICKED` fires *before* navigation needs the call order, that the CTA
opens `UPGRADE_URL` in a new tab needs the handler. If you cannot verify a criterion,
mark **FAIL** and say why under `## Notes / unverifiable`; don't wave it through.
Pretending an unwired paywall passes is how the upsell funnel loses its denominator.

---

## The 7 criteria

### C1. The gated affordance uses the shared Paywall component → PASS / FAIL

**Rule.** Every pro-gated affordance wraps in `<Paywall>` (or uses `<PaywallCrownBadge>`
as the anchor when the feature has no natural anchor). No hand-rolled upgrade modal,
tooltip, or popover for monetisation — a bespoke upsell drifts from the presenter app's
`UpgradePopover` and breaks the single-source-of-truth contract (PAYWALL-01).

✅ **GOOD**

```tsx
<Paywall featureKey="custom_survey_url" featureLabel="Custom survey URL"
         body="Give your survey a branded, memorable link." requiredPlan="pro">
  <UrlField disabled />
</Paywall>
```

❌ **BAD**

```tsx
<Modal title="Upgrade to Pro">        {/* bespoke upsell modal */}
  <p>This is a Pro feature. Upgrade to unlock it.</p>
  <Button onClick={goPricing}>See plans</Button>
</Modal>
```

**Failure modes:** a custom `Modal`/`Tooltip`/`Popover` built for the upsell; an
inline "upgrade" banner rolled by hand; anything that gates a feature without going
through `Paywall` / `PaywallCrownBadge`.

---

### C2. Popover anatomy is exactly correct → PASS / FAIL

**Rule.** The popover is, top to bottom: **crown badge** (the purple-circle custom
`CrownBadge`, 16×16 SVG — *not* the generic Phosphor Crown) + **feature label**; then a
**one-sentence value prop**; then the line **"Unlock with the _\<Plan\> plan_."** (plan
name bold); then a **single** full-width (`block`) primary **Upgrade** CTA. No secondary
"View plans" button, no dismiss link, no multi-paragraph body (PAYWALL-02, -03, -04).

✅ **GOOD** — crown badge + short label, one-sentence body, fixed unlock line, one block CTA.

❌ **BAD**

```tsx
<Popover>
  <Crown />                                   {/* Phosphor glyph — no purple circle */}
  <h4>Custom survey URL is a premium feature and gives you…</h4>  {/* multi-line body */}
  <Button block type="primary">Upgrade</Button>
  <Button block>View all plans</Button>       {/* secondary CTA — banned */}
</Popover>
```

**Failure modes:** Phosphor `Crown` instead of the custom `CrownBadge`; a body longer
than one sentence; a missing or reworded unlock line; a secondary button / dismiss link
inside the popover; a non-`block` or non-primary CTA.

---

### C3. Props contract is honoured → PASS / FAIL

**Rule.** `featureKey` is a stable `snake_case` token (e.g. `custom_survey_url`) reused
across analytics and DOM hooks; `featureLabel` and `body` are present; `requiredPlan` is
**one of `essential` | `pro`** (defaults to `pro`) — a real tier, not an invented plan
name or a display string like "Pro plan" (PAYWALL-05, -07).

✅ **GOOD**

```tsx
<Paywall featureKey="results_export" featureLabel="Export results"
         body="Download every response as a CSV." requiredPlan="essential" />
```

❌ **BAD**

```tsx
<Paywall featureKey="Results Export"          {/* not snake_case, unstable */}
         requiredPlan="premium" />            {/* not a real tier (essential|pro) */}
```

**Failure modes:** `featureKey` in `camelCase`/`Title Case`/with spaces; a per-render
or duplicated key; `requiredPlan` set to anything other than `essential`/`pro`
(`plus`, `premium`, `"Pro"`, a display label); a missing required prop.

---

### C4. Copy rules are followed → PASS / FAIL

**Rule.** **Feature label** is a short noun phrase (the locked feature's name), not a
sentence. **Body** is exactly one sentence describing the *benefit* of unlocking (not
"This is a Pro feature."), ending in a period. **Unlock line** uses the fixed format —
"Unlock with the **\<Plan\> plan**." — not reworded. **CTA** is "Upgrade" by default (a
verb); `ctaLabel` is overridden only with a clear reason and stays a verb.

✅ **GOOD** — label "Custom survey URL"; body "Give your survey a branded, memorable link."; unlock line verbatim; CTA "Upgrade".

❌ **BAD**

```
featureLabel: "Unlock a custom URL for your survey now!"   // a sentence, not a noun phrase
body:         "This is a Pro feature."                      // states the tier, not the benefit
CTA:          "Go Pro"                                       // not the verb "Upgrade" without reason
```

**Failure modes:** a sentence/CTA-style feature label; a body that names the tier
instead of the benefit, is multi-sentence, or drops the period; a reworded unlock line;
a non-verb or gratuitously-overridden CTA.

---

### C5. The analytics contract is wired → PASS / FAIL

**Rule.** `PAYWALL_SHOWN` fires when the popover opens and `PAYWALL_UPGRADE_CLICKED`
fires when the CTA is clicked — each with props `{ feature: featureKey, plan:
requiredPlan }`, and the click event fires **before** navigation or `onUpgrade` runs.
Never gate a feature without both events; they are the funnel's denominator and
conversion (PAYWALL-06).

✅ **GOOD**

```tsx
const onCta = () => {
  track('PAYWALL_UPGRADE_CLICKED', { feature: featureKey, plan: requiredPlan }); // fires first
  onUpgrade ? onUpgrade() : openUpgradeUrl();
};
```

❌ **BAD**

```tsx
const onCta = () => {
  openUpgradeUrl();                                          // navigates first
  track('upgrade_clicked');                                  // wrong name, no {feature,plan}, too late
};
// …and no PAYWALL_SHOWN on open at all
```

**Failure modes:** missing `PAYWALL_SHOWN` on open; missing `PAYWALL_UPGRADE_CLICKED`;
either event with a renamed key or without `{ feature, plan }`; the click event firing
*after* navigation/`onUpgrade`. **Unverifiable** call order → FAIL + note.

---

### C6. Upgrade URL / handler behaviour is correct → PASS / FAIL

**Rule.** The default CTA opens `UPGRADE_URL` (`https://ahaslides.com/pricing`) in a new
tab with `noopener,noreferrer`, then closes the popover. When `onUpgrade` is provided it
runs **instead** (analytics still fires first) and the popover still closes. The anchor
is wrapped in a `<span>` so children don't need to forward refs.

✅ **GOOD**

```tsx
window.open(UPGRADE_URL, '_blank', 'noopener,noreferrer'); // default path
close();
// or: onUpgrade?.() runs instead, popover still closes
```

❌ **BAD**

```tsx
window.location.href = UPGRADE_URL;   // same-tab, no noopener/noreferrer
// popover left open; onUpgrade ignored when provided
```

**Failure modes:** same-tab navigation; missing `noopener,noreferrer`; a hardcoded
pricing URL that isn't `UPGRADE_URL`; the popover not closing; `onUpgrade` provided but
not honoured (or firing analytics after it). **Unverifiable** handler → FAIL + note.

---

### C7. Crown-badge-only anchor used where the feature has no anchor → PASS / FAIL

**Rule.** When a feature has no natural clickable anchor (e.g. a bare field label), the
visible anchor is `<PaywallCrownBadge>`, which carries `role="img"` and an `aria-label`
(default "Upgrade required"). Don't invent a bespoke lock icon or an unlabelled glyph
for this job.

✅ **GOOD**

```tsx
<label>Theme colour <PaywallCrownBadge featureKey="custom_theme" /></label>
```

❌ **BAD**

```tsx
<label>Theme colour <LockIcon onClick={showUpsell} /></label>  {/* bespoke, no role/aria-label */}
```

**Failure modes:** an ad-hoc lock/crown glyph as the anchor; a `PaywallCrownBadge`
missing its `role="img"` / `aria-label`; a Phosphor Crown standing in for the badge.

---

## Output format — the verdict report

Always emit this exact structure (compact, scannable for reviewers and the build agent
that will fix it):

```markdown
# Paywall judge report — <surface name or file path>

| # | Criterion | Verdict |
|---|---|---|
| C1 | Uses the shared Paywall component | ✅ PASS / ❌ FAIL |
| C2 | Popover anatomy exactly correct | ✅ PASS / ❌ FAIL |
| C3 | Props contract honoured | ✅ PASS / ❌ FAIL |
| C4 | Copy rules followed | ✅ PASS / ❌ FAIL |
| C5 | Analytics contract wired | ✅ PASS / ❌ FAIL |
| C6 | Upgrade URL / handler behaviour | ✅ PASS / ❌ FAIL |
| C7 | Crown-badge-only anchor where needed | ✅ PASS / ❌ FAIL / ➖ N/A |

**Overall: OK TO SHIP / NEEDS FIX**

## Fails

### ❌ C1 — Uses the shared Paywall component
**Where:** `features/editor/CustomUrl.tsx:88`
**Evidence:** upgrade prompt is a hand-rolled `<Modal>` with a "See plans" button, not `<Paywall>` — drifts from the shared component / presenter `UpgradePopover`.
**Fix:** wrap the gated field in `<Paywall featureKey="custom_survey_url" featureLabel="Custom survey URL" body="…" requiredPlan="pro">`; delete the bespoke modal.

## Passes — brief

C2–C7 — anatomy, props, copy, analytics, handler, and anchor check out.

## Notes / unverifiable

- (List anything judged under uncertainty — e.g. "couldn't confirm from static markup
  that PAYWALL_UPGRADE_CLICKED fires before window.open; marked FAIL per burden-of-proof.")
```

**Overall verdict rule:** any FAIL → `NEEDS FIX`. All applicable criteria PASS (`➖ N/A`
allowed for C7 when the feature has its own natural anchor) → `OK TO SHIP`.

Always include: the verdict table (all 7 rows in order); a `## Fails` section with a
sub-section per failed criterion (**Where** `file:line`, **Evidence** 1 line, **Fix**
concrete action); a 1-line `## Passes — brief`; and a `## Notes / unverifiable` section
whenever a judgment was made under uncertainty or C7 was marked N/A.

---

## When NOT to use this skill

- The user is **building / editing** a paywall or upsell → use `aha-design-paywall`.
- Reviewing **pricing-page marketing copy** (tone, headlines, plan comparison) → the
  `aha-branding:*` tone skill, not this product-UI judge.
- Reviewing a **single plan-gated setting row** in a settings list → use
  `aha-design-settings` / `aha-design-settings-judge` (this judge covers the Paywall
  popover the crown opens, not how the setting row is grouped).
- Reviewing a **generic disabled button / empty state** unrelated to monetisation →
  other `aha-design-*` skills; a disabled control is not a paywall.

---

## Closing the build → judge → fix loop

This judge runs at the **end** of a build pass — by a human reviewer or by the build
agent as a self-check. The expected loop:

1. Build the gated affordance with `aha-design-paywall` (shared component, correct
   anatomy, wired analytics).
2. Invoke this judge → emits the verdict report.
3. Any FAIL → fix the specific files cited under `## Fails` → re-invoke this judge.
4. Repeat until the verdict is `OK TO SHIP`.

The reason for the loop: build-time guidance gets diluted under task pressure — an agent
wires the popover well but forgets `PAYWALL_SHOWN` on open, or reaches for a Phosphor
Crown instead of the custom badge, or fires the click event after navigation. The judge
gives a final, structured chance to catch exactly the traps the build skill warned about
but the agent dropped mid-implementation.
