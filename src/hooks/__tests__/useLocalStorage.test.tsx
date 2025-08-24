import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from '../useLocalStorage';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorageMock.clear();
  });

  it('should initialize with default value when localStorage is empty', () => {
    const { result } = renderHook(() => 
      useLocalStorage('test-key', 'default-value')
    );

    expect(result.current[0]).toBe('default-value');
  });

  it('should initialize with value from localStorage if it exists', () => {
    localStorageMock.setItem('test-key', JSON.stringify('stored-value'));

    const { result } = renderHook(() => 
      useLocalStorage('test-key', 'default-value')
    );

    expect(result.current[0]).toBe('stored-value');
  });

  it('should update localStorage when value changes', () => {
    const { result } = renderHook(() => 
      useLocalStorage('test-key', 'initial')
    );

    act(() => {
      result.current[1]('updated');
    });

    expect(result.current[0]).toBe('updated');
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'test-key', 
      JSON.stringify('updated')
    );
  });

  it('should handle complex data types', () => {
    const { result } = renderHook(() => 
      useLocalStorage('test-key', { count: 0, items: [] as string[] })
    );

    const newValue = { count: 5, items: ['a', 'b'] };
    
    act(() => {
      result.current[1](newValue);
    });

    expect(result.current[0]).toEqual(newValue);
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'test-key',
      JSON.stringify(newValue)
    );
  });

  it('should handle function updates', () => {
    const { result } = renderHook(() => 
      useLocalStorage('counter', 0)
    );

    act(() => {
      result.current[1]((prev) => prev + 1);
    });

    expect(result.current[0]).toBe(1);

    act(() => {
      result.current[1]((prev) => prev + 1);
    });

    expect(result.current[0]).toBe(2);
  });

  it('should handle corrupted localStorage data', () => {
    localStorageMock.setItem('test-key', 'invalid-json');

    const { result } = renderHook(() => 
      useLocalStorage('test-key', 'default')
    );

    // Should use default value when localStorage has invalid JSON
    expect(result.current[0]).toBe('default');
  });

  it('should handle localStorage errors gracefully', () => {
    const { result } = renderHook(() => 
      useLocalStorage('test-key', 'initial')
    );

    // Mock setItem to throw after initial render
    localStorageMock.setItem.mockImplementationOnce(() => {
      throw new Error('Storage full');
    });

    act(() => {
      result.current[1]('updated');
    });

    // State should still update even if localStorage fails
    expect(result.current[0]).toBe('updated');
  });

  it('should read initial value from localStorage for second hook', () => {
    const { result: hook1 } = renderHook(() => 
      useLocalStorage('shared-key', 'initial')
    );

    act(() => {
      hook1.current[1]('updated');
    });

    // Second hook should read from localStorage
    const { result: hook2 } = renderHook(() => 
      useLocalStorage('shared-key', 'initial')
    );

    expect(hook2.current[0]).toBe('updated');
  });

  it('should handle arrays correctly', () => {
    const { result } = renderHook(() => 
      useLocalStorage('array-key', [1, 2, 3])
    );

    act(() => {
      result.current[1]([...result.current[0], 4]);
    });

    expect(result.current[0]).toEqual([1, 2, 3, 4]);
  });

  it('should handle null and undefined', () => {
    const { result: nullResult } = renderHook(() => 
      useLocalStorage<null | undefined>('null-key', null)
    );

    expect(nullResult.current[0]).toBe(null);

    act(() => {
      nullResult.current[1](undefined);
    });

    expect(nullResult.current[0]).toBe(undefined);
  });


});