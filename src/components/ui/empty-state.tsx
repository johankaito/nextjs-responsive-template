import { memo, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  FileSearch, 
  // FolderOpen, 
  // Users, 
  // MapPin, 
  Briefcase,
  // FileText,
  Search,
  Plus,
  RefreshCw
} from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: ReactNode;
  variant?: 'default' | 'search' | 'error';
  action?: {
    label: string;
    onClick: () => void;
    icon?: ReactNode;
  };
  className?: string;
}

// Icon mapping for common empty states
// const iconMap = {
//   jobs: Briefcase,
//   users: Users,
//   locations: MapPin,
//   files: FileText,
//   search: Search,
//   folder: FolderOpen,
//   error: FileSearch,
// } as const;

export const EmptyState = memo(function EmptyState({
  title,
  description,
  icon,
  variant = 'default',
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center py-12 px-4 text-center",
      className
    )}>
      {/* Icon */}
      <div className={cn(
        "mb-4 rounded-full p-3",
        variant === 'error' ? "bg-destructive/10" : "bg-muted"
      )}>
        {icon || (
          <FileSearch className={cn(
            "h-10 w-10",
            variant === 'error' ? "text-destructive" : "text-muted-foreground"
          )} />
        )}
      </div>

      {/* Text content */}
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm max-w-sm mb-6">
        {description}
      </p>

      {/* Action button */}
      {action && (
        <Button
          onClick={action.onClick}
          variant={variant === 'error' ? 'destructive' : 'default'}
          className="gap-2"
        >
          {action.icon}
          {action.label}
        </Button>
      )}
    </div>
  );
});

// Pre-configured empty states for common scenarios
export const JobsEmptyState = memo(function JobsEmptyState({
  onCreateJob,
  isFiltered = false,
}: {
  onCreateJob?: () => void;
  isFiltered?: boolean;
}) {
  return (
    <EmptyState
      icon={<Briefcase className="h-10 w-10 text-muted-foreground" />}
      title={isFiltered ? "No jobs found" : "No jobs yet"}
      description={
        isFiltered 
          ? "Try adjusting your filters to see more results"
          : "Create your first job to get started"
      }
      action={
        isFiltered
          ? undefined
          : onCreateJob
          ? {
              label: "Create Job",
              onClick: onCreateJob,
              icon: <Plus className="h-4 w-4" />,
            }
          : undefined
      }
    />
  );
});

export const SearchEmptyState = memo(function SearchEmptyState({
  searchTerm,
  onClearSearch,
}: {
  searchTerm: string;
  onClearSearch?: () => void;
}) {
  return (
    <EmptyState
      icon={<Search className="h-10 w-10 text-muted-foreground" />}
      title="No results found"
      description={`We couldn't find anything matching "${searchTerm}"`}
      variant="search"
      action={
        onClearSearch
          ? {
              label: "Clear search",
              onClick: onClearSearch,
              icon: <RefreshCw className="h-4 w-4" />,
            }
          : undefined
      }
    />
  );
});

export const ErrorEmptyState = memo(function ErrorEmptyState({
  onRetry,
}: {
  onRetry?: () => void;
}) {
  return (
    <EmptyState
      title="Something went wrong"
      description="We couldn't load the data. Please try again."
      variant="error"
      action={
        onRetry
          ? {
              label: "Try again",
              onClick: onRetry,
              icon: <RefreshCw className="h-4 w-4" />,
            }
          : undefined
      }
    />
  );
}); 