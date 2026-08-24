// Frostbite Toybox scene: orthographic Babylon tableau with DOM expedition HUD and a deterministic demo route.
import { Camera } from "@babylonjs/core/Cameras/camera";
import { FreeCamera } from "@babylonjs/core/Cameras/freeCamera";
import { Engine } from "@babylonjs/core/Engines/engine";
import { Color4 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Scene } from "@babylonjs/core/scene";
import { AudioManager } from "./AudioManager";
import { GameWorld } from "./GameWorld";
import { HudController } from "./HudController";
import { InputManager } from "./InputManager";
import { createArenaArt } from "./SceneArt";
import { ARENA_PLATFORMS, PLAYER_CONFIGS } from "./types";

export interface GameHandle {
  scene: Scene;
  dispose(): void;
}

export async function createGameScene(engine: Engine, canvas: HTMLCanvasElement): Promise<GameHandle> {
  const scene = new Scene(engine);
  scene.clearColor = new Color4(0.02, 0.07, 0.14, 1);
  const camera = new FreeCamera("arena-camera", new Vector3(0, 0, -20), scene);
  camera.setTarget(Vector3.Zero());
  camera.mode = Camera.ORTHOGRAPHIC_CAMERA;
  const setOrtho = () => {
    const aspect = engine.getRenderWidth() / Math.max(1, engine.getRenderHeight());
    const height = 12.3;
    camera.orthoTop = height / 2;
    camera.orthoBottom = -height / 2;
    camera.orthoLeft = (-height * aspect) / 2;
    camera.orthoRight = (height * aspect) / 2;
  };
  setOrtho();
  canvas.focus();

  const hud = new HudController(PLAYER_CONFIGS);
  const audio = new AudioManager();
  const demo = new URLSearchParams(window.location.search).has("demo");
  let world: GameWorld;
  const input = new InputManager(() => {
    void audio.unlock();
    world?.handleKeyboardStart();
  });
  const art = createArenaArt(scene, ARENA_PLATFORMS);
  world = new GameWorld(scene, input, hud, audio, demo);

  hud.bind({
    start: () => world.startRound(),
    restart: () => world.startRound(),
    togglePause: () => world.togglePause(),
    toggleMute: () => audio.toggleMute(),
    unlockAudio: () => void audio.unlock(),
  });

  const resizeObserver = scene.onBeforeRenderObservable.add(() => {
    setOrtho();
    world.update(scene.getEngine().getDeltaTime() / 1000);
  });

  return {
    scene,
    dispose() {
      scene.onBeforeRenderObservable.remove(resizeObserver);
      world.dispose();
      input.dispose();
      art.dispose();
      hud.dispose();
      audio.dispose();
      scene.dispose();
    },
  };
}
