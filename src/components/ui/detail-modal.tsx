import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  onBack?: () => void;
  children: React.ReactNode;
  className?: string;
  showBackButton?: boolean;
  isLoading?: boolean;
}

export function DetailModal({
  open,
  onOpenChange,
  title,
  onBack,
  children,
  className,
  showBackButton = true,
  isLoading = false
}: DetailModalProps) {
  const handleBack = React.useCallback(() => {
    if (onBack) {
      onBack();
    } else {
      onOpenChange(false);
    }
  }, [onBack, onOpenChange]);

  // Handle escape key to close modal on mobile
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        handleBack();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, handleBack]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className={cn(
          // Base styles
          "fixed z-50 grid w-full gap-0 bg-background p-0 shadow-lg",
          // Mobile: Full screen
          "inset-0 h-full w-full rounded-none",
          // Tablet and up: Centered modal with rounded corners
          "sm:inset-auto sm:left-[50%] sm:top-[50%] sm:h-auto sm:max-h-[90vh] sm:w-[95vw] sm:max-w-[95vw] sm:translate-x-[-50%] sm:translate-y-[-50%] sm:rounded-lg",
          // Desktop: Larger max width
          "md:max-w-4xl",
          // Prevent body scroll on mobile when modal is open
          "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
          className
        )}
      >
        <div className="flex h-full flex-col overflow-hidden">
          {/* Header with safe area padding on mobile */}
          <DialogHeader className="flex-shrink-0 border-b bg-background px-4 pb-3 pt-safe sm:px-6 sm:pb-4 sm:pt-6">
            <div className="flex items-center gap-2">
              {showBackButton && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBack}
                  className="mr-1 min-w-0 px-2 sm:mr-2"
                  aria-label="Go back"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span className="ml-1 hidden sm:inline">Back</span>
                </Button>
              )}
              {title && (
                <DialogTitle className="flex-1 truncate text-base sm:text-lg md:text-xl">
                  {title}
                </DialogTitle>
              )}
            </div>
          </DialogHeader>
          
          {/* Content with safe area padding on mobile */}
          <div className="flex-1 overflow-y-auto overscroll-contain px-4 pb-4 sm:px-6 sm:pb-8">
            <div className="mt-4 sm:mt-6 pb-safe">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                </div>
              ) : (
                children
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 