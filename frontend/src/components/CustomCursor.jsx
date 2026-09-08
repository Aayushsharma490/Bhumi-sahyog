// CustomCursor.jsx — Dual-Element Luxury Cursor with Lagging Ring
import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';

export default function CustomCursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    // 1. Detect touch device and auto-deactivate
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
      setIsTouchDevice(true);
      return;
    }

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;

    const onMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      // Inner dot: instant move without delay
      gsap.set(dot, { x: mouseX, y: mouseY });

      // Outer ring: lagging smooth inertia
      gsap.to(ring, {
        x: mouseX,
        y: mouseY,
        duration: 0.22,
        ease: 'power3.out',
      });
    };

    // Interactive scale on buttons, links, inputs, and clickable elements
    const onMouseEnterInteractive = () => {
      gsap.to(ring, {
        scale: 1.6,
        borderColor: '#f59e0b', // accent amber
        backgroundColor: 'rgba(245, 158, 11, 0.08)',
        duration: 0.25,
        ease: 'power2.out',
      });
      gsap.to(dot, {
        scale: 0.6,
        backgroundColor: '#f59e0b',
        duration: 0.2,
      });
    };

    const onMouseLeaveInteractive = () => {
      gsap.to(ring, {
        scale: 1,
        borderColor: '#166534', // primary green
        backgroundColor: 'transparent',
        duration: 0.25,
        ease: 'power2.out',
      });
      gsap.to(dot, {
        scale: 1,
        backgroundColor: '#166534',
        duration: 0.2,
      });
    };

    window.addEventListener('mousemove', onMouseMove);

    // Attach listeners to interactive elements dynamically
    const attachHoverListeners = () => {
      const interactives = document.querySelectorAll('a, button, input, select, textarea, [role="button"], .cursor-pointer');
      interactives.forEach((el) => {
        el.addEventListener('mouseenter', onMouseEnterInteractive);
        el.addEventListener('mouseleave', onMouseLeaveInteractive);
      });
    };

    attachHoverListeners();

    // Re-check periodically for newly mounted components
    const interval = setInterval(attachHoverListeners, 2000);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      clearInterval(interval);
    };
  }, []);

  if (isTouchDevice) return null;

  return (
    <>
      {/* Inner Dot */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 w-2 h-2 rounded-full pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2 bg-primary-800 transition-opacity"
      />
      {/* Outer Ring */}
      <div
        ref={ringRef}
        className="fixed top-0 left-0 w-8 h-8 rounded-full pointer-events-none z-[9998] -translate-x-1/2 -translate-y-1/2 border border-primary-700/60 transition-opacity"
      />
    </>
  );
}
