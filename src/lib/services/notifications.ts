import { createClient } from '@supabase/supabase-js';
import { jobStatusChangeEmail, newJobAvailableEmail, jobCompletedEmail, jobClaimedEmail } from '@/lib/email/templates';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''; 
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export type NotificationType = 'job_status' | 'new_job' | 'assignment' | 'job_complete' | 'file_upload';

interface CreateNotificationParams {
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  link?: string;
  sendEmail?: boolean;
  emailTemplate?: {
    subject: string;
    html: string;
    text: string;
  };
}

async function sendEmailNotification(to: string, template: { subject: string; html: string; text: string }) {
  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseServiceKey}`,
      },
      body: JSON.stringify({
        to,
        subject: template.subject,
        html: template.html,
        text: template.text,
      }),
    });

    if (!response.ok) {
      console.error('Failed to send email:', await response.text());
    }
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

export async function createNotification({
  userId,
  title,
  message,
  type,
  link,
  sendEmail = true,
  emailTemplate
}: CreateNotificationParams) {
  try {
    // Service client with elevated permissions for creating notifications
    const serviceClient = createClient(supabaseUrl, supabaseServiceKey);
    // Create in-app notification
    const { error } = await serviceClient
      .from('notifications')
      .insert({
        user_id: userId,
        title,
        message,
        type,
        link,
        read: false
      });

    if (error) {
      console.error('Failed to create notification:', error);
      return false;
    }
    
    // Send email notification if requested and user has email preferences enabled
    if (sendEmail && emailTemplate) {
      // Service client with elevated permissions for creating notifications
      const serviceClient = createClient(supabaseUrl, supabaseServiceKey);
      // Get user email
      const { data: user } = await serviceClient
        .from('users')
        .select('email')
        .eq('id', userId)
        .single();
      
      if (user?.email) {
        // Check email preferences (localStorage or future DB implementation)
        // For now, always send unless explicitly disabled in localStorage
        const emailPref = typeof window !== 'undefined' 
          ? localStorage.getItem(`email_notifications_${userId}`)
          : 'true';
        
        if (emailPref !== 'false') {
          await sendEmailNotification(user.email, emailTemplate);
        }
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error creating notification:', error);
    return false;
  }
}

// Helper function to notify job status changes
export async function notifyJobStatusChange(
  jobId: string,
  jobTitle: string,
  newStatus: string,
  affectedUsers: { id: string; role: string }[]
) {
  const jobUrl = `${appUrl}/jobs/${jobId}`;
  const emailTemplate = jobStatusChangeEmail(jobTitle, newStatus, jobUrl);
  
  const notifications = affectedUsers.map(user => ({
    userId: user.id,
    title: `Job Status Updated`,
    message: `The job "${jobTitle}" status has been changed to ${newStatus}`,
    type: 'job_status' as NotificationType,
    link: `/jobs/${jobId}`,
    emailTemplate
  }));

  const results = await Promise.all(
    notifications.map(notification => createNotification(notification))
  );

  return results.every(result => result === true);
}

// Helper function to notify admin when job is claimed
export async function notifyAdminJobClaimed(
  jobId: string,
  jobTitle: string,
  location: string,
  contractorName: string,
  contractorEmail: string
) {
  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.tofilgroup.com';
    const jobUrl = `${appUrl}/jobs/${jobId}`;
    
    // Get email template
    const emailTemplate = jobClaimedEmail(
      jobTitle,
      contractorName,
      contractorEmail,
      location,
      jobUrl
    );
    
    // Send to admin emails
    const adminEmails = ['info@tofilgroup.com', 'john@tofilgroup.com'];
    
    for (const adminEmail of adminEmails) {
      await sendEmailNotification(adminEmail, emailTemplate);
    }
    
    console.log('Job claimed notification sent to admins');
    return true;
  } catch (error) {
    console.error('Failed to send job claimed notification:', error);
    return false;
  }
}

// Helper function to notify when a new job is available
export async function notifyNewJob(
  jobId: string,
  jobTitle: string,
  location: string,
  contractorIds: string[]
) {
  const jobUrl = `${appUrl}/jobs/${jobId}`;
  const emailTemplate = newJobAvailableEmail(jobTitle, location, jobUrl);
  
  const notifications = contractorIds.map(contractorId => ({
    userId: contractorId,
    title: `New Job Available`,
    message: `A new job "${jobTitle}" is available at ${location}`,
    type: 'new_job' as NotificationType,
    link: `/jobs/${jobId}`,
    emailTemplate
  }));

  const results = await Promise.all(
    notifications.map(notification => createNotification(notification))
  );

  return results.every(result => result === true);
}

// Helper function to notify job assignment
export async function notifyJobAssignment(
  jobId: string,
  jobTitle: string,
  contractorId: string
) {
  return createNotification({
    userId: contractorId,
    title: `Job Assigned`,
    message: `You have been assigned to the job "${jobTitle}"`,
    type: 'assignment' as NotificationType,
    link: `/jobs/${jobId}`
  });
}

// Helper function to notify when a contractor uploads a file
export async function notifyFileUpload(
  jobId: string,
  jobTitle: string,
  fileName: string,
  ownerId: string,
  managerId?: string,
  contractorName: string = 'Contractor'
) {
  const usersToNotify = [ownerId];
  if (managerId) usersToNotify.push(managerId);
  
  const jobUrl = `${appUrl}/jobs/${jobId}`;
  
  // Simple email template for file uploads
  const emailTemplate = {
    subject: `New file uploaded to job: ${jobTitle}`,
    html: `
      <h2>File Upload Notification</h2>
      <p>${contractorName} has uploaded a new file to the job "${jobTitle}"</p>
      <p><strong>File:</strong> ${fileName}</p>
      <p><a href="${jobUrl}">View Job Details</a></p>
    `,
    text: `${contractorName} has uploaded a new file "${fileName}" to the job "${jobTitle}". View at: ${jobUrl}`
  };

  const notifications = usersToNotify.map(userId => ({
    userId,
    title: `File Uploaded`,
    message: `${contractorName} uploaded "${fileName}" to "${jobTitle}"`,
    type: 'file_upload' as NotificationType,
    link: `/jobs/${jobId}`,
    emailTemplate
  }));

  const results = await Promise.all(
    notifications.map(notification => createNotification(notification))
  );

  return results.every(result => result === true);
}

// Helper function to notify job completion
export async function notifyJobCompletion(
  jobId: string,
  jobTitle: string,
  ownerId: string,
  managerId?: string,
  contractorName: string = 'Contractor',
  completionNotes?: string | null
) {
  const usersToNotify = [ownerId];
  if (managerId) usersToNotify.push(managerId);
  
  const jobUrl = `${appUrl}/jobs/${jobId}`;
  const emailTemplate = jobCompletedEmail(jobTitle, contractorName, completionNotes || null, jobUrl);

  const notifications = usersToNotify.map(userId => ({
    userId,
    title: `Job Completed`,
    message: `The job "${jobTitle}" has been marked as complete`,
    type: 'job_complete' as NotificationType,
    link: `/jobs/${jobId}`,
    emailTemplate
  }));

  const results = await Promise.all(
    notifications.map(notification => createNotification(notification))
  );

  return results.every(result => result === true);
} 