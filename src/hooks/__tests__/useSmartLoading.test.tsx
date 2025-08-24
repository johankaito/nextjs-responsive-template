import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSmartLoading, useInitialLoadComplete } from '../useSmartLoading';

describe('useSmartLoading', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('should show loading on initial load', () => {
    const { result } = renderHook(() =>
      useSmartLoading(true, true, false)
    );

    expect(result.current.shouldShowLoading).toBe(false); // Initially false due to delay

    // Wait for loading delay
    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(result.current.shouldShowLoading).toBe(true);
    expect(result.current.isInitialLoad).toBe(true);
    expect(result.current.isBackgroundRefetch).toBe(false);
  });

  it('should not show loading on background refetch by default', () => {
    const { result } = renderHook(() =>
      useSmartLoading(false, true, true) // Not loading, is fetching, has data
    );

    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(result.current.shouldShowLoading).toBe(false);
    expect(result.current.isInitialLoad).toBe(false);
    expect(result.current.isBackgroundRefetch).toBe(true);
  });

  it('should show loading on background refetch when enabled', () => {
    const { result } = renderHook(() =>
      useSmartLoading(false, true, true, { showBackgroundRefetch: true })
    );

    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(result.current.shouldShowLoading).toBe(true);
    expect(result.current.isBackgroundRefetch).toBe(true);
  });

  it('should not show loading for non-data queries', () => {
    const { result } = renderHook(() =>
      useSmartLoading(true, true, false, { isDataQuery: false })
    );

    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(result.current.shouldShowLoading).toBe(false);
    expect(result.current.isInitialLoad).toBe(false);
  });

  it('should hide loading immediately when done', () => {
    const { result, rerender } = renderHook(
      ({ isLoading }) => useSmartLoading(isLoading, isLoading, false),
      { initialProps: { isLoading: true } }
    );

    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(result.current.shouldShowLoading).toBe(true);

    // Stop loading
    rerender({ isLoading: false });

    expect(result.current.shouldShowLoading).toBe(false);
  });

  it('should use custom loading delay', () => {
    const { result } = renderHook(() =>
      useSmartLoading(true, true, false, { loadingDelay: 500 })
    );

    expect(result.current.shouldShowLoading).toBe(false);

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current.shouldShowLoading).toBe(false);

    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(result.current.shouldShowLoading).toBe(true);
  });

  it('should mark as loaded once data is available', () => {
    const { result, rerender } = renderHook(
      ({ hasData }) => useSmartLoading(false, false, hasData),
      { initialProps: { hasData: false } }
    );

    expect(result.current.isInitialLoad).toBe(false);

    // Get data
    rerender({ hasData: true });

    // Future loads should not be initial loads
    const { result: result2 } = renderHook(() =>
      useSmartLoading(true, true, true)
    );

    expect(result2.current.isInitialLoad).toBe(false);
  });
});

describe('useInitialLoadComplete', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('should start as incomplete', () => {
    const { result } = renderHook(() => useInitialLoadComplete());
    expect(result.current.isComplete).toBe(false);
  });

  it('should mark as complete and persist', () => {
    const { result } = renderHook(() => useInitialLoadComplete());

    act(() => {
      result.current.markAsComplete();
    });

    expect(result.current.isComplete).toBe(true);
    expect(sessionStorage.getItem('initial-load-complete')).toBe('true');
  });

  it('should read from sessionStorage on init', () => {
    sessionStorage.setItem('initial-load-complete', 'true');
    
    const { result } = renderHook(() => useInitialLoadComplete());
    expect(result.current.isComplete).toBe(true);
  });

  it('should reset properly', () => {
    const { result } = renderHook(() => useInitialLoadComplete());

    act(() => {
      result.current.markAsComplete();
    });

    expect(result.current.isComplete).toBe(true);

    act(() => {
      result.current.reset();
    });

    expect(result.current.isComplete).toBe(false);
    expect(sessionStorage.getItem('initial-load-complete')).toBe(null);
  });
});