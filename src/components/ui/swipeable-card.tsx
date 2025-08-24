import { useState, useRef, useCallback, ReactNode, memo } from 'react';
import { cn } from '@/lib/utils';

interface SwipeableCardProps {
  children: ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  leftAction?: {
    label: string;
    icon?: ReactNode;
    className?: string;
  };
  rightAction?: {
    label: string;
    icon?: ReactNode;
    className?: string;
  };
  threshold?: number;
  className?: string;
}

export const SwipeableCard = memo(function SwipeableCard({
  children,
  onSwipeLeft,
  onSwipeRight,
  leftAction,
  rightAction,
  threshold = 100,
  className,
}: SwipeableCardProps) {
  const [offset, setOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    setIsDragging(true);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging) return;
    
    const currentX = e.touches[0].clientX;
    const diff = currentX - startX.current;
    
    // Only allow swiping if we have actions defined
    if ((diff > 0 && !rightAction) || (diff < 0 && !leftAction)) {
      return;
    }
    
    setOffset(diff);
  }, [isDragging, leftAction, rightAction]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
    
    if (Math.abs(offset) > threshold) {
      if (offset > 0 && onSwipeRight) {
        onSwipeRight();
      } else if (offset < 0 && onSwipeLeft) {
        onSwipeLeft();
      }
    }
    
    // Animate back to center
    setOffset(0);
  }, [offset, threshold, onSwipeLeft, onSwipeRight]);

  const showLeftAction = offset < -20 && leftAction;
  const showRightAction = offset > 20 && rightAction;

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* Background actions */}
      {showLeftAction && (
        <div className={cn(
          "absolute inset-y-0 right-0 flex items-center px-4",
          "bg-destructive text-destructive-foreground",
          leftAction.className
        )}>
          {leftAction.icon}
          <span className="ml-2 font-medium">{leftAction.label}</span>
        </div>
      )}
      
      {showRightAction && (
        <div className={cn(
          "absolute inset-y-0 left-0 flex items-center px-4",
          "bg-primary text-primary-foreground",
          rightAction.className
        )}>
          {rightAction.icon}
          <span className="ml-2 font-medium">{rightAction.label}</span>
        </div>
      )}
      
      {/* Swipeable content */}
      <div
        ref={cardRef}
        className={cn(
          "relative bg-background",
          "transition-transform duration-200 ease-out",
          isDragging && "transition-none"
        )}
        style={{
          transform: `translateX(${offset}px)`,
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>
    </div>
  );
});