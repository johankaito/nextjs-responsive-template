import { useState, useEffect, useCallback } from 'react';

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  options?: {
    serialize?: (value: T) => string;
    deserialize?: (value: string) => T;
  }
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  const serialize = options?.serialize || JSON.stringify;
  const deserialize = options?.deserialize || JSON.parse;

  // Get initial value from localStorage or use default
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue;
    
    try {
      const item = window.localStorage.getItem(key);
      return item ? deserialize(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Save to localStorage whenever value changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    try {
      window.localStorage.setItem(key, serialize(storedValue));
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue, serialize]);

  // Remove value from storage
  const removeValue = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  return [storedValue, setStoredValue, removeValue];
}



// Hook for remembering UI preferences
export function useUIPreferences() {
  const [sidebarCollapsed, setSidebarCollapsed] = useLocalStorage('ui-sidebar-collapsed', false);
  const [tableColumns, setTableColumns] = useLocalStorage<Record<string, boolean>>('ui-table-columns', {});
  const [notificationsEnabled, setNotificationsEnabled] = useLocalStorage('ui-notifications', true);
  const [tutorialCompleted, setTutorialCompleted] = useLocalStorage('ui-tutorial-completed', false);

  return {
    sidebarCollapsed,
    setSidebarCollapsed,
    tableColumns,
    setTableColumns,
    notificationsEnabled,
    setNotificationsEnabled,
    tutorialCompleted,
    setTutorialCompleted
  };
} 