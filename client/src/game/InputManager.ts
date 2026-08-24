// Frostbite Toybox input: four coloured expedition teams map keyboard input to semantic actions.
import {
  EMPTY_ACTIONS,
  PLAYER_CONFIGS,
  type ActionState,
  type PlayerAction,
  type PlayerId,
} from "./types";

export class InputManager {
  private readonly held = new Set<string>();
  private readonly pressed = new Set<string>();
  private readonly keyOwners = new Map<string, { playerId: PlayerId; action: PlayerAction }>();
  private readonly onAction: () => void;

  constructor(onAction: () => void) {
    this.onAction = onAction;
    for (const player of PLAYER_CONFIGS) {
      for (const [action, key] of Object.entries(player.keys) as [PlayerAction, string][]) {
        this.keyOwners.set(key, { playerId: player.id, action });
      }
    }
    window.addEventListener("keydown", this.handleKeyDown, { passive: false });
    window.addEventListener("keyup", this.handleKeyUp, { passive: false });
    window.addEventListener("blur", this.clearAll);
  }

  actionsFor(playerId: PlayerId): ActionState {
    const player = PLAYER_CONFIGS.find((entry) => entry.id === playerId);
    if (!player) return { ...EMPTY_ACTIONS };
    return {
      left: this.held.has(player.keys.left),
      right: this.held.has(player.keys.right),
      jump: this.pressed.has(player.keys.jump),
      down: this.held.has(player.keys.down),
    };
  }

  endFrame() {
    this.pressed.clear();
  }

  dispose() {
    window.removeEventListener("keydown", this.handleKeyDown);
    window.removeEventListener("keyup", this.handleKeyUp);
    window.removeEventListener("blur", this.clearAll);
    this.clearAll();
  }

  private handleKeyDown = (event: KeyboardEvent) => {
    const key = event.key.toLowerCase();
    if (!this.keyOwners.has(key)) return;
    event.preventDefault();
    if (!this.held.has(key)) this.pressed.add(key);
    this.held.add(key);
    this.onAction();
  };

  private handleKeyUp = (event: KeyboardEvent) => {
    const key = event.key.toLowerCase();
    if (!this.keyOwners.has(key)) return;
    event.preventDefault();
    this.held.delete(key);
  };

  private clearAll = () => {
    this.held.clear();
    this.pressed.clear();
  };
}
