# Plan

## Intent

Build the next visual direction slice around the supplied reference image. The target is not a pixel-perfect clone. The target is the same product shape: a game cockpit where campaign, daily work, map progress, race/city, and opponent are visible as one coherent system.

## Delivery Order

1. Cockpit shell and persistent context
2. `Today` reference dashboard layout
3. Mini knowledge map and daily task cards
4. Race/city/opponent visual cards
5. Frame polish, visual assets, and mobile adaptation
6. Reference cockpit QA

## First Usable Slice

The smallest coherent slice:
- left nav is persistent on desktop
- top context bar shows campaign, specialization, race, and mode
- `Today` content is constrained to a cockpit grid with reserved right rail
- current functionality still works through the new shell
- no secondary screen loses access to Campaign, Today, Map, or Wind Rose

## Technical Direction

- Prefer adapting existing components over rewriting app state.
- Keep the full map editor as its own screen; `Today` should embed a preview, not the editor toolbar.
- Introduce layout primitives that can be reused across Today, Map, and Wind Rose.
- Keep data dependencies explicit: do not hardcode reference values such as race names or city levels when app data already exists.
- Use placeholder assets only when the data model is ready but final art is not.
- Add visual regression screenshots where practical.

## Design Direction

- Left nav is the primary navigation spine.
- Top context bar carries the selected campaign, current specialization, race, and career/free-mode switch.
- Right rail on `Today` carries race/city/opponent, not generic settings.
- Primary goal card is the largest daily object.
- Daily tasks are compact cards with progress, status, and action affordance.
- Mastery row is a visual ladder, not a plain list.
- Weak spots are warning-colored but not app-error styled.
- Mini map is an overview/front preview, not an editing surface.

## Risks

- Building a beautiful shell that hides existing workflows.
- Duplicating navigation state between old top nav and new left nav.
- Letting placeholder art become confusing or misleading.
- Making the desktop cockpit too dense to adapt to mobile.
- Accidentally exposing destructive map tools inside the Today preview.
- Treating the reference as pixel-perfect instead of product-structure guidance.

## QA Gate

Before closing:
- compare current desktop screenshots against the reference
- run desktop `1280x900`
- run mobile `390x844`
- check Campaign Menu, Today, Map, Wind Rose, Inspector, Assessment
- capture console warnings/errors
- run `npm run test`, `npm run lint`, and `npm run build`
- document remaining visual deltas from the reference
