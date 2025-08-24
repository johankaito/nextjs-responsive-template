import { RefObject, useEffect, useRef } from 'react';

/**
 * Hook to detect clicks outside of a specified element
 * @param handler - Function to call when click outside is detected
 * @param mouseEvent - Mouse event to listen for (default: 'mousedown')
 * @param touchEvent - Touch event to listen for (default: 'touchstart')
 * @returns RefObject to attach to the element
 * 
 * @example
 * ```tsx
 * function Dropdown() {
 *   const [isOpen, setIsOpen] = useState(false);
 *   const dropdownRef = useOnClickOutside(() => {
 *     setIsOpen(false);
 *   });
 * 
 *   return (
 *     <div ref={dropdownRef}>
 *       <button onClick={() => setIsOpen(!isOpen)}>Toggle</button>
 *       {isOpen && (
 *         <div className="dropdown-menu">
 *           <a href="#">Option 1</a>
 *           <a href="#">Option 2</a>
 *         </div>
 *       )}
 *     </div>
 *   );
 * }
 * ```
 */
export function useOnClickOutside<T extends HTMLElement = HTMLElement>(
  handler: (event: MouseEvent | TouchEvent) => void,
  mouseEvent: 'mousedown' | 'mouseup' | 'click' = 'mousedown',
  touchEvent: 'touchstart' | 'touchend' = 'touchstart'
): RefObject<T | null> {
  const ref = useRef<T>(null);

  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      const el = ref.current;
      
      // Do nothing if clicking ref's element or descendent elements
      if (!el || el.contains(event.target as Node)) {
        return;
      }

      handler(event);
    };

    document.addEventListener(mouseEvent, listener);
    document.addEventListener(touchEvent, listener, { passive: true });

    return () => {
      document.removeEventListener(mouseEvent, listener);
      document.removeEventListener(touchEvent, listener);
    };
  }, [handler, mouseEvent, touchEvent]);

  return ref;
}

/**
 * Hook to detect clicks outside of multiple elements
 * @param refs - Array of refs to elements
 * @param handler - Function to call when click outside all elements is detected
 * 
 * @example
 * ```tsx
 * function Modal() {
 *   const modalRef = useRef<HTMLDivElement>(null);
 *   const tooltipRef = useRef<HTMLDivElement>(null);
 *   
 *   useOnClickOutsideMultiple([modalRef, tooltipRef], () => {
 *     closeModal();
 *   });
 * 
 *   return (
 *     <>
 *       <div ref={modalRef} className="modal">
 *         Modal content
 *       </div>
 *       <div ref={tooltipRef} className="tooltip">
 *         Tooltip content
 *       </div>
 *     </>
 *   );
 * }
 * ```
 */
export function useOnClickOutsideMultiple(
  refs: RefObject<HTMLElement>[],
  handler: (event: MouseEvent | TouchEvent) => void
): void {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      // Check if click is inside any of the refs
      const isInsideAnyRef = refs.some(ref => {
        const el = ref.current;
        return el && el.contains(event.target as Node);
      });

      if (!isInsideAnyRef) {
        handler(event);
      }
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener, { passive: true });

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [refs, handler]);
}

/**
 * Hook to conditionally detect clicks outside
 * @param handler - Function to call when click outside is detected
 * @param enabled - Whether the click outside detection is enabled
 * @returns RefObject to attach to the element
 * 
 * @example
 * ```tsx
 * function ConditionalDropdown() {
 *   const [isOpen, setIsOpen] = useState(false);
 *   const [isLocked, setIsLocked] = useState(false);
 *   
 *   const dropdownRef = useConditionalOnClickOutside(
 *     () => setIsOpen(false),
 *     isOpen && !isLocked
 *   );
 * 
 *   return (
 *     <div ref={dropdownRef}>
 *       <button onClick={() => setIsOpen(!isOpen)}>Toggle</button>
 *       <button onClick={() => setIsLocked(!isLocked)}>
 *         {isLocked ? 'Unlock' : 'Lock'}
 *       </button>
 *       {isOpen && <div>Dropdown content</div>}
 *     </div>
 *   );
 * }
 * ```
 */
export function useConditionalOnClickOutside<T extends HTMLElement = HTMLElement>(
  handler: (event: MouseEvent | TouchEvent) => void,
  enabled: boolean = true
): RefObject<T | null> {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (!enabled) return;

    const listener = (event: MouseEvent | TouchEvent) => {
      const el = ref.current;
      
      if (!el || el.contains(event.target as Node)) {
        return;
      }

      handler(event);
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener, { passive: true });

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [handler, enabled]);

  return ref;
}