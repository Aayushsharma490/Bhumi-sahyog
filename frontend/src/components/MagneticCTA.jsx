// MagneticCTA.jsx — Magnetic button attraction effect
import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';

export default function MagneticCTA({ children, className = '', onClick, href, to, ...props }) {
  const btnRef = useRef(null);

  useEffect(() => {
    const button = btnRef.current;
    if (!button) return;

    const onMouseMove = (e) => {
      const rect = button.getBoundingClientRect();
      const buttonCenterX = rect.left + rect.width / 2;
      const buttonCenterY = rect.top + rect.height / 2;

      const deltaX = e.clientX - buttonCenterX;
      const deltaY = e.clientY - buttonCenterY;
      const distance = Math.hypot(deltaX, deltaY);

      if (distance < 70) {
        gsap.to(button, {
          x: deltaX * 0.35,
          y: deltaY * 0.35,
          duration: 0.35,
          ease: 'power2.out',
        });
      } else {
        gsap.to(button, { x: 0, y: 0, duration: 0.5, ease: 'power3.out' });
      }
    };

    const onMouseLeave = () => {
      gsap.to(button, { x: 0, y: 0, duration: 0.5, ease: 'power3.out' });
    };

    window.addEventListener('mousemove', onMouseMove);
    button.addEventListener('mouseleave', onMouseLeave);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      button.removeEventListener('mouseleave', onMouseLeave);
    };
  }, []);

  return (
    <div ref={btnRef} className={`inline-block ${className}`} onClick={onClick} {...props}>
      {children}
    </div>
  );
}
