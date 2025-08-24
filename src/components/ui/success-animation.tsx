import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface SuccessAnimationProps {
  show: boolean;
  message?: string;
  onComplete?: () => void;
  confetti?: boolean;
  className?: string;
}

export function SuccessAnimation({ 
  show, 
  message = "Success!", 
  onComplete,
  confetti = false,
  className 
}: SuccessAnimationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      if (confetti) {
        setShowConfetti(true);
      }
      
      const timer = setTimeout(() => {
        setIsVisible(false);
        setShowConfetti(false);
        onComplete?.();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [show, confetti, onComplete]);

  if (!isVisible) return null;

  return (
    <div className={cn(
      "fixed inset-0 z-50 flex items-center justify-center pointer-events-none",
      className
    )}>
      {showConfetti && (
        <div className="absolute inset-0">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-20px`,
                animationDelay: `${Math.random() * 0.5}s`,
                '--rotate': `${Math.random() * 360}deg`,
              } as React.CSSProperties}
            >
              <div className={cn(
                "w-2 h-2 rounded-sm",
                ["bg-primary", "bg-green-500", "bg-blue-500", "bg-yellow-500", "bg-purple-500"][Math.floor(Math.random() * 5)]
              )} />
            </div>
          ))}
        </div>
      )}
      
      <div className="bg-white dark:bg-gray-800 rounded-full p-8 shadow-2xl animate-success-scale">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
            <Check className="w-12 h-12 text-green-600 dark:text-green-400 animate-check-mark" />
          </div>
          {message && (
            <p className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap text-lg font-medium">
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
} 