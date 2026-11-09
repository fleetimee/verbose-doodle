import { useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";
import { useTheme } from "@/components/theme-provider";

type Snowflake = {
  x: number;
  y: number;
  radius: number;
  speedY: number;
  speedX: number;
  wobblePhase: number;
  wobbleSpeed: number;
  opacity: number;
};

const FLAKE_COUNT = 42;

function createFlake(width: number, height: number, randomY = true): Snowflake {
  const depth = Math.random();
  return {
    x: Math.random() * width,
    y: randomY ? Math.random() * height : -8 - Math.random() * 24,
    radius: 1 + depth * 1.9,
    speedY: 0.25 + depth * 0.55,
    speedX: (Math.random() - 0.5) * 0.22,
    wobblePhase: Math.random() * Math.PI * 2,
    wobbleSpeed: 0.008 + Math.random() * 0.014,
    opacity: 0.14 + depth * 0.28,
  };
}

export function SeasonalSnowfall() {
  const { colorScheme, theme } = useTheme();
  const shouldReduceMotion = useReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const isChristmas = colorScheme === "christmas-noel";

  useEffect(() => {
    if (!isChristmas || shouldReduceMotion) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    let animationFrameId = 0;
    let width = window.innerWidth;
    let height = window.innerHeight;

    const syncCanvasSize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    syncCanvasSize();

    const flakes: Snowflake[] = Array.from({ length: FLAKE_COUNT }, () =>
      createFlake(width, height, true)
    );

    const isDarkActive = () =>
      document.documentElement.classList.contains("dark");

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      const dark = isDarkActive();
      const rgb = dark ? "244, 248, 245" : "76, 118, 98";

      for (const flake of flakes) {
        flake.wobblePhase += flake.wobbleSpeed;
        flake.y += flake.speedY;
        flake.x += flake.speedX + Math.sin(flake.wobblePhase) * 0.22;

        if (flake.y > height + 10) {
          flake.y = -8;
          flake.x = Math.random() * width;
        }
        if (flake.x > width + 10) {
          flake.x = -8;
        } else if (flake.x < -10) {
          flake.x = width + 8;
        }

        ctx.beginPath();
        ctx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${rgb}, ${flake.opacity})`;
        ctx.fill();
      }

      animationFrameId = window.requestAnimationFrame(render);
    };

    animationFrameId = window.requestAnimationFrame(render);
    window.addEventListener("resize", syncCanvasSize, { passive: true });

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", syncCanvasSize);
    };
  }, [isChristmas, shouldReduceMotion, theme]);

  if (!isChristmas || shouldReduceMotion) {
    return null;
  }

  return (
    <canvas
      className="pointer-events-none fixed inset-0 z-50 h-full w-full select-none"
      data-testid="seasonal-snowfall-canvas"
      ref={canvasRef}
    />
  );
}
