---
name: aha-design-background-judge
description: "Authoritative judge / verdict-giver for surface background colour in AhaSlides product UI — the evaluation counterpart to the *Backgrounds are white by default* rule in aha-design-antd (the build skill). Use whenever an agent reviews, audits, scores, critiques, or self-checks the background colour of a product-UI surface: a PR diff that paints a card / panel / page / section / modal or drawer body / table row / tab panel, a 'is this background allowed?' question, or the self-check that should run after building or restyling a surface. Emits a binary PASS / FAIL verdict per criterion (no partial credit) across 3 criteria — (C1) every surface is white-by-default OR a sanctioned exception (semantic feedback tint via --aha-color{Success,Error,Warning,Info}Bg, the app-shell colorBgLayout grey, an interactive hover/selected/active state fill) OR carries explicit evidence the human asked for the colour, so a decorative or brand-coloured tint on a neutral container fails; (C2) no gradient is used as a background or fill (the only exception is the AI affordance's border-gradient with a white padding-box fill); (C3) every non-white value comes from a semantic/brand token or --aha-* var rather than a raw hex/rgb literal. Burden of proof is on PASS: a non-white surface you cannot justify is a FAIL. Trigger on phrases like 'review this background', 'is this surface white', 'audit background colour', 'why is this card coloured', 'judge my surface colour', 'check the white-background rule', 'is this coloured background allowed', 'self-check after restyling a surface', 'PR review for a coloured panel', 'should this be white'. Do NOT trigger for slide-type canvas / presenting-stage backgrounds (use aha-design-canvas-judge), for building/choosing a background in the first place (use aha-design-antd), or for legitimately building semantic correct/incorrect feedback surfaces (use aha-design-feedback)."
---

# Judging a surface's background colour

This skill is the **judgment counterpart** to the *Backgrounds are white by default*
rule in `aha-design-antd` (which guides building the surface). Reach for it when
reviewing finished product-UI code — a PR diff, a code-review request, or a self-check
at the end of a build — to decide whether a surface's background colour is allowed.
Don't reach for it while building — use `aha-design-antd` for that.

> **Scope:** product-UI surfaces built on the AntD theme — cards, panels, pages,
> sections, modal/drawer bodies, tables/list rows, tab panels. It is **not** for the
> slide-type canvas / presenting stage (that surface is intentionally theme-coloured and
> lives behind an iframe — hand it to `aha-design:aha-design-canvas-judge`).

---

## The rule being judged

From `aha-design-antd`:

> Surfaces are **white**: `colorBgBase` / `colorBgContainer` / `colorBgElevated` =
> `#ffffff`. **Do not** give a surface a coloured, tinted, or gradient background
> **unless the user explicitly asks for it.** White-first is the default; reach for
> colour only on request. Gradients are banned on any background/fill — the only
> sanctioned use is the AI affordance, and even then the gradient sits on the **border
> only** while the fill stays white.

"White by default" is **not** "never any colour." A handful of non-white backgrounds are
functional and correct — the judge must **pass** those and **fail** only *decorative* or
*brand* colour on a surface that has no functional reason to be non-white.

**Sanctioned non-white surfaces (these PASS):**

| Case | What it looks like | Token |
|---|---|---|
| Semantic feedback tint | success/error/warning/info result panel, Alert banner | `--aha-colorSuccessBg` / `…ErrorBg` / `…WarningBg` / `…InfoBg` |
| App-shell layout grey | the `Layout` body behind the app | `colorBgLayout` / `#f5f5f5` |
| Interactive state fill | hover / selected / active row, menu item, chip | fill tokens (`colorFillTertiary`, `controlItemBgActive`, …) |
| AI affordance | gradient on the **border only**, fill stays white | `--aha-ai-gradient-*` on `border-box` |
| Explicitly requested | the human asked for this colour in the task/diff | brand token, **plus a note** |

Everything else non-white — a brand-purple hero card, a tinted section "for emphasis", a
gradient page background — is a **FAIL** unless the diff carries evidence the human asked
for it.

---

## How to use

1. **Find every surface background declaration** in the diff/code — every place a
   `background`, `background-color`, or `fill` is set on a container: CSS / SCSS,
   styled-components, inline `style`, an AntD component token override
   (`colorBgContainer`, `Card.colorBgContainer`, …), or a `className` you can resolve to
   a colour.
2. **Classify each one** with the decision flow below.
3. For each criterion, decide **PASS** or **FAIL**, and capture a 1-line piece of evidence
   (`file:line` where possible).
4. **Emit the verdict report** using the exact template at the bottom — same shape every
   time so reviewers can scan it.

### The decision flow (run per surface)

Each surface is judged **once** per question — the *"is it allowed to be non-white?"*
test is **C1 only** (don't also log it under another criterion), gradients are **C2**, and
the token-vs-hex mechanism is **C3**.

```
For each surface background declaration:
  1. White or unset (inherits white)?              → PASS  (skip)
  2. Is it a gradient?
        AI border-gradient (white padding-box fill)? → PASS
        otherwise                                     → FAIL  (C2)
  3. Non-white flat colour — is it allowed to be non-white? (classify the reason)
        semantic feedback tint (--aha-color*Bg)       → allowed  (C1 PASS)
        app-shell colorBgLayout grey                  → allowed  (C1 PASS)
        interactive-state fill (hover/selected/active)→ allowed  (C1 PASS)
        explicit evidence the human requested colour  → allowed  (C1 PASS + note)
        decorative / brand colour, no reason          → FAIL  (C1)  ← stop here, don't
                                                                       also log under C3
  4. If non-white AND allowed by step 3 — is the value a token / --aha-* var?
        yes                                           → PASS  (C3)
        raw hex / rgb() / hsl() literal               → FAIL  (C3)
  5. Record file:line + 1-line evidence for every FAIL.
```

> **No double-counting.** A decorative brand fill that has no sanctioned reason is a
> **C1** failure and *only* C1 — it never reached the token check (step 4 runs only for
> *allowed* non-white surfaces). C3 fires only when a surface is legitimately non-white but
> uses a raw hex instead of a token. This keeps the same violation cited under the same
> criterion on every run.

**Why binary, no partial credit.** A surface is either white-by-default (or a sanctioned
exception) or it isn't — "mostly white" is a polite FAIL. Binary keeps the judge
consistent across reviewers and runs.

**Burden of proof is on PASS.** If you cannot tell from the diff whether a non-white
colour was requested, mark it **FAIL** and raise it under `## Notes / unverifiable`.
Pretending an unexplained tint passes is how coloured surfaces creep into a white-first
product.

---

## The 3 criteria

### C1. Every surface is white-by-default or a sanctioned exception → PASS / FAIL

**Rule.** Cards, panels, page/section wrappers, modal/drawer bodies, tables/list rows, and
tab panels are **white or unset** — *unless* the non-white background maps to a sanctioned
reason (semantic feedback tint, app-shell `colorBgLayout` grey, an interactive
hover/selected/active state fill) **or** the diff/task carries explicit evidence the human
asked for the colour. A neutral container painted with a **decorative or brand-coloured
tint that has none of those** fails — and it fails **here (C1) only** (see *No
double-counting* above; the token check C3 doesn't re-flag it).

✅ **GOOD**

```tsx
// unset → inherits white colorBgContainer
<Card>
  <SurveyList />
</Card>
```
```css
.dashboard-panel   { background: var(--aha-colorBgContainer); }  /* #ffffff */
.answer--correct   { background: var(--aha-colorSuccessBg); }    /* semantic feedback */
.list-row:hover    { background: var(--aha-colorFillTertiary); } /* interactive state */
```

❌ **BAD**

```css
.dashboard-panel {
  background: var(--brand-violet-purple); /* decorative brand fill on a plain panel */
}
.hero-card {
  background: #f3e8ff; /* tinted "for emphasis" — not requested, not functional */
}
```

**Common failure modes (any one → FAIL):**
- A `Card` / panel / section given a brand or pastel fill for "emphasis" with no request.
- A page or section wrapper painted a non-white colour by default.
- A modal/drawer **body** tinted (headers/footers follow the same rule).
- A tint that *mimics* semantic feedback but isn't a feedback surface (misleading).
- **Unverifiable:** you can't tell whether the human asked → FAIL + note (burden on PASS).

---

### C2. No gradient as a background or fill → PASS / FAIL

**Rule.** No `linear-gradient` / `radial-gradient` / `conic-gradient` used as a
`background` or `fill`. The **only** exception is the AI affordance: the gradient sits on
the **border** (`border-box`) with a white `padding-box` fill behind it.

✅ **GOOD** (the sanctioned AI-border technique)

```css
.ai-input {
  border: 2px solid transparent;
  background:
    linear-gradient(#fff, #fff) padding-box,        /* fill stays white */
    conic-gradient(from var(--aha-ai-gradient-angle),
      var(--aha-ai-gradient-1), var(--aha-ai-gradient-2),
      var(--aha-ai-gradient-3)) border-box;         /* gradient on border only */
}
```

❌ **BAD**

```css
.page {
  background: linear-gradient(135deg, #6a1ebb, #16c49a); /* gradient page background */
}
.cta-card {
  background: radial-gradient(circle, #7f58f0, #d7b8ff); /* gradient fill */
}
```

**Failure modes:** any gradient whose result paints a surface fill (not solely the
border), including "subtle" two-white-stop gradients used decoratively.

---

### C3. Non-white colour comes from a token, never a raw hex → PASS / FAIL

**Rule.** When a surface *is* legitimately non-white (allowed by C1), its value is a
semantic/brand token or an `--aha-*` var — never a hardcoded `#hex` / `rgb()` / `hsl()`
literal. (A non-white surface that *isn't* allowed is already a C1 FAIL — don't re-flag it
here.)

✅ **GOOD**

```css
.answer--incorrect { background: var(--aha-colorErrorBg); }
```

❌ **BAD**

```css
.answer--incorrect { background: #fff1f0; } /* raw hex — even if it's the right colour */
```

**Failure modes:** any hex/`rgb()`/`hsl()` literal as a background value (this overlaps the
repo's hardcoded-colour lint, but the judge flags it on *surfaces* specifically).

---

## Verdict report (emit exactly this shape)

```
## Background verdict

| # | Criterion                                   | Verdict |
|---|---------------------------------------------|---------|
| C1 | White-by-default or a sanctioned exception | ✅ PASS / ❌ FAIL |
| C2 | No gradient background or fill             | ✅ PASS / ❌ FAIL |
| C3 | Non-white colour via token, not raw hex   | ✅ PASS / ❌ FAIL |

**Overall: OK TO SHIP / NEEDS FIX**

## Fails

### ❌ C1 — White-by-default or a sanctioned exception
**Where:** `src/dashboard/Panel.css:12`
**Evidence:** `.dashboard-panel { background: var(--brand-violet-purple) }` — a plain
data panel painted brand purple with no feedback/state/layout role and no request.
**Fix:** remove the fill (inherit white `colorBgContainer`), or, if the colour was asked
for, cite where in the task and keep it as a brand token.

## Passes — brief

C2, C3 — no gradients, no raw-hex surfaces.

## Notes / unverifiable

- (List anything you judged under uncertainty — e.g. "couldn't tell whether the tinted
  banner at `Banner.tsx:8` was requested; marked FAIL per burden-of-proof.")
```

**Overall verdict rule:** any FAIL → `NEEDS FIX`. All PASS → `OK TO SHIP`.

Always include: the 3-row verdict table (in order), a `## Fails` section with a
sub-section per failed criterion (**Where** `file:line`, **Evidence** 1 line, **Fix**
concrete action), a 1-line `## Passes — brief`, and a `## Notes / unverifiable` section if
any judgment was made under uncertainty.

---

## When NOT to use this skill

- **Building or choosing** a background in the first place → use `aha-design-antd` (the
  build skill). This judge evaluates finished work.
- **Slide-type canvas / presenting-stage** backgrounds → use
  `aha-design:aha-design-canvas-judge`. That surface is intentionally theme-coloured.
- **Building** a semantic correct/incorrect feedback surface or CSAT → use
  `aha-design:aha-design-feedback`. (This judge *passes* those tints — it doesn't design
  them.)
- General hardcoded-colour-literal sweeps across a whole diff → the repo lint / the
  `aha-review` Step 3e grep already cover that; this judge is **surfaces**, not every hex.

---

## Closing the build → judge → fix loop

This judge is designed to run at the **end** of a build pass — by a human reviewer or by
the build agent as a self-check. The expected loop:

1. Build the surface with `aha-design-antd` (white-first).
2. Invoke this judge → emits the verdict report.
3. Any FAIL → fix the cited surfaces → re-invoke this judge.
4. Repeat until the verdict is `OK TO SHIP`.

Build-time guidance gets diluted under task pressure; the judge gives a final, structured
chance to catch the coloured-surface violations the build skill warned about but the agent
"forgot" mid-implementation.
