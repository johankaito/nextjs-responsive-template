import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createCrudHook, createSingleItemHook } from '../useCrudFactory';
import React from 'react';

// Mock the dependencies
vi.mock('@/components/SupabaseContext', () => ({
  useSupabase: vi.fn(() => ({
    query: vi.fn(),
    mutate: vi.fn(),
  })),
}));

vi.mock('humps', () => ({
  camelizeKeys: vi.fn((obj) => obj),
  decamelizeKeys: vi.fn((obj) => obj),
}));

// Test types
interface TestEntity {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
}

type NewTestEntity = Omit<TestEntity, 'id' | 'createdAt'>;

describe('useCrudFactory', () => {
  let queryClient: QueryClient;
  let wrapper: React.FC<{ children: React.ReactNode }>;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    
    wrapper = ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    
    vi.clearAllMocks();
  });

  describe('createCrudHook', () => {
    it('should create a hook with CRUD operations', () => {
      const useTestEntity = createCrudHook<TestEntity, NewTestEntity>({
        tableName: 'test_entities',
        queryKey: 'test-entities',
      });

      const { result } = renderHook(() => useTestEntity(), { wrapper });

      expect(result.current).toHaveProperty('data');
      expect(result.current).toHaveProperty('isLoading');
      expect(result.current).toHaveProperty('error');
      expect(result.current).toHaveProperty('createItem');
      expect(result.current).toHaveProperty('updateItem');
      expect(result.current).toHaveProperty('deleteItem');
      expect(result.current).toHaveProperty('refetch');
    });

    it('should fetch data with filters', async () => {
      const mockData = [
        { id: '1', name: 'Test 1', createdAt: new Date() },
        { id: '2', name: 'Test 2', createdAt: new Date() },
      ];

      const mockQuery = vi.fn().mockResolvedValue({ data: mockData, error: null });
      const { useSupabase } = await import('@/components/SupabaseContext');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (useSupabase as any).mockReturnValue({
        query: mockQuery,
        mutate: vi.fn(),
      });

      const useTestEntity = createCrudHook<TestEntity, NewTestEntity>({
        tableName: 'test_entities',
        queryKey: 'test-entities',
      });

      const { result } = renderHook(
        () => useTestEntity({ filters: { name: 'Test 1' } }),
        { wrapper }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual(mockData);
      expect(mockQuery).toHaveBeenCalledTimes(1);
    });

    it('should create new items', async () => {
      const newItem: NewTestEntity = { name: 'New Test', description: 'Description' };
      const createdItem = { id: '3', ...newItem, createdAt: new Date() };

      const mockMutate = vi.fn().mockResolvedValue({ data: [createdItem], error: null });
      const { useSupabase } = await import('@/components/SupabaseContext');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (useSupabase as any).mockReturnValue({
        query: vi.fn().mockResolvedValue({ data: [], error: null }),
        mutate: mockMutate,
      });

      const useTestEntity = createCrudHook<TestEntity, NewTestEntity>({
        tableName: 'test_entities',
        queryKey: 'test-entities',
      });

      const { result } = renderHook(() => useTestEntity(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const created = await result.current.createItemAsync(newItem);
      expect(created).toEqual([createdItem]);
      expect(mockMutate).toHaveBeenCalledTimes(1);
    });

    it('should update existing items', async () => {
      const updates = { id: '1', name: 'Updated Test' };
      const updatedItem = { id: '1', name: 'Updated Test', createdAt: new Date() };

      const mockMutate = vi.fn().mockResolvedValue({ data: [updatedItem], error: null });
      const { useSupabase } = await import('@/components/SupabaseContext');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (useSupabase as any).mockReturnValue({
        query: vi.fn().mockResolvedValue({ data: [], error: null }),
        mutate: mockMutate,
      });

      const useTestEntity = createCrudHook<TestEntity, NewTestEntity>({
        tableName: 'test_entities',
        queryKey: 'test-entities',
      });

      const { result } = renderHook(() => useTestEntity(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const updated = await result.current.updateItemAsync(updates);
      expect(updated).toEqual([updatedItem]);
      expect(mockMutate).toHaveBeenCalledTimes(1);
    });

    it('should delete items', async () => {
      const deletedItem = { id: '1', name: 'Deleted Test', createdAt: new Date() };

      const mockMutate = vi.fn().mockResolvedValue({ data: [deletedItem], error: null });
      const { useSupabase } = await import('@/components/SupabaseContext');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (useSupabase as any).mockReturnValue({
        query: vi.fn().mockResolvedValue({ data: [], error: null }),
        mutate: mockMutate,
      });

      const useTestEntity = createCrudHook<TestEntity, NewTestEntity>({
        tableName: 'test_entities',
        queryKey: 'test-entities',
      });

      const { result } = renderHook(() => useTestEntity(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const deleted = await result.current.deleteItemAsync('1');
      expect(deleted).toEqual([deletedItem]);
      expect(mockMutate).toHaveBeenCalledTimes(1);
    });

    it('should handle errors gracefully', async () => {
      const mockError = new Error('Database error');
      const mockQuery = vi.fn().mockRejectedValue(mockError);
      const { useSupabase } = await import('@/components/SupabaseContext');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (useSupabase as any).mockReturnValue({
        query: mockQuery,
        mutate: vi.fn(),
      });

      const useTestEntity = createCrudHook<TestEntity, NewTestEntity>({
        tableName: 'test_entities',
        queryKey: 'test-entities',
      });

      const { result } = renderHook(() => useTestEntity(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBeDefined();
    });

    it('should apply pagination options', async () => {
      const mockQuery = vi.fn((fn) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const queryBuilder: any = {
          from: vi.fn().mockReturnThis(),
          select: vi.fn().mockReturnThis(),
          limit: vi.fn().mockReturnThis(),
          range: vi.fn().mockResolvedValue({ data: [], error: null }),
        };
        
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const supabase = { from: () => queryBuilder } as any;
        return fn(supabase);
      });

      const { useSupabase } = await import('@/components/SupabaseContext');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (useSupabase as any).mockReturnValue({
        query: mockQuery,
        mutate: vi.fn(),
      });

      const useTestEntity = createCrudHook<TestEntity, NewTestEntity>({
        tableName: 'test_entities',
        queryKey: 'test-entities',
      });

      const { result } = renderHook(
        () => useTestEntity({ limit: 10, offset: 20 }),
        { wrapper }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockQuery).toHaveBeenCalled();
    });
  });

  describe('createSingleItemHook', () => {
    it('should create a hook for fetching single items', () => {
      const useTestEntity = createSingleItemHook<TestEntity>({
        tableName: 'test_entities',
        queryKey: 'test-entity',
      });

      const { result } = renderHook(() => useTestEntity('1'), { wrapper });

      expect(result.current).toHaveProperty('data');
      expect(result.current).toHaveProperty('isLoading');
      expect(result.current).toHaveProperty('error');
    });

    it('should fetch a single item by ID', async () => {
      const mockItem = { id: '1', name: 'Test Item', createdAt: new Date() };
      const mockQuery = vi.fn().mockResolvedValue({ data: mockItem, error: null });
      const { useSupabase } = await import('@/components/SupabaseContext');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (useSupabase as any).mockReturnValue({
        query: mockQuery,
      });

      const useTestEntity = createSingleItemHook<TestEntity>({
        tableName: 'test_entities',
        queryKey: 'test-entity',
      });

      const { result } = renderHook(() => useTestEntity('1'), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual(mockItem);
    });

    it('should not fetch when ID is not provided', async () => {
      const mockQuery = vi.fn();
      const { useSupabase } = await import('@/components/SupabaseContext');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (useSupabase as any).mockReturnValue({
        query: mockQuery,
      });

      const useTestEntity = createSingleItemHook<TestEntity>({
        tableName: 'test_entities',
        queryKey: 'test-entity',
      });

      renderHook(() => useTestEntity(''), { wrapper });

      expect(mockQuery).not.toHaveBeenCalled();
    });
  });
});