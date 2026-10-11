import React, { useEffect, useRef } from 'react';

// 60FPS Native Interactive Fluid Chromatic Canvas
// Simulates liquid plasma waves with mouse interaction and ambient breathing
export const FluidCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Mouse coordinates with smooth damping
    let mouseX = width * 0.5;
    let mouseY = height * 0.3;
    let targetMouseX = mouseX;
    let targetMouseY = mouseY;

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseX = e.clientX;
      targetMouseY = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Liquid Blobs definition
    const orbs = [
      { x: width * 0.2, y: height * 0.25, r: Math.min(width, height) * 0.42, color: 'rgba(99, 102, 241, 0.28)', vx: 0.25, vy: 0.18, phase: 0 },
      { x: width * 0.8, y: height * 0.35, r: Math.min(width, height) * 0.48, color: 'rgba(168, 85, 247, 0.24)', vx: -0.22, vy: 0.2, phase: 2 },
      { x: width * 0.5, y: height * 0.75, r: Math.min(width, height) * 0.55, color: 'rgba(14, 165, 233, 0.22)', vx: 0.18, vy: -0.24, phase: 4 },
      { x: width * 0.3, y: height * 0.85, r: Math.min(width, height) * 0.38, color: 'rgba(236, 72, 153, 0.18)', vx: -0.15, vy: -0.15, phase: 1 },
      { x: width * 0.7, y: height * 0.15, r: Math.min(width, height) * 0.35, color: 'rgba(56, 189, 248, 0.20)', vx: 0.2, vy: 0.25, phase: 3 },
    ];

    let time = 0;

    const render = () => {
      time += 0.008;

      // Smooth mouse damping
      mouseX += (targetMouseX - mouseX) * 0.04;
      mouseY += (targetMouseY - mouseY) * 0.04;

      ctx.clearRect(0, 0, width, height);

      // Composite mode for rich chromatic bloom
      ctx.globalCompositeOperation = 'screen';

      orbs.forEach((orb) => {
        // Orbit and breathing sine wave oscillation
        const offsetX = Math.sin(time + orb.phase) * 70 + (mouseX - width * 0.5) * 0.08;
        const offsetY = Math.cos(time * 0.8 + orb.phase) * 60 + (mouseY - height * 0.5) * 0.08;
        const currentR = orb.r + Math.sin(time * 1.2 + orb.phase) * 35;

        const currentX = orb.x + offsetX;
        const currentY = orb.y + offsetY;

        const grad = ctx.createRadialGradient(
          currentX, currentY, 0,
          currentX, currentY, currentR
        );

        grad.addColorStop(0, orb.color);
        grad.addColorStop(0.4, orb.color.replace(/[\d\.]+\)$/, '0.12)'));
        grad.addColorStop(0.75, orb.color.replace(/[\d\.]+\)$/, '0.04)'));
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(currentX, currentY, currentR, 0, Math.PI * 2);
        ctx.fill();
      });

      // Subtle living noise grain overlay
      ctx.globalCompositeOperation = 'source-over';

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-80"
      style={{ filter: 'blur(70px)', transform: 'translate3d(0, 0, 0)' }}
    />
  );
};
