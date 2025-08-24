import { useEffect, useState, useCallback } from 'react';

interface ViewportInfo {
  height: number;
  hasBottomBar: boolean;
  safeAreaBottom: number;
  isIOS: boolean;
  isMobileSafari: boolean;
}

/**
 * Hook to handle mobile viewport issues, especially with bottom browser UI
 * Detects and compensates for mobile browser navigation bars
 */
export function useMobileViewport(): ViewportInfo {
  const [viewportInfo, setViewportInfo] = useState<ViewportInfo>(() => {
    // Initial detection
    const userAgent = typeof window !== 'undefined' ? window.navigator.userAgent : '';
    const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !('MSStream' in window);
    const isMobileSafari = isIOS && /Safari/.test(userAgent) && !/CriOS/.test(userAgent) && !/FxiOS/.test(userAgent);
    
    // Check if Visual Viewport API is available
    const visualViewport = typeof window !== 'undefined' ? window.visualViewport : null;
    const windowHeight = typeof window !== 'undefined' ? window.innerHeight : 0;
    const visualHeight = visualViewport?.height || windowHeight;
    
    // Detect if there's a bottom bar (difference between window and visual viewport)
    const hasBottomBar = windowHeight > visualHeight;
    
    // Get safe area inset if available (CSS env variable)
    const safeAreaBottom = 0; // Will be updated in useEffect
    
    return {
      height: visualHeight,
      hasBottomBar,
      safeAreaBottom,
      isIOS,
      isMobileSafari
    };
  });

  const updateViewportInfo = useCallback(() => {
    const userAgent = window.navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !('MSStream' in window);
    const isMobileSafari = isIOS && /Safari/.test(userAgent) && !/CriOS/.test(userAgent) && !/FxiOS/.test(userAgent);
    
    const visualViewport = window.visualViewport;
    const windowHeight = window.innerHeight;
    const visualHeight = visualViewport?.height || windowHeight;
    
    // More sophisticated detection:
    // 1. Check visual viewport vs window height
    // 2. Check if we're on a mobile device
    // 3. Check specific browser patterns
    const hasBottomBar = (windowHeight > visualHeight) || 
                        (isIOS && windowHeight > window.screen.height * 0.8) ||
                        (isMobileSafari && window.orientation !== undefined);
    
    // Try to get safe area from CSS
    let safeAreaBottom = 0;
    if (typeof getComputedStyle !== 'undefined') {
      const testEl = document.createElement('div');
      testEl.style.paddingBottom = 'env(safe-area-inset-bottom, 0px)';
      document.body.appendChild(testEl);
      const computedStyle = getComputedStyle(testEl);
      safeAreaBottom = parseInt(computedStyle.paddingBottom) || 0;
      document.body.removeChild(testEl);
    }
    
    setViewportInfo({
      height: visualHeight,
      hasBottomBar,
      safeAreaBottom,
      isIOS,
      isMobileSafari
    });
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Initial update
    updateViewportInfo();
    
    // Set CSS custom properties for use in CSS
    const root = document.documentElement;
    root.style.setProperty('--viewport-height', `${viewportInfo.height}px`);
    root.style.setProperty('--safe-area-bottom', `${viewportInfo.safeAreaBottom}px`);
    
    // Listen for viewport changes
    const handleResize = () => {
      updateViewportInfo();
    };
    
    // Visual Viewport API (more accurate for mobile)
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
      window.visualViewport.addEventListener('scroll', handleResize);
    }
    
    // Fallback to window resize
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    
    // Also listen for scroll events (some browsers show/hide UI on scroll)
    let scrollTimeout: NodeJS.Timeout;
    const handleScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(updateViewportInfo, 100);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize);
        window.visualViewport.removeEventListener('scroll', handleResize);
      }
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, [updateViewportInfo, viewportInfo.height, viewportInfo.safeAreaBottom]);

  return viewportInfo;
}

/**
 * Hook to get dynamic CSS classes for mobile viewport handling
 */
export function useMobileViewportClasses(): string {
  const { hasBottomBar, isIOS, isMobileSafari } = useMobileViewport();
  
  const classes: string[] = [];
  
  if (hasBottomBar) {
    classes.push('has-bottom-bar');
  }
  
  if (isIOS) {
    classes.push('is-ios');
  }
  
  if (isMobileSafari) {
    classes.push('is-mobile-safari');
  }
  
  return classes.join(' ');
}
