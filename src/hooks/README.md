# React Hooks Documentation

This directory contains all custom React hooks used in the Tofil application. Our hooks follow consistent patterns for data fetching, state management, and side effects.

## Table of Contents

- [Core Hooks](#core-hooks)
- [Data Fetching Hooks](#data-fetching-hooks)
- [State Management Hooks](#state-management-hooks)
- [Utility Hooks](#utility-hooks)
- [Best Practices](#best-practices)
- [Common Patterns](#common-patterns)

## Core Hooks

### `useAuth`
Comprehensive authentication hook that manages user authentication state and provides auth methods.

```typescript
const {
  user,               // Current authenticated user
  isLoading,          // Loading state
  error,              // Auth error
  signInWithPassword, // Sign in with email/password
  signInWithOtp,      // Sign in with OTP
  verifyOtp,          // Verify OTP token
  signOut,            // Sign out user
  resetPassword,      // Request password reset
  updatePassword,     // Update password
  refreshSession,     // Refresh auth session
  getSession,         // Get current session
  clearError,         // Clear auth error
} = useAuth();
```

### `useUser`
Access current user context and profile information.

```typescript
const {
  user,         // User object with profile data
  tofilUser,    // Extended user data with role info
  loading,      // Loading state
  setUser,      // Update user (rarely needed)
} = useUser();
```

### `useSupabase`
Direct access to Supabase client and query/mutation helpers.

```typescript
const {
  client,  // Supabase client instance
  query,   // Query helper with error handling
  mutate,  // Mutation helper with error handling
} = useSupabase();
```

## Data Fetching Hooks

All data hooks are built using our CRUD factory pattern for consistency.

### CRUD Factory Pattern

```typescript
// Basic CRUD hook
const {
  data,              // Fetched data array
  isLoading,         // Initial loading state
  isFetching,        // Refetching state
  hasData,           // Boolean indicating if data exists
  error,             // Error object
  createItem,        // Create mutation (void)
  createItemAsync,   // Create mutation (Promise)
  updateItem,        // Update mutation (void)
  updateItemAsync,   // Update mutation (Promise)
  deleteItem,        // Delete mutation (void)
  deleteItemAsync,   // Delete mutation (Promise)
  refetch,           // Manual refetch function
} = useDataHook();
```

### Available Data Hooks

- `useJobs` - Manage job listings
- `useUsers` - Manage user accounts
- `useLocations` - Manage location data
- `useOrganisations` - Manage organisations
- `useFiles` - Manage file uploads
- `useNotifications` - Manage notifications
- `useContractorDocuments` - Manage contractor documents

### Smart Loading Pattern

Smart CRUD hooks prevent loading flicker on refetch:

```typescript
const {
  ...crudHookProps,
  shouldShowLoading,    // Smart loading indicator
  isInitialLoad,        // First load
  isBackgroundRefetch,  // Background update
} = useSmartDataHook();
```

## State Management Hooks

### `useLocalStorage`
Persist state to localStorage with SSR safety.

```typescript
const [value, setValue, removeValue] = useLocalStorage(
  'key',           // Storage key
  defaultValue,    // Default value
  {
    serialize,     // Custom serializer
    deserialize,   // Custom deserializer
  }
);
```

### `useDebounce`
Debounce rapidly changing values.

```typescript
const debouncedValue = useDebounce(value, 500); // 500ms delay
```

### `useFilterPreferences`
Persist filter and UI preferences.

```typescript
const {
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  sortBy,
  setSortBy,
  viewMode,
  setViewMode,
  resetFilters,
} = useFilterPreferences('prefix');
```

## Utility Hooks

### `useMediaQuery`
Responsive design with media queries.

```typescript
const isMobile = useMediaQuery('(max-width: 768px)');
const isDesktop = useMediaQuery(mediaQueries.desktop);
```

### `usePrevious`
Track previous values across renders.

```typescript
const prevValue = usePrevious(currentValue);
const prevWithDefault = usePreviousWithInitial(currentValue, defaultValue);
const history = usePreviousHistory(currentValue, maxItems);
```

### `useOnClickOutside`
Detect clicks outside elements.

```typescript
const ref = useOnClickOutside(() => {
  closeModal();
});

// Multiple refs
useOnClickOutsideMultiple([ref1, ref2], handleClickOutside);

// Conditional
const ref = useConditionalOnClickOutside(handler, isEnabled);
```

### `useIntersectionObserver`
Lazy loading and visibility detection.

```typescript
const { ref, isIntersecting, entry } = useIntersectionObserver({
  threshold: 0.1,
  triggerOnce: true,
  rootMargin: '100px',
});
```

### `useWindowSize`
Track window dimensions with debouncing.

```typescript
const { width, height } = useWindowSize(150); // 150ms debounce
```

### `useScrollPosition`
Track scroll position with throttling.

```typescript
const { x, y } = useScrollPosition(100); // 100ms throttle
```

### `useScrollDirection`
Detect scroll direction.

```typescript
const direction = useScrollDirection(5); // 5px threshold
// Returns: 'up' | 'down' | 'idle'
```

## Best Practices

### 1. Error Handling

Always use the `useErrorHandler` for consistent error handling:

```typescript
const { handle, createHandlers } = useErrorHandler();

// Wrap async operations
const handlers = createHandlers(async () => {
  const result = await someAsyncOperation();
  return result;
});

// Execute with error handling
await handlers.execute(); // Throws on error
await handlers.executeQuietly(); // Handles error silently
```

### 2. Performance Optimization

- **Use memoization**: Wrap expensive computations with `useMemo`
- **Optimize callbacks**: Use `useCallback` for event handlers
- **Smart loading**: Use smart hooks to prevent loading flicker
- **Lazy load**: Import rarely used hooks dynamically

```typescript
// Lazy loading utility hooks
import { lazyHooks } from '@/hooks';

const useMediaQuery = await lazyHooks.useMediaQuery();
```

### 3. Type Safety

Always provide proper TypeScript types:

```typescript
// Good
const useTypedHook = <T extends BaseType>(
  options: HookOptions<T>
): HookResult<T> => {
  // Implementation
};

// Bad
const useUntypedHook = (options: any): any => {
  // Implementation
};
```

### 4. Consistent Naming

- Prefix with `use` (e.g., `useAuth`, `useUser`)
- Be descriptive (e.g., `useScrollPosition` not `useScroll`)
- Group related hooks (e.g., `usePrevious`, `usePreviousWithInitial`)

## Common Patterns

### Data Fetching with Filters

```typescript
const { data, isLoading } = useJobs({
  status: 'AVAILABLE',
  locationId: userLocation,
  search: searchTerm,
});
```

### Optimistic Updates

```typescript
const { updateItemAsync } = useJobs();

// Optimistic update
try {
  setLocalState(newValue); // Update UI immediately
  await updateItemAsync({ id, ...updates });
} catch (error) {
  setLocalState(oldValue); // Revert on error
  handle(error);
}
```

### Conditional Fetching

```typescript
const { data } = useUser(userId || undefined);
// Only fetches when userId is defined
```

### Pagination

```typescript
const { data } = useJobs({
  limit: 10,
  offset: page * 10,
  orderBy: { column: 'createdAt', ascending: false },
});
```

## Common Pitfalls

### 1. Missing Dependencies

Always include all dependencies in effect arrays:

```typescript
// Bad
useEffect(() => {
  fetchData(userId);
}, []); // Missing userId

// Good
useEffect(() => {
  fetchData(userId);
}, [userId]);
```

### 2. Stale Closures

Use refs for values that shouldn't trigger re-renders:

```typescript
// Bad
const [count, setCount] = useState(0);
const interval = setInterval(() => {
  console.log(count); // Always logs 0
}, 1000);

// Good
const countRef = useRef(0);
const interval = setInterval(() => {
  console.log(countRef.current);
}, 1000);
```

### 3. Memory Leaks

Always cleanup side effects:

```typescript
useEffect(() => {
  const subscription = subscribe();
  
  return () => {
    subscription.unsubscribe(); // Cleanup
  };
}, []);
```

### 4. Unnecessary Re-renders

Use memoization to prevent re-renders:

```typescript
// Bad
const options = { threshold: 0.1 }; // New object every render

// Good
const options = useMemo(() => ({ threshold: 0.1 }), []);
```

## Testing Hooks

Use `@testing-library/react-hooks` for testing:

```typescript
import { renderHook, act } from '@testing-library/react';

it('should update state', () => {
  const { result } = renderHook(() => useCounter());
  
  act(() => {
    result.current.increment();
  });
  
  expect(result.current.count).toBe(1);
});
```

## Contributing

When adding new hooks:

1. Follow the established patterns
2. Add comprehensive JSDoc comments
3. Include usage examples
4. Write unit tests
5. Update this documentation
6. Consider performance implications