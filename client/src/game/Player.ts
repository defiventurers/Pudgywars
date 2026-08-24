// Frostbite Toybox character: round, readable penguin silhouettes with springy in-world motion.
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type { Scene } from "@babylonjs/core/scene";
import type { PlatformRect, PlayerConfig, Vec2 } from "./types";

const PENGUIN_WIDTH = 0.88;
const PENGUIN_HEIGHT = 1.08;

function flatMaterial(scene: Scene, name: string, color: string) {
  const material = new StandardMaterial(name, scene);
  material.diffuseColor = Color3.FromHexString(color);
  material.emissiveColor = Color3.FromHexString(color);
  material.specularColor = Color3.Black();
  material.disableLighting = true;
  return material;
}

export class Player {
  readonly root: TransformNode;
  readonly config: PlayerConfig;
  readonly width = PENGUIN_WIDTH;
  readonly height = PENGUIN_HEIGHT;
  readonly velocity: Vec2 = { x: 0, y: 0 };
  position: Vec2;
  previousPosition: Vec2;
  grounded = false;
  groundedPlatform: PlatformRect | null = null;
  dropTimer = 0;
  respawnTimer = 0;
  score = 0;
  private landSquash = 0;

  constructor(scene: Scene, config: PlayerConfig) {
    this.config = config;
    this.position = { ...config.spawn };
    this.previousPosition = { ...config.spawn };
    this.root = new TransformNode(`penguin-${config.id}`, scene);
    this.root.position = new Vector3(config.spawn.x, config.spawn.y, -0.9);

    const black = flatMaterial(scene, `ink-${config.id}`, "#152033");
    const white = flatMaterial(scene, `belly-${config.id}`, "#FFF8E8");
    const orange = flatMaterial(scene, `feet-${config.id}`, "#F59A45");
    const accent = flatMaterial(scene, `accent-${config.id}`, config.color);
    const accentDark = flatMaterial(scene, `accent-dark-${config.id}`, config.trim);

    const disc = (name: string, radius: number, x: number, y: number, z: number, material: StandardMaterial) => {
      const mesh = MeshBuilder.CreateDisc(name, { radius, tessellation: 32, sideOrientation: Mesh.DOUBLESIDE }, scene);
      mesh.parent = this.root;
      mesh.position = new Vector3(x, y, z);
      mesh.material = material;
      return mesh;
    };

    disc(`body-${config.id}`, 0.47, 0, 0, 0, black);
    disc(`belly-${config.id}`, 0.33, 0, -0.05, -0.06, white);
    disc(`face-${config.id}`, 0.24, 0, 0.22, -0.09, white);
    disc(`eye-left-${config.id}`, 0.045, -0.086, 0.27, -0.14, black);
    disc(`eye-right-${config.id}`, 0.045, 0.086, 0.27, -0.14, black);
    disc(`beak-${config.id}`, 0.075, 0, 0.18, -0.16, orange);
    disc(`foot-left-${config.id}`, 0.13, -0.18, -0.43, -0.16, orange);
    disc(`foot-right-${config.id}`, 0.13, 0.18, -0.43, -0.16, orange);
    disc(`scarf-${config.id}`, 0.29, 0, -0.13, -0.18, accent);

    if (config.id === "citron") {
      disc(`beanie-${config.id}`, 0.23, 0, 0.48, -0.16, accent);
      disc(`beanie-dot-${config.id}`, 0.075, 0, 0.69, -0.18, accentDark);
    } else if (config.id === "saffron") {
      disc(`ear-left-${config.id}`, 0.1, -0.39, 0.26, -0.18, accent);
      disc(`ear-right-${config.id}`, 0.1, 0.39, 0.26, -0.18, accent);
      disc(`band-${config.id}`, 0.31, 0, 0.39, 0.02, accentDark);
    } else if (config.id === "violet") {
      disc(`hood-${config.id}`, 0.38, 0, 0.19, 0.04, accentDark);
      disc(`hood-face-${config.id}`, 0.26, 0, 0.19, -0.13, white);
    } else {
      disc(`scarf-tail-${config.id}`, 0.11, 0.33, -0.2, -0.13, accentDark);
    }
  }

  get active() {
    return this.respawnTimer <= 0;
  }

  reset(spawn = this.config.spawn) {
    this.position = { ...spawn };
    this.previousPosition = { ...spawn };
    this.velocity.x = 0;
    this.velocity.y = 0;
    this.grounded = false;
    this.groundedPlatform = null;
    this.dropTimer = 0;
    this.respawnTimer = 0;
    this.root.setEnabled(true);
    this.syncVisual(0);
  }

  beginRespawn(seconds = 1.65) {
    this.respawnTimer = seconds;
    this.grounded = false;
    this.groundedPlatform = null;
    this.velocity.x = 0;
    this.velocity.y = 0;
    this.root.setEnabled(false);
  }

  syncVisual(delta: number, landed = false) {
    if (landed) this.landSquash = 1;
    this.landSquash = Math.max(0, this.landSquash - delta * 7);
    const squeeze = this.landSquash * 0.13;
    this.root.position.x = this.position.x;
    this.root.position.y = this.position.y;
    this.root.rotation.z = Math.max(-0.18, Math.min(0.18, -this.velocity.x * 0.026));
    this.root.scaling.x = 1 + squeeze;
    this.root.scaling.y = 1 - squeeze;
  }

  dispose() {
    this.root.dispose(false, true);
  }
}
