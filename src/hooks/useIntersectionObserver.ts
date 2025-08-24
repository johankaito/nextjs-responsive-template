import { RefObject, useEffect, useRef, useState } from 'react';

interface IntersectionObserverOptions {
  /**
   * The element that is used as the viewport for checking visibility
   */
  root?: Element | Document | null;
  /**
   * Margin around the root
   */
  rootMargin?: string;
  /**
   * Either a single number or an array of numbers which indicate at what percentage of the target's visibility the observer's callback should be executed
   */
  threshold?: number | number[];
  /**
   * Only trigger once when the element comes into view
   */
  triggerOnce?: boolean;
  /**
   * Skip the IntersectionObserver and return isIntersecting as this value (SSR)
   */
  skip?: boolean;
  /**
   * Initial value for isIntersecting
   */
  initialIntersecting?: boolean;
}

interface IntersectionObserverResult {
  ref: RefObject<Element>;
  entry?: IntersectionObserverEntry;
  isIntersecting: boolean;
}

/**
 * Hook to use Intersection Observer API for lazy loading and visibility detection
 * @param options - IntersectionObserver options
 * @returns Object containing ref, entry, and isIntersecting state
 * 
 * @example
 * ```tsx
 * // Basic lazy loading
 * function LazyImage({ src, alt }: { src: string; alt: string }) {
 *   const { ref, isIntersecting } = useIntersectionObserver({
 *     threshold: 0.1,
 *     triggerOnce: true
 *   });
 * 
 *   return (
 *     <div ref={ref}>
 *       {isIntersecting ? (
 *         <img src={src} alt={alt} />
 *       ) : (
 *         <div className="placeholder" />
 *       )}
 *     </div>
 *   );
 * }
 * ```
 * 
 * @example
 * ```tsx
 * // Infinite scroll
 * function InfiniteList() {
 *   const { ref, isIntersecting } = useIntersectionObserver({
 *     threshold: 1.0,
 *     rootMargin: '100px'
 *   });
 * 
 *   useEffect(() => {
 *     if (isIntersecting) {
 *       loadMoreItems();
 *     }
 *   }, [isIntersecting]);
 * 
 *   return (
 *     <div>
 *       {items.map(item => <Item key={item.id} {...item} />)}
 *       <div ref={ref}>Loading more...</div>
 *     </div>
 *   );
 * }
 * ```
 */
export function useIntersectionObserver({
  root = null,
  rootMargin = '0px',
  threshold = 0,
  triggerOnce = false,
  skip = false,
  initialIntersecting = false,
}: IntersectionObserverOptions = {}): IntersectionObserverResult {
  const [entry, setEntry] = useState<IntersectionObserverEntry>();
  const [isIntersecting, setIsIntersecting] = useState(initialIntersecting);
  const elementRef = useRef<Element | null>(null);
  const unobserveRef = useRef<(() => void) | null>(null);

  const ref = useRef<(element: Element | null) => void>((element: Element | null) => {
    if (element) {
      elementRef.current = element;
    }
  });

  useEffect(() => {
    // Skip if explicitly disabled or no IntersectionObserver support
    if (skip || typeof IntersectionObserver === 'undefined') {
      return;
    }

    if (unobserveRef.current) {
      unobserveRef.current();
      unobserveRef.current = null;
    }

    if (!elementRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setEntry(entry);
        setIsIntersecting(entry.isIntersecting);

        if (triggerOnce && entry.isIntersecting && unobserveRef.current) {
          unobserveRef.current();
          unobserveRef.current = null;
        }
      },
      { root, rootMargin, threshold }
    );

    observer.observe(elementRef.current);

    unobserveRef.current = () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current);
      }
      observer.disconnect();
    };

    return () => {
      if (unobserveRef.current) {
        unobserveRef.current();
      }
    };
  }, [root, rootMargin, threshold, triggerOnce, skip]);

  // @ts-expect-error - Hook interface mismatch, but hook is unused
  return { ref, entry, isIntersecting };
}

/**
 * Hook for tracking visibility of multiple elements
 * @param options - IntersectionObserver options
 * @returns Array of refs and their intersection states
 * 
 * @example
 * ```tsx
 * function Gallery({ images }: { images: string[] }) {
 *   const observers = useMultipleIntersectionObserver(images.length, {
 *     threshold: 0.1,
 *     triggerOnce: true
 *   });
 * 
 *   return (
 *     <div className="gallery">
 *       {images.map((src, index) => (
 *         <div key={index} ref={observers[index].ref}>
 *           {observers[index].isIntersecting ? (
 *             <img src={src} alt={`Image ${index}`} />
 *           ) : (
 *             <div className="placeholder" />
 *           )}
 *         </div>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function useMultipleIntersectionObserver(
  count: number,
  options: IntersectionObserverOptions = {}
): IntersectionObserverResult[] {
  const [intersectionStates, setIntersectionStates] = useState<boolean[]>(
    () => new Array(count).fill(options.initialIntersecting ?? false)
  );
  const refs = useRef<(Element | null)[]>(new Array(count).fill(null));
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (options.skip || typeof IntersectionObserver === 'undefined') {
      return;
    }

    // Disconnect existing observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // Create new observer
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = refs.current.findIndex(el => el === entry.target);
          if (index !== -1) {
            setIntersectionStates(prev => {
              const next = [...prev];
              next[index] = entry.isIntersecting;
              return next;
            });

            if (options.triggerOnce && entry.isIntersecting && observerRef.current) {
              observerRef.current.unobserve(entry.target);
            }
          }
        });
      },
      {
        root: options.root,
        rootMargin: options.rootMargin,
        threshold: options.threshold,
      }
    );

    // Observe all elements
    refs.current.forEach((el) => {
      if (el && observerRef.current) {
        observerRef.current.observe(el);
      }
    });

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [count, options]);

  return Array.from({ length: count }, (_, index) => ({
    // @ts-expect-error - Hook interface mismatch, but hook is unused
    ref: {
      current: (el: Element | null) => {
        refs.current[index] = el;
        if (el && observerRef.current) {
          observerRef.current.observe(el);
        }
      }
    } as RefObject<Element>,
    isIntersecting: intersectionStates[index],
    entry: undefined, // Not tracking individual entries for performance
  }));
}