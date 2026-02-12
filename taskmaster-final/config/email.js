// ==========================================
// SULTAN: Email Service Configuration
// ==========================================
// Email configuration and functions using Nodemailer + Brevo (SendinBlue)

const nodemailer = require('nodemailer');

/**
 * Create transporter for sending emails
 * Using Brevo (formerly SendinBlue) - free 300 emails/day
 */
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
    port: process.env.SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER, // Your Brevo email
      pass: process.env.SMTP_PASSWORD, // Your SMTP password from Brevo
    },
  });
};

/**
 * Send welcome email on registration
 */
const sendWelcomeEmail = async (userEmail, userName) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"TaskMaster App" <${process.env.SMTP_FROM || 'noreply@taskmaster.com'}>`,
      to: userEmail,
      subject: '🎉 Welcome to TaskMaster!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #4F46E5;">Hello, ${userName}! 👋</h1>
          <p>Thank you for registering with TaskMaster - your personal task management assistant!</p>
          
          <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #1F2937; margin-top: 0;">What you can do:</h2>
            <ul style="color: #4B5563;">
              <li>✅ Create and manage tasks</li>
              <li>📊 Track your progress</li>
              <li>🔔 Receive deadline reminders</li>
              <li>👥 Collaborate with your team</li>
              <li>💬 Comment on tasks</li>
            </ul>
          </div>
          
          <p style="color: #6B7280;">Your role: <strong>User</strong> (limit: 20 tasks)</p>
          <p style="color: #6B7280;">Want unlimited tasks? Upgrade to Premium! 🚀</p>
          
          <p>Best regards,<br>TaskMaster Team</p>
        </div>
      `,
      text: `
        Hello, ${userName}!
        
        Thank you for registering with TaskMaster!
        
        Your role: User (limit: 20 tasks)
        
        Best regards,
        TaskMaster Team
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Welcome email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending welcome email:', error);
    // Don't interrupt registration if email fails
    return { success: false, error: error.message };
  }
};

/**
 * Send task assignment notification
 */
const sendTaskAssignmentEmail = async (userEmail, userName, taskTitle, assignedBy) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"TaskMaster App" <${process.env.SMTP_FROM || 'noreply@taskmaster.com'}>`,
      to: userEmail,
      subject: `📋 New task assigned: ${taskTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #4F46E5;">New Task! 📋</h1>
          <p>Hello, ${userName}!</p>
          <p><strong>${assignedBy}</strong> assigned you a task:</p>
          
          <div style="background-color: #EEF2FF; padding: 20px; border-left: 4px solid #4F46E5; margin: 20px 0;">
            <h2 style="color: #1F2937; margin-top: 0;">${taskTitle}</h2>
          </div>
          
          <p>Log in to the system to view task details.</p>
          
          <p style="color: #6B7280; font-size: 12px;">
            This is an automatic notification from TaskMaster. Please do not reply to this email.
          </p>
        </div>
      `,
      text: `
        New Task!
        
        Hello, ${userName}!
        ${assignedBy} assigned you a task: ${taskTitle}
        
        Log in to the system to view details.
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Task assignment notification sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending task assignment notification:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send deadline reminder email
 */
const sendDeadlineReminderEmail = async (userEmail, userName, taskTitle, dueDate) => {
  try {
    const transporter = createTransporter();
    const dueDateFormatted = new Date(dueDate).toLocaleDateString('en-US');

    const mailOptions = {
      from: `"TaskMaster App" <${process.env.SMTP_FROM || 'noreply@taskmaster.com'}>`,
      to: userEmail,
      subject: `⏰ Reminder: task "${taskTitle}" deadline approaching!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #DC2626;">⏰ Deadline Reminder</h1>
          <p>Hello, ${userName}!</p>
          <p>The deadline for this task is approaching:</p>
          
          <div style="background-color: #FEF2F2; padding: 20px; border-left: 4px solid #DC2626; margin: 20px 0;">
            <h2 style="color: #1F2937; margin-top: 0;">${taskTitle}</h2>
            <p style="color: #991B1B; font-weight: bold;">Due: ${dueDateFormatted}</p>
          </div>
          
          <p>Don't forget to complete the task on time! 🚀</p>
          
          <p style="color: #6B7280; font-size: 12px;">
            You can change notification settings in your profile.
          </p>
        </div>
      `,
      text: `
        ⏰ Deadline Reminder
        
        Hello, ${userName}!
        
        Task deadline approaching: ${taskTitle}
        Due: ${dueDateFormatted}
        
        Don't forget to complete it on time!
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Deadline reminder sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending deadline reminder:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send overdue task notification
 */
const sendOverdueTaskEmail = async (userEmail, userName, taskTitle, dueDate) => {
  try {
    const transporter = createTransporter();
    const dueDateFormatted = new Date(dueDate).toLocaleDateString('en-US');

    const mailOptions = {
      from: `"TaskMaster App" <${process.env.SMTP_FROM || 'noreply@taskmaster.com'}>`,
      to: userEmail,
      subject: `🚨 Overdue task: ${taskTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #991B1B;">🚨 Task Overdue!</h1>
          <p>Hello, ${userName}!</p>
          <p>You have an overdue task:</p>
          
          <div style="background-color: #FEE2E2; padding: 20px; border-left: 4px solid #991B1B; margin: 20px 0;">
            <h2 style="color: #1F2937; margin-top: 0;">${taskTitle}</h2>
            <p style="color: #7F1D1D; font-weight: bold;">Deadline was: ${dueDateFormatted}</p>
          </div>
          
          <p>We recommend completing the task as soon as possible or extending the deadline.</p>
        </div>
      `,
      text: `
        🚨 Task Overdue!
        
        Hello, ${userName}!
        Task "${taskTitle}" is overdue (deadline was ${dueDateFormatted})
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Overdue task notification sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending overdue task notification:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send role upgrade notification
 */
const sendRoleUpgradeEmail = async (userEmail, userName, newRole) => {
  try {
    const transporter = createTransporter();

    const roleMessages = {
      premium: {
        title: '🎉 Congratulations! You are now a Premium user!',
        benefits: `
          <ul style="color: #4B5563;">
            <li>✅ Unlimited tasks</li>
            <li>✅ All categories available</li>
            <li>✅ Priority support</li>
            <li>✅ Extended analytics</li>
          </ul>
        `
      },
      admin: {
        title: '👑 You have been assigned as Administrator!',
        benefits: `
          <ul style="color: #4B5563;">
            <li>✅ Full access to all features</li>
            <li>✅ User management</li>
            <li>✅ Delete any tasks</li>
            <li>✅ View all data</li>
          </ul>
        `
      }
    };

    const roleData = roleMessages[newRole] || roleMessages.premium;

    const mailOptions = {
      from: `"TaskMaster App" <${process.env.SMTP_FROM || 'noreply@taskmaster.com'}>`,
      to: userEmail,
      subject: roleData.title,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #059669;">${roleData.title}</h1>
          <p>Hello, ${userName}!</p>
          <p>Your role has been successfully upgraded to <strong>${newRole.toUpperCase()}</strong>!</p>
          
          <div style="background-color: #ECFDF5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #1F2937; margin-top: 0;">Your new capabilities:</h2>
            ${roleData.benefits}
          </div>
          
          <p>Enjoy all the benefits! 🚀</p>
        </div>
      `,
      text: `
        ${roleData.title}
        
        Hello, ${userName}!
        Your role has been upgraded to ${newRole.toUpperCase()}!
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Role upgrade notification sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending role upgrade notification:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendWelcomeEmail,
  sendTaskAssignmentEmail,
  sendDeadlineReminderEmail,
  sendOverdueTaskEmail,
  sendRoleUpgradeEmail,
};
