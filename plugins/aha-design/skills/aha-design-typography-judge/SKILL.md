---
name: aha-design-typography-judge
description: "The verdict counterpart to [[aha-design-typography]] — invoke it whenever that skill has been applied, and whenever you review, audit, or self-check the typography of AhaSlides product-UI text (a PR diff touching in-app text styles, a post-build self-check, an 'is this text style correct?'). Emits a binary PASS / FAIL per criterion (no partial credit) against the fixed Design System V3 scale — checking font family (Plus Jakarta Sans, except the Inter Capitalized/Small/Tiny labels), weight (400/600 only; Display 700 and Inter tiny 600 the exceptions), size snapped to the scale (no in-between px), line-height as a role-matched unitless ratio, letter-spacing by category, the role matching the text's job, and that the surface is product UI not marketing/brand (→ [[aha-branding-typography]]). Trigger on 'review this typography', 'check the font sizes/weights', 'is this text style correct', 'audit the type scale', 'PR review touching typography'. Not for first-time building — use [[aha-design-typography]]."
---

# Judging AhaSlides product-UI typography

This skill is the **judgment counterpart** to [[aha-design-typography]] (which guides
*setting* text). Reach for it when reviewing finished text styles — a PR diff, a code
review, or a self-check at the end of a build — to close a **build → judge → fix** loop.
Don't reach for it while first choosing values — use [[aha-design-typography]] for that.

> **The standard.** All values are judged against `[[aha-design-typography]]`'s
> `references/typography.json` (`tokens` + `roles` + `rules`). Read the exact role values
> from there; don't grade from memory. Open its `references/review.html` to eyeball.

## How to use

1. Identify the text styles under review — CSS / AntD tokens / Tailwind / inline styles
   that set `font-family` / `font-weight` / `font-size` / `line-height` / `letter-spacing`
   on a piece of in-app text.
2. For each criterion below, find the evidence in the code, decide **PASS** or **FAIL**,
   and capture a 1-line piece of evidence (file:line if possible).
3. Emit the verdict report using the exact template at the bottom — same shape every time
   so reviewers can scan it.

**Why binary, no partial credit.** A shipped style either matches the role's token or it
doesn't — "close enough" is a polite FAIL that lets drift accumulate. Binary keeps the
judge consistent across reviewers and runs.

**Burden of proof is on PASS.** If a value can't be tied to a role in `typography.json`,
mark FAIL and say so in the notes — don't assume an unlabeled 15px is "probably fine".

## The 7 criteria

### J1. Font family matches the role → PASS / FAIL

**Rule.** **Plus Jakarta Sans** for every role **except** the stylized label set —
`capitalized` / `small` / `tiny` — which use **Inter**. Any other family (Poppins,
Roboto, Helvetica, SF) is an automatic FAIL.

**FAIL when:** Inter is used on a heading/body/display role; Plus Jakarta Sans is used on
a `capitalized`/`small`/`tiny` label; a third font appears anywhere.

### J2. Weight is 400 or 600 — exceptions only → PASS / FAIL

**Rule.** Headings and body use **only 400 (Regular) or 600 (SemiBold)**. The *only*
documented exceptions: **Display 1 & 2 use 700**, and the Inter **`tiny`** label uses 600.
Text baked into a **shared component** (e.g. the primary **Tabs** label at **700**) follows
its measured [[aha-design-component-standard]] value, not this scale — don't FAIL it.

**FAIL when:** 500 / 700 / 800 appears on a **role-based content** heading or body (700 is
allowed *only* on Display, and on shared-component chrome per component-standard); a role's
weight doesn't match its `typography.json` value.

### J3. Size snaps to the scale → PASS / FAIL

**Rule.** Sizes come from the fixed px scale only:
`64 · 56 · 48 · 40 · 32 · 24 · 20 · 18 · 16 · 14 · 12 · 10`. No in-between values.

**FAIL when:** an in-between size appears (15, 17, 22, 26, 28, 30, 36, 38…) — the classic
symptom of eyeballing instead of snapping to a role. `rem`/`em` that computes to an
off-scale px (e.g. `1.75rem` = 28px) also FAILs.

### J4. Line-height is a unitless ratio matching the role → PASS / FAIL

**Rule.** Line-height is a **unitless ratio**, matching the role:
`1.2` (H1/H2), `1.3` (H3–H6, Blockquote), `1.5` (Body, Lead, Display 1), or `normal`
(Display 2 + the Inter labels). There is **no px line-height scale**.

**FAIL when:** line-height is set in px (`line-height: 28px`), or the ratio doesn't match
the role (e.g. `1.5` on an H2, `1.2` on body copy).

### J5. Letter-spacing matches the role's category → PASS / FAIL

**Rule.** Letter-spacing (px) by category:
headlines `0` (Display, H1–H4) · subheadings `0.2` (H5, H6) · paragraph `0.2` · subtext `0.3` · Inter caps `2`.

**FAIL when:** the value doesn't match the role's category — e.g. `0` on body (should be
`0.2px`), `0.2px` on a 12px caption (should be `0.3px`), negative tracking (`-0.02em`) on
a heading, or a `capitalized` label without its `2px`.

### J6. Role fits the text's job (and capitalized is uppercased) → PASS / FAIL

**Rule.** The role is chosen by the text's *job*, not its rough size: page/hero title →
`heading1`; section heading → `heading2`/`heading3`; card/dialog title →
`heading4`/`heading5`; base UI/paragraph → `body`; larger intro → `bodyLG`; emphasized
inline → `bodyBold`; small caption/helper → `bodySM`/`bodySMBold`; all-caps eyebrow →
`capitalized`; tiny meta → `small`/`tiny`. A `capitalized` role MUST carry
`text-transform: uppercase`.

**FAIL when:** a role is used against its job (e.g. Display for a dialog title), the five
values don't together match any single role in `typography.json`, or a `capitalized`
label is missing `text-transform: uppercase`.

### J7. In scope — product UI, not marketing/brand → PASS / FAIL

**Rule.** This scale governs **in-app product UI** (presenter, audience, editor,
dashboard). A marketing/brand surface — landing page, blog, email template, social/slide
graphic — must NOT be forced onto this scale; it belongs to [[aha-branding-typography]]
(weights 200–800, optical sizing).

**FAIL when:** the text under review is clearly a marketing/brand asset being styled from
this product scale (or vice-versa). Note it and redirect to the right skill.

## Output format — the verdict report

Always emit this exact structure (compact, scannable). The rows below are an
**illustrative example** — grade every row from the actual code in front of you, never
copy these verdicts:

```markdown
# Typography judge report — <element / file path>

**Role claimed:** `heading1`  ·  **Text's job:** dashboard page title

| # | Criterion | Verdict |
|---|---|---|
| J1 | Font family matches the role | ✅ PASS |
| J2 | Weight 400/600 (exceptions only) | ✅ PASS |
| J3 | Size snaps to the scale | ❌ FAIL |
| J4 | Line-height is a role-matched ratio | ✅ PASS |
| J5 | Letter-spacing matches the category | ❌ FAIL |
| J6 | Role fits the text's job | ✅ PASS |
| J7 | In scope (product UI, not marketing) | ✅ PASS |

**Overall: NEEDS FIX** (2 failing criteria)

## Fails

### ❌ J3 — Size snaps to the scale
**Where:** `src/DashboardHeader.tsx:20`
**Evidence:** `font-size: 28px` — not on the scale.
**Fix:** a dashboard page title is `heading1` → **48px** (or, if intentionally smaller,
snap to the nearest role — 40/32/24 — never an in-between value).

### ❌ J5 — Letter-spacing matches the category
**Where:** `src/DashboardHeader.tsx:23`
**Evidence:** `letter-spacing: -0.02em` on a headline.
**Fix:** headlines use `0`. Remove the negative tracking.

## Passes — brief

J1, J2, J4, J6, J7 — family/weight/line-height/role/scope all match `heading1`.

## Notes / unverifiable

- (Anything you couldn't tie to a role — list it so the reviewer can follow up.)
```

**Overall verdict rule:** any FAIL → `NEEDS FIX`. All PASS → `OK TO SHIP`.

Always include: the role claimed + the text's job, the 7-row verdict table, a `## Fails`
section (per failed criterion: **Where** file:line, **Evidence** 1 line, **Fix** the exact
role value), a 1-line `## Passes — brief`, and `## Notes / unverifiable` when any judgment
was made under uncertainty.

## When NOT to use this skill

- **Choosing** values while first building UI text → use [[aha-design-typography]].
- **Marketing / brand** type (websites, email, social, slides) → [[aha-branding-typography]].
- A component's broader visual spec (dimensions, spacing, states) →
  [[aha-design-component-standard]]; this judge covers **text** only.

## Closing the build → judge → fix loop

1. Set text with [[aha-design-typography]] → produces styled UI text.
2. Invoke this judge → emits the verdict report.
3. Any FAIL → fix the exact values cited under `## Fails` → re-invoke this judge.
4. Repeat until the verdict is `OK TO SHIP`.

The reason for the loop: build-time guidance gets diluted under task pressure, and text
values are easy to eyeball "close enough". The judge gives a final, structured check that
every value ties back to a real role in `typography.json`.
