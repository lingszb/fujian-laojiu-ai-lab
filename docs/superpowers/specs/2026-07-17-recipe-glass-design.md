# Recipe Glass Redesign

## Goal

Replace the layered recipe glass on the receipt with a smaller, translucent CSS-drawn glass. Each of the five recipes uses one mixed liquid appearance that represents the final combined drink rather than its separate ingredients.

## Visual Design

- Reduce the glass footprint by roughly 25% while preserving the existing receipt hierarchy.
- Keep the existing stemmed round-bowl silhouette, with a thinner rim, subtle glass tint, soft cast shadow, and restrained highlights.
- Render the liquid as one continuous fill with a recipe-specific gradient, a soft elliptical surface, reflected highlight, darker lower edge, and slight transparency.
- Define exactly five liquid palettes, keyed by recipe ID:
  - `R01`: muted grape-milk mauve.
  - `R02`: warm sunset coral-amber.
  - `R03`: translucent tea-gold.
  - `R04`: bright grape-citrus rose.
  - `R05`: creamy orange-apricot.
- Do not calculate or display ingredient layers at runtime.
- Show a few subtle rising bubbles only for sparkling recipes `R02` and `R04`.

## Interaction

- Make the glass a real button with an accessible label and visible keyboard focus.
- A click, tap, Enter, or Space triggers a single approximately 600 ms gentle wobble.
- The vessel rotates slightly around its lower center while the liquid surface counter-rotates by a smaller amount, suggesting inertia without spilling.
- Ignore repeated activation while the current wobble is playing, then allow it again.
- Disable the decorative animation when `prefers-reduced-motion: reduce` is active.

## Data And Components

- Replace recipe `visualLayers` with a `glass` object containing the mixed liquid colors and a `sparkling` boolean.
- Pass the selected recipe's glass palette to CSS through custom properties on the receipt glass.
- Keep the drawing in the existing receipt component and stylesheet; no canvas, image assets, or new dependencies.
- Update the accessible description from layered ingredients to a mixed recipe color.

## Validation

- Update engine tests to require one valid glass palette for every recipe and bubbling only on `R02` and `R04`.
- Update rendered-source tests to require the interactive glass and remove the layered-liquid expectation.
- Run the complete production build and test suite.
- Verify that the receipt remains within the mobile viewport and that reduced-motion mode suppresses the wobble.
