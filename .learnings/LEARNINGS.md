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

## [LRN-20260717-003] correction

**Logged**: 2026-07-17T18:05:00+08:00
**Priority**: medium
**Status**: resolved
**Area**: infra

### Summary
For Codex in-app browser handoff, verify the exact browser URL; host-side `curl localhost` success does not prove that the in-app browser can load `localhost`.

### Details
The server returned HTTP 200 to host-side curl, but the in-app browser tab at `http://localhost:3001/` remained blank and generated no server request. Navigating the same tab to `http://127.0.0.1:3001/` loaded the app immediately. The prior completion claim relied on the wrong verification surface.

### Suggested Action
When handing off a local preview, inspect the actual in-app browser DOM and console. If `localhost` is blank while the server is healthy, retry the equivalent `127.0.0.1` URL and verify the rendered page before reporting success.

### Metadata
- Source: user_feedback
- Related Files: package.json, vite.config.ts
- Tags: in-app-browser, localhost, loopback, verification
- Pattern-Key: infra.verify_preview_in_target_browser
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
