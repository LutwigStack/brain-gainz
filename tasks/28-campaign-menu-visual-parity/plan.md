# Campaign Menu Visual Parity Plan

## Order

1. Active campaign hero slot.
2. Ready campaign card composition.
3. Ready grid empty/placeholder behavior.
4. Custom campaign workshop.
5. Frame and badge noise pass.
6. Browser QA.

## Implementation Notes

- Keep `src/components/CampaignMenu.tsx` as the main component boundary.
- Keep `src/components/campaign-menu-model.ts` responsible only for intent/data splitting.
- Keep accepted campaign-card assets; generate new assets only if a specific slot cannot be solved with existing images and CSS.
- Do not make the screen more text-heavy. Prefer visual grouping, stable action placement, and progressive secondary controls.
- Do not expose archive/destructive actions outside secondary menus.

## Acceptance Checklist

- [ ] Active campaign hero visually matches the importance of the mockup save slot.
- [ ] Ready campaign cards feel image-led and scannable.
- [ ] Template hiding does not make the grid look broken.
- [ ] Custom campaign creation is compact.
- [ ] Borders and badges have clear hierarchy.
- [ ] Desktop QA captured.
- [ ] Mobile QA captured.
- [ ] Console warnings/errors checked.
- [ ] Tests and build pass.
