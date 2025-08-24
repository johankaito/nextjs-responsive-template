import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface HoverCardProps {
  trigger: React.ReactNode;
  content: React.ReactNode;
  side?: 'top' | 'bottom' | 'left' | 'right';
  align?: 'start' | 'center' | 'end';
  delay?: number;
  className?: string;
  contentClassName?: string;
}

export function HoverCard({
  trigger,
  content,
  side = 'bottom',
  align = 'center',
  delay = 200,
  className,
  contentClassName
}: HoverCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const calculatePosition = React.useCallback(() => {
    if (!triggerRef.current || !contentRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const contentRect = contentRef.current.getBoundingClientRect();
    const spacing = 8;

    let top = 0;
    let left = 0;

    // Calculate vertical position
    switch (side) {
      case 'top':
        top = triggerRect.top - contentRect.height - spacing;
        break;
      case 'bottom':
        top = triggerRect.bottom + spacing;
        break;
      case 'left':
        top = triggerRect.top + (triggerRect.height - contentRect.height) / 2;
        break;
      case 'right':
        top = triggerRect.top + (triggerRect.height - contentRect.height) / 2;
        break;
    }

    // Calculate horizontal position
    switch (side) {
      case 'top':
      case 'bottom':
        switch (align) {
          case 'start':
            left = triggerRect.left;
            break;
          case 'center':
            left = triggerRect.left + (triggerRect.width - contentRect.width) / 2;
            break;
          case 'end':
            left = triggerRect.right - contentRect.width;
            break;
        }
        break;
      case 'left':
        left = triggerRect.left - contentRect.width - spacing;
        break;
      case 'right':
        left = triggerRect.right + spacing;
        break;
    }

    // Ensure content stays within viewport
    const padding = 16;
    left = Math.max(padding, Math.min(left, window.innerWidth - contentRect.width - padding));
    top = Math.max(padding, Math.min(top, window.innerHeight - contentRect.height - padding));

    setPosition({ top, left });
  }, [side, align]);

  useEffect(() => {
    if (isOpen) {
      calculatePosition();
      window.addEventListener('resize', calculatePosition);
      window.addEventListener('scroll', calculatePosition);
      
      return () => {
        window.removeEventListener('resize', calculatePosition);
        window.removeEventListener('scroll', calculatePosition);
      };
    }
  }, [isOpen, calculatePosition]);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setIsOpen(true), delay);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setIsOpen(false), 150);
  };

  return (
    <>
      <div
        ref={triggerRef}
        className={cn("inline-block", className)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {trigger}
      </div>
      
      {isOpen && (
        <div
          ref={contentRef}
          className={cn(
            "fixed z-50 p-3 bg-background border rounded-lg shadow-lg",
            "animate-in fade-in-0 zoom-in-95",
            contentClassName
          )}
          style={{ top: position.top, left: position.left }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {content}
        </div>
      )}
    </>
  );
} 