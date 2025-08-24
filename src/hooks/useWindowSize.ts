import { useState, useEffect, useCallback, useRef } from 'react';

interface WindowSize {
  width: number | undefined;
  height: number | undefined;
}

interface ScrollPosition {
  x: number;
  y: number;
}

/**
 * Hook to track window size with debouncing
 * @param debounceMs - Debounce delay in milliseconds (default: 150)
 * @returns Object containing width and height
 * 
 * @example
 * ```tsx
 * function ResponsiveComponent() {
 *   const { width, height } = useWindowSize();
 * 
 *   return (
 *     <div>
 *       <p>Window size: {width} x {height}</p>
 *       {width && width < 768 ? (
 *         <MobileView />
 *       ) : (
 *         <DesktopView />
 *       )}
 *     </div>
 *   );
 * }
 * ```
 */
export function useWindowSize(debounceMs: number = 150): WindowSize {
  const [windowSize, setWindowSize] = useState<WindowSize>(() => {
    // SSR safety
    if (typeof window === 'undefined') {
      return { width: undefined, height: undefined };
    }
    return {
      width: window.innerWidth,
      height: window.innerHeight,
    };
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let timeoutId: NodeJS.Timeout;

    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setWindowSize({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      }, debounceMs);
    };

    window.addEventListener('resize', handleResize);
    
    // Call handler right away so state gets updated with initial window size
    handleResize();

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', handleResize);
    };
  }, [debounceMs]);

  return windowSize;
}

/**
 * Hook to track scroll position with optional throttling
 * @param throttleMs - Throttle delay in milliseconds (default: 100)
 * @param element - Element to track scroll position (default: window)
 * @returns Object containing x and y scroll positions
 * 
 * @example
 * ```tsx
 * function ScrollIndicator() {
 *   const { y } = useScrollPosition();
 *   const [showBackToTop, setShowBackToTop] = useState(false);
 * 
 *   useEffect(() => {
 *     setShowBackToTop(y > 300);
 *   }, [y]);
 * 
 *   return (
 *     <>
 *       <div className="scroll-progress" style={{ width: `${(y / document.body.scrollHeight) * 100}%` }} />
 *       {showBackToTop && (
 *         <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
 *           Back to Top
 *         </button>
 *       )}
 *     </>
 *   );
 * }
 * ```
 * 
 * @example
 * ```tsx
 * // Track scroll in a specific element
 * function ScrollableContent() {
 *   const containerRef = useRef<HTMLDivElement>(null);
 *   const { x, y } = useScrollPosition(50, containerRef.current);
 * 
 *   return (
 *     <div ref={containerRef} className="scrollable-container">
 *       <div>Scroll position: {x}, {y}</div>
 *       {/* content *\/}
 *     </div>
 *   );
 * }
 * ```
 */
export function useScrollPosition(
  throttleMs: number = 100,
  element?: HTMLElement | null
): ScrollPosition {
  const [scrollPosition, setScrollPosition] = useState<ScrollPosition>({ x: 0, y: 0 });

  const updatePosition = useCallback(() => {
    if (element) {
      setScrollPosition({ x: element.scrollLeft, y: element.scrollTop });
    } else if (typeof window !== 'undefined') {
      setScrollPosition({ x: window.scrollX, y: window.scrollY });
    }
  }, [element]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let lastTime = 0;
    let rafId: number;

    const handleScroll = () => {
      const now = Date.now();
      
      if (now - lastTime >= throttleMs) {
        lastTime = now;
        updatePosition();
      } else {
        // Cancel any pending update
        cancelAnimationFrame(rafId);
        // Schedule update for the next frame after throttle period
        rafId = requestAnimationFrame(() => {
          lastTime = Date.now();
          updatePosition();
        });
      }
    };

    const target = element || window;
    target.addEventListener('scroll', handleScroll, { passive: true });
    
    // Get initial position
    updatePosition();

    return () => {
      target.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(rafId);
    };
  }, [throttleMs, element, updatePosition]);

  return scrollPosition;
}

/**
 * Hook to detect scroll direction
 * @param threshold - Minimum scroll distance to trigger direction change (default: 5)
 * @returns 'up' | 'down' | 'idle'
 * 
 * @example
 * ```tsx
 * function Header() {
 *   const scrollDirection = useScrollDirection();
 *   const [isHidden, setIsHidden] = useState(false);
 * 
 *   useEffect(() => {
 *     setIsHidden(scrollDirection === 'down');
 *   }, [scrollDirection]);
 * 
 *   return (
 *     <header className={`header ${isHidden ? 'header--hidden' : ''}`}>
 *       {/* header content *\/}
 *     </header>
 *   );
 * }
 * ```
 */
export function useScrollDirection(threshold: number = 5): 'up' | 'down' | 'idle' {
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down' | 'idle'>('idle');
  const [lastScrollY, setLastScrollY] = useState(0);
  const ticking = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateScrollDirection = () => {
      const scrollY = window.scrollY;
      
      if (Math.abs(scrollY - lastScrollY) < threshold) {
        ticking.current = false;
        return;
      }
      
      setScrollDirection(scrollY > lastScrollY ? 'down' : 'up');
      setLastScrollY(scrollY > 0 ? scrollY : 0);
      ticking.current = false;
    };

    const onScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(updateScrollDirection);
        ticking.current = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });

    return () => window.removeEventListener('scroll', onScroll);
  }, [lastScrollY, threshold]);

  return scrollDirection;
}