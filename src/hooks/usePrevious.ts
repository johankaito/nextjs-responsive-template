import { useRef, useEffect } from 'react';

/**
 * Hook to track the previous value of a variable
 * @param value - The value to track
 * @returns The previous value (undefined on first render)
 * 
 * @example
 * ```tsx
 * function Counter() {
 *   const [count, setCount] = useState(0);
 *   const prevCount = usePrevious(count);
 * 
 *   return (
 *     <div>
 *       <p>Current: {count}</p>
 *       <p>Previous: {prevCount ?? 'N/A'}</p>
 *       <button onClick={() => setCount(count + 1)}>Increment</button>
 *     </div>
 *   );
 * }
 * ```
 * 
 * @example
 * ```tsx
 * // Tracking object changes
 * const prevUser = usePrevious(user);
 * 
 * useEffect(() => {
 *   if (prevUser && user.role !== prevUser.role) {
 *     console.log('User role changed from', prevUser.role, 'to', user.role);
 *   }
 * }, [user, prevUser]);
 * ```
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined);
  
  useEffect(() => {
    ref.current = value;
  }, [value]);
  
  return ref.current;
}

/**
 * Hook to track previous value with initial value support
 * @param value - The value to track
 * @param initialValue - Initial value to return on first render
 * @returns The previous value (initialValue on first render)
 * 
 * @example
 * ```tsx
 * const prevStatus = usePreviousWithInitial(job.status, 'draft');
 * 
 * if (prevStatus !== job.status) {
 *   logStatusChange(prevStatus, job.status);
 * }
 * ```
 */
export function usePreviousWithInitial<T>(value: T, initialValue: T): T {
  const ref = useRef<T>(initialValue);
  
  useEffect(() => {
    ref.current = value;
  }, [value]);
  
  return ref.current;
}

/**
 * Hook to track multiple previous values in history
 * @param value - The value to track
 * @param maxHistory - Maximum number of previous values to keep (default: 5)
 * @returns Array of previous values (newest first)
 * 
 * @example
 * ```tsx
 * const [searchTerm, setSearchTerm] = useState('');
 * const searchHistory = usePreviousHistory(searchTerm, 10);
 * 
 * return (
 *   <div>
 *     <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
 *     <div>Recent searches:</div>
 *     <ul>
 *       {searchHistory.map((term, i) => (
 *         <li key={i}>{term}</li>
 *       ))}
 *     </ul>
 *   </div>
 * );
 * ```
 */
export function usePreviousHistory<T>(value: T, maxHistory: number = 5): T[] {
  const historyRef = useRef<T[]>([]);
  const previousValueRef = useRef<T | undefined>(undefined);
  
  // Update history synchronously during render
  if (previousValueRef.current !== undefined && previousValueRef.current !== value) {
    historyRef.current = [previousValueRef.current, ...historyRef.current].slice(0, maxHistory);
  }
  previousValueRef.current = value;
  
  return historyRef.current;
}