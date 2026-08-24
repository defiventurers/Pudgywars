// Frostbite Toybox gameplay: explicit fixed-step rules make the fast four-player brawl readable and fair.
import type { Scene } from "@babylonjs/core/scene";
import { AudioManager } from "./AudioManager";
import { HudController } from "./HudController";
import { InputManager } from "./InputManager";
import { Player } from "./Player";
import {
  ARENA_PLATFORMS,
  PLAYER_CONFIGS,
  WORLD,
  type ActionState,
  type PlatformRect,
  type PlayerId,
} from "./types";

type MatchState = "title" | "countdown" | "match" | "results" | "paused";

export class GameWorld {
  readonly players = PLAYER_CONFIGS.map((config) => new Player(this.scene, config));
  readonly platforms = ARENA_PLATFORMS;
  state: MatchState;
  private previousState: MatchState = "match";
  private timeLeft = WORLD.roundSeconds;
  private countdown = 0;
  private accumulator = 0;
  private objectiveTick = 0;
  private demoClock = 0;

  constructor(
    private readonly scene: Scene,
    private readonly input: InputManager,
    private readonly hud: HudController,
    private readonly audio: AudioManager,
    private readonly demo = false,
  ) {
    this.state = demo ? "match" : "title";
    if (demo) {
      this.hud.hideModal();
      this.hud.showNotice("DEMO RUNNING — CROWN THE CRATE");
    } else {
      this.hud.showTitle();
    }
  }

  update(delta: number) {
    const frame = Math.min(delta, 0.05);
    if (this.state === "title" || this.state === "results" || this.state === "paused") {
      this.players.forEach((player) => player.syncVisual(frame));
      this.input.endFrame();
      return;
    }

    if (this.state === "countdown") {
      this.countdown -= frame;
      this.hud.showCountdown(Math.max(0, Math.ceil(this.countdown)));
      if (this.countdown <= 0) {
        this.state = "match";
        this.hud.hideModal();
        this.audio.play("start");
      }
      this.input.endFrame();
      return;
    }

    this.timeLeft -= frame;
    this.hud.setTimer(this.timeLeft);
    this.demoClock += frame;
    this.accumulator += frame;
    while (this.accumulator >= 1 / 120) {
      this.step(1 / 120);
      this.accumulator -= 1 / 120;
    }
    this.input.endFrame();
    if (this.timeLeft <= 0) this.finishRound();
  }

  startRound() {
    this.timeLeft = WORLD.roundSeconds;
    this.countdown = 3.05;
    this.objectiveTick = 0;
    this.accumulator = 0;
    this.state = "countdown";
    this.players.forEach((player) => {
      player.score = 0;
      player.reset();
      this.hud.updateScore(player.config.id, 0);
    });
    this.hud.setTimer(this.timeLeft);
    this.hud.hideModal();
    this.hud.showCountdown(3);
  }

  togglePause() {
    if (this.state !== "match" && this.state !== "paused") return;
    if (this.state === "paused") {
      this.state = this.previousState;
      this.hud.setPaused(false);
      return;
    }
    this.previousState = this.state;
    this.state = "paused";
    this.hud.setPaused(true);
  }

  handleKeyboardStart() {
    if (this.demo) return;
    if (this.state === "title" || this.state === "results") this.startRound();
  }

  dispose() {
    this.players.forEach((player) => player.dispose());
  }

  private step(dt: number) {
    for (let index = 0; index < this.players.length; index += 1) {
      const player = this.players[index];
      if (!player.active) {
        player.respawnTimer -= dt;
        if (player.respawnTimer <= 0) {
          player.reset();
          this.hud.showNotice(`${player.config.name} waddles back in!`);
        }
        continue;
      }
      this.simulatePlayer(player, this.actionsFor(player.config.id, index), dt);
    }
    this.resolveBounces();
    this.scoreCrate(dt);
  }

  private actionsFor(playerId: PlayerId, index: number): ActionState {
    if (!this.demo) return this.input.actionsFor(playerId);
    const player = this.players[index];
    const target = [0, -0.5, 0.55, 0][index] + Math.sin(this.demoClock * (0.68 + index * 0.08) + index * 1.3) * 2.6;
    const shouldJump = player.grounded && Math.sin(this.demoClock * (1.3 + index * 0.11) + index * 2.6) > 0.988;
    return {
      left: player.position.x > target + 0.18,
      right: player.position.x < target - 0.18,
      jump: shouldJump,
      down: false,
    };
  }

  private simulatePlayer(player: Player, actions: ActionState, dt: number) {
    player.previousPosition = { ...player.position };
    player.dropTimer = Math.max(0, player.dropTimer - dt);
    const direction = Number(actions.right) - Number(actions.left);
    const acceleration = player.grounded ? WORLD.groundAcceleration : WORLD.airAcceleration;
    if (direction !== 0) {
      player.velocity.x += direction * acceleration * dt;
      player.velocity.x = Math.max(-WORLD.moveSpeed, Math.min(WORLD.moveSpeed, player.velocity.x));
    } else if (player.grounded) {
      const brake = WORLD.friction * dt;
      player.velocity.x = Math.abs(player.velocity.x) <= brake ? 0 : player.velocity.x - Math.sign(player.velocity.x) * brake;
    }

    if (actions.down && player.groundedPlatform?.oneWay) {
      player.dropTimer = 0.18;
      player.grounded = false;
      player.groundedPlatform = null;
      player.velocity.y = -2.2;
    }
    if (actions.jump && player.grounded) {
      player.velocity.y = WORLD.jumpVelocity;
      player.grounded = false;
      player.groundedPlatform = null;
      this.audio.play("jump");
    }

    player.position.x += player.velocity.x * dt;
    this.resolveHorizontalPlatforms(player);
    player.velocity.y += WORLD.gravity * dt;
    player.position.y += player.velocity.y * dt;
    const landed = this.resolveVerticalPlatforms(player);
    player.syncVisual(dt, landed);

    if (player.position.y < WORLD.deathY) {
      this.knockOut(player, null, "slid beyond the shelf");
    }
  }

  private resolveHorizontalPlatforms(player: Player) {
    const half = player.width / 2;
    for (const platform of this.platforms) {
      const top = platform.y + platform.height / 2;
      const bottom = platform.y - platform.height / 2;
      const playerTop = player.position.y + player.height / 2;
      const playerBottom = player.position.y - player.height / 2;
      if (playerBottom >= top - 0.04 || playerTop <= bottom + 0.04) continue;
      const left = platform.x - platform.width / 2;
      const right = platform.x + platform.width / 2;
      if (player.velocity.x > 0 && player.position.x + half > left && player.previousPosition.x + half <= left) {
        player.position.x = left - half;
        player.velocity.x = 0;
      }
      if (player.velocity.x < 0 && player.position.x - half < right && player.previousPosition.x - half >= right) {
        player.position.x = right + half;
        player.velocity.x = 0;
      }
    }
    player.position.x = Math.max(WORLD.left + half, Math.min(WORLD.right - half, player.position.x));
  }

  private resolveVerticalPlatforms(player: Player) {
    player.grounded = false;
    player.groundedPlatform = null;
    const previousBottom = player.previousPosition.y - player.height / 2;
    const previousTop = player.previousPosition.y + player.height / 2;
    const currentBottom = player.position.y - player.height / 2;
    const currentTop = player.position.y + player.height / 2;
    let landed = false;
    for (const platform of this.platforms) {
      const left = platform.x - platform.width / 2;
      const right = platform.x + platform.width / 2;
      if (player.position.x + player.width / 2 <= left || player.position.x - player.width / 2 >= right) continue;
      const top = platform.y + platform.height / 2;
      const bottom = platform.y - platform.height / 2;
      const ignoresOneWay = platform.oneWay && player.dropTimer > 0;
      if (!ignoresOneWay && player.velocity.y <= 0 && previousBottom >= top - 0.04 && currentBottom <= top + 0.03) {
        player.position.y = top + player.height / 2;
        player.velocity.y = 0;
        player.grounded = true;
        player.groundedPlatform = platform;
        landed = true;
      } else if (!platform.oneWay && player.velocity.y > 0 && previousTop <= bottom + 0.04 && currentTop >= bottom - 0.03) {
        player.position.y = bottom - player.height / 2;
        player.velocity.y = 0;
      }
    }
    return landed;
  }

  private resolveBounces() {
    for (let i = 0; i < this.players.length; i += 1) {
      for (let j = i + 1; j < this.players.length; j += 1) {
        const a = this.players[i];
        const b = this.players[j];
        if (!a.active || !b.active) continue;
        const upper = a.position.y > b.position.y ? a : b;
        const lower = upper === a ? b : a;
        const horizontalDistance = Math.abs(upper.position.x - lower.position.x);
        const upperBottom = upper.position.y - upper.height / 2;
        const lowerTop = lower.position.y + lower.height / 2;
        if (
          horizontalDistance < (upper.width + lower.width) * 0.44 &&
          upper.velocity.y < -1.2 &&
          upper.position.y > lower.position.y + 0.18 &&
          upperBottom <= lowerTop + 0.17 &&
          upperBottom >= lowerTop - 0.25
        ) {
          upper.velocity.y = WORLD.bounceVelocity;
          upper.score += 3;
          this.hud.updateScore(upper.config.id, upper.score);
          this.hud.showNotice(`${upper.config.name} delivered a snow day!`);
          this.audio.play("bounce");
          lower.beginRespawn();
          return;
        }
      }
    }
  }

  private scoreCrate(dt: number) {
    if (this.demo) {
      this.objectiveTick += dt;
      if (this.objectiveTick >= 1.8) {
        this.objectiveTick = 0;
        const showcasePlayer = this.players[Math.floor(this.demoClock / 1.8) % this.players.length];
        showcasePlayer.score += 1;
        this.hud.updateScore(showcasePlayer.config.id, showcasePlayer.score);
        this.hud.showNotice(`${showcasePlayer.config.name} camps the crate!`);
        this.audio.play("score");
      }
      return;
    }
    const contenders = this.players.filter((player) => player.active && player.groundedPlatform?.objective);
    if (contenders.length !== 1) {
      this.objectiveTick = 0;
      return;
    }
    this.objectiveTick += dt;
    if (this.objectiveTick < 0.75) return;
    this.objectiveTick = 0;
    const leader = contenders[0];
    leader.score += 1;
    this.hud.updateScore(leader.config.id, leader.score);
    this.hud.showNotice(`${leader.config.name} pockets a crate pip.`);
    this.audio.play("score");
  }

  private knockOut(player: Player, by: Player | null, reason: string) {
    if (!player.active) return;
    player.beginRespawn();
    this.audio.play("knockout");
    this.hud.showNotice(by ? `${by.config.name} iced ${player.config.name}!` : `${player.config.name} ${reason}.`);
  }

  private finishRound() {
    this.state = "results";
    const sorted = [...this.players].sort((a, b) => b.score - a.score);
    const winner = sorted[0];
    const tie = sorted.filter((player) => player.score === winner.score).length > 1;
    this.hud.showResult(winner.config.name, winner.score, tie);
    this.hud.setResultAction(() => this.startRound());
  }
}
