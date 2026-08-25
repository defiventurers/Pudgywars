# Pudgywars

**Pudgywars** is a native four-player local arena game built from the original Super Mario War engine, deliberately preserved rather than reimplemented. The gameplay systems, modes, items, physics, menus, map loader, and local multiplayer rules remain native; this fork applies a focused data-only retheme with four original penguin character sheets and an ice-only standard map pool.

## What changed

| Area | Pudgywars configuration |
| --- | --- |
| Player skins | Exactly four original 192 × 32 PNG sheets live in `data/gfx/skins/`: **Polly** (pink), **Retsba** (red), **Pengu** (blue), and **Abster** (green). |
| Standard maps | `data/maps/` contains ten ice-, snow-, winter-, or frozen-themed `.map` files only. |
| Preserved content | Upstream skin files and non-ice maps are retained under `data/gfx/skins-original/` and `data/maps-disabled/` for reversible curation. |
| Game code | The gameplay systems remain native and unchanged. A narrow WebAssembly launcher, host touch adapter, and four-slot remote-controller bridge were added only for the landscape browser host. |

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

## Landscape mobile web build

The repository also supports a browser build of the same native engine through Emscripten. It keeps the original 640 × 480 logical game surface, blocks portrait presentation, preloads the rethemed data pack, and adds a thumb-reachable host touch pad plus jump/select action. The underlying game remains local multiplayer, but a compatible web host may pair separate phones as controllers for its four native player slots.

```bash
emcmake cmake -S . -B build-web -DCMAKE_BUILD_TYPE=Release -DNO_NETWORK=ON
cmake --build build-web --target smw -j2
```

The generated `smw.html`, `smw.js`, `smw.wasm`, and `smw.data` files must be served over HTTP(S). On a phone, open the web page in **landscape**, wait for the data preload, then use the left thumb pad for movement/menu navigation and the right action zone for jump/select.

### Four-phone host bridge

The Emscripten bundle explicitly exports three browser-facing control functions. The host shell uses `pudgywars_mobile_control(slot, action, pressed)` for host-only menu navigation, `pudgywars_set_remote_players(activeMask)` to declare which of the four player slots are held by connected phones, and `pudgywars_remote_control(player, actionMask)` to write a connected phone’s compact action mask into its native input slot.

The native menu state is refreshed every menu frame and gameplay state every gameplay frame. Remote action masks are therefore ignored in menus, while the host continues to navigate and start matches; they become active only during gameplay. A web host must keep room state outside the Emscripten module, validate controller ownership itself, and clear a player bit and action mask when a phone disconnects.

## Credits and provenance

The native game code and the retained upstream data remain subject to their respective upstream credits and terms. The four Pudgywars penguin sheets are new original pixel-art assets based on the supplied visual reference. See `CREDITS` for the preserved upstream attribution.
