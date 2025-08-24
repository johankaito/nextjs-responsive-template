import React, { useState, useRef, MouseEvent } from 'react';
import { cn } from '@/lib/utils';
import { Button, ButtonProps } from '@/components/ui/button';

interface RippleButtonProps extends ButtonProps {
  rippleColor?: string;
  rippleDuration?: number;
}

interface Ripple {
  x: number;
  y: number;
  size: number;
  id: number;
}

export function RippleButton({
  children,
  className,
  rippleColor = 'rgba(255, 255, 255, 0.5)',
  rippleDuration = 600,
  onClick,
  ...props
}: RippleButtonProps) {
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    if (!buttonRef.current) return;

    const rect = buttonRef.current.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    const newRipple: Ripple = {
      x,
      y,
      size,
      id: Date.now()
    };

    setRipples(prev => [...prev, newRipple]);

    // Remove ripple after animation
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
    }, rippleDuration);

    // Call original onClick
    onClick?.(e);
  };

  return (
    <Button
      ref={buttonRef}
      className={cn("relative overflow-hidden", className)}
      onClick={handleClick}
      {...props}
    >
      {children}
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          className="absolute rounded-full pointer-events-none animate-ripple"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: ripple.size,
            height: ripple.size,
            backgroundColor: rippleColor,
            transform: 'scale(0)',
            animation: `ripple ${rippleDuration}ms ease-out`
          }}
        />
      ))}
    </Button>
  );
} 