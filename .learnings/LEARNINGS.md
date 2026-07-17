## [LRN-20260717-001] correction

**Logged**: 2026-07-17T15:30:00+08:00
**Priority**: high
**Status**: resolved
**Area**: frontend

### Summary
A mixed drink color must use one base hue; multiple recipe color stops still read as ingredient layers.

### Details
The receipt glass was changed from stacked elements to a CSS gradient, but each recipe still supplied distinct top, middle, and bottom colors. Even without hard-coded layer elements, the visual communicated separation instead of a fully mixed drink. The correct interpretation is one final recipe color with light, transparency, and shadow overlays derived by CSS.

### Suggested Action
Store one `glass.color` per recipe and create depth only with translucent white/black gradients and highlights. Do not use multiple opaque recipe colors for the liquid fill.

### Metadata
- Source: user_feedback
- Related Files: app/lib/lab-engine.mjs, app/lab-app.tsx, app/globals.css
- Tags: css, gradient, color, visual-language
- Pattern-Key: frontend.single_mixed_color
- Recurrence-Count: 1
- First-Seen: 2026-07-17
- Last-Seen: 2026-07-17

---

## [LRN-20260717-002] correction

**Logged**: 2026-07-17T15:45:00+08:00
**Priority**: medium
**Status**: resolved
**Area**: frontend

### Summary
An interactive decorative object needs perceptible feedback and a non-motion fallback.

### Details
The receipt glass click handler worked, but a 3-degree, 620 ms wobble was too subtle to read reliably. The reduced-motion rule also removed every visual response. A click interaction should remain obvious through a slightly stronger wobble plus shadow/highlight feedback, while reduced-motion devices receive the shadow/highlight response without movement.

### Suggested Action
Verify both the event-state transition and computed visual feedback. For reduced-motion branches, replace movement with a visible static state instead of removing all feedback.

### Metadata
- Source: user_feedback
- Related Files: app/lab-app.tsx, app/globals.css
- Tags: interaction, motion, accessibility, feedback
- Pattern-Key: frontend.perceptible_interaction_feedback
- Recurrence-Count: 1
- First-Seen: 2026-07-17
- Last-Seen: 2026-07-17

---
