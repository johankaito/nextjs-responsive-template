import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { usePrevious, usePreviousWithInitial, usePreviousHistory } from '../usePrevious';

describe('usePrevious', () => {
  it('should return undefined on first render', () => {
    const { result } = renderHook(() => usePrevious(1));
    expect(result.current).toBeUndefined();
  });

  it('should return previous value after update', () => {
    const { result, rerender } = renderHook(
      ({ value }) => usePrevious(value),
      { initialProps: { value: 1 } }
    );

    expect(result.current).toBeUndefined();

    rerender({ value: 2 });
    expect(result.current).toBe(1);

    rerender({ value: 3 });
    expect(result.current).toBe(2);
  });

  it('should work with objects', () => {
    const obj1 = { name: 'John' };
    const obj2 = { name: 'Jane' };

    const { result, rerender } = renderHook(
      ({ value }) => usePrevious(value),
      { initialProps: { value: obj1 } }
    );

    expect(result.current).toBeUndefined();

    rerender({ value: obj2 });
    expect(result.current).toBe(obj1);
  });
});

describe('usePreviousWithInitial', () => {
  it('should return initial value on first render', () => {
    const { result } = renderHook(() => usePreviousWithInitial(1, 0));
    expect(result.current).toBe(0);
  });

  it('should return previous value after update', () => {
    const { result, rerender } = renderHook(
      ({ value }) => usePreviousWithInitial(value, 0),
      { initialProps: { value: 1 } }
    );

    expect(result.current).toBe(0);

    rerender({ value: 2 });
    expect(result.current).toBe(1);
  });
});

describe('usePreviousHistory', () => {
  it('should track history of values', () => {
    const { result, rerender } = renderHook(
      ({ value }) => usePreviousHistory(value, 3),
      { initialProps: { value: 1 } }
    );

    // Initially empty as no previous values
    expect(result.current).toEqual([]);

    // After first rerender with 2
    rerender({ value: 2 });
    expect(result.current).toEqual([1]);

    // After second rerender with 3
    rerender({ value: 3 });
    expect(result.current).toEqual([2, 1]);

    // After third rerender with 4
    rerender({ value: 4 });
    expect(result.current).toEqual([3, 2, 1]);

    // Check max history is respected (maxHistory = 3)
    rerender({ value: 5 });
    expect(result.current).toEqual([4, 3, 2]);
  });
});