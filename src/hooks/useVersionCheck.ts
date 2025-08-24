'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { usePathname } from 'next/navigation';

const CHECK_INTERVAL = 60000; // Check every 60 seconds
const VERSION_CHECK_KEY = 'app-build-id';
const MIN_CHECK_INTERVAL = 5000; // Minimum 5 seconds between checks

export function useVersionCheck() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const isCheckingRef = useRef(false);
  const lastCheckRef = useRef(0);
  const pathname = usePathname();

  // Check if we're in development by looking at the hostname
  const isDevelopment = typeof window !== 'undefined' && 
    (window.location.hostname === 'localhost' || 
     window.location.hostname === '127.0.0.1' ||
     window.location.hostname.includes('localhost'));

  // Allow forcing version check in development via localStorage for testing
  const forceVersionCheck = typeof window !== 'undefined' && 
    window.localStorage.getItem('FORCE_VERSION_CHECK') === 'true';

  // Skip version checking only if in development AND not forced
  const shouldSkipCheck = isDevelopment && !forceVersionCheck;

  const checkForUpdates = useCallback(async () => {
    // Disable version checking in development unless forced
    if (shouldSkipCheck) return;
    
    // Prevent concurrent checks
    if (isCheckingRef.current) return;
    
    // Prevent checks that are too frequent
    const now = Date.now();
    if (now - lastCheckRef.current < MIN_CHECK_INTERVAL) return;
    
    try {
      isCheckingRef.current = true;
      lastCheckRef.current = now;
      
      // Fetch the build ID from a simple API endpoint
      const response = await fetch('/api/version', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });
      
      if (!response.ok) return;
      
      const data = await response.json();
      const currentBuildId = localStorage.getItem(VERSION_CHECK_KEY);
      
      if (!currentBuildId) {
        // First visit, store the build ID
        localStorage.setItem(VERSION_CHECK_KEY, data.buildId);
      } else if (currentBuildId !== data.buildId) {
        // New version detected
        setUpdateAvailable(true);
      }
    } catch (error) {
      console.error('Version check failed:', error);
    } finally {
      isCheckingRef.current = false;
    }
  }, [shouldSkipCheck]); // Update dependency

  const reload = useCallback(() => {
    // Update the stored build ID before reloading
    localStorage.removeItem(VERSION_CHECK_KEY);
    window.location.reload();
  }, []);

  useEffect(() => {
    // Skip in development unless forced
    if (shouldSkipCheck) return;
    
    // Initial check
    checkForUpdates();
    
    // Set up interval for periodic checks
    const interval = setInterval(checkForUpdates, CHECK_INTERVAL);
    
    return () => clearInterval(interval);
  }, [checkForUpdates, shouldSkipCheck]);

  // Check on route changes (debounced)
  useEffect(() => {
    // Skip in development unless forced
    if (shouldSkipCheck) return;
    
    const timeoutId = setTimeout(() => {
      checkForUpdates();
    }, 1000); // Wait 1 second after route change
    
    return () => clearTimeout(timeoutId);
  }, [pathname, checkForUpdates, shouldSkipCheck]);

  return {
    updateAvailable,
    reload,
    checkForUpdates,
  };
} 