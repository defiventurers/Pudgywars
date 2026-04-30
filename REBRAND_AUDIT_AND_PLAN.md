# Arctic Penguin War Rebrand Audit & Implementation Plan

## Status

This workspace currently does **not** contain the upstream `supermariowar` source tree, and direct network cloning from GitHub failed in this environment (HTTP 403 tunnel/connect restriction). That means a direct in-repo code/asset modification pass could not be executed here.

To keep progress unblocked, this document provides:

1. A concrete audit method for the exact items you requested.
2. A file-by-file rebrand mapping plan for the expected Super Mario War source layout.
3. A minimal implementation checklist you can apply immediately once the upstream code is present.
4. A cleanup checklist for remaining Nintendo/Mario references.

---

## 1) Repo Structure Inspection (expected)

When the upstream source is available, inspect:

- `src/` or `source/` → engine/UI string tables, menu code, object names.
- `gfx/` → player skins, menu graphics, logos, UI sheets, backgrounds, tilesets.
- `sfx/` and/or `music/` → sound packs and music references.
- `maps/` → map packs and map metadata/names.
- `config/`, `.ini`, `.cfg`, or defaults in `src/` → default pack selection/settings.
- `docs/` + root `README*` + license files → legal attribution and branding references.

Fast scan commands:

```bash
rg --files gfx sfx maps src config docs
rg -n "Mario|Nintendo|Luigi|Peach|Bowser|Toad|Yoshi|SMW|Super Mario War|fireball|coin|star|ice wand" .
```

---

## 2) Locate Requested Assets/Systems

Use these targeted searches in the imported repo:

- Player skins:
  - `rg -n "skin|player sprite|character|costume" src gfx`
- Tilesets:
  - `rg -n "tileset|tile set|tile.*load" src gfx maps`
- Backgrounds:
  - `rg -n "background|bg_" src gfx maps`
- Menu graphics:
  - `rg -n "menu|title|logo|ui" src gfx`
- Sound packs:
  - `rg -n "sfx|sound pack|sound.*load" src sfx config`
- Maps:
  - `rg -n "maps|maplist|map.*load" src maps config`
- Game mode names:
  - `rg -n "mode|gametype|game mode" src`
- Title/logo/menu text:
  - `rg -n "Super Mario War|title|logo|menu text" src gfx`
- Config/default settings:
  - `rg -n "default|pack|theme|gfx|sfx|maps" config src`

---

## 3) Rebrand Mapping Plan (old -> Arctic Penguin)

> Keep gameplay/engine logic unchanged whenever possible.

### Branding
- `"Super Mario War"` -> `"Arctic Penguin War"`
- Window title string, splash/title text, menu header text, about screen text.

### Visual terminology swaps (UI labels only)
- `fireball` -> `snowball`
- `ice wand` -> `freeze wand`
- `coins` -> `fish tokens`
- `stars` -> `aurora shards`

### New pack structure (preferred)
- `gfx/packs/arctic_penguin/`
- `sfx/packs/arctic_penguin/`
- `maps/arctic_penguin/`

### Placeholder asset set (original artwork only)
- Penguin player spritesheet(s), neutral colors, no third-party mascots.
- Arctic menu/title logo.
- Ice/snow terrain tiles.
- Snowfield/aurora backgrounds.
- Icon swaps for coin/star/fireball-themed UI glyphs.

---

## 4) Minimal Working Rebrand Implementation Steps

1. Duplicate a known-good default pack into `arctic_penguin` variants.
2. Replace title/menu/logo images with placeholder arctic branding.
3. Replace default player skin sprites with penguin placeholders.
4. Replace default tiles/backgrounds used by stock maps with icy set.
5. Update menu-visible item labels in code/string tables only.
6. Set config defaults to load `arctic_penguin` packs at startup.
7. Keep all legacy packs present and selectable.

---

## 5) Build Compatibility Guardrails

- Do **not** alter core collision/physics or game loop.
- Do **not** remove existing game modes.
- Do **not** delete legacy assets required by fallback loaders.
- Preserve CMake target names and source lists.
- Prefer additive theme pack registration over path rewrites.

---

## 6) Cleanup Audit Checklist (Nintendo/Mario references)

Audit and replace all **visible** branding while preserving legal attribution:

### Filenames
- [ ] Rename obvious user-facing file names containing Mario/Nintendo terms where safe.
- [ ] Keep internal engine identifiers unchanged if renaming risks breakage.

### Visible UI text
- [ ] Main title strings.
- [ ] Menu headers and captions.
- [ ] Credits/about strings (branding only).

### Menu graphics
- [ ] Title logo image.
- [ ] Menu background art.
- [ ] Any iconography directly tied to Mario franchise look.

### Character names
- [ ] Replace visible roster names with penguin-themed placeholders.
- [ ] Keep gameplay IDs stable if needed.

### Sound names
- [ ] Replace user-visible labels; internal sound keys may stay if not shown.
- [ ] Ensure no copyrighted voice clips/music remain.

### Map names
- [ ] Replace map display names with arctic naming.
- [ ] Keep legacy maps available but relabeled when feasible.

### README/docs
- [ ] Rebrand fork description to Arctic Penguin War.
- [ ] Add explicit note: based on open-source Super Mario War fork.
- [ ] Keep required license notices and attribution intact.

---

## 7) Placeholder Art Specs (recommended)

Use dimensions matching original files exactly. Determine via:

```bash
identify path/to/asset.png
```

Suggested minimum placeholder set:

- Title logo (same dimensions as original title sheet).
- Menu background(s).
- Player spritesheet (idle/run/jump/death frames matching source frame grid).
- Tileset atlas (same tile size, often 16x16 or 32x32 depending project settings).
- Item/UI icons for fish token/aurora shard/snowball/freeze wand labels.

---

## 8) How to switch back to originals

- Keep default packs unchanged.
- Add runtime menu option or config key to select pack.
- Revert defaults in config to original pack names.

---

## 9) Legal/Licensing notes

- Remove/replace all Nintendo trademarks from visible game branding.
- Do not use Pudgy Penguins assets unless separately licensed/supplied.
- Keep upstream open-source attribution and license texts as required.

