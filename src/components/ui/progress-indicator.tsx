import React from 'react';
import { cn } from '@/lib/utils';
import { Check, Clock } from 'lucide-react';

interface ProgressIndicatorProps {
  current: number;
  total: number;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  showPercentage?: boolean;
  variant?: 'linear' | 'circular' | 'steps';
  className?: string;
}

export function ProgressIndicator({
  current,
  total,
  label,
  size = 'md',
  showPercentage = true,
  variant = 'linear',
  className
}: ProgressIndicatorProps) {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;
  
  const sizeClasses = {
    sm: { bar: 'h-2', circle: 'w-12 h-12', text: 'text-xs' },
    md: { bar: 'h-3', circle: 'w-16 h-16', text: 'text-sm' },
    lg: { bar: 'h-4', circle: 'w-20 h-20', text: 'text-base' }
  };

  if (variant === 'circular') {
    const circumference = 2 * Math.PI * 20;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div className={cn("relative inline-flex items-center justify-center", className)}>
        <svg className={sizeClasses[size].circle}>
          <circle
            cx="50%"
            cy="50%"
            r="20"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
            className="text-muted"
          />
          <circle
            cx="50%"
            cy="50%"
            r="20"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="text-primary transition-all duration-500 ease-out"
            style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          {showPercentage && (
            <span className={cn("font-semibold", sizeClasses[size].text)}>
              {percentage}%
            </span>
          )}
          {label && (
            <span className={cn("text-muted-foreground", sizeClasses[size].text)}>
              {label}
            </span>
          )}
        </div>
      </div>
    );
  }

  if (variant === 'steps') {
    return (
      <div className={cn("space-y-2", className)}>
        {label && (
          <div className="flex justify-between items-center mb-1">
            <span className={cn("text-muted-foreground", sizeClasses[size].text)}>
              {label}
            </span>
            <span className={cn("font-medium", sizeClasses[size].text)}>
              {current} / {total}
            </span>
          </div>
        )}
        <div className="flex gap-1">
          {[...Array(total)].map((_, i) => (
            <div
              key={i}
              className={cn(
                "flex-1 rounded-full transition-all duration-300",
                sizeClasses[size].bar,
                i < current 
                  ? "bg-primary" 
                  : "bg-muted"
              )}
            >
              {i < current && size !== 'sm' && (
                <div className="h-full flex items-center justify-center">
                  <Check className="w-3 h-3 text-primary-foreground" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Default linear variant
  return (
    <div className={cn("space-y-2", className)}>
      {(label || showPercentage) && (
        <div className="flex justify-between items-center">
          {label && (
            <span className={cn("text-muted-foreground", sizeClasses[size].text)}>
              {label}
            </span>
          )}
          {showPercentage && (
            <span className={cn("font-medium", sizeClasses[size].text)}>
              {percentage}%
            </span>
          )}
        </div>
      )}
      <div className={cn(
        "w-full bg-muted rounded-full overflow-hidden",
        sizeClasses[size].bar
      )}>
        <div
          className="h-full bg-primary transition-all duration-500 ease-out flex items-center justify-end pr-2"
          style={{ width: `${percentage}%` }}
        >
          {percentage === 100 && size !== 'sm' && (
            <Check className="w-3 h-3 text-primary-foreground" />
          )}
        </div>
      </div>
    </div>
  );
}

// Additional component for showing time-based progress
export function TimeProgressIndicator({
  startTime,
  estimatedDuration,
  label = "Time remaining",
  className
}: {
  startTime: Date;
  estimatedDuration: number; // in minutes
  label?: string;
  className?: string;
}) {
  const [elapsed, setElapsed] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const elapsedMinutes = Math.floor((now.getTime() - startTime.getTime()) / 60000);
      setElapsed(elapsedMinutes);
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  const percentage = Math.min((elapsed / estimatedDuration) * 100, 100);
  const remaining = Math.max(estimatedDuration - elapsed, 0);

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex justify-between items-center">
        <span className="text-sm text-muted-foreground flex items-center gap-1">
          <Clock className="w-4 h-4" />
          {label}
        </span>
        <span className="text-sm font-medium">
          {remaining > 0 ? `${remaining} min` : 'Complete'}
        </span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-1000 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
} 