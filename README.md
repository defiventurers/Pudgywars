# Pudhy Penguin Wars

**Pudhy Penguin Wars** is an original four-player local arena-platformer for the browser. Four colour-coded expedition penguins compete in a single-screen Antarctic snack depot: hold the glowing fish crate to collect score pips and bounce rivals to send them on a short snow day.

The game is inspired by the enduring local-multiplayer arena-platformer format, but uses original penguin characters, arena illustration, UI, gameplay code, branding, and audio feedback.

## What is included

The first playable release includes a full-screen Frostbite Toybox arena, four keyboard control clusters, a **Crown the Crate** scoring mode, bounce knockouts and respawns, a 75-second round clock, sound feedback unlocked on interaction, pause and sound controls, an on-screen field manual, responsive interface treatment, and an automated attract-mode route at `?demo`.

## Controls

| Player | Move left | Move right | Jump | Drop through platform |
| --- | --- | --- | --- | --- |
| Coral | `A` | `D` | `W` | `S` |
| Citron | `J` | `L` | `I` | `K` |
| Saffron | `F` | `H` | `T` | `G` |
| Violet | `←` | `→` | `↑` | `↓` |

## Run locally

Use Node.js 22+ and pnpm:

```bash
pnpm install
pnpm dev
```

Open the local URL shown in the terminal. For a deterministic presentation round, open `/?demo` after the local address.

To verify the project before publishing a build, run:

```bash
pnpm check
pnpm build
```

## Project structure

| Location | Purpose |
| --- | --- |
| `client/src/game/` | Framework-independent Babylon scene, arena art, movement, rules, input, HUD, and audio modules. |
| `client/src/components/GameCanvas.tsx` | React lifecycle wrapper for the full-screen Babylon canvas. |
| `PLAN.md` | Gameplay risk plan and acceptance criteria. |
| `STRUCTURE.md` | Runtime ownership and module architecture. |
| `ASSETS.md` | Original runtime-illustration manifest and art-direction reference. |
| `ideas.md` | The committed Frostbite Toybox design direction. |

## Next expansions

The architecture is set up for additional arenas, team rules, capture-the-fish play, gamepad mappings, and more seasonal penguin cosmetics.
