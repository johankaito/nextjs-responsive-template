import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebounce } from '../useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('should return the initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 500));
    expect(result.current).toBe('initial');
  });

  it('should debounce value updates', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    );

    expect(result.current).toBe('initial');

    // Update the value
    rerender({ value: 'updated', delay: 500 });
    
    // Value should not change immediately
    expect(result.current).toBe('initial');

    // Fast forward time
    act(() => {
      vi.advanceTimersByTime(499);
    });
    
    // Still not updated
    expect(result.current).toBe('initial');

    // Fast forward past the delay
    act(() => {
      vi.advanceTimersByTime(1);
    });

    // Now it should be updated
    expect(result.current).toBe('updated');
  });

  it('should cancel previous timeout on rapid updates', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    );

    // Rapid updates
    rerender({ value: 'update1', delay: 500 });
    act(() => {
      vi.advanceTimersByTime(200);
    });
    
    rerender({ value: 'update2', delay: 500 });
    act(() => {
      vi.advanceTimersByTime(200);
    });
    
    rerender({ value: 'update3', delay: 500 });
    
    // Value should still be initial
    expect(result.current).toBe('initial');

    // Fast forward past the delay from the last update
    act(() => {
      vi.advanceTimersByTime(500);
    });

    // Should have the last value
    expect(result.current).toBe('update3');
  });

  it('should handle different data types', () => {
    // Test with number
    const { result: numberResult } = renderHook(() => useDebounce(42, 100));
    expect(numberResult.current).toBe(42);

    // Test with object
    const obj = { key: 'value' };
    const { result: objectResult } = renderHook(() => useDebounce(obj, 100));
    expect(objectResult.current).toBe(obj);

    // Test with array
    const arr = [1, 2, 3];
    const { result: arrayResult } = renderHook(() => useDebounce(arr, 100));
    expect(arrayResult.current).toBe(arr);

    // Test with null
    const { result: nullResult } = renderHook(() => useDebounce(null, 100));
    expect(nullResult.current).toBe(null);
  });

  it('should handle delay changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 1000 } }
    );

    rerender({ value: 'updated', delay: 1000 });
    
    // Change delay while timer is running
    rerender({ value: 'updated', delay: 200 });
    
    act(() => {
      vi.advanceTimersByTime(200);
    });

    // Should update with new delay
    expect(result.current).toBe('updated');
  });

  it('should handle zero delay', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 0 } }
    );

    rerender({ value: 'updated', delay: 0 });
    
    // Should update immediately with zero delay
    act(() => {
      vi.advanceTimersByTime(0);
    });

    expect(result.current).toBe('updated');
  });

  it('should cleanup timeout on unmount', () => {
    const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');
    
    const { unmount, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    );

    rerender({ value: 'updated', delay: 500 });
    
    unmount();

    expect(clearTimeoutSpy).toHaveBeenCalled();
  });
});