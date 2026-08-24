# Game Plan: Pudhy Penguin Wars

Pudhy Penguin Wars is an original four-player local arena-platformer. Players use distinct keyboard control clusters to slide, jump, and bounce on rivals in a single-screen Antarctic snack-depot arena. The first playable build focuses on a quick **Crown the Crate** round: stay atop the central glowing fish crate to collect score pips; a last-penguin bounce bonus keeps the round volatile.

## Risk Tasks

### 1. Four-player movement, terrain contact, and stomp outcomes

- **Why isolated:** Four simultaneous movers on one-screen platforms can produce ambiguous collision order, repeated stomps, and players sticking inside platforms.
- **Approach:** Use a compact fixed-step 2D simulation with axis-separated AABB resolution. Landings only resolve when a falling player crosses a platform’s top face. A bounce occurs only when the descending player crosses another active player’s upper hit band; the struck player enters a short frozen/respawn state.
- **Verify:** Each control cluster moves only its assigned penguin; running, jumping, landing, drop-through, and respawning do not trap a player; a descending player scores exactly one bounce, receives upward rebound, and cannot score the same collision again during invulnerability.

### 2. Deterministic attract/demo mode

- **Why isolated:** Screenshot verification must show a legible match without human keyboard input, while normal local play must never have the AI override player controls.
- **Approach:** Enable an explicit `?demo` mode that seeds simple velocity targets, periodic jumps, and objective-seeking choices for all four penguins. Keep demo logic outside normal input resolution.
- **Verify:** Loading `?demo` starts a visible round, moves all four colored penguins, changes scores, and reaches a visible round result without any input; loading without `?demo` leaves all control clusters responsive to keyboards.

## Main Build

- Build a full-screen orthographic Babylon arena with a deep twilight backdrop, stylized ice platforms, central fish crate, score tags, round timer, an accessible keyboard control manual, pause/restart flow, and a compact audio layer unlocked on the first user interaction.
- Use original procedural geometry and hand-authored materials for the penguins, ice, fish crate, lantern, snow motes, and logo. This keeps all runtime visual elements original and crisp at browser scale.
- **Assets needed:** Runtime-generated decorative meshes and material palettes rather than downloaded game assets. The separate asset manifest documents their dimensions and visual roles.
- **Verify:**
  - Each of the four penguins has an independent color, name tag, keyboard control cluster, score, and spawn point.
  - Movement direction matches player input; jumps, slides, landings, bumps, objective scoring, bounce scoring, and respawns are visible.
  - The central crate correctly awards score only to a lone active penguin standing inside its control zone.
  - The scene retains clear silhouettes and readable UI at desktop and mobile viewport widths.
  - No browser console errors occur during normal and `?demo` captures.
  - The visual output follows the Frostbite Toybox direction: twilight blues, snow cream, warm wood, Penguin Coral accents, crooked platform layout, and expedition-tag HUD.

## Completion Criteria

The final browser build type-checks, builds, runs in the preview, and visibly presents a complete original four-player match loop with controls, restart flow, scoring, sound feedback, and automated `?demo` proof mode.
