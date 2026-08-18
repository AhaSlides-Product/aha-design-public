---
name: aha-design-status-badges-judge
description: "Authoritative judge / verdict-giver for a status/state indicator on a domain object in AhaSlides product UI — the evaluation counterpart to aha-design-status-badges (the build skill). Use whenever an agent reviews, audits, scores, critiques, or self-checks a status pill: a PR diff that renders a survey/presentation/collector state (draft/published/closed/archived, active/inactive, or any enum-driven state), a 'is this status pill correct?' question, or the self-check that should run after building a state pill. Emits a binary PASS / FAIL verdict per criterion (no partial credit) across the status-pill rules — (C1) the pill is a dot + a localised text label; (C2) the markup uses the aha-status-pill / aha-status-pill--{status} class convention with a per-state modifier; (C3) the element carries the role=status + aria-label accessibility contract and state is never conveyed by dot colour alone; (C4) the label is sourced from i18n, never a hardcoded string; (C5) colour is driven by the --{status} modifier class on semantic tokens, no inline hex. Burden of proof is on PASS: a pill you cannot justify against the rules is a FAIL. Trigger on phrases like 'review this status badge', 'is this status pill correct', 'judge my status indicator', 'check the draft/published badge', 'audit status-pill a11y', 'audit status-pill i18n', 'self-check after building a state pill', 'score my status badge', 'does this state pill follow our rules'. Do NOT trigger while BUILDING a status pill (use aha-design-status-badges), for a generic AntD Tag/Badge unrelated to a domain status enum, for notification/count badges, or for the plan-gating crown badge (use aha-design-paywall)."
---

# Judging a status / state indicator

This skill is the **judgment counterpart** to `aha-design-status-badges` (which guides
building the same pill). Reach for it when reviewing finished status-indicator work — a
PR diff, a review request, or a self-check at the end of a build — to decide whether a
status pill follows the house rules. Don't reach for it while building — use
`aha-design-status-badges` for that.

> **Scope.** Any indicator whose job is "what lifecycle state is this domain object in?"
> — a survey/presentation/collector status, a draft/published/closed/archived state, an
> active/inactive label, any enum-driven state pill. It is **not** for a generic AntD
> `Tag`/`Badge` with no domain status enum behind it, a notification/count badge, or the
> plan-gating crown badge (that is upsell — hand it to `aha-design-paywall`).
>
> **Cross-skill reference.** Hand off other layers to their own skills: a glyph beside
> the state → `aha-design-icons`; the semantic colour each state maps to → the
> `aha-branding:*` colour skill; the crown/upsell badge → `aha-design-paywall`. This
> judge checks that the pill is correctly *shaped, classed, labelled, coloured, and
> announced* — nothing else.

---

## How to use

1. Locate the status indicator under review — the `StatusBadge` component
   (`features/dashboard/StatusBadge.tsx`) or any markup that renders a domain object's
   state. Read the target rules from the build skill —
   `aha-design-status-badges/SKILL.md` §1–§6 (RULES + "Test-case assertions"). Don't
   judge from memory; diff against them.
2. Confirm the indicator is genuinely status-enum-driven. If it's a free-form label, a
   count, a notification dot, or a crown badge, this judge does **not** apply — say so
   and route it (see *When NOT to use this skill*).
3. For each criterion below, gather evidence, decide **PASS** or **FAIL**, and capture a
   1-line piece of evidence (`file:line` where possible).
4. **Emit the verdict report** using the exact template at the bottom — same shape every
   time so reviewers can scan it.

**Why binary, no partial credit.** A pill either honours each rule or it doesn't —
"mostly right" is a polite FAIL. Half-credit invites endless argument about whether a
gap is 60% or 70% correct. Binary keeps the judge consistent across reviewers and runs.

**Burden of proof is on PASS.** Some rules can't be confirmed from static markup — a
label's i18n source needs the translation call visible, colour-not-alone needs the
rendered text present. If you cannot verify a criterion, mark **FAIL** and say why under
`## Notes / unverifiable`; don't wave it through. Pretending unclear code passes is how
un-announced, colour-only, hardcoded pills reach prod.

---

## The 5 criteria

### C1. The pill is a dot + a localised text label → PASS / FAIL

**Rule.** A status pill is a single inline element containing a **dot**
(`aha-status-pill__dot`) carrying the state colour **and** the visible **text label**.
The dot is decorative; the text is the source of truth. A dot with no text, or text with
the state carried only by the dot, fails.

✅ **GOOD**

```tsx
<span className={`aha-status-pill aha-status-pill--${status}`} …>
  <span className="aha-status-pill__dot" />
  {label}
</span>
```

❌ **BAD**

```tsx
<span className="aha-status-pill aha-status-pill--published" />  {/* dot only, no label */}
```

**Common failure modes (any one → FAIL):**
- A coloured dot with no text label beside it.
- The state conveyed by dot colour alone (no readable word).
- A bare label with no pill wrapper / dot element.

---

### C2. Markup uses the aha-status-pill / aha-status-pill--{status} convention → PASS / FAIL

**Rule.** The base class is `aha-status-pill` plus a **per-state modifier**
`aha-status-pill--{status}`, and the dot is `aha-status-pill__dot`. The state name comes
from the status enum. No ad-hoc class name, no one-off wrapper.

✅ **GOOD**

```tsx
className={`aha-status-pill aha-status-pill--${status}`}
```

❌ **BAD**

```tsx
className="badge badge-green"        {/* ad-hoc, not the pill convention */}
className="aha-status-pill"          {/* base class only, no --{status} modifier */}
```

**Common failure modes (any one → FAIL):**
- Missing the `aha-status-pill--{status}` modifier (base class alone).
- A bespoke class family (`status-tag`, `badge-*`) instead of `aha-status-pill`.
- The dot styled inline instead of via `aha-status-pill__dot`.

---

### C3. The role=status + aria-label accessibility contract is present → PASS / FAIL

**Rule.** The element carries `role="status"` **and** an `aria-label` equal to the
visible label, so the state is announced to assistive tech and **not conveyed by colour
alone**. The text label is always present — the dot colour is never the sole carrier of
meaning.

✅ **GOOD**

```tsx
<span className="aha-status-pill aha-status-pill--closed" role="status" aria-label={label}>
  <span className="aha-status-pill__dot" />
  {label}
</span>
```

❌ **BAD**

```tsx
<span className="aha-status-pill aha-status-pill--closed">  {/* no role, no aria-label */}
  <span className="aha-status-pill__dot" />
</span>
```

**Common failure modes (any one → FAIL):**
- Missing `role="status"`.
- Missing `aria-label`, or an `aria-label` that doesn't match the visible label.
- State communicated by dot colour with no announced/visible text.

---

### C4. The label is sourced from i18n, never hardcoded → PASS / FAIL

**Rule.** The visible label is always a translation lookup —
``t(`survey_status.${status}`)`` or the equivalent namespace for the object — never a
hardcoded visible string. Adding a state means adding a translation key (and a
`--{status}` modifier), not typing the word.

✅ **GOOD**

```tsx
const label = t(`survey_status.${status}`);
```

❌ **BAD**

```tsx
const label = "Published";                         {/* hardcoded string */}
const label = status === "draft" ? "Draft" : "…";  {/* hardcoded branch */}
```

**Common failure modes (any one → FAIL):**
- A literal English string as the visible label.
- A hardcoded map of status → display word instead of an i18n key.
- A new state shipped with no matching translation key.

---

### C5. Colour comes from the --{status} modifier class, no inline hex → PASS / FAIL

**Rule.** The **modifier class** — not an inline style or prop — drives the pill and dot
colour, and it resolves to **semantic tokens**. Every state's colour lives in one
stylesheet on tokens; the visible label is never coloured by a hardcoded hex.

✅ **GOOD**

```css
.aha-status-pill--published .aha-status-pill__dot { background: var(--aha-colorSuccess); }
```

❌ **BAD**

```tsx
<span className="aha-status-pill" style={{ color: "#16c49a" }}>  {/* inline hardcoded hex */}
```

**Common failure modes (any one → FAIL):**
- Colour set via inline `style` / a colour prop instead of the modifier class.
- A raw `#hex` / `rgb()` literal for the pill or dot colour.
- Colour applied without a `--{status}` modifier (so states can't diverge in one place).

---

## Verdict report (emit exactly this shape)

```markdown
# Status-badge judge report — <component name or file path>

| # | Criterion | Verdict |
|---|---|---|
| C1 | Dot + localised text label | ✅ PASS |
| C2 | aha-status-pill / --{status} class convention | ✅ PASS |
| C3 | role=status + aria-label, not colour-alone | ❌ FAIL |
| C4 | Label sourced from i18n, never hardcoded | ❌ FAIL |
| C5 | Colour via --{status} modifier, no inline hex | ✅ PASS |

**Overall: NEEDS FIX** (2 failing criteria)

## Fails

### ❌ C3 — role=status + aria-label
**Where:** `features/dashboard/StatusBadge.tsx:14`
**Evidence:** the pill renders with no `role="status"` and no `aria-label` — the state
is announced by nothing and, with the dot as the only colour carrier, conveyed by colour
alone.
**Fix:** add `role="status"` and `aria-label={label}` to the pill span; keep the visible
text label present.

### ❌ C4 — Label from i18n
**Where:** `features/dashboard/StatusBadge.tsx:9`
**Evidence:** `const label = "Published"` — a hardcoded English string as the visible label.
**Fix:** use ``t(`survey_status.${status}`)`` and add the translation key for the state.

## Passes — brief

C1, C2, C5 — dot + label, the aha-status-pill convention, and modifier-driven colour all check out.

## Notes / unverifiable

- (List anything you judged under uncertainty — e.g. "couldn't confirm the label is an
  i18n key without the translation call in view; marked FAIL per burden-of-proof.")
```

**Overall verdict rule:** any FAIL → `NEEDS FIX`. All PASS → `OK TO SHIP`.

Always include: the 5-row verdict table (in order); a `## Fails` section with a
sub-section per failed criterion (**Where** `file:line`, **Evidence** 1 line, **Fix**
concrete action); a 1-line `## Passes — brief`; and a `## Notes / unverifiable` section
whenever a judgment was made under uncertainty.

---

## When NOT to use this skill

- **Building or editing** a status pill in the first place → use
  `aha-design-status-badges` (the build skill). This judge evaluates finished work.
- A **generic AntD `Tag`/`Badge`** with no domain status enum behind it, or a free-form
  label / count → not a status pill; this judge doesn't apply.
- A **notification / count badge** (the red number dot) → not a lifecycle-state pill.
- The **plan-gating crown badge** → that is upsell, not status → use
  `aha-design-paywall`.

---

## Closing the build → judge → fix loop

This judge runs at the **end** of a build pass — by a human reviewer or by the build
agent as a self-check. The expected loop:

1. Build the pill with `aha-design-status-badges` (dot + i18n label, the
   `aha-status-pill` convention, the a11y contract, modifier-driven colour).
2. Invoke this judge → emits the verdict report.
3. Any FAIL → fix the specific files cited under `## Fails` → re-invoke this judge.
4. Repeat until the verdict is `OK TO SHIP`.

Build-time guidance gets diluted under task pressure — an agent classes the pill right
but forgets the `aria-label`, or hardcodes "Published" because the enum was in reach. The
judge gives a final, structured chance to catch exactly the traps the build skill warned
about but the agent dropped mid-implementation.
