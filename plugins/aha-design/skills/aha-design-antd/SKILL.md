---
name: aha-design-antd
description: "Authoritative rules for building AhaSlides product UI on Ant Design v6 — the component-library mandate, the theme/token system (ConfigProvider, theme/index.ts ↔ variables.css dual source of truth, --aha-* CSS vars), colour usage (semantic tokens, white-background-by-default, AI-only/border-only gradients, no hardcoded hex), the eslint-enforced Button system, and key surface conventions. Use whenever an agent is building, editing, or reviewing AhaSlides frontend UI — choosing a component library, theming, setting a colour or background, adding a Button, a Modal/Drawer/Form/Card, or a chart. Trigger on phrases like 'antd', 'Ant Design', 'ConfigProvider', 'theme token', 'design token', 'colorPrimary', 'colorBgContainer', '--aha-', 'which component library', 'MUI', 'Chakra', 'Radix', 'gradient', 'background colour', 'white background', 'hardcoded hex', 'AntD Button', 'XLButtonScope', 'button size', 'contrast', 'WCAG', 'AA', 'contrast ratio', 'accessible colour', 'text on coloured background', 'dark mode', 'dark surface', 'dark background', 'text on dark', 'invisible text', 'readable', or any moment where a component, theme token, colour, or background is being chosen in AhaSlides frontend code — including a custom/non-AntD component where you hand-pick colours and must check contrast yourself. Do NOT trigger for icons/glyph choice (use aha-design-icons) or pure brand-palette meaning questions (use aha-branding-colors)."
---

# AhaSlides Ant Design

Source of truth: the AhaSlides frontend theme in `aha-survey`
(`frontend/src/theme/`). These rules keep every AhaSlides screen built on **one**
component library, **one** theme, and **one** token system — so the product reads
as a single coherent app instead of a patchwork of libraries and one-off styles.
When you build or review UI, conform to the rules below; if a design mock asks for
something outside them, flag it rather than silently introducing a new pattern.

> **This skill owns the code/implementation layer** — antd, tokens, colour
> mechanics, the Button system. For *why* a colour means what it means, the type
> hierarchy, or the CTA brand spec, defer to the brand skills:
> [[aha-branding-colors]], [[aha-branding-typography]], [[aha-branding-buttons]].
> For glyphs, defer to [[aha-design-icons]].

> **Judge counterpart.** After building or when reviewing UI, self-check with
> [[aha-design-antd-judge]] — it scores the library mandate, hardcoded hex/px, the
> radius scale, the Button system, control heights & provider nesting, the focus
> ring, and WCAG AA on custom components PASS/FAIL, closing a build→judge→fix loop.
> Three dimensions have their own judges: surface **background** colour →
> [[aha-design-background-judge]], **typography** → [[aha-design-typography-judge]],
> **icons** → [[aha-design-icons-judge]].

## Use Ant Design — nothing else

AhaSlides frontends are built on **Ant Design v6** (`antd: ^6.0.0`), with
`@ant-design/cssinjs`, `@ant-design/plots` (charts), and `@ant-design/x` (AI
surfaces). Don't reach for another component or UI-primitive library. This is
**eslint-enforced** (`no-restricted-imports`, `AC08_BANNED_PACKAGES`) — it will
fail CI, not just review:

| Don't import | Use instead |
|---|---|
| `@mui/*` (Material UI), `@chakra-ui/*`, `@radix-ui/*`, `@headlessui/*`, `@mantine/*`, `react-bootstrap`, `react-aria` | **Ant Design v6** |
| `recharts`, `victory`, `chart.js` | `@ant-design/plots` |
| `@ant-design/icons`, `lucide-react`, `@heroicons/*`, `@fortawesome/react-fontawesome` | `@phosphor-icons/react` — see [[aha-design-icons]] |

Note the icon row: even **AntD's own icon set is banned**. Icons are governed
entirely by [[aha-design-icons]] — don't pull glyphs from `antd`.

## The theme & the dual source-of-truth rule

The theme lives in `frontend/src/theme/index.ts` — a single AntD `ThemeConfig`
(`token` + a small `components` block) — and is mounted **once** at the app root
via `<AppConfigProvider>` (a thin `ConfigProvider` wrapper). Every token is
**mirrored** in `frontend/src/theme/variables.css` as a `--aha-*` CSS var so
non-AntD CSS reads the same values.

> **The rule, verbatim from `index.ts`:** *"If you need to change a token here,
> you MUST also update the matching `--aha-*` CSS var in `variables.css`."* The
> two files must stay byte-aligned. Changing one without the other splits the
> theme and is the fastest way to make AntD components and raw CSS disagree.

- **Consume tokens, never hardcode.** In components read tokens via
  `theme.useToken()`; in CSS use the `--aha-*` vars. A literal `14px` or `#6a1ebb`
  in a component is a drift waiting to happen — bind to the token.
- **Mount `ConfigProvider` once.** Don't scatter ad-hoc `<ConfigProvider>`s to
  patch a local look. The **only** sanctioned nested provider is `<XLButtonScope>`
  (hero-CTA height override — see *Buttons*).
- The full token catalog — every colour scale, sizing/spacing value, radius,
  control height, motion curve — is in `references/theme-tokens.md`. Read it when
  you need an exact value without opening the repo.

## Colour

Colour comes from semantic tokens, not raw hex. The brand semantics:

| Token | Value | Role |
|---|---|---|
| `colorPrimary` | `#6a1ebb` (Violet Purple) | Interactive, links, focus ring |
| `colorSuccess` | `#16c49a` | Success states |
| `colorWarning` | `#ff7747` | Warnings |
| `colorError` | `#f5222d` | Errors |
| `colorInfo` | `#9bb3e9` | Info |
| `colorLink` | `#6a1ebb` | Links (AntD default is blue — we override to brand purple) |

Plus full Primary/Success/Error/Warning/Info scales, layered text/fill/border
sets, and the `--brand-*` palette — all in `references/theme-tokens.md`. The
primary/CTA button fill is **`colorPrimary #6a1ebb`** — the same brand purple used
for links and focus — per the measured [[aha-design-component-standard]] contract
(`btn|primary|md` = `rgb(106, 30, 187)`). White text on it clears WCAG AA (≈8.3:1),
so there is **no** separate darker CTA shade. For *which* colour means what, see
[[aha-branding-colors]].

**Never hardcode hex in components** — use a token or `--aha-*` var. (The repo
still has ~legacy hardcoded hex; those are being migrated — don't add more.)

### Backgrounds are white by default

Surfaces are **white**: `colorBgBase` / `colorBgContainer` / `colorBgElevated` =
`#ffffff`. The only non-white default is the app-shell `colorBgLayout` (`#f5f5f5`)
behind the `Layout`.

- **Do not** give a surface (card, panel, modal, section, page) a coloured,
  tinted, or gradient background **unless the user explicitly asks for it.**
  White-first is the default; reach for colour only on request.
- When a non-white background *is* requested, use a brand token (`--brand-*` /
  `--aha-*`), never an arbitrary hex.

> **Judge counterpart.** After building or when reviewing a surface, self-check with
> [[aha-design-background-judge]] — it scores each surface's background PASS/FAIL against
> this rule (white-by-default or a sanctioned exception; no gradient fills; token, not raw
> hex) and feeds concrete fixes back, closing a build→judge→fix loop. A coloured surface is
> not done until it passes.

### Gradients: AI-only, border-only

Gradients are **banned on any background or fill.** The single sanctioned use is
the **AI affordance**, and even then the gradient sits on the **border only** —
the spark / AI icon border, the AI input border — while the fill stays white. The
canonical technique (from `AiReveal.css`) layers a white fill behind a gradient
border:

```css
/* AI input/card — gradient border, white fill */
border: 2px solid transparent;
background:
  linear-gradient(#fff, #fff) padding-box,                /* fill stays white */
  conic-gradient(from var(--aha-ai-gradient-angle),
    var(--aha-ai-gradient-1),
    var(--aha-ai-gradient-2),
    var(--aha-ai-gradient-3),
    var(--aha-ai-gradient-2),
    var(--aha-ai-gradient-1)) border-box;                 /* gradient on border only */
```

Canonical AI-gradient tokens: `--aha-ai-gradient-1 #7f58f0`,
`--aha-ai-gradient-2 #a78bfa`, `--aha-ai-gradient-3 #d7b8ff`, with the animated
`--aha-ai-gradient-angle`. (These currently live in `AiReveal.css`; they belong in
`variables.css` as the single source — promote them when you touch this.)

Legacy gradient **backgrounds** exist in `dashboard.css` / `editor.css` /
`respondent.css`. They're violations being migrated — don't add more; use a flat
brand colour instead.

## Typography

**Plus Jakarta Sans only** — self-hosted (latin + vietnamese subsets), set as
`fontFamily` / `--aha-fontFamily`; `system-ui` is the final fallback only. Don't
introduce another typeface. Use the font-size and line-height **tokens**
(`fontSize` 14 base, `fontSizeSM` 12, `fontSizeLG` 16, the heading ramp), not
magic px. For the hierarchy and weights, see [[aha-branding-typography]].

## Buttons (AHA-42519 — eslint-enforced)

The Button system is a hard contract, enforced by `no-restricted-syntax`:

- **Size via the `size` prop:** `size="small" | "middle" | "large"` (28 / 36 / 40px
  heights). For the **single** most-prominent hero CTA on a screen, wrap it in
  `<XLButtonScope>` (52px) — the one sanctioned per-region `ConfigProvider`.
- **Never** set `height`, `minHeight`, `padding*`, `borderRadius`, or `fontSize`
  via inline `style` on `<Button>` — eslint blocks it.
- **Never** add per-feature `aha-*-btn` classNames to a `<Button>` — also blocked.
  If the gallery doesn't express the shape you need, fix the gallery, not the call
  site.
- The visual contract is the **`/__button-gallery`** route. Brand spec (colour,
  states): [[aha-branding-buttons]].

## Border radius

Corner radius comes from a **fixed scale — never an ad-hoc number.** Pick the step
by element, not by eye. The steps below are the values [[aha-design-component-standard]]
**measures on shipped components** — that is the source of truth; where an AntD theme
token currently emits a different number, migrate the token to match (last column).
Every step must be both an AntD theme token and a mirrored `--aha-*` CSS var so CSS
can consume it instead of hardcoding.

| px | AntD token | Used by (measured component-standard) | Migration |
| -- | ---------- | ------------------------------------- | --------- |
| **4**  | `borderRadiusXS` | Tag, checkbox corner, Tooltip, small Alert, uploader dropzone, Button `sm` | retune token `2 → 4` |
| **6**  | `borderRadiusSM` (= `borderRadiusOuter`) | Vertical-tab active pill, chips | ✓ already 6 |
| **8**  | `borderRadius` (default) | Inputs, Select, menus/Dropdown, **Modal / Drawer / Popover**, upload item, regular Alert, Button `md` | Modal/Drawer/Popover move `LG(10) → default(8)` |
| **12** | `borderRadiusLG` (+ `components.Card`) | Cards & panel containers, Button `xl` | retune `borderRadiusLG 10 → 12`; unify with Card |
| **16** | `borderRadiusXL` *(to add)* | Large surfaces — hero cards, sheets, respondent/dashboard shells | add token |

Two shape escapes that are **not** on the numeric scale (use intentionally, not as a radius guess): `50%` for a true circle (avatar, icon button) and a full **pill** (`999px` / `9999px`) for a capsule (toggle track, radio). Everything else is one of the steps above.

The DS V3 Alert (`AhaAlert`) is sized here too — `8px` regular / `4px` small (per [[aha-design-feedback]]).

> **`10` and `2` are retired.** The old scale documented `borderRadiusXS 2` and
> `borderRadiusLG 10`, but the component-standard measures **no** component at those
> radii — tags/checkbox/tooltip are `4`, Modal is `8`. Until `theme/index.ts` is
> migrated, bind to the **target** value above (the component-standard number), not the
> stale token output, and flag the token drift for the DS owner.

**Rules**
- **Never hardcode a radius** — no `border-radius: 12px`, no `borderRadius: 8`. Bind to the token (`theme.useToken()`) or the `--aha-*` var. Off-scale values (`14 / 20 / 32 / 44`) are drift; collapse to the nearest step (`4 / 6 / 8 / 12 / 16`).
- **Let AntD components keep their token radius** — don't override a Modal/Card/Button corner. If a component's shape is wrong, fix it at the theme so the token emits the component-standard value, not at the call site.
- **Custom / non-AntD containers** must still pull from this scale — a bespoke box is the most common source of radius drift, so pick a step deliberately.
- **Close the token gaps.** Add `borderRadiusXL 16` (new) and retune the drifted tokens to the component-standard values (`borderRadiusXS 2 → 4`, `borderRadiusLG 10 → 12`, Modal/Drawer/Popover to `borderRadius 8`) in `theme/index.ts`, and mirror **every** step as a `--aha-*` var in `variables.css` — today only `--aha-borderRadius` (8px) is exposed, so CSS has no token for 4/6/12/16 and authors are forced to hardcode. That missing mirror is exactly how the scale drifted.

## Key surfaces

Most components inherit the root tokens — leave them alone unless the theme says
otherwise. What the theme actually customizes:

- **Radii are token-driven** — see the *Border radius* section above. Don't set ad-hoc corner radii.
- **Control heights are shared.** `Input` / `Select` / `DatePicker` inherit the
  root `controlHeight` (32px) — **don't grow them per-instance.** Only `<Button>`
  (gallery sizes) and the `<XLButtonScope>` region override heights.
- **Layout** uses `headerBg #ffffff`, `bodyBg #f5f5f5`.
- **Charts → `@ant-design/plots`** (not recharts/victory/chart.js).
- **Tables → the shared `DataTable`.** A data grid (`<Table>`, `columns=`/`dataSource=`,
  a results/leaderboard/admin list) is **not** styled per call site — it renders through the
  one canonical DS V3 `DataTable` (white header, dividers-only, single-arrow sort, canonical
  filter/freeze, `components.Table` theme). Governed entirely by [[aha-design-table]]; judge
  finished grids with [[aha-design-table-judge]]. Don't drop a raw AntD `<Table>` with its
  own `bordered`/`size`/`rowClassName`.

## Focus & accessibility

- A global keyboard focus ring is defined once: `:focus-visible { outline: 2px
  solid #6a1ebb; outline-offset: 2px }`. **Never override it with `outline: none`.**
- Don't convey state with colour alone — pair a colour change with a shape/text
  change so it survives colour-blindness and greyscale.

### Contrast — AntD covers it; *custom* components are on you

Stock AntD components already ship **WCAG AA**-passing contrast when you leave the
theme tokens alone — that's the first safeguard, and it's why you don't normally
think about ratios. **The gap is the bespoke component**: the moment a feature
needs something AntD doesn't ship and you hand-pick colours, nothing is checking
the ratio for you. That's where this second safeguard applies — **you** own the
contrast.

The bar (same WCAG AA floor as the slide canvas — see [[aha-design-canvas]]):

- **4.5:1** for body text, **3:1** for large text (≥18.66px bold / ≥24px) and for
  **meaningful non-text** — icon glyphs, chart series, input borders, focus rings.
- Go higher when you can; AA is the floor, not the target.

The traps, all specific to non-white / hand-coloured surfaces:

- **Dark surfaces are the #1 trap — every text token inverts from safe to
  invisible.** AhaSlides has real dark fills: the presenting/casting stage on a
  dark theme, `colorBgSpotlight` (`rgba(26,26,46,0.85)`), `--brand-deep-space`
  (`#1a1a2e`). **Every** `colorText*` token derives from `colorTextBase #1a1a2e`
  (Deep Space) — i.e. they're *black-alpha*, tuned for white. On a dark fill
  `colorText` lands ~1.2:1: technically invisible. On any dark surface, flip text
  to **`colorWhite` (`#fff`) / `--brand-white`** and re-check the ratio — never
  reuse the default black-alpha text token.
  - There is **no inverse text token** (`colorTextLightSolid` doesn't exist here)
    and **no inverse fill token**. For a dark-surface chip/pill, use a translucent
    white scrim (e.g. `rgba(255,255,255,0.12)`) — and flag that the theme should
    gain a proper inverse fill var rather than inlining it.
- **The layered text tokens are tuned for white.** `colorTextSecondary`,
  `colorTextTertiary`, `colorTextQuaternary` pass on `#ffffff` — drop them onto a
  tinted, brand-coloured, gradient, image, *or dark* background and the ratio
  collapses. Switch to a token that actually clears 4.5:1 against *that* fill,
  don't reuse the light grey.
- **Check against the *real* rendered background**, including any tint, overlay, or
  image behind the text — not the nominal token. Busy backgrounds are the hard
  case: add a solid scrim behind text rather than hoping.
- **Brand purple text** (`colorPrimary #6a1ebb`) on white clears AA — and white
  text on that same `colorPrimary` fill clears AA too (≈8.3:1), which is why the
  CTA button uses it directly. A light `--brand-*` step would not carry white text.
- **Disabled / placeholder** are AA-exempt by spec, but keep them perceivable —
  don't push faint-on-faint just because the linter won't flag it.

Disabled state and screen-reader semantics are not contrast — for the a11y
primitives (`FieldError`, `LiveRegion`, `Progressbar`) see
[[aha-design-shared-components]]; for icon-specific rules, [[aha-design-icons]].

## Don't

- Don't import a banned library (MUI, Chakra, Radix, Headless UI, Mantine,
  react-bootstrap, react-aria, recharts/victory/chart.js) — use antd v6 /
  `@ant-design/plots`. Don't pull icons from `@ant-design/icons` — see
  [[aha-design-icons]].
- Don't hardcode hex (or px) in a component — bind to a theme token / `--aha-*` var.
- Don't set an ad-hoc `border-radius` — pick a step from the radius scale (`4 · 6 · 8 · 12 · 16`, the measured component-standard values) via a token/`--aha-*` var; `14/20/32/44` are drift. Circles use `50%`, capsules use a pill.
- Don't change a JS token in `index.ts` without updating its `--aha-*` mirror in
  `variables.css` (and vice-versa).
- Don't give a surface a non-white background unless the user asks — white-first.
- Don't use a gradient on any background/fill; the only gradient is an **AI
  border** (white fill behind it).
- Don't inline-size a `<Button>` (`height`/`padding`/`borderRadius`/`fontSize`) or
  add `aha-*-btn` classNames — use `size=` or `<XLButtonScope>`.
- Don't nest ad-hoc `<ConfigProvider>`s — the theme is mounted once; the only
  exception is `<XLButtonScope>`.
- Don't grow `Input`/`Select`/form-control heights per-instance.
- Don't override the global `:focus-visible` ring.
- Don't reuse the default black-alpha text tokens (`colorText`,
  `colorTextSecondary/Tertiary/Quaternary`) on a dark or otherwise non-white
  background — on a dark fill they're invisible; flip to `colorWhite` /
  `--brand-white`. Re-check the ratio and hit WCAG AA (4.5:1 text, 3:1
  large/non-text) on any **custom** component AntD doesn't cover.
