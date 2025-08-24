import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface TableSkeletonProps {
  columns?: number;
  rows?: number;
  showActions?: boolean;
}

export function TableSkeleton({ 
  columns = 4, 
  rows = 5,
  showActions = true 
}: TableSkeletonProps) {
  const totalColumns = showActions ? columns + 1 : columns;
  
  return (
    <div className="space-y-4">
      {/* Search and filters skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex flex-1 items-center space-x-2">
          <Skeleton className="h-10 w-[250px]" />
          <Skeleton className="h-10 w-[180px]" />
        </div>
      </div>
      
      {/* Table skeleton */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {Array.from({ length: totalColumns }).map((_, i) => (
                <TableHead key={i}>
                  <Skeleton className="h-4 w-24" />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <TableRow key={rowIndex}>
                {Array.from({ length: totalColumns }).map((_, colIndex) => (
                  <TableCell key={colIndex}>
                    {colIndex === totalColumns - 1 && showActions ? (
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-8 w-16" />
                        <Skeleton className="h-8 w-16" />
                      </div>
                    ) : (
                      <Skeleton className="h-4 w-32" />
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {/* Pagination skeleton */}
      <div className="flex items-center justify-end space-x-2">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-20" />
      </div>
    </div>
  );
}