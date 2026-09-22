"use client";

import { useEffect, useRef } from "react";
import { STRINGS, type Locale } from "@/lib/i18n";

// Constantes de jeu, en pixels logiques (avant mise à l'échelle DPR).
const GRAVITY = 780;
const THRUST = -1150;
const MAX_FALL_SPEED = 280;
const MAX_RISE_SPEED = -240;
const PLAYER_X = 56;
const PLAYER_SIZE = 14;
const OBSTACLE_WIDTH = 20;
const GAP_HEIGHT_MAX = 104;
const GAP_HEIGHT_MIN = 74;
const OBSTACLE_SPACING = 230;
const SCROLL_SPEED = 140;
const CANVAS_HEIGHT = 180;

// Mêmes couleurs que le système (globals.css :root) — un canvas ne peut pas
// lire les custom properties CSS, donc dupliquées ici en constantes.
const INK = "#0a0a0a";
const PAPER = "#fafafa";
const ULTRAMARINE = "#1200e8";
const FONT = "'Space Mono', ui-monospace, monospace";

type Obstacle = { x: number; gapY: number; gapHeight: number; passed: boolean };

// Clone très simple de Jetpack Joyride en rendu ASCII : maintenir
// espace/pointeur propulse vers le haut, relâcher laisse tomber, il faut
// passer les murs sans toucher ni le sol/plafond ni les segments pleins.
export default function AsciiJetpack({ locale }: { locale: Locale }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const thrustingRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = canvas?.parentElement;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !container || !ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = container.clientWidth;

    function resize() {
      width = container!.clientWidth;
      canvas!.width = width * dpr;
      canvas!.height = CANVAS_HEIGHT * dpr;
      canvas!.style.width = `${width}px`;
      canvas!.style.height = `${CANVAS_HEIGHT}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);

    let player = { y: CANVAS_HEIGHT / 2, vy: 0 };
    let obstacles: Obstacle[] = [];
    let score = 0;
    let best = 0;
    let gameOver = false;
    let gameOverAt = 0;
    let graceUntil = 0;
    let running = true;

    function spawnObstacle(fromX: number) {
      const gapHeight = Math.max(GAP_HEIGHT_MIN, GAP_HEIGHT_MAX - score * 0.4);
      const gapY = 24 + Math.random() * (CANVAS_HEIGHT - 48 - gapHeight);
      obstacles.push({ x: fromX, gapY, gapHeight, passed: false });
    }

    function reset() {
      player = { y: CANVAS_HEIGHT / 2, vy: 0 };
      obstacles = [];
      score = 0;
      gameOver = false;
      graceUntil = performance.now() + 500;
      let x = width + 60;
      for (let i = 0; i < 4; i++) {
        spawnObstacle(x);
        x += OBSTACLE_SPACING;
      }
    }
    reset();

    function onKeyDown(e: KeyboardEvent) {
      if (e.code === "Space") {
        e.preventDefault();
        thrustingRef.current = true;
      }
    }
    function onKeyUp(e: KeyboardEvent) {
      if (e.code === "Space") thrustingRef.current = false;
    }
    function onPointerDown(e: Event) {
      e.preventDefault();
      thrustingRef.current = true;
    }
    function onPointerUp() {
      thrustingRef.current = false;
    }

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    canvas.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("touchstart", onPointerDown, { passive: false });
    canvas.addEventListener("touchend", onPointerUp);

    let last = performance.now();
    let raf = 0;

    function tick(now: number) {
      if (!running) return;
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      const inGrace = now < graceUntil;

      if (gameOver) {
        if (now - gameOverAt > 900) reset();
      } else {
        if (!inGrace) {
          player.vy += (thrustingRef.current ? THRUST : GRAVITY) * dt;
          player.vy = Math.max(MAX_RISE_SPEED, Math.min(MAX_FALL_SPEED, player.vy));
          player.y += player.vy * dt;
          player.y = Math.max(14 + PLAYER_SIZE / 2, Math.min(CANVAS_HEIGHT - 14 - PLAYER_SIZE / 2, player.y));
        }

        const speed = SCROLL_SPEED + Math.min(score, 40) * 2;
        for (const obstacle of obstacles) {
          obstacle.x -= speed * dt;
          if (!obstacle.passed && obstacle.x + OBSTACLE_WIDTH < PLAYER_X) {
            obstacle.passed = true;
            score += 1;
            best = Math.max(best, score);
          }
        }
        if (obstacles.length && obstacles[0].x < -OBSTACLE_WIDTH) {
          obstacles.shift();
          const lastX = obstacles.length ? obstacles[obstacles.length - 1].x : width;
          spawnObstacle(lastX + OBSTACLE_SPACING);
        }

        if (!inGrace) {
          if (player.y - PLAYER_SIZE / 2 <= 14 || player.y + PLAYER_SIZE / 2 >= CANVAS_HEIGHT - 14) {
            gameOver = true;
            gameOverAt = now;
          }
          for (const obstacle of obstacles) {
            const withinX =
              PLAYER_X + PLAYER_SIZE / 2 > obstacle.x && PLAYER_X - PLAYER_SIZE / 2 < obstacle.x + OBSTACLE_WIDTH;
            if (!withinX) continue;
            const withinGap =
              player.y - PLAYER_SIZE / 2 > obstacle.gapY &&
              player.y + PLAYER_SIZE / 2 < obstacle.gapY + obstacle.gapHeight;
            if (!withinGap) {
              gameOver = true;
              gameOverAt = now;
            }
          }
        }
      }

      draw(ctx!, width, player, obstacles, score, best, gameOver, locale);
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      canvas.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("touchstart", onPointerDown);
      canvas.removeEventListener("touchend", onPointerUp);
    };
  }, [locale]);

  return (
    <div className="game">
      <canvas ref={canvasRef} className="game-canvas" aria-hidden="true" />
    </div>
  );
}

function draw(
  ctx: CanvasRenderingContext2D,
  width: number,
  player: { y: number },
  obstacles: Obstacle[],
  score: number,
  best: number,
  gameOver: boolean,
  locale: Locale,
) {
  const t = STRINGS[locale];
  const height = CANVAS_HEIGHT;

  ctx.fillStyle = INK;
  ctx.fillRect(0, 0, width, height);
  ctx.textBaseline = "top";

  // Sol et plafond : une rangée de caractères pleine largeur.
  ctx.fillStyle = ULTRAMARINE;
  ctx.font = `700 14px ${FONT}`;
  const border = "=".repeat(Math.ceil(width / 8));
  ctx.fillText(border, 0, 0);
  ctx.fillText(border, 0, height - 14);

  // Murs : colonnes de "#" qui sautent la zone de passage.
  const rowHeight = 12;
  for (const obstacle of obstacles) {
    for (let y = 14; y < height - 14; y += rowHeight) {
      if (y + rowHeight > obstacle.gapY && y < obstacle.gapY + obstacle.gapHeight) continue;
      ctx.fillText("#", obstacle.x, y);
      ctx.fillText("#", obstacle.x + 9, y);
    }
  }

  // Joueur.
  ctx.fillStyle = PAPER;
  ctx.font = `700 20px ${FONT}`;
  ctx.fillText(gameOver ? "X" : "@", PLAYER_X - 8, player.y - 10);

  // Score.
  ctx.fillStyle = PAPER;
  ctx.font = `700 11px ${FONT}`;
  ctx.fillText(
    `${t.gameScore} ${String(score).padStart(3, "0")}   BEST ${String(best).padStart(3, "0")}`,
    8,
    height - 30,
  );

  if (gameOver) {
    ctx.fillStyle = ULTRAMARINE;
    ctx.font = `700 18px ${FONT}`;
    const text = t.gameOver;
    const textWidth = ctx.measureText(text).width;
    ctx.fillText(text, width / 2 - textWidth / 2, height / 2 - 10);
  } else if (score === 0) {
    ctx.fillStyle = "rgba(250, 250, 250, 0.6)";
    ctx.font = `700 11px ${FONT}`;
    const text = t.gameInstructions;
    const textWidth = ctx.measureText(text).width;
    ctx.fillText(text, width / 2 - textWidth / 2, 22);
  }
}
