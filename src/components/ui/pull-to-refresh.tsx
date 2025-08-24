import { useState, useRef, useCallback, ReactNode, memo } from 'react';
import { Loader2, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PullToRefreshProps {
  children: ReactNode;
  onRefresh: () => Promise<void>;
  threshold?: number;
  className?: string;
  disabled?: boolean;
}

export const PullToRefresh = memo(function PullToRefresh({
  children,
  onRefresh,
  threshold = 80,
  className,
  disabled = false,
}: PullToRefreshProps) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const startY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (disabled || isRefreshing) return;
    
    const touch = e.touches[0];
    startY.current = touch.clientY;
    
    // Only start pulling if we're at the top of the container
    if (containerRef.current && containerRef.current.scrollTop === 0) {
      setIsPulling(true);
    }
  }, [disabled, isRefreshing]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isPulling || disabled || isRefreshing) return;
    
    const touch = e.touches[0];
    const currentY = touch.clientY;
    const diff = currentY - startY.current;
    
    // Only pull down, not up
    if (diff > 0) {
      // Add resistance to pull
      const resistance = 2.5;
      const adjustedDiff = Math.min(diff / resistance, 150);
      setPullDistance(adjustedDiff);
      
      // Prevent default scroll when pulling
      if (adjustedDiff > 10) {
        e.preventDefault();
      }
    }
  }, [isPulling, disabled, isRefreshing]);

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling || disabled || isRefreshing) return;
    
    setIsPulling(false);
    
    if (pullDistance > threshold) {
      setIsRefreshing(true);
      setPullDistance(threshold); // Keep indicator visible
      
      try {
        await onRefresh();
      } catch (error) {
        console.error('Refresh error:', error);
      } finally {
        setIsRefreshing(false);
        setPullDistance(0);
      }
    } else {
      setPullDistance(0);
    }
  }, [isPulling, disabled, isRefreshing, pullDistance, threshold, onRefresh]);

  const showIndicator = pullDistance > 20 || isRefreshing;
  const readyToRefresh = pullDistance > threshold;

  return (
    <div
      ref={containerRef}
      className={cn("relative overflow-auto", className)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull indicator */}
      {showIndicator && (
        <div
          className={cn(
            "absolute top-0 left-0 right-0 flex items-center justify-center",
            "transition-all duration-200 ease-out",
            "bg-background z-10"
          )}
          style={{
            height: `${pullDistance}px`,
            opacity: Math.min(pullDistance / threshold, 1),
          }}
        >
          <div className={cn(
            "flex items-center gap-2 text-muted-foreground",
            readyToRefresh && "text-primary"
          )}>
            {isRefreshing ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="text-sm font-medium">Refreshing...</span>
              </>
            ) : (
              <>
                <RefreshCw className={cn(
                  "h-5 w-5 transition-transform",
                  readyToRefresh && "rotate-180"
                )} />
                <span className="text-sm font-medium">
                  {readyToRefresh ? "Release to refresh" : "Pull to refresh"}
                </span>
              </>
            )}
          </div>
        </div>
      )}
      
      {/* Content with transform */}
      <div
        className={cn(
          "transition-transform duration-200 ease-out",
          isPulling && "transition-none"
        )}
        style={{
          transform: `translateY(${pullDistance}px)`,
        }}
      >
        {children}
      </div>
    </div>
  );
});