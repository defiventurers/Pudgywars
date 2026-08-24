# Pudhy Penguin Wars — Runtime Structure

> **Architecture stance:** React is the picture frame, Babylon is the canvas, and the TypeScript game modules own gameplay. The Frostbite Toybox visual language remains mandatory: soft penguins, sharp ice, expedition tags, Twilight-blue field, and Penguin Coral moments of impact.

## Entry and Rendering

| Module | Responsibility |
| --- | --- |
| `client/src/App.tsx` | Routes the root directly to the full-screen game canvas. |
| `client/src/components/GameCanvas.tsx` | Owns the React lifecycle for the Babylon Engine, canvas resize listener, and scene handle disposal. |
| `client/src/game/scene.ts` | Creates a fresh Babylon scene, camera, lighting, DOM HUD, audio gate, world instance, and lifecycle handle. |

## Gameplay Ownership

| Module | Responsibility |
| --- | --- |
| `client/src/game/types.ts` | Shared data models for players, platforms, vectors, game events, inputs, and configuration. |
| `client/src/game/InputManager.ts` | Converts browser keyboard events into semantic player actions; removes listeners on disposal. |
| `client/src/game/Player.ts` | Owns one penguin’s mesh hierarchy, local motion state, score, respawn state, and visual squash/tilt. |
| `client/src/game/GameWorld.ts` | Owns rules, fixed-step update, collision resolution, Crown-the-Crate scoring, player-on-player bounce checks, respawns, and demo behavior. |
| `client/src/game/SceneArt.ts` | Creates original mesh art for snowcaps, ice shelves, penguins, crate, lantern, cloud/iceberg layers, and snow motes. |
| `client/src/game/HudController.ts` | Owns the DOM overlay: score tags, timer, round states, manual, pause panel, and match restart button. |
| `client/src/game/AudioManager.ts` | Creates short WebAudio oscillator cues only after user interaction unlocks the audio context. |

## Runtime Data Model

The first release has four fixed contenders: **Coral, Citron, Saffron, and Violet**. Each player has an identifier, color, input mapping, spawn, position, velocity, bounds, score, grounded/drop-through state, respawn timer, and a Babylon mesh root.

The arena is defined by a small authored array of platforms: floor, three snow-capped shelves, a tilt-floe, and the central fish crate control zone. Gameplay uses these dimensions directly; rendering decorates them but never determines collisions.

## State Flow

`title → countdown → match → results → title`

Attract mode bypasses the title state only when the URL has `?demo`. Pause freezes the `match` update, not the renderer. Any player control input during normal title flow unlocks audio and starts the countdown.

## Asset Hints

All first-release art is authored as runtime meshes/materials. Penguins are approximately `1.1 world units` tall; platforms read at `0.6–0.9 world units` high; the central fish crate is `1.8 × 0.95 world units`; HUD score tags are DOM, fixed at `190 × 52 px` on desktop. External generated assets can replace decorative layers later without changing the collision model.
