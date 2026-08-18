---
name: aha-design-antd-judge
description: "Authoritative judge / verdict-giver for AhaSlides product-UI code built on Ant Design v6 — the evaluation counterpart to aha-design-antd (the build skill). Use whenever an agent reviews, audits, scores, critiques, or self-checks AhaSlides frontend UI code against the antd conventions: a PR diff that adds a component / theme token / Button / Modal / Form / Card / chart, an 'is this on-theme?' question, or the self-check that should run after building or restyling UI. Emits a binary PASS / FAIL verdict per criterion (no partial credit) across 7 criteria — (C1) one component library: AntD v6 only, no MUI/Chakra/Radix/Headless/Mantine/react-bootstrap/react-aria, charts via @ant-design/plots (not recharts/victory/chart.js), no icon imports from @ant-design/icons/lucide/heroicons/fontawesome; (C2) no hardcoded hex or px in components — colours, sizes, and font-sizes bind to a theme token or --aha-* var; (C3) border-radius on custom containers is token-bound or matches the DS reference, never an eyeballed number — per-component radius is owned by aha-design-component-standard (whose measured radii win where the antd token scale disagrees); (C4) the Button system — size via the size prop or <XLButtonScope> only, no inline height/padding/borderRadius/fontSize, no aha-*-btn classNames, CTA fill is colorPrimary #6a1ebb not a bespoke shade; (C5) control heights aren't grown per-instance (Input/Select inherit controlHeight) and ConfigProvider is mounted once (only <XLButtonScope> nested); (C6) the global :focus-visible ring isn't overridden and state is never conveyed by colour alone; (C7) custom non-AntD components hit WCAG AA (4.5:1 text, 3:1 large/non-text) against the real rendered background, with dark-surface text flipped to colorWhite. Burden of proof is on PASS. Trigger on phrases like 'review this component', 'is this on-theme', 'audit the theme tokens', 'check the Button usage', 'judge my antd code', 'is this hardcoded hex ok', 'self-check after building UI', 'PR review for a component'. Do NOT trigger for building UI in the first place (use aha-design-antd), for surface background colour specifically (use aha-design-background-judge), for typography (use aha-design-typography-judge), or for icon glyphs (use aha-design-icons-judge)."
---

# Judging AhaSlides AntD code

This skill is the **judgment counterpart** to `aha-design-antd` (which guides
building UI on the AhaSlides Ant Design theme). Reach for it when reviewing
finished product-UI code — a PR diff, a code-review request, or a self-check at the
end of a build — to decide whether the code conforms to the one-library / one-theme /
one-token-system rules. Don't reach for it while building — use `aha-design-antd`
for that.

> **Scope:** product-UI code built on the AntD theme — components, theme tokens,
> Buttons, Modals/Drawers/Forms/Cards, charts, custom (non-AntD) components. It
> delegates three dimensions to focused sibling judges:
>
> - **Surface background colour** → `aha-design:aha-design-background-judge`
> - **Typography** (family / weight / size / line-height / letter-spacing) →
>   `aha-design:aha-design-typography-judge`
> - **Icon glyphs / sizes / stroke** → `aha-design:aha-design-icons-judge`
>
> This judge covers everything else: the library mandate, hardcoded hex/px, the
> radius scale, the Button system, control heights & provider nesting, the focus
> ring, and WCAG AA on custom components.

---

## The rules being judged

From `aha-design-antd` (read it for the full detail — this judge scores against it):

> Build on **one** component library (AntD v6), **one** theme, **one** token
> system. Never hardcode hex or px in a component — bind to a theme token
> (`theme.useToken()`) or an `--aha-*` var. Corner radius comes from a fixed token
> scale. Size a `<Button>` only via `size=` or `<XLButtonScope>` — never inline
> `height`/`padding`/`borderRadius`/`fontSize`, never per-feature classNames. Mount
> `<ConfigProvider>` once. Never override the global `:focus-visible` ring. Custom
> components AntD doesn't cover must hit WCAG AA against the real rendered
> background.

**Burden of proof is on PASS.** If you cannot tell from the diff whether a value is
token-bound or a ratio clears AA, mark it **FAIL** and raise it under `## Notes /
unverifiable`. Pretending an unverified value passes is how drift creeps in.

**Why binary, no partial credit.** A component either conforms or it doesn't —
"mostly token-bound" is a polite FAIL. Binary keeps the judge consistent across
reviewers and runs.

---

## How to use

1. **Read the diff/code** and locate every relevant declaration: imports, colour /
   size / radius / font values, `<Button>` usage, `<ConfigProvider>` mounts, focus
   styles, and any custom (non-AntD) component that paints its own colours.
2. For each criterion, decide **PASS** or **FAIL**, and capture a 1-line piece of
   evidence (`file:line` where possible).
3. **Emit the verdict report** using the exact template at the bottom.
4. Hand off the three delegated dimensions (background, typography, icons) to their
   judges if the diff touches them — note that in `## Notes`.

---

## The 7 criteria

### C1. One component library — AntD v6 only → PASS / FAIL

**Rule.** UI is built on Ant Design v6 (`antd`, `@ant-design/cssinjs`,
`@ant-design/plots` for charts, `@ant-design/x` for AI). No other UI kit is
imported.

❌ **BAD** — any of these imports:
`@mui/*`, `@chakra-ui/*`, `@radix-ui/*`, `@headlessui/*`, `@mantine/*`,
`react-bootstrap`, `react-aria`; charts from `recharts` / `victory` / `chart.js`;
icons from `@ant-design/icons` / `lucide-react` / `@heroicons/*` /
`@fortawesome/*` (icons come from the shared AhaSlides icon component — see
`aha-design-icons`).

✅ **GOOD**

```tsx
import { Button, Modal, Form } from 'antd'
import { Column } from '@ant-design/plots'
```

**Failure modes:** a second component/chart/icon library imported anywhere in the
diff, even "just for one widget."

---

### C2. No hardcoded hex or px in components → PASS / FAIL

**Rule.** Colours, sizes, and font-sizes are consumed from a theme token
(`theme.useToken()`) or an `--aha-*` CSS var — never a literal `#6a1ebb`, `rgb(...)`,
or bare `14px` baked into a component. (Surface *background* colour is scored by
`aha-design-background-judge`; this criterion covers component-level colour/size
hardcoding generally.)

✅ **GOOD**

```tsx
const { token } = theme.useToken()
<span style={{ color: token.colorPrimary, fontSize: token.fontSize }}>…</span>
```
```css
.badge { color: var(--aha-colorPrimary); gap: var(--aha-sizeXXS); }
```

❌ **BAD**

```tsx
<span style={{ color: '#6a1ebb', fontSize: '14px' }}>…</span>  // literal hex + px
```

**Failure modes:** any `#hex` / `rgb()` / `hsl()` or magic `px` for colour/size/font
in a component where a token exists. (Documented one-offs like `50%` / pill radius,
or the audience-iframe `16px` input exception, are out of this judge's scope.)

---

### C3. Border-radius is token-bound, not eyeballed → PASS / FAIL

**Rule.** Corner radius on a **custom / bespoke** container comes from a radius
token or `--aha-*` var (or matches the DS reference), never an arbitrary eyeballed
number. AntD components keep their theme radius — don't override a
Modal/Card/Button corner at the call site. The **per-component** radius target
(Tag, Modal, Tooltip, Button size, …) is owned by
[[aha-design-component-standard]] and its judge — match that, not a guess.

> **Scale.** The radius steps are `4 · 6 · 8 · 12 · 16` (+ `50%` / pill) — the values
> [[aha-design-component-standard]] measures on shipped components (Tag / Tooltip /
> checkbox / small-Alert / Button `sm` = **4**; inputs / Modal / menus / Button `md` =
> **8**; Card / Button `xl` = **12**). These are authoritative; a theme token still
> emitting a stale value (`2` / `10`) is a theme bug, not a reason to FAIL a component
> that matches the measured value. Only flag a radius that matches *neither* the scale
> *nor* the DS reference.

✅ **GOOD** — `borderRadius: token.borderRadiusLG` · a bespoke box matching the DS reference radius · `border-radius: 50%`

❌ **BAD** — `border-radius: 13px` / `borderRadius: 27` picked by eye with no token and no DS basis, or an ad-hoc override of an AntD component's theme corner.

**Failure modes:** an arbitrary eyeballed radius with no token/DS basis, or a raw
literal overriding an AntD component's theme corner.

---

### C4. Button system honoured → PASS / FAIL

**Rule.** A `<Button>` is sized **only** via the `size` prop (`small`/`middle`/
`large`) or, for the single hero CTA, `<XLButtonScope>`. Never inline
`height` / `minHeight` / `padding*` / `borderRadius` / `fontSize` on a Button;
never add `aha-*-btn` classNames (both are eslint-blocked). The primary/CTA fill is
`colorPrimary #6a1ebb` — **not** a bespoke darker shade.

✅ **GOOD**

```tsx
<Button type="primary" size="large">Save</Button>
<XLButtonScope><Button type="primary">Start</Button></XLButtonScope>
```

❌ **BAD**

```tsx
<Button style={{ height: 52, fontSize: 18, borderRadius: 12 }}>Big</Button>
<Button className="aha-hero-btn">Go</Button>
<Button style={{ background: '#5A189A' }}>Save</Button>  // bespoke fill, not colorPrimary
```

**Failure modes:** inline sizing on a Button, per-feature Button classNames, a hero
CTA sized by hand instead of `<XLButtonScope>`, or a CTA fill that isn't
`colorPrimary`.

---

### C5. Control heights & provider nesting → PASS / FAIL

**Rule.** `Input` / `Select` / `DatePicker` / form controls inherit the root
`controlHeight` (32) — they are **not** grown per-instance. `<ConfigProvider>` is
mounted **once** at the app root; the only sanctioned nested provider is
`<XLButtonScope>`.

✅ **GOOD** — controls left at theme height; one `<AppConfigProvider>` at root.

❌ **BAD**

```tsx
<Input style={{ height: 44 }} />                 // per-instance height growth
<ConfigProvider theme={{ token: { colorPrimary: '#f00' } }}>…</ConfigProvider>  // ad-hoc nested provider
```

**Failure modes:** any per-instance control-height override, or a nested
`<ConfigProvider>` that isn't `<XLButtonScope>`.

---

### C6. Focus ring & non-colour state → PASS / FAIL

**Rule.** The global `:focus-visible` ring (`outline: 2px solid #6a1ebb;
outline-offset: 2px`) is never overridden with `outline: none`. State is never
conveyed by colour alone — a colour change is paired with a shape/text/icon change
so it survives colour-blindness and greyscale.

✅ **GOOD** — focus ring left intact; a selected chip changes colour **and** shows a check.

❌ **BAD**

```css
button:focus-visible { outline: none; }          // ring removed
```
```tsx
<Tag color={ok ? 'green' : 'red'} />             // meaning by colour only
```

**Failure modes:** `outline: none` on a focusable element without an equivalent
replacement, or a status shown only by colour.

---

### C7. WCAG AA on custom (non-AntD) components → PASS / FAIL

**Rule.** Stock AntD with theme tokens left alone covers AA. A **custom / bespoke**
component where you hand-pick colours must clear **4.5:1** for body text and
**3:1** for large text (≥18.66px bold / ≥24px) and meaningful non-text (icon
glyphs, chart series, input borders, focus rings) — measured against the **real
rendered background** (including tint / overlay / image). On a dark fill the
black-alpha text tokens (`colorText`, `colorTextSecondary/Tertiary/Quaternary`)
collapse to ~1.2:1 — flip to `colorWhite` / `--brand-white` and re-check.

✅ **GOOD** — white text on `colorPrimary #6a1ebb` (~8.3:1); a scrim behind text on a photo.

❌ **BAD**

```css
.chip-on-dark { color: var(--aha-colorTextSecondary); }  // black-alpha on a dark fill → invisible
```

**Failure modes:** a custom component whose text/non-text contrast can't be shown to
clear AA against its actual background; black-alpha text tokens reused on a
dark/non-white fill.

---

## Verdict report (emit exactly this shape)

```
## AntD verdict

| # | Criterion                                   | Verdict |
|---|---------------------------------------------|---------|
| C1 | One component library — AntD v6 only        | ✅ PASS / ❌ FAIL |
| C2 | No hardcoded hex or px in components        | ✅ PASS / ❌ FAIL |
| C3 | Border-radius from the fixed scale          | ✅ PASS / ❌ FAIL |
| C4 | Button system honoured                      | ✅ PASS / ❌ FAIL |
| C5 | Control heights & provider nesting          | ✅ PASS / ❌ FAIL |
| C6 | Focus ring & non-colour state               | ✅ PASS / ❌ FAIL |
| C7 | WCAG AA on custom components                | ✅ PASS / ❌ FAIL |

**Overall: OK TO SHIP / NEEDS FIX**

## Fails

### ❌ C4 — Button system honoured
**Where:** `src/editor/HeroCta.tsx:22`
**Evidence:** `<Button style={{ height: 52, fontSize: 18 }}>` — inline-sized instead of `<XLButtonScope>`.
**Fix:** wrap the CTA in `<XLButtonScope>` and drop the inline height/fontSize.

## Passes — brief

C1, C2, C3, C5, C6, C7 — single library, token-bound values, scale radii, controls at theme height, focus ring intact, custom contrast clears AA.

## Notes / unverifiable

- Delegated: background colour → aha-design-background-judge; typography → aha-design-typography-judge; icons → aha-design-icons-judge (if this diff touches them).
- (List anything judged under uncertainty.)
```

**Overall verdict rule:** any FAIL → `NEEDS FIX`. All PASS → `OK TO SHIP`.

Always include: the 7-row verdict table (in order), a `## Fails` section with a
sub-section per failed criterion (**Where** `file:line`, **Evidence** 1 line,
**Fix** concrete action), a 1-line `## Passes — brief`, and a `## Notes /
unverifiable` section (always name the delegated dimensions there).

---

## When NOT to use this skill

- **Building** UI in the first place → use `aha-design-antd`. This judge evaluates
  finished work.
- **Surface background colour** specifically → use
  `aha-design:aha-design-background-judge`.
- **Typography** → use `aha-design:aha-design-typography-judge`.
- **Icon glyphs / sizes / stroke** → use `aha-design:aha-design-icons-judge`.

---

## Closing the build → judge → fix loop

1. Build the UI with `aha-design-antd`.
2. Invoke this judge (plus the background / typography / icon judges for those
   dimensions) → emits the verdict report.
3. Any FAIL → fix the cited code → re-invoke this judge.
4. Repeat until the verdict is `OK TO SHIP`.
