import { forwardRef } from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface TouchButtonProps extends ButtonProps {
  touchSize?: 'default' | 'large';
}

export const TouchButton = forwardRef<HTMLButtonElement, TouchButtonProps>(
  ({ className, size = 'default', touchSize = 'default', ...props }, ref) => {
    return (
      <Button
        ref={ref}
        size={size}
        className={cn(
          // Ensure minimum 44px touch target on mobile
          "touch-manipulation",
          "md:min-h-9",
          touchSize === 'default' && "min-h-[44px] min-w-[44px]",
          touchSize === 'large' && "min-h-[48px] min-w-[48px]",
          className
        )}
        {...props}
      />
    );
  }
);

TouchButton.displayName = 'TouchButton';

// Mobile-optimized icon button with proper touch target
export const TouchIconButton = forwardRef<HTMLButtonElement, TouchButtonProps>(
  ({ className, ...props }, ref) => {
    return (
      <TouchButton
        ref={ref}
        size="icon"
        className={cn(
          "h-11 w-11", // 44px square for touch target
          "md:h-9 md:w-9", // Can be smaller on desktop
          className
        )}
        {...props}
      />
    );
  }
);

TouchIconButton.displayName = 'TouchIconButton';