# Implementation Notes

- The high-level inspiration is a quick four-player single-screen arena-platformer. No source code, character names, maps, sprites, audio, or branded game material from the reference repository will be used.
- The current build targets browser-based **local keyboard multiplayer**; network multiplayer and a level editor are deliberately out of scope for the first playable release.
- `?demo` is a deliberate deterministic attract mode for preview verification. It must not activate during normal play.
- First image generation was blocked by the day’s free-plan quota. The game will use original runtime geometric art and an authored SVG logo for its first playable version, with this limitation recorded in `ASSETS.md`.
- Browser audio is unlocked only after a user gesture. Demo mode may therefore be visually complete but silent until interacted with.
- Live preview confirmed the HUD, wordmark, score tags, manual, penguins, platforms, fish crate, and snow motes mount correctly. The first capture occurred while the new Babylon dependency was being optimized and read as an empty navy frame; the later live inspection showed the arena but the original material emissive values made its runtime illustration too dark. Procedural materials now use their full palette as emissive color for readable toybox contrast.
- Browser verification confirmed the normal title layer, **Start a Scramble** countdown, transition to a running 75-second match, visible timer decrement, and keyboard-action smoke test using Coral’s `D` mapping. The deterministic demo route also shows four distinct penguins, the central crate, elevated ice shelves, the objective halo, and live score HUD in the browser preview.
