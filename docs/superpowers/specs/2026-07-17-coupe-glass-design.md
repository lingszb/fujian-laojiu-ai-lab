# Coupe Glass Visual Design

## Goal

Replace the current rounded goblet with a lighter coupe silhouette inspired by the supplied reference, while making all five recipe liquids brighter, clearer, and still visibly distinct.

## Visual Direction

- Use a wide, shallow bowl with a fine rim, a narrow elongated stem, and a low elliptical foot.
- Add restrained vertical fluting to the lower bowl to suggest cut glass without turning the receipt into an illustration.
- Keep the existing monochrome receipt palette for the glass outline so the vessel still belongs to the printed-ticket visual system.
- Render each recipe as one mixed liquid color. Do not introduce ingredient layers.
- Use translucent highlights, a brighter liquid surface, and reduced dark shading so the drink reads as clear rather than muddy.

## Interaction

- Preserve the existing click target, accessible label, 900 ms glass wobble, liquid counter-motion, and reduced-motion behavior.
- Preserve recipe-specific bubbles for sparkling recipes.

## Data And Components

- `app/lib/lab-engine.mjs` continues to provide `recipe.glass = { color, sparkling }`, with five lighter color values.
- `app/lab-app.tsx` keeps the current semantic button and glass child elements.
- `app/globals.css` reshapes those existing elements into the coupe and controls transparency, reflections, fluting, and shadows.

## Verification

- Engine tests confirm all five recipes retain a single valid mixed color and sparkling flags.
- Rendered-source tests confirm the coupe styling exists and no layered-liquid variables return.
- Browser QA checks the receipt at mobile width, the click wobble, and the exported receipt layout.
