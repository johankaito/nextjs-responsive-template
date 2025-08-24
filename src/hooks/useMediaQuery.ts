import { useState, useEffect } from 'react';

/**
 * Hook for responsive design using media queries
 * @param query - The media query string (e.g., '(min-width: 768px)')
 * @returns boolean indicating if the media query matches
 * 
 * @example
 * ```tsx
 * const isMobile = useMediaQuery('(max-width: 767px)');
 * const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1023px)');
 * const isDesktop = useMediaQuery('(min-width: 1024px)');
 * 
 * return (
 *   <div>
 *     {isMobile && <MobileLayout />}
 *     {isTablet && <TabletLayout />}
 *     {isDesktop && <DesktopLayout />}
 *   </div>
 * );
 * ```
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(() => {
    // SSR safety: return false during server-side rendering
    if (typeof window === 'undefined') {
      return false;
    }
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    // SSR safety check
    if (typeof window === 'undefined') {
      return;
    }

    const mediaQueryList = window.matchMedia(query);
    
    // Set initial value
    setMatches(mediaQueryList.matches);

    // Define event handler
    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Modern browsers
    if (mediaQueryList.addEventListener) {
      mediaQueryList.addEventListener('change', handleChange);
      return () => {
        mediaQueryList.removeEventListener('change', handleChange);
      };
    } 
    // Legacy browsers
    else {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore - legacy browser support
      mediaQueryList.addListener(handleChange);
      return () => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore - legacy browser support
        mediaQueryList.removeListener(handleChange);
      };
    }
  }, [query]);

  return matches;
}

/**
 * Preset media queries for common breakpoints
 */
export const mediaQueries = {
  mobile: '(max-width: 767px)',
  tablet: '(min-width: 768px) and (max-width: 1023px)',
  desktop: '(min-width: 1024px)',
  largeDesktop: '(min-width: 1440px)',
  portrait: '(orientation: portrait)',
  landscape: '(orientation: landscape)',
  retina: '(min-resolution: 2dppx)',
  prefersReducedMotion: '(prefers-reduced-motion: reduce)',
  prefersDarkMode: '(prefers-color-scheme: dark)',
} as const;