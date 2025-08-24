import { useCallback, useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';

/**
 * Hook for persisting filter preferences
 * @param prefix - Prefix for localStorage keys
 * @returns Object with filter state and setters
 */
export function useFilterPreferences(prefix: string) {
  const [searchTerm, setSearchTerm] = useLocalStorage(`${prefix}-search`, '');
  const [statusFilter, setStatusFilter] = useLocalStorage(`${prefix}-status`, 'all');
  const [sortBy, setSortBy] = useLocalStorage(`${prefix}-sort`, 'date');
  const [viewMode, setViewMode] = useLocalStorage(`${prefix}-view`, 'grid');

  const resetFilters = useCallback(() => {
    setSearchTerm('');
    setStatusFilter('all');
    setSortBy('date');
    setViewMode('grid');
  }, [setSearchTerm, setStatusFilter, setSortBy, setViewMode]);

  return useMemo(() => ({
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    sortBy,
    setSortBy,
    viewMode,
    setViewMode,
    resetFilters
  }), [
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    sortBy,
    setSortBy,
    viewMode,
    setViewMode,
    resetFilters
  ]);
}