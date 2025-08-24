import { z } from 'zod';
import { JOB_CATEGORY_VALUES, JOB_STATUS_VALUES } from '@/types/drizzle';

export const jobSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1),
  description: z.string().min(1),
  status: z.enum(JOB_STATUS_VALUES),
  category: z.enum(JOB_CATEGORY_VALUES).default('GENERAL_MAINTENANCE'),
  ownerId: z.string().uuid(),
  contractorId: z.string().uuid().nullable().optional(),
  location_id: z.string().nullable().optional(),
}); 