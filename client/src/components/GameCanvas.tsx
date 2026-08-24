// Frostbite Toybox: React is the frame; Babylon owns the tactile, edge-to-edge ice arena.
// The canvas must remain the sole root-stage content and preserve a strict lifecycle.
import { useEffect, useRef, useState } from "react";
import { Engine } from "@babylonjs/core/Engines/engine";
import { createGameScene, type GameHandle } from "@/game/scene";

export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const startedRef = useRef(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || startedRef.current) return;
    startedRef.current = true;

    const engine = new Engine(canvas, true, {
      preserveDrawingBuffer: true,
      stencil: true,
      adaptToDeviceRatio: true,
    });
    let handle: GameHandle | null = null;
    let cancelled = false;

    createGameScene(engine, canvas)
      .then((gameHandle) => {
        if (cancelled) {
          gameHandle.dispose();
          return;
        }
        handle = gameHandle;
        setReady(true);
        engine.runRenderLoop(() => gameHandle.scene.render());
      })
      .catch((error) => {
        console.error("Pudhy Penguin Wars could not start.", error);
      });

    const onResize = () => engine.resize();
    window.addEventListener("resize", onResize);

    return () => {
      cancelled = true;
      window.removeEventListener("resize", onResize);
      handle?.dispose();
      engine.dispose();
      startedRef.current = false;
    };
  }, []);

  return (
    <>
      <div className={`ppw-boot-stage ${ready ? "is-hidden" : ""}`} aria-hidden="true">
        <div className="ppw-boot-snow ppw-boot-snow-a" /><div className="ppw-boot-snow ppw-boot-snow-b" /><div className="ppw-boot-snow ppw-boot-snow-c" />
        <div className="ppw-boot-top"><span className="ppw-boot-badge">▣</span><strong>PUDHY<br/>PENGUIN WARS</strong><small>CROWN THE CRATE</small></div>
        <div className="ppw-boot-tags"><b>CORAL <i>0</i></b><b>CITRON <i>0</i></b><b>SAFFRON <i>0</i></b><b>VIOLET <i>0</i></b></div>
        <div className="ppw-boot-ridge ppw-boot-ridge-a" /><div className="ppw-boot-ridge ppw-boot-ridge-b" /><div className="ppw-boot-ridge ppw-boot-ridge-c" />
        <div className="ppw-boot-platform ppw-boot-left" /><div className="ppw-boot-platform ppw-boot-right" /><div className="ppw-boot-platform ppw-boot-floor" />
        <div className="ppw-boot-crate"><span>◒</span></div>
        <div className="ppw-boot-penguin coral"><i/><b/></div><div className="ppw-boot-penguin citron"><i/><b/></div><div className="ppw-boot-penguin saffron"><i/><b/></div><div className="ppw-boot-penguin violet"><i/><b/></div>
        <p className="ppw-boot-copy">Four beaks enter. One crate survives.</p>
      </div>
      <canvas
        ref={canvasRef}
        className={`fixed inset-0 h-full w-full outline-none ${ready ? "ppw-canvas-ready" : "ppw-canvas-loading"}`}
        style={{ touchAction: "none" }}
        aria-label="Pudhy Penguin Wars playable arena"
        tabIndex={0}
      />
    </>
  );
}
