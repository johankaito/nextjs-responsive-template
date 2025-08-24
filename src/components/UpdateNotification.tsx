'use client';

import { useVersionCheck } from '@/hooks/useVersionCheck';
import { Button } from '@/components/ui/button';
import { RefreshCw, X } from 'lucide-react';
import { useState } from 'react';

export function UpdateNotification() {
  const { updateAvailable, reload } = useVersionCheck();
  const [isDismissed, setIsDismissed] = useState(false);

  if (!updateAvailable || isDismissed) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-auto z-50 animate-in slide-in-from-bottom duration-300">
      <div className="bg-primary text-primary-foreground rounded-lg shadow-lg p-4 flex items-start md:items-center gap-3 md:gap-4 max-w-md">
        <div className="flex-shrink-0 p-2 bg-primary-foreground/10 rounded-full">
          <RefreshCw className="h-5 w-5" />
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm">New version available!</p>
          <p className="text-xs opacity-90 mt-0.5 break-words">
            We&apos;ve shipped new features and improvements. Reload to update.
          </p>
        </div>
        
        <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
          <Button
            size="sm"
            variant="secondary"
            onClick={reload}
            className="font-medium text-xs md:text-sm h-8 px-3 md:px-4"
          >
            <RefreshCw className="h-3 w-3 mr-1.5" />
            Reload
          </Button>
          
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setIsDismissed(true)}
            className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20"
            aria-label="Dismiss update notification"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
} 