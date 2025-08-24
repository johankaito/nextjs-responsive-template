import { pgTable, uuid, text, timestamp, pgEnum, primaryKey, bigint, boolean, index } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// Enums
export const userTypeEnum = pgEnum('user_type', ['ADMIN', 'OWNER', 'MANAGER', 'CONTRACTOR']);
export const userStatusEnum = pgEnum('user_status', ['ACTIVE', 'INACTIVE', 'SUSPENDED']);
export const jobStatusEnum = pgEnum('job_status', [
  'DRAFT',
  'PENDING_REVIEW',
  'AVAILABLE',
  'CLAIMED',
  'SUBMITTED',
  'IN_PROGRESS',
  'COMPLETED',
  'PAID',
  'ARCHIVED',
]);
export const jobCategoryEnum = pgEnum('job_category', ['ELECTRICAL', 'PLUMBING', 'GENERAL_MAINTENANCE', 'OFF_PLATFORM']);
export const fileEventTypeEnum = pgEnum('file_event_type', ['ADDED', 'REMOVED']);
export const contractorSpecialityEnum = pgEnum('contractor_speciality', ['electrical', 'plumbing', 'general_maintenance']);

// User Table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  type: userTypeEnum('type').notNull(),
  status: userStatusEnum('status').notNull().default('ACTIVE'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
}, (table) => [
  index('idx_users_type').on(table.type),
  index('idx_users_email').on(table.email),
  index('idx_users_created_at').on(table.createdAt),
]);

// User Invitations Table
export const invitationStatusEnum = pgEnum('invitation_status', ['pending', 'completed', 'expired', 'revoked']);

export const userInvitations = pgTable('user_invitations', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull(),
  name: text('name').notNull(),
  userType: userTypeEnum('user_type').notNull(),
  invitedBy: uuid('invited_by').notNull().references(() => users.id),
  status: invitationStatusEnum('status').default('pending').notNull(),
  token: text('token').notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  index('idx_user_invitations_email').on(table.email),
  index('idx_user_invitations_status').on(table.status),
  index('idx_user_invitations_token').on(table.token),
  index('idx_user_invitations_expires_at').on(table.expiresAt),
]);

// User History Table
export const userHistories = pgTable('user_history', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull(),
  name: text('name').notNull(),
  type: userTypeEnum('type').notNull(),
  status: userStatusEnum('status').notNull(),
  changedBy: uuid('changed_by').references(() => users.id),
  validFrom: timestamp('valid_from').notNull(),
  validTo: timestamp('valid_to'),
});

// Organisation Table
export const organisations = pgTable('organisations', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  ownerId: uuid('owner_id').references(() => users.id).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
  createdBy: uuid('created_by').references(() => users.id),
  updatedBy: uuid('updated_by').references(() => users.id),
  deletedBy: uuid('deleted_by').references(() => users.id),
}, (table) => [
  index('idx_organisations_owner_id').on(table.ownerId),
]);

// Organisation History Table
export const organisationHistories = pgTable('organisation_history', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  ownerId: uuid('owner_id').references(() => users.id).notNull(),
  changedBy: uuid('changed_by').references(() => users.id),
  validFrom: timestamp('valid_from').notNull(),
  validTo: timestamp('valid_to'),
});

// Location Table
export const locations = pgTable('locations', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  address: text('address').notNull(),
  organisationId: uuid('organisation_id').references(() => organisations.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
  createdBy: uuid('created_by').references(() => users.id),
  updatedBy: uuid('updated_by').references(() => users.id),
  deletedBy: uuid('deleted_by').references(() => users.id),
}, (table) => [
  index('idx_locations_organisation_id').on(table.organisationId),
]);

// Location History Table
export const locationHistories = pgTable('location_history', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  address: text('address').notNull(),
  organisationId: uuid('organisation_id').references(() => organisations.id),
  changedBy: uuid('changed_by').references(() => users.id),
  validFrom: timestamp('valid_from').notNull(),
  validTo: timestamp('valid_to'),
});

// Job Table
export const jobs = pgTable('jobs', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  status: jobStatusEnum('status').default('DRAFT').notNull(),
  category: jobCategoryEnum('category').default('GENERAL_MAINTENANCE').notNull(),
  ownerId: uuid('owner_id').notNull().references(() => users.id),
  locationId: uuid('location_id').references(() => locations.id),
  contractorId: uuid('contractor_id').references(() => users.id),
  organisationId: uuid('organisation_id').references(() => organisations.id),
  completionNotes: text('completion_notes'),
  requiredSpecialities: text('required_specialities').array().default([]).notNull(),
  changedBy: uuid('changed_by').references(() => users.id),
  // Pricing fields
  listingPrice: text('listing_price'), // Set by owner/manager, visible to setter and admin only
  contractorPrice: text('contractor_price'), // Set by admin, visible to contractors only
  notes: text('notes'), // Internal notes, visible to admins only
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
  createdBy: uuid('created_by').references(() => users.id),
  updatedBy: uuid('updated_by').references(() => users.id),
  deletedBy: uuid('deleted_by').references(() => users.id),
}, (table) => [
  index('idx_jobs_status').on(table.status),
  index('idx_jobs_location_id').on(table.locationId),
  index('idx_jobs_contractor_id').on(table.contractorId),
  index('idx_jobs_created_at').on(table.createdAt),
  index('idx_jobs_category').on(table.category),
  index('idx_jobs_owner_id').on(table.ownerId),
  // Composite indexes for common query patterns
  index('idx_jobs_status_location').on(table.status, table.locationId),
  index('idx_jobs_contractor_status').on(table.contractorId, table.status).where(sql`contractor_id IS NOT NULL`),
]);

// Job History Table (Temporal)
export const jobHistories = pgTable('job_history', {
  id: uuid('id').primaryKey().defaultRandom(),
  jobId: uuid('job_id').notNull().references(() => jobs.id),
  title: text('title').notNull(),
  description: text('description').notNull(),
  status: jobStatusEnum('status').notNull(),
  ownerId: uuid('owner_id').notNull().references(() => users.id),
  locationId: uuid('location_id').references(() => locations.id),
  contractorId: uuid('contractor_id').references(() => users.id),
  completionNotes: text('completion_notes'),
  changedBy: uuid('changed_by').references(() => users.id),
  validFrom: timestamp('valid_from').notNull(),
  validTo: timestamp('valid_to'),
  fileEventType: fileEventTypeEnum('file_event_type'),
  fileId: uuid('file_id'),
  fileName: text('file_name'),
}, (table) => [
  index('idx_job_history_job_id').on(table.jobId),
  index('idx_job_history_valid_from').on(table.validFrom),
  index('idx_job_history_changed_by').on(table.changedBy),
  index('idx_job_history_status').on(table.status),
]);

// Files Table (generic)
export const files = pgTable('files', {
  id: uuid('id').primaryKey().defaultRandom(),
  storagePath: text('storage_path').notNull(), // Path/key in Supabase Storage
  bucket: text('bucket').notNull(), // Storage bucket name
  name: text('name').notNull(), // Original filename
  type: text('type').notNull(), // MIME type
  size: bigint('size', { mode: 'number' }).notNull(), // File size in bytes
  uploadedBy: uuid('uploaded_by').references(() => users.id).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
  createdBy: uuid('created_by').references(() => users.id),
  updatedBy: uuid('updated_by').references(() => users.id),
  deletedBy: uuid('deleted_by').references(() => users.id),
}, (table) => [
  index('idx_files_uploaded_by').on(table.uploadedBy),
  index('idx_files_created_at').on(table.createdAt),
  index('idx_files_bucket').on(table.bucket),
]);

// Contractor Documents Table
export const contractorDocuments = pgTable('contractor_documents', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id).unique(),
  
  // White Card
  whiteCardFrontFileId: uuid('white_card_front_file_id').references(() => files.id),
  whiteCardBackFileId: uuid('white_card_back_file_id').references(() => files.id),
  
  // Driver's License
  licenseFrontFileId: uuid('license_front_file_id').references(() => files.id),
  licenseBackFileId: uuid('license_back_file_id').references(() => files.id),
  
  // Business Information
  abn: text('abn'),
  bsb: text('bsb'),
  accountNumber: text('account_number'),
  
  // Insurance
  insuranceDocumentFileId: uuid('insurance_document_file_id').references(() => files.id),
  insuranceExpiryDate: timestamp('insurance_expiry_date'),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  index('idx_contractor_documents_user_id').on(table.userId),
]);

// Job-Files Linking Table
export const jobFiles = pgTable('job_files', {
  id: uuid('id').primaryKey().defaultRandom(),
  jobId: uuid('job_id').notNull().references(() => jobs.id),
  fileId: uuid('file_id').notNull().references(() => files.id),
  createdBy: uuid('created_by').notNull().references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
  updatedBy: uuid('updated_by').references(() => users.id),
  deletedBy: uuid('deleted_by').references(() => users.id),
}, (table) => [
  index('idx_job_files_job_id').on(table.jobId),
  index('idx_job_files_file_id').on(table.fileId),
]);

// Contractor Profiles Table
export const contractorProfiles = pgTable('contractor_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id).unique(),
  specialities: text('specialities').array().default([]).notNull(),
  hourlyRate: text('hourly_rate'), // Using text for decimal values
  yearsExperience: bigint('years_experience', { mode: 'number' }),
  serviceRadiusKm: bigint('service_radius_km', { mode: 'number' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  index('idx_contractor_profiles_user_id').on(table.userId),
]);

// Relations (many-to-many, one-to-many, etc.)
// User-Organisation (many-to-many via UserOrganisations)
export const userOrganisations = pgTable('user_organisations', {
  userId: uuid('user_id').notNull().references(() => users.id),
  organisationId: uuid('organisation_id').notNull().references(() => organisations.id),
}, (table) => ({
  pk: primaryKey({ columns: [table.userId, table.organisationId] }),
}));

// Notifications Table
export const notifications = pgTable('notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  title: text('title').notNull(),
  message: text('message').notNull(),
  link: text('link'),
  read: boolean('read').notNull().default(false),
  type: text('type'), // 'job_status', 'new_job', 'assignment', etc.
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('idx_notifications_user_id').on(table.userId),
  index('idx_notifications_read').on(table.read),
  index('idx_notifications_created_at').on(table.createdAt),
  index('idx_notifications_type').on(table.type),
]);

// User-JobHistory (one-to-many)
// Job-JobHistory (one-to-many)
// User-Job (OwnerJobs, ContractorJobs)
// User-Location (ManagerLocation, many-to-many)
export const managerLocations = pgTable('manager_locations', {
  userId: uuid('user_id').notNull().references(() => users.id),
  locationId: uuid('location_id').notNull().references(() => locations.id),
}, (table) => [
  primaryKey({ columns: [table.userId, table.locationId] }),
]);

// User-Location (ManagerLocation, many-to-many)
export const locationManagers = pgTable('location_managers', {
  locationId: uuid('location_id').notNull().references(() => locations.id),
  managerId: uuid('manager_id').notNull().references(() => users.id),
}, (table) => [
  primaryKey({ columns: [table.locationId, table.managerId] }),
]); 