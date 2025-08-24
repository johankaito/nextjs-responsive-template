import { memo, Fragment } from 'react';
import { ChevronRight, Home } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
  separator?: React.ReactNode;
}

export const Breadcrumb = memo(function Breadcrumb({
  items,
  className,
  separator = <ChevronRight className="h-4 w-4" />,
}: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={cn("flex items-center space-x-1 text-sm", className)}>
      {/* Home icon as first item if not already present */}
      {items[0]?.label !== 'Home' && (
        <>
          <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
            <Home className="h-4 w-4" />
          </Link>
          <span className="text-muted-foreground">{separator}</span>
        </>
      )}
      
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        
        return (
          <Fragment key={index}>
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ) : (
              <span className={cn(
                "flex items-center gap-1",
                isLast ? "text-foreground font-medium" : "text-muted-foreground"
              )}>
                {item.icon}
                <span>{item.label}</span>
              </span>
            )}
            
            {!isLast && (
              <span className="text-muted-foreground">{separator}</span>
            )}
          </Fragment>
        );
      })}
    </nav>
  );
});

// Dashboard-specific breadcrumb with common patterns
interface DashboardBreadcrumbProps {
  currentTab: string;
  entityName?: string;
  entityType?: 'job' | 'user' | 'location' | 'organisation';
}

export const DashboardBreadcrumb = memo(function DashboardBreadcrumb({
  currentTab,
  entityName,
  entityType,
}: DashboardBreadcrumbProps) {
  const items: BreadcrumbItem[] = [
    { label: 'Dashboard', href: '/dashboard' },
  ];

  // Add current tab
  const tabLabels: Record<string, string> = {
    dashboard: 'Overview',
    analytics: 'Analytics',
    jobs: 'Jobs',
    users: 'Users',
    locations: 'Locations',
    organisations: 'Organisations',
    managers: 'Managers',
    contractors: 'Contractors',
    documents: 'Documents',
  };

  if (currentTab && tabLabels[currentTab]) {
    items.push({
      label: tabLabels[currentTab],
      href: entityName ? `/dashboard?tab=${currentTab}` : undefined,
    });
  }

  // Add entity detail if present
  if (entityName && entityType) {
    items.push({
      label: entityName,
    });
  }

  return <Breadcrumb items={items} />;
});