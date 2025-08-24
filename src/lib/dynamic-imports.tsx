import dynamic from 'next/dynamic';
import { ComponentType } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

// Generic loading fallback
const LoadingFallback = () => (
  <div className="space-y-4">
    <Skeleton className="h-8 w-48" />
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Skeleton className="h-32" />
      <Skeleton className="h-32" />
      <Skeleton className="h-32" />
    </div>
  </div>
);

// Type-safe dynamic import wrapper for Next.js
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function dynamicImport<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T } | T>,
  options?: {
    loading?: ComponentType;
    ssr?: boolean;
  }
) {
  return dynamic(
    async () => {
      const mod = await importFn();
      return 'default' in mod ? mod : { default: mod };
    },
    {
      loading: options?.loading ? (() => {
        const Loading = options.loading;
        // @ts-expect-error - Complex ComponentType dynamic loading issue
        return <Loading />;
      }) : (() => <LoadingFallback />),
      ssr: options?.ssr ?? true,
    }
  );
}

// Pre-configured dynamic imports for common components
export const DynamicAdminDashboard = dynamicImport(
  () => import('@/components/dashboards/AdminDashboard')
);

export const DynamicOwnerDashboard = dynamicImport(
  () => import('@/components/dashboards/OwnerDashboard')
);

export const DynamicManagerDashboard = dynamicImport(
  () => import('@/components/dashboards/ManagerDashboard')
);

export const DynamicContractorDashboard = dynamicImport(
  () => import('@/components/dashboards/ContractorDashboard')
);

// Tab components
export const DynamicUsersContent = dynamicImport(
  () => import('@/components/dashboards/tabs/UsersContent').then(m => m.UsersContent)
);

export const DynamicLocationsContent = dynamicImport(
  () => import('@/components/dashboards/tabs/LocationsContent').then(m => m.LocationsContent)
);

export const DynamicOrganisationsContent = dynamicImport(
  () => import('@/components/dashboards/tabs/OrganisationsContent').then(m => m.OrganisationsContent)
);

export const DynamicManagersContent = dynamicImport(
  () => import('@/components/dashboards/tabs/ManagersContent').then(m => m.ManagersContent)
);

export const DynamicDocumentsContent = dynamicImport(
  () => import('@/components/dashboards/tabs/DocumentsContent').then(m => m.DocumentsContent)
);

// Modal components
export const DynamicJobDetailModal = dynamicImport(
  () => import('@/components/jobs/job-detail-modal').then(m => m.JobDetailModal)
);