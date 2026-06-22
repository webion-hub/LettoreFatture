import { useEffect, useRef } from "react";

/**
 * Texture puntinata di sfondo, interattiva.
 *
 * Disegna una griglia di punti su un canvas fisso a tutto schermo, dietro a
 * tutto il contenuto (`pointer-events: none`, quindi non intercetta i click né
 * interferisce con i componenti). I punti vicini al cursore vengono attratti
 * verso di esso; quando il cursore si allontana tornano alla posizione
 * originale. Il movimento usa un easing costante, così l'animazione è fluida
 * sia in entrata (inseguimento) che in uscita (ritorno).
 */
export function DotBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // ---- parametri della texture ----
    const SPACING = 12; // distanza tra i punti (px) → griglia fitta
    const RADIUS = 1; // raggio del punto (px)
    const INFLUENCE = 110; // entro questa distanza il cursore attrae i punti
    const STRENGTH = 0.32; // quanto si avvicinano al cursore (0..1)
    const EASE = 0.12; // morbidezza del movimento (in entrata e in uscita)
    const COLOR = "hsla(215, 30%, 17%, 0.26)"; // --foreground @ 26%

    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = 0;
    let height = 0;

    // posizioni: origine (ox, oy) e attuale (x, y) per ogni punto
    let ox: Float32Array = new Float32Array(0);
    let oy: Float32Array = new Float32Array(0);
    let px: Float32Array = new Float32Array(0);
    let py: Float32Array = new Float32Array(0);

    // cursore fuori schermo all'avvio → nessuna attrazione
    let mouseX = -9999;
    let mouseY = -9999;

    let rafId = 0;
    let running = false;

    function build() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;

      canvas!.width = Math.floor(width * dpr);
      canvas!.height = Math.floor(height * dpr);
      canvas!.style.width = `${width}px`;
      canvas!.style.height = `${height}px`;

      const cols = Math.ceil(width / SPACING) + 1;
      const rows = Math.ceil(height / SPACING) + 1;
      const count = cols * rows;

      ox = new Float32Array(count);
      oy = new Float32Array(count);
      px = new Float32Array(count);
      py = new Float32Array(count);

      let i = 0;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = c * SPACING;
          const y = r * SPACING;
          ox[i] = x;
          oy[i] = y;
          px[i] = x;
          py[i] = y;
          i++;
        }
      }
    }

    function draw() {
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx!.clearRect(0, 0, width, height);
      ctx!.fillStyle = COLOR;
      ctx!.beginPath();

      let maxDelta = 0;
      const inf2 = INFLUENCE * INFLUENCE;

      for (let i = 0; i < ox.length; i++) {
        // target = origine, salvo se il cursore è abbastanza vicino
        let tx = ox[i];
        let ty = oy[i];

        const dx = mouseX - ox[i];
        const dy = mouseY - oy[i];
        const d2 = dx * dx + dy * dy;
        if (d2 < inf2) {
          const dist = Math.sqrt(d2) || 1;
          const force = (1 - dist / INFLUENCE) * STRENGTH;
          tx = ox[i] + dx * force;
          ty = oy[i] + dy * force;
        }

        // easing verso il target (stesso fattore in entrata e in uscita)
        px[i] += (tx - px[i]) * EASE;
        py[i] += (ty - py[i]) * EASE;

        const adx = px[i] - ox[i];
        const ady = py[i] - oy[i];
        const delta = Math.abs(adx) + Math.abs(ady);
        if (delta > maxDelta) maxDelta = delta;

        ctx!.moveTo(px[i] + RADIUS, py[i]);
        ctx!.arc(px[i], py[i], RADIUS, 0, Math.PI * 2);
      }

      ctx!.fill();

      // continua finché c'è movimento o il cursore è sullo schermo;
      // altrimenti ferma il loop per non sprecare risorse
      const cursorActive = mouseX > -9999;
      if (maxDelta > 0.05 || cursorActive) {
        rafId = requestAnimationFrame(draw);
      } else {
        running = false;
      }
    }

    function start() {
      if (!running) {
        running = true;
        rafId = requestAnimationFrame(draw);
      }
    }

    function onPointerMove(e: PointerEvent) {
      mouseX = e.clientX;
      mouseY = e.clientY;
      start();
    }

    function onPointerLeave() {
      // cursore fuori dalla finestra → i punti tornano al loro posto
      mouseX = -9999;
      mouseY = -9999;
      start();
    }

    function onResize() {
      build();
      start();
    }

    build();
    draw(); // un primo frame statico

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerleave", onPointerLeave);
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerleave", onPointerLeave);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10"
    />
  );
}
