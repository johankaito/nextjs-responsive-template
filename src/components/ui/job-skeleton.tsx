import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface JobCardSkeletonProps {
  count?: number;
}

export function JobCardSkeleton({ count = 1 }: JobCardSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="p-4">
          {/* Status indicator bar skeleton */}
          <div className="absolute top-0 left-0 right-0 h-1">
            <Skeleton className="h-full w-full" />
          </div>
          
          <div className="space-y-4">
            {/* Header skeleton */}
            <div className="flex justify-between items-start gap-2">
              <div className="flex-1 space-y-2">
                <Skeleton className="h-6 w-3/4" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-5 w-32" />
                </div>
              </div>
            </div>
            
            {/* Description skeleton */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
            </div>
            
            {/* Details grid skeleton */}
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-1">
                <Skeleton className="h-3 w-3 rounded-full" />
                <Skeleton className="h-3 w-24" />
              </div>
              <div className="flex items-center gap-1">
                <Skeleton className="h-3 w-3 rounded-full" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
            
            {/* Footer skeleton */}
            <div className="pt-2 border-t">
              <div className="flex items-center justify-between">
                <Skeleton className="h-3 w-12" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
          </div>
        </Card>
      ))}
    </>
  );
}

export function JobGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <JobCardSkeleton count={count} />
    </div>
  );
}