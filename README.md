# Pudgywars

**Pudgywars** is a native four-player local arena game built from the original Super Mario War engine, deliberately preserved rather than reimplemented. The gameplay systems, modes, items, physics, menus, map loader, and local multiplayer rules remain native; this fork applies a focused data-only retheme with four original penguin character sheets and an ice-only standard map pool.

## What changed

| Area | Pudgywars configuration |
| --- | --- |
| Player skins | Exactly four original 192 × 32 PNG sheets live in `data/gfx/skins/`: **Polly** (pink), **Retsba** (red), **Pengu** (blue), and **Abster** (green). |
| Standard maps | `data/maps/` contains ten ice-, snow-, winter-, or frozen-themed `.map` files only. |
| Preserved content | Upstream skin files and non-ice maps are retained under `data/gfx/skins-original/` and `data/maps-disabled/` for reversible curation. |
| Game code | No game logic or C++ source changes were made for the character or map retheme. |

The six frames in each skin sheet are ordered as idle, two walk frames, jump, flattened defeat, and airborne defeat. Sheets use magenta (`#FF00FF`) as their transparent colour key and remain at the engine-required **192 × 32** dimensions.

## Active ice-map pool

`MrMister_Ice Shelf`, `MrMister_Snow Top`, `Peardian_Frozen Frenzy (MP5)`, `Peardian_snowball fight`, `Tanuki_Ice Cave`, `Xijar_Wonder Winterland`, `bobmanperson_icy hills`, `cristomarquez_icecube`, `hazey_Iceland`, and `tubesteak_icecap` are the only maps included in the standard selection list.

## Build and run

Pudgywars requires a C++20 compiler, CMake, SDL 2 with SDL_image and SDL_mixer, zlib, and toml11. On Debian/Ubuntu systems, the dependency command is:

```bash
sudo apt install cmake libsdl2-dev libsdl2-image-dev libsdl2-mixer-dev zlib1g-dev libtoml11-dev libenet-dev
```

Then build and run from the repository root:

```bash
cmake -S . -B build
cmake --build build -j4
./build/smw --datadir ./data
```

At the character-selection screen, assign Polly, Retsba, Pengu, and Abster to the four local players. No asset rebuild or configuration manifest is required.

## Credits and provenance

The native game code and the retained upstream data remain subject to their respective upstream credits and terms. The four Pudgywars penguin sheets are new original pixel-art assets based on the supplied visual reference. See `CREDITS` for the preserved upstream attribution.
