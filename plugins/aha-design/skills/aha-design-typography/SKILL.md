---
name: aha-design-typography
description: "Use whenever an agent designs, builds, implements, restyles, or reviews ANY AhaSlides PRODUCT user interface — a screen, page, dashboard, form, dialog, or component (presenter, audience, editor) — because every UI has text that must follow this fixed scale. Pull it in on general build requests ('design a settings page', 'build the results screen', 'làm giao diện cho…', 'restyle this dialog') EVEN when the user never mentions fonts or sizes, as well as on explicit type questions ('size/weight for this heading', 'line-height for body', 'is weight 500 allowed'). It resolves the right role and its exact Design System V3 values — font, weight, size, line-height, letter-spacing: Plus Jakarta Sans at 400/600 (Display uses Bold 700; the stylized Capitalized/Small/Tiny labels use Inter) across 18 semantic roles. Do NOT trigger for marketing/brand type — websites, landing pages, social, email, slide graphics (weights 200-800) → [[aha-branding-typography]]. After building, check with [[aha-design-typography-judge]]."
---

# AhaSlides Product Typography

**The type scale for app UI text** — not marketing. When you set any text in an
AhaSlides product surface, match it to one of the roles below instead of picking
an arbitrary size or weight. The values come from **Design System V3** (Figma),
so treat them as canon rather than guessing.

> **Applies to every UI build, not just "font" questions.** Most requests are
> general — *"design a settings page"*, *"làm giao diện dashboard"*, *"restyle this
> dialog"* — and never mention type. Reach for this skill anyway: any product UI
> you build has titles, body copy, labels and captions, and each must resolve to a
> role here. Don't wait for someone to ask about a font size.

> **Product UI vs brand/marketing.** This skill owns *in-app product text* —
> a fixed px scale at weights 400/600. Websites, slides, social graphics, emails
> and other marketing/editorial type use a different, more expressive system with
> weights 200-800 and optical sizing — see [[aha-branding-typography]]. Same font
> family (Plus Jakarta Sans), different scale + weights. Don't cross them: if the
> text lives inside the running product, it's this skill; if it's a marketing or
> brand touchpoint, it's branding.

## The data

The authoritative values live in **`references/typography.json`** (`tokens` +
`roles` + `rules`). Read the exact value from that file — don't infer it from the
prose here. **`references/review.html`** renders all 18 roles in the real fonts;
open it to see and diff against. `references/ds-v3-source.png` is the Figma frame
the values were pulled from.

## The rules (read before setting any text)

- **Font.** Plus Jakarta Sans for everything **except** the stylized label set
  (`capitalized` / `small` / `tiny`), which uses **Inter**.
- **Weight — 400 and 600 only**, with two documented exceptions baked into the
  data:
  - **Display 1 & Display 2 use Bold 700** (hard-set in Figma, not token-bound).
  - The Inter **`tiny`** label uses 600.

  Everything else — all headings and body — is **Regular 400** or **SemiBold
  600**. Don't introduce 500 / 700 / 800 anywhere else; if a mock seems to want
  one, that's a flag to reconcile, not a new weight to add.
  - **Shared-component chrome text is the exception's exception.** The weight of
    text *baked into a shared component* (e.g. the **primary Tabs** label, which
    [[aha-design-component-standard]] measures at **700**) is owned by that
    component's measured standard, not this scale — match the component-standard
    value there. This scale governs **role-based content text** (titles, body,
    captions, labels you author), not a shipped component's internal chrome.
- **Size** is a fixed px scale (Display 64/56 · H1-H6 48/40/32/24/20/18 · body
  16/14/12). Snap to the nearest role — inventing in-between sizes is what makes a
  UI drift out of rhythm.
- **Line-height** is a unitless **ratio**: `1.2` (H1/H2), `1.3` (H3-H6,
  Blockquote), `1.5` (Body, Lead, Display 1), or `normal` (Display 2 + the Inter
  labels). There is **no px line-height scale** — the `28px` value that shows up in
  the Figma spec page is only that page's grey label text, not a role.
- **Letter-spacing** (px): headlines `0` (Display, H1–H4) · subheadings `0.2`
  (H5, H6) · paragraph `0.2` · subtext `0.3` · Inter caps `2`.

## How to use (any stack)

1. **Pick the role** that matches the text's *job*, not its visual size:
   - page / hero title → `heading1`; section heading → `heading2`/`heading3`;
     card or dialog title → `heading4`/`heading5`.
   - base UI / paragraph text → `body`; slightly larger intro copy → `bodyLG`;
     an emphasized inline run → `bodyBold`.
   - a small caption / helper / metadata line → `bodySM` (or `bodySMBold`).
   - an all-caps chip / eyebrow / overline → `capitalized`; tiny meta → `small`
     / `tiny`.
2. **Apply its `family` / `weight` / `size` / `lineHeight` / `letterSpacing`**
   from `typography.json` — in whatever your stack uses (CSS, AntD token,
   Tailwind, inline style). This skill fixes the *values*, not the mechanism.
3. **Verify** against `review.html`, then **run [[aha-design-typography-judge]]**
   on the result — it emits a PASS/FAIL verdict per value and closes a
   build → judge → fix loop. Treat the judge as the mandatory self-check after
   setting any product-UI text; fix every FAIL and re-run until it's `OK TO SHIP`.

## Relationships

- **Verdict / self-check →** [[aha-design-typography-judge]] — the evaluation
  counterpart; invoke it whenever this skill has been applied or when reviewing
  in-app text styles.
- **Marketing / brand text →** [[aha-branding-typography]] (different scale +
  weights; same font family). Don't apply this product scale to a marketing
  asset, or vice-versa.
- **A component's own text** (e.g. a button label) should resolve to one of these
  roles — [[aha-design-component-standard]]'s per-component `fontSize`/`fontWeight`
  values are expected to line up with a role here (e.g. a button label =
  `bodyBold`, 14/600). If they disagree, that's a bug to reconcile, not two
  competing truths.
- **AntD theme tokens →** [[aha-design-antd]] carries the runtime font-size
  tokens, now aligned to this scale (see below).

## Source of truth & known items

1. **Heading sizes — RESOLVED, DS V3 is the source of truth.** Design System V3
   heading sizes are **48 / 40 / 32 / 24 / 20 / 18** (H1–H6). The AntD theme
   (`aha-design-antd`, `references/theme-tokens.md`) previously listed
   **38 / 30 / 24 / 20 / 16** for `fontSizeHeading1-5`; it has been **aligned to DS
   V3** (H1–H5 = 48 / 40 / 32 / 24 / 20). AntD's 5 heading levels have no token for
   **H6 = 18px** — apply it as an explicit 18px (`heading6`) outside the AntD
   heading tokens. If any older `theme.json` / component still hard-codes the old
   sizes, migrate it to these values.

2. **Overlap with [[aha-branding-typography]].** That skill still lists "product
   UI" among its touchpoints and mentions "UI mockup" in its trigger description,
   so on paper both skills can claim in-app text. This skill's `description` now
   only triggers on **UI-build / code intent** and carries an explicit "Do NOT
   trigger for marketing/brand" boundary to keep them apart; a maintainer could
   still tighten the branding skill's scope to brand/marketing only. Rule of thumb:
   **building/reviewing product UI → this skill; brand/marketing asset → branding.**

## Regenerating

`typography.json` was extracted from Figma DS V3 (`get_design_context` on the
"System Typography" frame, file `MwjvUjVI0HnfwD9EwPXRAy`, node `58608-29089`).
Re-extract and re-copy when the design changes; `review.html` is generated from
the JSON.
