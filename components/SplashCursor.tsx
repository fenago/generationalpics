/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
"use client";
import { useEffect, useRef } from "react";

function SplashCursor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas to cover the entire viewport
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    let lastMousePos = { x: 0, y: 0 };
    let animationId: number;
    
    // Continuous fade effect
    function animate() {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(0,0,0,0.02)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = 'source-over';
      
      animationId = requestAnimationFrame(animate);
    }
    
    // Mouse tracking and color generation
    const handleMouseMove = (e: MouseEvent) => {
      // Check if mouse is over an element with no-splash-cursor class
      const elementUnderMouse = document.elementFromPoint(e.clientX, e.clientY);
      if (elementUnderMouse?.closest('.no-splash-cursor')) {
        return; // Skip splash effect for polaroid cards
      }
      
      const rect = canvas.getBoundingClientRect();
      const currentPos = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
      
      // Calculate velocity
      const mouseVelocity = {
        x: currentPos.x - lastMousePos.x,
        y: currentPos.y - lastMousePos.y
      };
      
      const speed = Math.sqrt(mouseVelocity.x * mouseVelocity.x + mouseVelocity.y * mouseVelocity.y);
      
      if (speed > 1) { // Only create splash if mouse is moving
        const intensity = Math.min(speed / 15, 1);
        const radius = 25 + speed * 0.4;
        
        // Create multiple gradients for a more fluid effect
        for (let i = 0; i < 2; i++) {
          const offset = i * 10;
          const gradient = ctx.createRadialGradient(
            currentPos.x - mouseVelocity.x * 0.2,
            currentPos.y - mouseVelocity.y * 0.2,
            0,
            currentPos.x,
            currentPos.y,
            radius + offset
          );
          
          const hue = (Date.now() * 0.05 + i * 120) % 360;
          gradient.addColorStop(0, `hsla(${hue}, 70%, 60%, ${0.2 * intensity})`);
          gradient.addColorStop(0.7, `hsla(${hue + 60}, 80%, 70%, ${0.1 * intensity})`);
          gradient.addColorStop(1, 'transparent');
          
          ctx.globalCompositeOperation = 'screen';
          ctx.fillStyle = gradient;
          ctx.fillRect(
            currentPos.x - radius - offset,
            currentPos.y - radius - offset,
            (radius + offset) * 2,
            (radius + offset) * 2
          );
        }
      }
      
      lastMousePos = currentPos;
    };
    
    // Add event listeners
    document.addEventListener('mousemove', handleMouseMove);
    
    // Start animation loop
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      document.removeEventListener('mousemove', handleMouseMove);
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{
        mixBlendMode: 'multiply',
      }}
    />
  );
}

export default SplashCursor;
