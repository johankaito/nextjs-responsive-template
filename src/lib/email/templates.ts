export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export function getBaseTemplate(content: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tofil Notification</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #0066cc; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background-color: #f9f9f9; padding: 30px; border: 1px solid #ddd; border-radius: 0 0 8px 8px; }
    .button { display: inline-block; padding: 12px 24px; background-color: #0066cc; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
    .footer { margin-top: 30px; text-align: center; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Tofil</h1>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>© 2024 Tofil Group. All rights reserved.</p>
      <p>This is an automated notification. Please do not reply to this email.</p>
    </div>
  </div>
</body>
</html>
  `;
}

export function jobStatusChangeEmail(
  jobTitle: string,
  newStatus: string,
  jobUrl: string
): EmailTemplate {
  const subject = `Job Status Updated: ${jobTitle}`;
  
  const htmlContent = `
    <h2>Job Status Update</h2>
    <p>The status of the following job has been updated:</p>
    <p><strong>Job:</strong> ${jobTitle}</p>
    <p><strong>New Status:</strong> ${newStatus}</p>
    <a href="${jobUrl}" class="button">View Job Details</a>
  `;
  
  const textContent = `
Job Status Update

The status of the following job has been updated:
Job: ${jobTitle}
New Status: ${newStatus}

View job details at: ${jobUrl}
  `;
  
  return {
    subject,
    html: getBaseTemplate(htmlContent),
    text: textContent
  };
}

export function newJobAvailableEmail(
  jobTitle: string,
  location: string,
  jobUrl: string
): EmailTemplate {
  const subject = `New Job Available: ${jobTitle}`;
  
  const htmlContent = `
    <h2>New Job Available</h2>
    <p>A new job matching your profile is now available:</p>
    <p><strong>Job:</strong> ${jobTitle}</p>
    <p><strong>Location:</strong> ${location}</p>
    <a href="${jobUrl}" class="button">View Job Details</a>
  `;
  
  const textContent = `
New Job Available

A new job matching your profile is now available:
Job: ${jobTitle}
Location: ${location}

View job details at: ${jobUrl}
  `;
  
  return {
    subject,
    html: getBaseTemplate(htmlContent),
    text: textContent
  };
}

export function jobCompletedEmail(
  jobTitle: string,
  contractorName: string,
  completionNotes: string | null,
  jobUrl: string
): EmailTemplate {
  const subject = `Job Completed: ${jobTitle}`;
  
  const htmlContent = `
    <h2>Job Completed</h2>
    <p>The following job has been marked as complete:</p>
    <p><strong>Job:</strong> ${jobTitle}</p>
    <p><strong>Completed by:</strong> ${contractorName}</p>
    ${completionNotes ? `<p><strong>Completion Notes:</strong> ${completionNotes}</p>` : ''}
    <a href="${jobUrl}" class="button">View Job Details</a>
  `;
  
  const textContent = `
Job Completed

The following job has been marked as complete:
Job: ${jobTitle}
Completed by: ${contractorName}
${completionNotes ? `Completion Notes: ${completionNotes}` : ''}

View job details at: ${jobUrl}
  `;
  
  return {
    subject,
    html: getBaseTemplate(htmlContent),
    text: textContent
  };
}

export function jobClaimedEmail(
  jobTitle: string,
  contractorName: string,
  contractorEmail: string,
  location: string,
  jobUrl: string
): EmailTemplate {
  const subject = `Job Claimed: ${jobTitle}`;
  
  const htmlContent = `
    <h2>Job Claimed Notification</h2>
    <p>A contractor has claimed the following job:</p>
    <p><strong>Job:</strong> ${jobTitle}</p>
    <p><strong>Location:</strong> ${location}</p>
    <p><strong>Contractor:</strong> ${contractorName}</p>
    <p><strong>Contractor Email:</strong> ${contractorEmail}</p>
    <a href="${jobUrl}" class="button">View Job Details</a>
  `;
  
  const textContent = `
Job Claimed Notification

A contractor has claimed the following job:
Job: ${jobTitle}
Location: ${location}
Contractor: ${contractorName}
Contractor Email: ${contractorEmail}

View job details at: ${jobUrl}
  `;
  
  return {
    subject,
    html: getBaseTemplate(htmlContent),
    text: textContent
  };
} 