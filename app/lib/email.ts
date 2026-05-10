// lib/email.ts
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.BREVO_SMTP_HOST,
  port: Number(process.env.BREVO_SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.BREVO_SMTP_LOGIN,
    pass: process.env.BREVO_SMTP_KEY,
  },
});

export async function sendGroupCredentials(leaderEmail: string, groupUsername: string, password: string) {
  try {
    console.log(`📧 [EMAIL] Starting email delivery process...`);
    console.log(`📧 [EMAIL] Recipient: ${leaderEmail}`);
    console.log(`📧 [EMAIL] Group: ${groupUsername}`);
    console.log(`📧 [EMAIL] SMTP Server: ${process.env.BREVO_SMTP_HOST}`);
    
    // Validate inputs
    if (!leaderEmail || !groupUsername || !password) {
      console.error(`❌ [EMAIL] Missing required fields`);
      return { 
        success: false, 
        error: 'Missing recipient, group username, or password' 
      };
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>FYP Group Credentials</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
          }
          .container {
            max-width: 600px;
            margin: 20px auto;
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          }
          .header {
            background: linear-gradient(135deg, #1A237E 0%, #3F51B5 100%);
            color: white;
            padding: 30px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
          }
          .header p {
            margin: 10px 0 0;
            opacity: 0.9;
          }
          .content {
            padding: 30px;
            background: #ffffff;
          }
          .greeting {
            font-size: 18px;
            margin-bottom: 20px;
          }
          .message-box {
            background: #f0f4ff;
            border-left: 4px solid #3F51B5;
            padding: 15px 20px;
            margin: 20px 0;
            border-radius: 8px;
          }
          .credentials {
            background: #f9f9f9;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
            text-align: center;
          }
          .credential-item {
            margin: 15px 0;
          }
          .credential-label {
            font-weight: bold;
            color: #3F51B5;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          .credential-value {
            font-size: 20px;
            font-weight: bold;
            color: #1A237E;
            font-family: 'Courier New', monospace;
            background: #e8eaf6;
            display: inline-block;
            padding: 8px 16px;
            border-radius: 6px;
            margin-top: 8px;
          }
          .button {
            background: linear-gradient(135deg, #1A237E 0%, #3F51B5 100%);
            color: white;
            text-decoration: none;
            padding: 12px 30px;
            border-radius: 6px;
            display: inline-block;
            margin: 20px 0;
            font-weight: bold;
          }
          .button:hover {
            opacity: 0.9;
          }
          .footer {
            background: #f8f9fa;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #666;
            border-top: 1px solid #e0e0e0;
          }
          .success-icon {
            font-size: 48px;
            margin-bottom: 10px;
          }
          .warning {
            background: #fff3cd;
            border-left-color: #ffc107;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="success-icon">🎓</div>
            <h1>FYP Automation System</h1>
            <p>Final Year Project Management</p>
          </div>
          
          <div class="content">
            <div class="greeting">
              <strong>Dear Group Leader,</strong>
            </div>
            
            <p>Congratulations! Your Final Year Project group has been <strong style="color: #3F51B5;">verified and approved</strong> by the administrator.</p>
            
            <div class="message-box">
              <p>📢 <strong>Your group is now active!</strong> You can now access the FYP Automation System using the credentials below.</p>
            </div>
            
            <div class="credentials">
              <div class="credential-item">
                <div class="credential-label">🔑 GROUP USERNAME</div>
                <div class="credential-value">${groupUsername}</div>
              </div>
              <div class="credential-item">
                <div class="credential-label">🔐 PASSWORD</div>
                <div class="credential-value">${password}</div>
              </div>
            </div>
            
            <div style="text-align: center;">
              <a href="https://fyp-automation-fast.vercel.app/auth/login" class="button">🚀 Login to Dashboard</a>
            </div>
            
            <div class="message-box warning">
              <p>⚠️ <strong>Important:</strong> Please keep these credentials secure. Do not share them with anyone outside your group.</p>
              <p style="font-size: 14px; margin-top: 10px;">💡 You can change your password after logging in.</p>
            </div>
            
            <p>If you have any questions or need assistance, please contact your supervisor or the FYP coordinator.</p>
            
            <p>Best regards,<br>
            <strong>FYP Automation Team</strong><br>
            <span style="font-size: 12px; color: #666;">Final Year Project Management System</span></p>
          </div>
          
          <div class="footer">
            <p>© 2024 FYP Automation System | This is an automated message, please do not reply.</p>
            <p>Sent from the FYP Automation System</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const textContent = `
      FYP Automation System - Group Credentials
      ==========================================
      
      Dear Group Leader,
      
      Congratulations! Your Final Year Project group "${groupUsername}" has been verified and approved.
      
      LOGIN CREDENTIALS:
      ------------------
      Group Username: ${groupUsername}
      Password: ${password}
      
      Login URL: ${process.env.NEXTAUTH_URL}
      
      Important: Please keep these credentials secure.
      
      Best regards,
      FYP Automation Team
    `;

    const info = await transporter.sendMail({
      from: `"FYP Automation System" <ammarmazher10@gmail.com>`,
      to: leaderEmail,
      subject: '✅ Your FYP Group Has Been Approved - Login Credentials Inside',
      html: htmlContent,
      text: textContent,
      headers: {
        'X-Priority': '1',
        'X-MSMail-Priority': 'High',
        'Importance': 'high'
      }
    });

    console.log(`✅ [EMAIL] Success! Email sent to ${leaderEmail}`);
    console.log(`✅ [EMAIL] Message ID: ${info.messageId}`);
    console.log(`✅ [EMAIL] Sent at: ${new Date().toISOString()}`);
    
    return { 
      success: true, 
      messageId: info.messageId,
      recipient: leaderEmail,
      group: groupUsername,
      sentAt: new Date().toISOString()
    };
    
  } catch (error) {
    console.error(`❌ [EMAIL] Failed to send email to ${leaderEmail}`);
    console.error(`❌ [EMAIL] Error details:`, error);
    
    // Log the specific error type
    if (error instanceof Error) {
      console.error(`❌ [EMAIL] Error name: ${error.name}`);
      console.error(`❌ [EMAIL] Error message: ${error.message}`);
    }
    
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown email error',
      recipient: leaderEmail,
      group: groupUsername
    };
  }
}

// Optional: Send verification email (for registration)
export async function sendVerificationEmail(recipientEmail: string, otpCode: string) {
  try {
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
        <div style="background: #3F51B5; color: white; padding: 20px; text-align: center;">
          <h2>Email Verification</h2>
        </div>
        <div style="padding: 20px;">
          <p>Your verification code is:</p>
          <h1 style="font-size: 36px; letter-spacing: 5px; background: #f0f0f0; padding: 15px; text-align: center;">${otpCode}</h1>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
      </div>
    `;

    const info = await transporter.sendMail({
      from: `"FYP Automation System" <ammarmazher10@gmail.com>`,
      to: recipientEmail,
      subject: '🔐 Verify Your Email - FYP Group Registration',
      html: htmlContent,
    });

    console.log(`✅ [EMAIL] Verification email sent to ${recipientEmail}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ [EMAIL] Failed to send verification email to ${recipientEmail}`);
    return { success: false, error };
  }
}

// lib/email.ts - Add this function

export async function sendGroupRejectionEmail(leaderEmail: string, groupUsername: string, reason?: string) {
  try {
    console.log(`📧 [EMAIL] Sending rejection email to: ${leaderEmail}`);
    console.log(`📧 [EMAIL] Group: ${groupUsername}`);
    
    // Validate inputs
    if (!leaderEmail || !groupUsername) {
      console.error(`❌ [EMAIL] Missing required fields for rejection email`);
      return { 
        success: false, 
        error: 'Missing recipient or group username' 
      };
    }

    const defaultReason = reason || "The application did not meet the required criteria or contained incomplete information.";
    const currentDate = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>FYP Group Registration Update</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
          }
          .container {
            max-width: 600px;
            margin: 20px auto;
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          }
          .header {
            background: linear-gradient(135deg, #8B0000 0%, #DC143C 100%);
            color: white;
            padding: 30px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
          }
          .header p {
            margin: 10px 0 0;
            opacity: 0.9;
          }
          .content {
            padding: 30px;
            background: #ffffff;
          }
          .greeting {
            font-size: 18px;
            margin-bottom: 20px;
          }
          .info-box {
            background: #fff5f5;
            border-left: 4px solid #DC143C;
            padding: 15px 20px;
            margin: 20px 0;
            border-radius: 8px;
          }
          .reason-box {
            background: #f9f9f9;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
          }
          .reason-title {
            font-weight: bold;
            color: #8B0000;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 10px;
          }
          .reason-text {
            font-size: 16px;
            color: #333;
            line-height: 1.5;
          }
          .button {
            background: linear-gradient(135deg, #8B0000 0%, #DC143C 100%);
            color: white;
            text-decoration: none;
            padding: 12px 30px;
            border-radius: 6px;
            display: inline-block;
            margin: 20px 0;
            font-weight: bold;
          }
          .button:hover {
            opacity: 0.9;
          }
          .footer {
            background: #f8f9fa;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #666;
            border-top: 1px solid #e0e0e0;
          }
          .icon {
            font-size: 48px;
            margin-bottom: 10px;
          }
          .next-steps {
            background: #f0f0f0;
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
          }
          .next-steps h4 {
            margin: 0 0 10px 0;
            color: #333;
          }
          .next-steps ul {
            margin: 0;
            padding-left: 20px;
          }
          .next-steps li {
            margin: 8px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="icon">📋</div>
            <h1>FYP Automation System</h1>
            <p>Final Year Project Management</p>
          </div>
          
          <div class="content">
            <div class="greeting">
              <strong>Dear Group Leader,</strong>
            </div>
            
            <p>Thank you for your interest in registering your Final Year Project group <strong>${groupUsername}</strong>.</p>
            
            <div class="info-box">
              <p>📢 <strong>Registration Status: NOT APPROVED</strong></p>
              <p>After careful review of your application, the administrator has decided not to approve your group registration at this time.</p>
            </div>
            
            <div class="reason-box">
              <div class="reason-title">📝 REASON FOR REJECTION</div>
              <div class="reason-text">${defaultReason}</div>
            </div>
            
            <div class="next-steps">
              <h4>📌 What You Can Do Next:</h4>
              <ul>
                <li>Review the feedback provided above</li>
                <li>Make necessary corrections to your application</li>
                <li>Contact your supervisor for guidance</li>
                <li>Submit a new registration application with corrected information</li>
              </ul>
            </div>
            
            <div style="text-align: center;">
              <a href="https://fyp-automation-fast.vercel.app/auth/register" class="button">🔄 Submit New Application</a>
            </div>
            
            <div class="next-steps" style="background: #fff3cd; margin-top: 20px;">
              <h4 style="color: #856404;">❓ Need Help?</h4>
              <p style="margin: 0; font-size: 14px;">If you believe this decision was made in error or need clarification, please contact the FYP coordinator or your department head.</p>
            </div>
            
            <p>We encourage you to address the issues mentioned and reapply. For any questions, please reach out to the FYP administration.</p>
            
            <p>Best regards,<br>
            <strong>FYP Automation Team</strong><br>
            <span style="font-size: 12px; color: #666;">Final Year Project Management System</span></p>
            
            <p style="font-size: 12px; color: #999; margin-top: 20px;">Decision Date: ${currentDate}</p>
          </div>
          
          <div class="footer">
            <p>© 2024 FYP Automation System | This is an automated message, please do not reply.</p>
            <p>Sent from the FYP Automation System</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const textContent = `
      FYP Automation System - Group Registration Update
      =================================================
      
      Dear Group Leader,
      
      Thank you for your interest in registering your Final Year Project group "${groupUsername}".
      
      REGISTRATION STATUS: NOT APPROVED
      
      Reason for Rejection:
      ${defaultReason}
      
      What you can do next:
      - Review the feedback provided above
      - Make necessary corrections to your application
      - Contact your supervisor for guidance
      - Submit a new registration application with corrected information
      
      Submit new application: ${process.env.NEXTAUTH_URL}/register
      
      Decision Date: ${currentDate}
      
      Best regards,
      FYP Automation Team
    `;

    const info = await transporter.sendMail({
      from: `"FYP Automation System" <ammarmazher10@gmail.com>`,
      to: leaderEmail,
      subject: `📋 Update on Your FYP Group Registration (${groupUsername})`,
      html: htmlContent,
      text: textContent,
      headers: {
        'X-Priority': '1',
        'X-MSMail-Priority': 'High',
        'Importance': 'high'
      }
    });

    console.log(`✅ [EMAIL] Rejection email sent to ${leaderEmail}`);
    console.log(`✅ [EMAIL] Message ID: ${info.messageId}`);
    
    return { 
      success: true, 
      messageId: info.messageId,
      recipient: leaderEmail,
      group: groupUsername,
      sentAt: new Date().toISOString()
    };
    
  } catch (error) {
    console.error(`❌ [EMAIL] Failed to send rejection email to ${leaderEmail}`);
    console.error(`❌ [EMAIL] Error details:`, error);
    
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown email error',
      recipient: leaderEmail,
      group: groupUsername
    };
  }
}

// Optional: Send rejection email with custom reason from admin
export async function sendGroupRejectionWithReason(leaderEmail: string, groupUsername: string, customReason: string, additionalNotes?: string) {
  const fullReason = customReason + (additionalNotes ? `\n\nAdditional Notes: ${additionalNotes}` : '');
  return sendGroupRejectionEmail(leaderEmail, groupUsername, fullReason);
}