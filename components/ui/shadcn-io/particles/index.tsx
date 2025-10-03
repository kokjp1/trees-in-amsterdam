'use client';
/* eslint-disable react-hooks/exhaustive-deps */

import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface MousePosition { x: number; y: number; }
function useMousePosition(): MousePosition {
  const [mousePosition, setMousePosition] = useState<MousePosition>({ x: 0, y: 0 });
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => setMousePosition({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);
  return mousePosition;
}

export interface ParticlesProps {
  className?: string;
  quantity?: number;
  staticity?: number;
  ease?: number;
  size?: number;          // (movement sensitivity) kept for compatibility
  refresh?: boolean;
  color?: string;         // only used if no icons load
  vx?: number;
  vy?: number;
  iconSources?: string[]; // list of icon paths
  iconBaseSize?: number;  // base px size
  iconJitter?: number;    // size variance (0..1)
  rotateDynamic?: boolean;// if true, icons slowly spin
}

function hexToRgb(hex: string): number[] {
  hex = hex.replace("#", "");
  if (hex.length === 3) hex = hex.split("").map(c => c + c).join("");
  const intVal = parseInt(hex, 16);
  return [(intVal >> 16) & 255, (intVal >> 8) & 255, intVal & 255];
}

type Particle = {
  x: number;
  y: number;
  translateX: number;
  translateY: number;
  size: number;        // radius (fallback)
  alpha: number;
  targetAlpha: number;
  dx: number;
  dy: number;
  magnetism: number;
  img?: HTMLImageElement;
  w?: number;
  h?: number;
  rotation: number;
  rotationSpeed: number;
};

export const Particles: React.FC<ParticlesProps> = ({
  className = "",
  quantity = 100,
  staticity = 50,
  ease = 50,
  refresh = false,
  color = "#008000",
  vx = 0,
  vy = 0,
  iconSources = [
    "/asset1.svg","/asset2.svg","/asset3.svg","/asset4.svg",
    "/asset5.svg","/asset6.svg","/asset7.svg","/asset8.svg"
  ],
  iconBaseSize = 16,     // smaller default (was 28)
  iconJitter = 0.2,      // subtle variance
  rotateDynamic = false, // static random rotation by default
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const context = useRef<CanvasRenderingContext2D | null>(null);
  const particles = useRef<Particle[]>([]);
  const mousePosition = useMousePosition();
  const mouse = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const canvasSize = useRef<{ w: number; h: number }>({ w: 0, h: 0 });
  const dpr = typeof window !== "undefined" ? window.devicePixelRatio : 1;

  const imagesRef = useRef<HTMLImageElement[]>([]);
  const [iconsReady, setIconsReady] = useState(false);
  const useIcons = iconSources && iconSources.length > 0;
  const rgb = hexToRgb(color);

  // Load icons
  useEffect(() => {
    if (!useIcons) {
      setIconsReady(false);
      return;
    }
    let cancelled = false;
    const loadedImgs: HTMLImageElement[] = [];
    let processed = 0;

    const finish = () => {
      if (cancelled) return;
      // keep only valid images
      const valid = loadedImgs.filter(i => i.complete && i.naturalWidth > 0);
      imagesRef.current = valid;
      setIconsReady(valid.length > 0);
      if (valid.length === 0) {
        console.warn("[Particles] No valid icon images loaded. Check /public asset paths.");
      }
      initCanvas();
    };

    iconSources.forEach(src => {
      const img = new Image();
      img.onload = () => {
        if (img.naturalWidth === 0) {
          console.warn("[Particles] Broken SVG (0 width):", src);
        }
        loadedImgs.push(img);
        processed++;
        if (processed === iconSources.length) finish();
      };
      img.onerror = () => {
        console.warn("[Particles] Failed to load:", src);
        processed++;
        if (processed === iconSources.length) finish();
      };
      img.src = src; // must exist in /public
    });

    return () => { cancelled = true; };
  }, [iconSources.join("|")]);

  useEffect(() => {
    if (canvasRef.current) context.current = canvasRef.current.getContext("2d");
    initCanvas();
    animate();
    window.addEventListener("resize", initCanvas);
    return () => window.removeEventListener("resize", initCanvas);
  }, [color, iconsReady]);

  useEffect(() => { onMouseMove(); }, [mousePosition.x, mousePosition.y]);
  useEffect(() => { initCanvas(); }, [refresh]);

  const initCanvas = () => {
    resizeCanvas();
    // Avoid drawing fallback dots while waiting for icons: draw only when ready or when icons disabled
    if ((useIcons && iconsReady) || !useIcons) {
      drawInitialParticles();
    }
  };

  const onMouseMove = () => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const { w, h } = canvasSize.current;
    const x = mousePosition.x - rect.left - w / 2;
    const y = mousePosition.y - rect.top - h / 2;
    const inside = x < w / 2 && x > -w / 2 && y < h / 2 && y > -h / 2;
    if (inside) {
      mouse.current.x = x;
      mouse.current.y = y;
    }
  };

  const resizeCanvas = () => {
    if (canvasContainerRef.current && canvasRef.current && context.current) {
      particles.current.length = 0;
      canvasSize.current.w = canvasContainerRef.current.offsetWidth;
      canvasSize.current.h = canvasContainerRef.current.offsetHeight;
      canvasRef.current.width = canvasSize.current.w * dpr;
      canvasRef.current.height = canvasSize.current.h * dpr;
      canvasRef.current.style.width = `${canvasSize.current.w}px`;
      canvasRef.current.style.height = `${canvasSize.current.h}px`;
      context.current.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
  };

  const particleParams = (): Particle => {
    const x = Math.random() * canvasSize.current.w;
    const y = Math.random() * canvasSize.current.h;
    const baseRand = 1 - iconJitter / 2 + Math.random() * iconJitter;
    const iconDim = iconBaseSize * baseRand;
    const radius = iconDim / 2;
    const targetAlpha = parseFloat((Math.random() * 0.6 + 0.25).toFixed(2));
    const img = (useIcons && iconsReady && imagesRef.current.length)
      ? imagesRef.current[Math.floor(Math.random() * imagesRef.current.length)]
      : undefined;
    return {
      x, y,
      translateX: 0,
      translateY: 0,
      size: radius,
      alpha: 0,
      targetAlpha,
      dx: (Math.random() - 0.5) * 0.15,
      dy: (Math.random() - 0.5) * 0.15,
      magnetism: 0.1 + Math.random() * 4,
      img,
      w: iconDim,
      h: iconDim,
      rotation: Math.random() * Math.PI * 2,                // random static rotation
      rotationSpeed: rotateDynamic ? (Math.random() - 0.5) * 0.004 : 0 // optional slow spin
    };
  };

  const drawParticle = (p: Particle, update = false) => {
    if (!context.current) return;
    const ctx = context.current;

    if (p.img && p.img.complete && p.img.naturalWidth > 0) {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.translate(p.x + p.translateX, p.y + p.translateY);
      ctx.rotate(p.rotation);
      ctx.drawImage(p.img, -(p.w! / 2), -(p.h! / 2), p.w!, p.h!);
      ctx.restore();
    } else if (!useIcons) {
      // fallback dots only when icon mode disabled
      ctx.save();
      ctx.translate(p.translateX, p.translateY);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${rgb.join(",")}, ${p.alpha})`;
      ctx.fill();
      ctx.restore();
    }
    if (!update) particles.current.push(p);
  };

  const clearContext = () => {
    context.current?.clearRect(0, 0, canvasSize.current.w, canvasSize.current.h);
  };

  const drawInitialParticles = () => {
    clearContext();
    particles.current.length = 0;
    for (let i = 0; i < quantity; i++) drawParticle(particleParams());
  };

  const remapValue = (value: number, start1: number, end1: number, start2: number, end2: number): number =>
    ((value - start1) * (end2 - start2)) / (end1 - start1) + start2;

  const animate = () => {
    clearContext();
    particles.current.forEach((p, i) => {
      const edge = [
        p.x + p.translateX - p.size,
        canvasSize.current.w - p.x - p.translateX - p.size,
        p.y + p.translateY - p.size,
        canvasSize.current.h - p.y - p.translateY - p.size,
      ];
      const closestEdge = edge.reduce((a, b) => Math.min(a, b));
      const remapClosest = parseFloat(remapValue(closestEdge, 0, 20, 0, 1).toFixed(2));
      if (remapClosest > 1) {
        p.alpha += 0.02;
        if (p.alpha > p.targetAlpha) p.alpha = p.targetAlpha;
      } else {
        p.alpha = p.targetAlpha * remapClosest;
      }

      p.x += p.dx + vx;
      p.y += p.dy + vy;
      p.translateX += (mouse.current.x / (staticity / p.magnetism) - p.translateX) / ease;
      p.translateY += (mouse.current.y / (staticity / p.magnetism) - p.translateY) / ease;
      if (p.rotationSpeed) p.rotation += p.rotationSpeed;

      drawParticle(p, true);

      if (
        p.x < -p.size || p.x > canvasSize.current.w + p.size ||
        p.y < -p.size || p.y > canvasSize.current.h + p.size
      ) {
        particles.current.splice(i, 1);
        drawParticle(particleParams());
      }
    });
    window.requestAnimationFrame(animate);
  };

  return (
    <div
      className={cn("pointer-events-none select-none", className)}
      ref={canvasContainerRef}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="size-full" />
    </div>
  );
};

Particles.displayName = "Particles";