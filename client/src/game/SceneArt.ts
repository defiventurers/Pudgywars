// Frostbite Toybox environmental illustration: blocky ice, snow caps, warm crate and low-gravity motes.
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import type { Scene } from "@babylonjs/core/scene";
import type { PlatformRect } from "./types";

function material(scene: Scene, name: string, hex: string, alpha = 1) {
  const entry = new StandardMaterial(name, scene);
  const color = Color3.FromHexString(hex);
  entry.diffuseColor = color;
  entry.emissiveColor = color;
  entry.specularColor = Color3.Black();
  entry.disableLighting = true;
  entry.alpha = alpha;
  return entry;
}

export interface SceneArtHandle {
  dispose(): void;
}

export function createArenaArt(scene: Scene, platforms: PlatformRect[]): SceneArtHandle {
  const sky = material(scene, "twilight-sky", "#0A1E37");
  const farIce = material(scene, "far-ice", "#173A58");
  const midIce = material(scene, "mid-ice", "#265B76");
  const ice = material(scene, "ice", "#58B9C9");
  const iceDark = material(scene, "ice-dark", "#23788D");
  const snow = material(scene, "snow", "#FFF8E8");
  const wood = material(scene, "crate-wood", "#B96E42");
  const woodDark = material(scene, "crate-dark", "#6F3A2E");
  const coral = material(scene, "lantern-coral", "#FF6B5E");
  const glow = material(scene, "lantern-glow", "#FFD476", 0.22);

  const back = MeshBuilder.CreatePlane("twilight", { width: 22, height: 13 }, scene);
  back.position = new Vector3(0, -0.3, 3.8);
  back.material = sky;

  const silhouettes = [
    [-7.9, -2.3, 3.5, 3.1, farIce],
    [-4.6, -1.8, 4.1, 4.0, farIce],
    [0.8, -2.5, 4.8, 3.4, farIce],
    [5.8, -2.0, 4.2, 3.9, farIce],
    [-6.6, -3.25, 5.5, 2.2, midIce],
    [-0.6, -3.0, 5.1, 2.7, midIce],
    [6.8, -3.1, 5.4, 2.5, midIce],
  ] as const;
  silhouettes.forEach(([x, y, width, height, fill], index) => {
    const chunk = MeshBuilder.CreateBox(`iceberg-${index}`, { width, height, depth: 0.08 }, scene);
    chunk.position = new Vector3(x, y, 2.8);
    chunk.rotation.z = index % 2 === 0 ? -0.12 : 0.09;
    chunk.material = fill;
  });

  for (const platform of platforms) {
    if (platform.objective) {
      const crate = MeshBuilder.CreateBox("fish-crate", { width: platform.width, height: platform.height, depth: 0.35 }, scene);
      crate.position = new Vector3(platform.x, platform.y, -0.05);
      crate.material = wood;
      const band = MeshBuilder.CreateBox("crate-band", { width: 0.13, height: platform.height + 0.03, depth: 0.39 }, scene);
      band.position = new Vector3(platform.x, platform.y, -0.27);
      band.material = woodDark;
      const fish = MeshBuilder.CreateDisc("crate-fish", { radius: 0.22, tessellation: 18 }, scene);
      fish.position = new Vector3(platform.x - 0.38, platform.y + 0.03, -0.29);
      fish.material = snow;
      const objectiveHalo = MeshBuilder.CreateDisc("crate-halo", { radius: 1.55, tessellation: 40 }, scene);
      objectiveHalo.position = new Vector3(platform.x, platform.y + platform.height / 2 + 0.03, 0.21);
      objectiveHalo.material = glow;
      continue;
    }

    const base = MeshBuilder.CreateBox(`ice-${platform.id}`, { width: platform.width, height: platform.height, depth: 0.32 }, scene);
    base.position = new Vector3(platform.x, platform.y, 0.08);
    base.material = platform.id === "floor" ? iceDark : ice;
    const cap = MeshBuilder.CreateBox(`snow-${platform.id}`, { width: platform.width + 0.12, height: 0.18, depth: 0.36 }, scene);
    cap.position = new Vector3(platform.x, platform.y + platform.height / 2 + 0.05, -0.12);
    cap.material = snow;
  }

  const lanternBase = MeshBuilder.CreateBox("lantern-base", { width: 0.28, height: 0.42, depth: 0.2 }, scene);
  lanternBase.position = new Vector3(-1.48, 0.05, -0.5);
  lanternBase.material = coral;
  const lanternTop = MeshBuilder.CreateDisc("lantern-window", { radius: 0.12, tessellation: 18 }, scene);
  lanternTop.position = new Vector3(-1.48, 0.08, -0.64);
  lanternTop.material = glow;

  const motes = Array.from({ length: 30 }, (_, index) => {
    const mote = MeshBuilder.CreateDisc(`snow-mote-${index}`, { radius: 0.025 + (index % 4) * 0.012, tessellation: 8 }, scene);
    mote.position = new Vector3(-9 + ((index * 1.91) % 18), -4.8 + ((index * 0.77) % 9), 1.6);
    mote.material = snow;
    return mote;
  });
  let snowClock = 0;
  const observer = scene.onBeforeRenderObservable.add(() => {
    const delta = Math.min(scene.getEngine().getDeltaTime() / 1000, 0.05);
    snowClock += delta;
    motes.forEach((mote, index) => {
      mote.position.y -= delta * (0.12 + (index % 5) * 0.03);
      mote.position.x += Math.sin(snowClock * 0.8 + index) * delta * 0.05;
      if (mote.position.y < -5.2) {
        mote.position.y = 5.4;
        mote.position.x = -9 + ((index * 2.13 + snowClock * 0.7) % 18);
      }
    });
  });

  return {
    dispose() {
      scene.onBeforeRenderObservable.remove(observer);
    },
  };
}
