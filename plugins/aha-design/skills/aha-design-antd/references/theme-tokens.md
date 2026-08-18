# AhaSlides AntD theme tokens (reference)

A convenience snapshot of the AhaSlides frontend theme. **The live source of
truth is the repo** — `aha-survey/frontend/src/theme/index.ts` (AntD
`ThemeConfig`) and `frontend/src/theme/variables.css` (the `--aha-*` CSS mirror).
If they drift from this table, the repo wins; re-sync this doc. Every JS token is
mirrored 1:1 as a `--aha-<tokenName>` CSS var unless noted.

## Semantic colour tokens

| JS token | `--aha-*` var | Value | Role |
|---|---|---|---|
| `colorPrimary` | `--aha-colorPrimary` | `#6a1ebb` | Violet Purple — interactive, links, focus |
| `colorSuccess` | `--aha-colorSuccess` | `#16c49a` | Success |
| `colorWarning` | `--aha-colorWarning` | `#ff7747` | Warning |
| `colorError` | `--aha-colorError` | `#f5222d` | Error |
| `colorInfo` | `--aha-colorInfo` | `#9bb3e9` | Info |
| `colorTextBase` | `--aha-colorTextBase` | `#1a1a2e` | Text base (Deep Space Blue) |
| `colorBgBase` | `--aha-colorBgBase` | `#ffffff` | Background base |
| `colorLink` | — | `#6a1ebb` | Link (overrides AntD blue) |
| `colorLinkHover` | — | `#8640c7` | Link hover |
| `colorLinkActive` | — | `#4b1094` | Link active |

### Layered text / fill / background / border

| JS token | `--aha-*` var | Value |
|---|---|---|
| `colorText` | `--aha-colorText` | `rgba(26,26,46,0.88)` |
| `colorTextSecondary` | `--aha-colorTextSecondary` | `rgba(26,26,46,0.65)` |
| `colorTextTertiary` | `--aha-colorTextTertiary` | `rgba(26,26,46,0.45)` |
| `colorTextQuaternary` | `--aha-colorTextQuaternary` | `rgba(26,26,46,0.25)` |
| `colorFill` | `--aha-colorFill` | `rgba(26,26,46,0.15)` |
| `colorFillSecondary` | `--aha-colorFillSecondary` | `rgba(26,26,46,0.06)` |
| `colorFillTertiary` | `--aha-colorFillTertiary` | `rgba(26,26,46,0.04)` |
| `colorFillQuaternary` | `--aha-colorFillQuaternary` | `rgba(26,26,46,0.02)` |
| `colorBgLayout` | `--aha-colorBgLayout` | `#f5f5f5` (app shell — only non-white) |
| `colorBgContainer` | `--aha-colorBgContainer` | `#ffffff` |
| `colorBgElevated` | `--aha-colorBgElevated` | `#ffffff` |
| `colorBgSpotlight` | `--aha-colorBgSpotlight` | `rgba(26,26,46,0.85)` |
| `colorBorder` | `--aha-colorBorder` | `#d9d9d9` |
| `colorBorderSecondary` | `--aha-colorBorderSecondary` | `#f0f0f0` |

### Primary scale

`colorPrimaryBg #f5ebfa` · `colorPrimaryBgHover #dbbeed` · `colorPrimaryBorder #bf90e0`
· `colorPrimaryBorderHover #a266d4` · `colorPrimaryHover #8640c7` ·
`colorPrimaryActive #4b1094` · `colorPrimaryText #6a1ebb` ·
`colorPrimaryTextHover #8640c7` · `colorPrimaryTextActive #4b1094`
(each mirrored as `--aha-colorPrimary*`).

### Success scale

`colorSuccessBg #e8fff6` · `BgHover #baf7e1` · `Border #8aebcb` · `BorderHover #5fdeb8`
· `Hover #5fdeb8` · `Active #099e80` · `Text #16c49a` · `TextHover #38d1a8` ·
`TextActive #099e80`.

### Error scale

`colorErrorBg #fff1f0` · `BgHover #ffccc7` · `Border #ffa39e` · `BorderHover #ff7875`
· `Hover #ff4d4f` · `Active #cf1322` · `Text #f5222d` · `TextHover #ff4d4f` ·
`TextActive #cf1322`.

### Warning scale

`colorWarningBg #fff6f0` · `BgHover #fff3eb` · `Border #ffd8c2` · `BorderHover #ffbb99`
· `Hover #ffbb99` · `Active #d95932` · `Text #ff7747` · `TextHover #ff9b70` ·
`TextActive #d95932`.

### Info scale

`colorInfoBg #f0f7ff` · `BgHover #f0f6ff` · `Border #f0f6ff` · `BorderHover #f0f5ff`
· `Hover #f0f5ff` · `Active #788cc2` · `Text #9bb3e9` · `TextHover #cbd9f5` ·
`TextActive #788cc2`.

## Brand palette (`--brand-*`, CSS only)

**Core Four:** `--brand-radical-pink #ff4081` (primary brand — headings,
highlights) · `--brand-violet #6a1ebb` (interactive hover) ·
`--brand-deep-space #1a1a2e` (primary text / dark bg) · `--brand-white #ffffff`.

**Extended:** `--brand-deep-carmine #e6005c` (errors) ·
`--brand-dark-royal-purple #5a189a` (deep-purple accent) ·
`--brand-muted-indigo #3e3e5a` (dividers) · `--brand-soft-sky #f0f4ff` (page bg) ·
`--brand-coral-sunset #ff9068` (non-critical alerts) ·
`--brand-cool-mint #b4e4e0` (progress accents) ·
`--brand-lavender-mist #d3b4ff` · `--brand-rose-quartz #faf0f6` ·
`--brand-blush-white #fdf6fa` (alt backgrounds).

## Neutral / UI-surface / status tokens (CSS-only `--aha-*`)

Tailwind-aligned neutrals for non-AntD CSS. Text: `colorTextStrong #111827`,
`colorTextDark #1f2937`, `colorTextBody #374151`, `colorTextMuted #6b7280`,
`colorTextPlaceholder #9ca3af`, `colorTextSubtle #94a3b8`, `colorTextSlate #64748b`,
`colorTextSlateLight #475569`, `colorTextSlateBody #4b5563`. Borders:
`colorBorderLight #eef0f3`, `colorBorderMedium #e5e7eb`, `colorBorderStrong #d1d5db`,
`colorBorderEmphasis #d5d9e0`, `colorBorderSlate #cbd5e1`, `colorBorderHover #e0e3e8`.
Backgrounds: `colorBgSubtle #fafbfc`, `colorBgMuted #f7f8fa`, `colorBgFill #f3f4f6`,
`colorBgFillAlt #f4f4f6`, `colorBgHover #f9fafb`, `colorBgTint #f1f5f9`,
`colorBgSurface #fafafa`. Status: green `#16a34a` (+ Dark `#047857`, Strong
`#166534`, Light `#22c55e`, Bg `#ecfdf5`/`#dcfce7`, Border `#bbf7d0`); amber
`#f59e0b` (+ Strong `#92400e`, Bg `#fef3c7`, Border `#fde68a`); orange `#c2410c`
(BgLight `#fff7ed`); red `#dc2626` (+ Dark `#b91c1c`, Light `#ef4444`, Bg
`#fee2e2`/`#fef2f2`). Purple UI: `colorPrimarySubtle #ede9fe`,
`colorPrimaryDark #4a1280`, `colorPrimaryBorderSubtle #c4b5fd`. Accents:
`accentIndigo #6366f1` (Bg `#eef2ff`, Text `#4338ca`), `accentTeal #14b8a6`,
`accentSlate #64748b`, `accentSlateLight #94a3b8`. Misc:
`colorBgMask rgba(0,0,0,0.45)`, `colorOverlayLight rgba(255,255,255,0.7)`,
`colorWhite #fff`.

## AI gradient (border-only — see SKILL.md)

Currently defined in `AiReveal.css` (should be promoted to `variables.css`):
`--aha-ai-gradient-1 #7f58f0` · `--aha-ai-gradient-2 #a78bfa` ·
`--aha-ai-gradient-3 #d7b8ff` · `--aha-ai-gradient-angle` (animated `@property`,
`0deg`→`360deg`). Use **only** on an AI element's border; fill stays white.

## Typography

`fontFamily`: `'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI',
sans-serif` (`--aha-fontFamily: 'Plus Jakarta Sans', system-ui`).

| Token | `--aha-*` | px |
|---|---|---|
| — | `--aha-fontSizeXS` | 10 |
| `fontSizeSM` | `--aha-fontSizeSM` | 12 |
| `fontSize` (base body) | `--aha-fontSize` | **14** |
| `fontSizeLG` | `--aha-fontSizeLG` | 16 |
| `fontSizeXL` | `--aha-fontSizeXL` | 20 |
| `fontSizeHeading1` | `--aha-fontSizeHeading1` | 48 |
| `fontSizeHeading2` | `--aha-fontSizeHeading2` | 40 |
| `fontSizeHeading3` | `--aha-fontSizeHeading3` | 32 |
| `fontSizeHeading4` | `--aha-fontSizeHeading4` | 24 |
| `fontSizeHeading5` | `--aha-fontSizeHeading5` | 20 |

> **Source of truth: Design System V3.** Heading sizes above are aligned to the DS V3
> type scale (H1–H5 = 48 / 40 / 32 / 24 / 20). DS V3 also defines an **H6 = 18px**,
> which AntD's 5 heading levels don't have a token for — apply it as an explicit 18px
> (role `heading6`) outside the AntD heading tokens. For the full 18-role product type
> scale and per-role weight / line-height / letter-spacing, see the authoritative skill
> [[aha-design-typography]] (`references/typography.json`).

Line heights: `lineHeight 1.5714…` (base) · `lineHeightLG 1.5` · `lineHeightSM 1.6667`
· headings **`1.2 / 1.2 / 1.3 / 1.3 / 1.3`** (DS V3 ratios for H1–H5; H6 = 1.3).

## Sizing / spacing scale

`sizeUnit 4` · `sizeStep 4` · `sizeXXS 4` · `sizeXS 8` · `sizeSM 12` · `size 16` ·
`sizeMS 16` · `sizeMD 20` · `sizeLG 24` · `sizeXL 32` · `sizeXXL 48`
(mirrored as `--aha-size*`; `--aha-sizePopupArrow 16px`).

## Control heights

`controlHeight 32` (root — Input/Select/DatePicker) · `controlHeightSM 24` ·
`controlHeightXS 16` · `controlHeightLG 40`. Button overrides these on
`components.Button` (SM 28 · M 36 · LG 40); `<XLButtonScope>` → 52.

## Border radii

Target values (the measured component-standard — migrate `theme/index.ts` to these):
`borderRadius 8` · `borderRadiusSM 6` · `borderRadiusLG 12` · `borderRadiusXS 4` ·
`borderRadiusOuter 6` · `borderRadiusXL 16` *(to add)*. Modal/Drawer/Popover read
`borderRadius` (**8**, not LG); `components.Card` = **12** (= `borderRadiusLG`).
Button radii on `components.Button` (S 4 · M 8 · L 8 · XL 12). The DS V3 Alert
(`AhaAlert`) is `8px` regular / `4px` small (per [[aha-design-feedback]]).
(Stale token output `borderRadiusXS 2` / `borderRadiusLG 10` is being retired — no
component measures at `2` or `10`.)

## Motion

Durations: `motionDurationFast 0.1s` · `motionDurationMid 0.2s` ·
`motionDurationSlow 0.3s`. Easing: `motionEaseOutBack
cubic-bezier(0.12,0.4,0.29,1.46)` ("playful pop-in" — dropdowns/modals/tooltips).
Additional CSS curves: `--aha-motionEaseOutCirc`, `--aha-motionEaseInOutCirc`,
`--aha-motionEaseOut`, `--aha-motionEaseInOut`, `--aha-motionEaseInBack`,
`--aha-motionEaseInQuint`, `--aha-motionEaseOutQuint`.

## Line widths

`lineWidth 1` (`--aha-lineWidth 1px`) · `lineWidthBold 2` (`--aha-lineWidthBold 2px`).
These are **border** widths — not the icon stroke; for icon line width see
[[aha-design-icons]].

## components block (theme/index.ts)

- **Button** — `colorPrimary #6a1ebb` (CTA fill = brand purple, per component-standard `btn|primary|md`), `fontWeight 600`,
  `primaryShadow none`, heights 28/36/40 (XL 52), radii 4/8/8 (XL 12), paddingInline 12/16/20,
  contentFontSize 12/14/14, `textHoverBg #F5EBFA`.
- **Card** — `borderRadiusLG 12`.
- **Layout** — `headerBg #ffffff`, `bodyBg #f5f5f5`.
