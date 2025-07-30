import nodemailer from "nodemailer";

const APPROVAL_EMAIL = "yourmamasoosexy@gmail.com";

// Create transporter for sending emails
const createTransporter = () => {
  // Use environment variables for email configuration
  const emailUser = process.env.EMAIL_USER || process.env.SMTP_USER;
  const emailPass = process.env.EMAIL_PASS || process.env.SMTP_PASS;
  const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
  const smtpPort = parseInt(process.env.SMTP_PORT || "587");

  if (!emailUser || !emailPass) {
    console.warn("Email credentials not configured. Email functionality will be disabled.");
    return null;
  }

  return nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: emailUser,
      pass: emailPass,
    },
  });
};

export const sendPasswordResetApprovalRequest = async (
  requestId: string,
  userEmail: string,
  reason: string
) => {
  const transporter = createTransporter();
  if (!transporter) {
    throw new Error("Email service not configured");
  }

  const approvalUrl = `${process.env.BASE_URL || "http://localhost:5000"}/api/admin/approve-password-reset/${requestId}`;
  const rejectUrl = `${process.env.BASE_URL || "http://localhost:5000"}/api/admin/reject-password-reset/${requestId}`;

  const mailOptions = {
    from: process.env.EMAIL_USER || process.env.SMTP_USER,
    to: APPROVAL_EMAIL,
    subject: "OwnersAlliance - Password Reset Approval Required",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #1a1a1a; color: #ffffff; padding: 20px; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #ef4444; margin: 0;">🛡️ OwnersAlliance</h1>
          <p style="color: #9ca3af; margin: 5px 0 0 0;">Database Portal</p>
        </div>
        
        <div style="background-color: #2a2a2a; padding: 20px; border-radius: 6px; margin-bottom: 20px;">
          <h2 style="color: #ef4444; margin-top: 0;">Password Reset Approval Required</h2>
          <p>A staff member has requested a password reset for their OwnersAlliance admin account.</p>
          
          <div style="margin: 20px 0;">
            <p><strong>Email:</strong> ${userEmail}</p>
            <p><strong>Reason:</strong></p>
            <p style="background-color: #0a0a0a; padding: 15px; border-radius: 4px; border-left: 3px solid #ef4444;">${reason}</p>
          </div>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${approvalUrl}" style="background-color: #22c55e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 0 10px; display: inline-block;">
            ✅ Approve Reset
          </a>
          <a href="${rejectUrl}" style="background-color: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 0 10px; display: inline-block;">
            ❌ Reject Request
          </a>
        </div>
        
        <div style="background-color: #fbbf24; color: #0a0a0a; padding: 15px; border-radius: 6px; margin-top: 20px;">
          <p style="margin: 0;"><strong>⚠️ Security Notice:</strong> Only approve this request if you recognize the user and the reason is legitimate. This action will allow them to reset their admin password.</p>
        </div>
        
        <div style="text-align: center; margin-top: 30px; color: #6b7280; font-size: 12px;">
          <p>This is an automated message from OwnersAlliance Database Portal.</p>
          <p>If you did not expect this email, please ignore it.</p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Password reset approval email sent to ${APPROVAL_EMAIL}`);
  } catch (error) {
    console.error("Failed to send password reset approval email:", error);
    throw error;
  }
};

export const sendPasswordResetToken = async (email: string, token: string) => {
  const transporter = createTransporter();
  if (!transporter) {
    throw new Error("Email service not configured");
  }

  const resetUrl = `${process.env.BASE_URL || "http://localhost:5000"}/reset-password?token=${token}`;

  const mailOptions = {
    from: process.env.EMAIL_USER || process.env.SMTP_USER,
    to: email,
    subject: "OwnersAlliance - Password Reset Approved",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #1a1a1a; color: #ffffff; padding: 20px; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #ef4444; margin: 0;">🛡️ OwnersAlliance</h1>
          <p style="color: #9ca3af; margin: 5px 0 0 0;">Database Portal</p>
        </div>
        
        <div style="background-color: #2a2a2a; padding: 20px; border-radius: 6px; margin-bottom: 20px;">
          <h2 style="color: #22c55e; margin-top: 0;">Password Reset Approved</h2>
          <p>Your password reset request has been approved. You can now reset your password using the link below.</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Reset Password
          </a>
        </div>
        
        <div style="background-color: #fbbf24; color: #0a0a0a; padding: 15px; border-radius: 6px; margin-top: 20px;">
          <p style="margin: 0;"><strong>⚠️ Security Notice:</strong> This link will expire in 1 hour. If you did not request this password reset, please ignore this email.</p>
        </div>
        
        <div style="text-align: center; margin-top: 30px; color: #6b7280; font-size: 12px;">
          <p>This is an automated message from OwnersAlliance Database Portal.</p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Password reset token sent to ${email}`);
  } catch (error) {
    console.error("Failed to send password reset token:", error);
    throw error;
  }
};
