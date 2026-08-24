// Frostbite Toybox constants: physical rules stay separate from the soft-penguin presentation.
export type PlayerId = "coral" | "citron" | "saffron" | "violet";

export type PlayerAction = "left" | "right" | "jump" | "down";

export type ActionState = Record<PlayerAction, boolean>;

export interface KeyMap {
  left: string;
  right: string;
  jump: string;
  down: string;
}

export interface Vec2 {
  x: number;
  y: number;
}

export interface PlayerConfig {
  id: PlayerId;
  name: string;
  color: string;
  pale: string;
  trim: string;
  spawn: Vec2;
  keys: KeyMap;
  shortKeys: string;
}

export interface PlatformRect {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  oneWay?: boolean;
  objective?: boolean;
}

export const EMPTY_ACTIONS: ActionState = {
  left: false,
  right: false,
  jump: false,
  down: false,
};

export const PLAYER_CONFIGS: PlayerConfig[] = [
  {
    id: "coral",
    name: "Coral",
    color: "#FF6B5E",
    pale: "#FFD5D0",
    trim: "#A52F31",
    spawn: { x: -7.2, y: -3.7 },
    keys: { left: "a", right: "d", jump: "w", down: "s" },
    shortKeys: "A / D / W",
  },
  {
    id: "citron",
    name: "Citron",
    color: "#C8E85A",
    pale: "#ECF7B7",
    trim: "#597115",
    spawn: { x: -3.7, y: -3.7 },
    keys: { left: "j", right: "l", jump: "i", down: "k" },
    shortKeys: "J / L / I",
  },
  {
    id: "saffron",
    name: "Saffron",
    color: "#FFC857",
    pale: "#FFE7AA",
    trim: "#AA6211",
    spawn: { x: 3.8, y: -3.7 },
    keys: { left: "f", right: "h", jump: "t", down: "g" },
    shortKeys: "F / H / T",
  },
  {
    id: "violet",
    name: "Violet",
    color: "#AB8CFF",
    pale: "#E1D8FF",
    trim: "#5537AD",
    spawn: { x: 7.1, y: -3.7 },
    keys: {
      left: "arrowleft",
      right: "arrowright",
      jump: "arrowup",
      down: "arrowdown",
    },
    shortKeys: "← / → / ↑",
  },
];

export const ARENA_PLATFORMS: PlatformRect[] = [
  { id: "floor", x: 0, y: -5.4, width: 18.6, height: 0.9 },
  { id: "left-shelf", x: -5.5, y: -2.6, width: 4.2, height: 0.68, oneWay: true },
  { id: "right-shelf", x: 5.6, y: -2.05, width: 4.3, height: 0.68, oneWay: true },
  { id: "upper-left", x: -2.8, y: 0.25, width: 3.5, height: 0.68, oneWay: true },
  { id: "upper-right", x: 3.3, y: 1.2, width: 3.25, height: 0.68, oneWay: true },
  { id: "crate", x: 0, y: -0.9, width: 2.05, height: 1.0, objective: true },
];

export const WORLD = {
  left: -9.25,
  right: 9.25,
  deathY: -7.7,
  gravity: -24,
  moveSpeed: 5.8,
  groundAcceleration: 42,
  airAcceleration: 25,
  friction: 34,
  jumpVelocity: 10.2,
  bounceVelocity: 11.1,
  roundSeconds: 75,
} as const;
