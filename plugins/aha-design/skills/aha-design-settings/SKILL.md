---
name: aha-design-settings
description: "Redirect for AhaSlides settings, configuration and options UI: settings panel, settings page, options drawer, preferences, slide type config or right-panel options, naming or labelling a setting, adding a toggle or checkbox, help text or tooltip, grouping options, plan-gated or locked settings, danger zone. Settings design now lives in ONE skill, `settings-design` in the AhaSlides design-system plugin; this skill only sends you there. Do NOT trigger for non-settings UI."
---

# Settings design moved to one skill

AhaSlides settings design is now **one skill**: `settings-design` in the design-system plugin
(`ahaslides-design@ahaslides-design`, marketplace `AhaSlides-Product/ahaslides-design`). It holds
every settings rule: labels, control choice, help and tooltips, grouping, spacing, plan-gated and
danger settings, and the judge. Run it before planning, building or reviewing any settings UI,
with no exception.

1. Plugin installed → load `ahaslides-design:settings-design` and follow it.
2. Plugin not installed → install it (`/plugin marketplace add AhaSlides-Product/ahaslides-design`,
   then enable `ahaslides-design@ahaslides-design`). Until then, read the same rules from the hosted
   design system: https://design.ahaslides.io/settings/index.html (control table) and
   https://design.ahaslides.io/guidelines/settings/index.html (rules, including "Labels: say what
   the setting does"), then judge against the `settings` criteria in
   https://design.ahaslides.io/anti-slop.agent.json.

The rules that used to be here (for example "a setting name is a short noun phrase") are retired:
they contradicted the design system's labelling rule, which puts a clear label before a short one.
