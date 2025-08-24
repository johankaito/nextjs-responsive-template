import { memo } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/StatusBadge';
import { ProgressIndicator } from '@/components/ui/progress-indicator';
import { MapPin, Calendar, User, Paperclip, AlertCircle } from 'lucide-react';
import { Job, JobStatus } from '@/types/drizzle';
import { formatRelativeDate, formatJobCategory } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface EnhancedJobCardProps {
  job: Job & { jobFiles?: Array<{ id: string }>; location?: { name: string } };
  onClick?: () => void;
  showProgress?: boolean;
  isUrgent?: boolean;
}

// Status color mapping for the border
const statusColors: Record<JobStatus, string> = {
  DRAFT: 'border-l-gray-400',
  PENDING_REVIEW: 'border-l-yellow-500',
  AVAILABLE: 'border-l-green-500',
  CLAIMED: 'border-l-blue-500',
  SUBMITTED: 'border-l-cyan-500',
  IN_PROGRESS: 'border-l-indigo-500',
  COMPLETED: 'border-l-emerald-500',
  PAID: 'border-l-purple-500',
  ARCHIVED: 'border-l-gray-600',
};

// Progress mapping for job status
const statusProgress: Record<JobStatus, number> = {
  DRAFT: 0,
  PENDING_REVIEW: 1,
  AVAILABLE: 2,
  CLAIMED: 3,
  SUBMITTED: 4,
  IN_PROGRESS: 5,
  COMPLETED: 6,
  PAID: 7,
  ARCHIVED: 8,
};

export const EnhancedJobCard = memo(function EnhancedJobCard({
  job,
  onClick,
  showProgress = true,
  isUrgent = false,
}: EnhancedJobCardProps) {
  const fileCount = job.jobFiles?.length || 0;
  const progress = statusProgress[job.status] || 0;

  return (
    <Card 
      className={cn(
        "group relative overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-1 cursor-pointer",
        "border-l-4",
        statusColors[job.status],
        isUrgent && "ring-2 ring-red-500 ring-offset-2"
      )}
      onClick={onClick}
    >
      {/* Urgent indicator */}
      {isUrgent && (
        <div className="absolute top-2 right-2 z-10">
          <Badge variant="destructive" className="gap-1">
            <AlertCircle className="h-3 w-3" />
            Urgent
          </Badge>
        </div>
      )}

      <CardHeader className="pb-2">
        <div className="space-y-1.5">
          {/* Title and Status */}
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-lg line-clamp-1 flex-1 pr-2">
              {job.title}
            </h3>
            <StatusBadge status={job.status} />
          </div>

          {/* Category and Location */}
          <div className="flex items-center gap-2 flex-wrap">
            {job.category && (
              <Badge variant="secondary" className="text-xs">
                {formatJobCategory(job.category)}
              </Badge>
            )}
            {job.location && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />
                <span className="truncate max-w-[150px]">{job.location.name}</span>
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-2">
        {/* Description */}
        {job.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {job.description}
          </p>
        )}

        {/* Progress Indicator */}
        {showProgress && job.status !== 'ARCHIVED' && (
          <ProgressIndicator
            current={progress}
            total={5}
            variant="steps"
            size="sm"
            className="py-2"
          />
        )}

        {/* Metadata Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
          {/* Created Date */}
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>{formatRelativeDate(job.createdAt)}</span>
          </div>

          {/* Assigned Status */}
          {job.contractorId && (
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              <span>Assigned</span>
            </div>
          )}

          {/* Due Date if exists */}
          {/* TODO: Add dueDate to Job schema if needed
          {job.dueDate && (
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>Due {formatRelativeDate(job.dueDate)}</span>
            </div>
          )} */}

          {/* File Count */}
          {fileCount > 0 && (
            <div className="flex items-center gap-1">
              <Paperclip className="h-3 w-3" />
              <span>{fileCount} file{fileCount !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>

        {/* Priority/Price indicator */}
        {/* TODO: Add priority to Job schema if needed
        {job.priority && (
          <div className="pt-2 border-t">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Priority</span>
              <Badge variant={job.priority === 'HIGH' ? 'destructive' : job.priority === 'MEDIUM' ? 'default' : 'secondary'}>
                {job.priority}
              </Badge>
            </div>
          </div>
        )} */}
      </CardContent>

      {/* Hover effect overlay */}
      <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </Card>
  );
});