# Alert — Design System V3 reference

The canonical AhaSlides **Alert** (inline banner for feedback). Source of truth: Figma
*Design System V3*, Alert frame `60808:8340` (file `MwjvUjVI0HnfwD9EwPXRAy`).

This reference is **framework-agnostic**: it is anchored on the DS token layer (`--p-color-*`)
plus concrete hex values and semantic roles, so the same contract holds whether the target uses
Ant Design (React), Vue, or plain CSS. AntD/React wiring appears at the end as *implementation
notes*, not as the contract.

> Use this whenever building, reviewing, or generating an Alert / inline alert banner in AhaSlides
> product UI. Do not ship a bare AntD `<Alert>` — it cannot express the DS `branding` type, the
> `small`/`regular` sizes, the DS surface/border tokens, or the DS system icons.

## Anatomy

Horizontal row, `align-items: flex-start`, gap `8px`:

```
[ leading status icon ] [ text block ] [ × close ]
                          ├ optional bold title
                          ├ message
                          └ optional inline link (underlined, brand purple)
```

## Knobs

| knob | values | default | notes |
|---|---|---|---|
| `type` | `success` · `error` · `info` · `warning` · `branding` | `info` | drives colour + glyph |
| `size` | `regular` · `small` | `regular` | drives padding / radius / type scale |
| `icon` | on / off | on | leading status icon |
| `title` | on / off | off | bold title line above the message |
| `close` | on / off | on | trailing × close button |
| `inlineAction` | on / off | off | underlined brand-purple link inside the text block |

## Colour tokens (per type)

DS token first; concrete hex is the fallback / non-token value.

| type | bg-surface | border | icon | glyph |
|---|---|---|---|---|
| success | `--p-color-bg-surface-success` `#d8faef` | `--p-color-border-success` `#16c49a` | `--p-color-icon-success` `#16c49a` | check-circle |
| error | `#ffe3e9` (¹) | `#f5222d` (¹) | `#f5222d` (¹) | x-circle |
| info | `--p-color-bg-surface-info` `#eaf0ff` | `--p-color-border-info` `#bfd2ff` | `--p-color-icon-info` `#7b98d4` | info-circle |
| warning | `--p-color-bg-surface-caution` `#ffe5d6` | `--p-color-border-caution` `#ff7747` | `--p-color-icon-caution` `#ff7747` | warning-triangle |
| branding | `#f9f5ff` (²) | `--p-color-border-hover` `#a96ff0` | `--p-color-icon-brand` `#6a1ebb` | lightbulb |

Shared: text `--p-color-text` `#1a1a1a`; border `1px solid`; inline link
`--p-color-text-brand` `#6a1ebb`, underlined.

**(¹) DS token-naming quirk — error:** in Figma the *error*-looking red resolves through tokens
named `*-warning` (`#f5222d` / `#ffe3e9`), while the *warning*-looking orange resolves through
tokens named `*-caution` (`#ff7747` / `#ffe5d6`). Trust the **visual/semantic** column above, not
the confusing token names. Flagged for the DS owner to reconcile.

**(²) DS token-naming quirk — branding surface:** Figma surfaces the branding background via a
token labelled `--p-color-bg-surface-info` = `#f9f5ff` (an aliasing quirk). Use concrete `#f9f5ff`
until the intended token name is confirmed.

## Size metrics

| | Regular | Small |
|---|---|---|
| padding | `12px` vertical · `16px` horizontal | `8px` all sides |
| border radius | `8px` (matches AntD `borderRadius`) | `4px` (DS Alert small — off the shared radius scale) |
| leading icon | `16px` | `12px` |
| close icon | `12px` | `12px` |
| message | Plus Jakarta Sans Regular, `14px` / lh `1.5` / ls `0.2px` | PJS Regular, `12px` / lh `1.5` / ls `0.3px` |
| title | PJS SemiBold, `14px` / ls `0.2px` | PJS SemiBold, `12px` / ls `0.3px` |
| icon↔text and text↔close gap | `8px` | `8px` |
| title↔message gap | `4px` | `4px` |

Icons come from the DS **system** icon set, stroke width `1.5`. The leading-icon wrapper carries
`3px` vertical padding to optically centre it against the first line of text.

### Font weight — 400 and 600 only

Only **two** Plus Jakarta Sans weights are permitted anywhere in the Alert:

- **400 (Regular)** — the message text and the inline link.
- **600 (SemiBold)** — the optional title line.

No other weight is allowed (no 500 Medium, no 700 Bold, no 300 Light). Any implementation or token
mapping must clamp to `{400, 600}`; if a design or theme supplies another weight, snap it to the
nearest of the two (title → 600, body → 400).

### Heading capitalization — sentence case

The **title / heading** is **sentence case**: capitalize the **first letter only** (plus any proper
nouns). Never Title Case ("Something Went Wrong") and never ALL CAPS. Examples: "Success!",
"Couldn't save your changes", "Upgrade to unlock this". This applies to the title line; the message
body follows normal sentence punctuation too.

## Accessibility

- Actionable / error alerts: `role="alert"` (assertive). Informational: `role="status"`.
- Every colour-bearing type is paired with a **distinct glyph** (colour is never the only signal).
- The × close is a real button with an accessible label (e.g. "Dismiss"); touch target ≥ 24px
  even though the glyph is 12px.

## Figma node IDs

- Alert frame: `60808:8340`
- Regular: success `60808:8561` · error `60808:8553` · info `60808:8527` · warning `60808:8519` · branding `63128:6667`
- Small: success `66120:299` · error `66120:307` · info `66120:315` · warning `66120:323` · branding `66120:331`

## Implementation notes (React / AntD — go-forward stack)

AntD `<Alert>` alone cannot match the DS. Build a thin wrapper (e.g. `AhaAlert`) that:

- renders the DS box (surface / border / radius / padding per `type` × `size`) from the DS tokens
  wired into the app's token layer — map `--p-color-*` onto the app's existing `--aha-*` / AntD
  theme tokens, **or** adopt the `--p-*` names; that choice is per-app, not fixed by this spec;
- adds the `branding` type and the `small` / `regular` sizes AntD lacks;
- uses the DS system icons (check-circle / x-circle / info-circle / warning-triangle / lightbulb),
  not AntD's default filled icons;
- preserves AntD's a11y semantics (`role`, closable button, keyboard dismiss).

Because the contract is token- and role-based, the identical spec applies to a Vue or plain-CSS
implementation — reach for whatever the target app already uses.
