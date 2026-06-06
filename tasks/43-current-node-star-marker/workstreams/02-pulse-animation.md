# 02 Pulse Animation

## Status

`planned`

## Goal

Add a slow, soft pulse to the corona of the current-node star marker. The pulse is paused when the atlas tab is not the focused tab.

## Why This Matters

A static star is correct but a little inert. A subtle pulse tells the learner "this is alive, this is where you are" without becoming a distraction. Pausing the pulse when the tab is hidden saves CPU and avoids the silent battery drain that comes with a perpetually running animation.

## Scope

- the render loop in `src/game/layers/map-layer.ts` (or wherever the marker is drawn);
- a small `useEffect` / `requestAnimationFrame` hook that drives the pulse;
- a visibility listener that pauses the pulse when the tab is hidden.

## Requirements

### Pulse

- the corona scale animates from `0.96` to `1.04` and back over `2.4s`, ease-in-out, looped;
- the star body does not animate (kept stable for legibility);
- the alpha of the corona also breathes between `0.20` and `0.30`, in sync with the scale, to add a sense of "light";
- the animation is computed from `performance.now()`, not from a frame counter, so that frame drops do not skip the cycle visibly.

### Pause on hide

- when the document is hidden (`document.hidden === true`), the pulse stops and the corona is held at the last computed frame;
- when the document becomes visible again, the pulse resumes from the current `performance.now()`, not from the paused frame, so the cycle stays in phase with wall clock time;
- a `console.debug` log on every pause / resume is added behind a debug flag, off by default.

## Out Of Scope

- A pause when the user is idle inside the tab (out of scope; the brief is "pause on hide", not "pause on idle");
- A different curve for different spheres (out of scope; the pulse is the same for every sphere);
- A heartbeat sound or haptic (out of scope; this epic is visual only).

## Implementation Hints

- The render loop already runs every frame; adding a `const t = (performance.now() % 2400) / 2400` and computing the scale from `t` is the cheapest way to drive the pulse.
- For the pause, listen on `document.addEventListener('visibilitychange', ...)` in the component that owns the canvas, and pass the paused state down to the layer.
- Do not introduce a new animation library. The existing `Math.sin` style of the codebase is fine.

## Done When

- The corona pulses smoothly on a focused tab.
- The pulse pauses within 200ms of the tab losing focus.
- The pulse resumes in phase when the tab regains focus.
- The frame rate stays above 55fps on a standard laptop with the pulse running.
- No `console.warn` or `console.error` from the visibility listener.
