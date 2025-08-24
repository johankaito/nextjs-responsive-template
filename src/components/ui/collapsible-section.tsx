import { useState, memo, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CollapsibleSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
  icon?: ReactNode;
  badge?: ReactNode;
}

export const CollapsibleSection = memo(function CollapsibleSection({
  title,
  description,
  children,
  defaultOpen = false,
  className,
  icon,
  badge,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Card className={cn("transition-all duration-200", className)}>
      <CardHeader className="cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(!isOpen);
              }}
            >
              {isOpen ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
            {icon && <div className="text-muted-foreground">{icon}</div>}
            <div>
              <CardTitle className="text-base font-medium">{title}</CardTitle>
              {description && (
                <p className="text-sm text-muted-foreground mt-1">{description}</p>
              )}
            </div>
          </div>
          {badge && <div>{badge}</div>}
        </div>
      </CardHeader>
      {isOpen && (
        <CardContent className="animate-in slide-in-from-top-2 duration-200">
          {children}
        </CardContent>
      )}
    </Card>
  );
});

// Dashboard-specific collapsible section with metrics
interface MetricsSectionProps extends CollapsibleSectionProps {
  metrics?: {
    label: string;
    value: string | number;
    trend?: {
      value: number;
      isPositive: boolean;
    };
  }[];
}

export const MetricsSection = memo(function MetricsSection({
  metrics = [],
  children,
  ...props
}: MetricsSectionProps) {
  return (
    <CollapsibleSection {...props}>
      {metrics.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {metrics.map((metric, index) => (
            <div key={index} className="text-center">
              <p className="text-2xl font-bold">{metric.value}</p>
              <p className="text-sm text-muted-foreground">{metric.label}</p>
              {metric.trend && (
                <p className={cn(
                  "text-xs mt-1",
                  metric.trend.isPositive ? "text-green-600" : "text-red-600"
                )}>
                  {metric.trend.isPositive ? "+" : ""}{metric.trend.value}%
                </p>
              )}
            </div>
          ))}
        </div>
      )}
      {children}
    </CollapsibleSection>
  );
});