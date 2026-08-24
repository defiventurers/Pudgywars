# Pudhy Penguin Wars — Asset Manifest

**Art direction:** Frostbite Toybox — an original tactile miniature diorama with mid-century children’s adventure-book styling. Use deep twilight blue, glacier cyan, snow cream, seal-stone navy, weathered wood, and the ownable **Penguin Coral `#FF6B5E`**. Silhouettes are rounded for penguins and faceted for ice.

> **Generation note:** The required visual-target request was made on 25 August 2026, but the current free image-generation quota had already been reached. The first playable build therefore uses finished, original runtime mesh illustration rather than downloaded or borrowed art. These scene elements are intentional production artwork, not branded placeholders; generated texture URLs can be added later without changing their gameplay dimensions.

## Runtime Mesh Artwork

| Name | Description | Size | Source |
| --- | --- | --- | --- |
| `penguin_coral` | Round penguin with coral scarf and orange feet | 0.9w × 1.1h | Original runtime geometry |
| `penguin_citron` | Round penguin with citron beanie and orange feet | 0.9w × 1.1h | Original runtime geometry |
| `penguin_saffron` | Round penguin with saffron earmuffs and orange feet | 0.9w × 1.1h | Original runtime geometry |
| `penguin_violet` | Round penguin with violet parka and orange feet | 0.9w × 1.1h | Original runtime geometry |
| `ice_platforms` | Crooked blue ice shelves with thick snowcap top faces | Floor 18w × 1h; shelves 3–6w × 0.7h | Original runtime geometry |
| `fish_crate` | Warm wooden snack crate with fish mark and objective halo | 1.8w × 0.95h | Original runtime geometry |
| `lantern` | Small coral expedition lantern with warm bloom ring | 0.35w × 0.55h | Original runtime geometry |
| `iceberg_layers` | Distant navy and cyan angular iceberg silhouette bands | 18w × 4h | Original runtime geometry |
| `snow_motes` | Sparse low-gravity white snow dots | 0.05–0.12w each | Original runtime geometry |
| `crate_emblem` | Simple fish-crate/penguin flipper icon used in HUD and favicon | 48 × 48 px UI / 0.55w world | Hand-authored SVG and runtime geometry |

## UI Artwork

| Name | Description | Size | Source |
| --- | --- | --- | --- |
| `expedition_tag` | Stitched score label with color ribbon, status dot, and large numerals | 190 × 52 px | CSS/DOM illustration |
| `round_medallion` | Snow-cream timer disc with coral tick | 72 × 72 px | CSS/DOM illustration |
| `field_manual` | Fold-out game controls card with four color-keyed control clusters | 370 × 280 px | CSS/DOM illustration |

## Audio Cues

| Name | Description | Duration | Source |
| --- | --- | --- | --- |
| `jump` | Short rising wooden-toy blip | 100 ms | WebAudio oscillator |
| `bounce` | Two-tone celebratory score chirp | 180 ms | WebAudio oscillator |
| `score` | Warm lantern-like objective chime | 150 ms | WebAudio oscillator |
| `knockout` | Low snow-puff thump | 180 ms | WebAudio oscillator |
