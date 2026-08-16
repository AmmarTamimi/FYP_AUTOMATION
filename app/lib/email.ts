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
              <a href="https://fyp-automation-fast.vercel.app/login" class="button">🚀 Login to Dashboard</a>
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

// Add to your lib/email.ts

export async function sendAdminPasswordChangedEmail(
  adminEmail: string,
  adminName: string,
  newPassword: string,
  changedBy: 'admin' | 'system'
) {
  try {
    console.log(`📧 [EMAIL] Sending admin password change email to: ${adminEmail}`);
    console.log(`📧 [EMAIL] Admin: ${adminName}`);

    // Validate inputs
    if (!adminEmail || !adminName || !newPassword) {
      console.error(`❌ [EMAIL] Missing required fields for admin password change`);
      return { 
        success: false, 
        error: 'Missing recipient, admin name, or new password' 
      };
    }

    const changedByText = changedBy === 'admin' ? 'you' : 'the system administrator';
    const changedByIcon = changedBy === 'admin' ? '🔐' : '🔄';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Admin Password Updated</title>
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
            font-size: 18px;
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
          .icon {
            font-size: 48px;
            margin-bottom: 10px;
          }
          .warning {
            background: #fff3cd;
            border-left-color: #ffc107;
          }
          .info-text {
            font-size: 12px;
            color: #666;
            margin-top: 15px;
            text-align: center;
          }
          .success-box {
            background: #d4edda;
            border-left-color: #28a745;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="icon">${changedByIcon}</div>
            <h1>FYP Automation System</h1>
            <p>Admin Password Updated</p>
          </div>
          
          <div class="content">
            <div class="greeting">
              <strong>Dear ${adminName},</strong>
            </div>
            
            <p>Your administrator account password has been successfully updated.</p>
            
            <div class="message-box success-box">
              <p>✅ <strong>Password updated successfully!</strong> The change was initiated by ${changedByText}.</p>
            </div>
            
            <div class="credentials">
              <div class="credential-item">
                <div class="credential-label">🔑 ADMIN EMAIL</div>
                <div class="credential-value">${adminEmail}</div>
              </div>
              <div class="credential-item">
                <div class="credential-label">🔐 NEW PASSWORD</div>
                <div class="credential-value">${newPassword}</div>
              </div>
            </div>
            
            <div style="text-align: center;">
              <a href="https://fyp-automation-fast.vercel.app/login" class="button">🚀 Login to Admin Dashboard</a>
            </div>
            
            <div class="message-box warning">
              <p>⚠️ <strong>Important:</strong> Please keep these credentials secure. Do not share them with anyone.</p>
              <p style="font-size: 14px; margin-top: 10px;">💡 For security reasons, we recommend changing your password immediately after login if this was a system-generated password.</p>
            </div>
            
            <p>If you did not request this password change, please contact the system administrator immediately.</p>
            
            <p>Best regards,<br>
            <strong>FYP Automation Team</strong><br>
            <span style="font-size: 12px; color: #666;">Final Year Project Management System</span></p>
          </div>
          
          <div class="footer">
            <p>© 2025 FYP Automation System | This is an automated message, please do not reply.</p>
            <p>Sent from the FYP Automation System</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const textContent = `
      FYP Automation System - Admin Password Updated
      ==============================================
      
      Dear ${adminName},
      
      Your administrator account password has been successfully updated. The change was initiated by ${changedByText}.
      
      NEW LOGIN CREDENTIALS:
      ----------------------
      Admin Email: ${adminEmail}
      New Password: ${newPassword}
      
      Login URL: https://fyp-automation-fast.vercel.app/admin/login
      
      Important: Please keep these credentials secure. For security reasons, we recommend changing your password immediately after login if this was a system-generated password.
      
      If you did not request this password change, please contact the system administrator immediately.
      
      Best regards,
      FYP Automation Team
    `;

    const info = await transporter.sendMail({
      from: `"FYP Automation System" <ammarmazher10@gmail.com>`,
      to: adminEmail,
      subject: `🔐 Admin Password Updated - FYP Automation System`,
      html: htmlContent,
      text: textContent,
      headers: {
        'X-Priority': '1',
        'X-MSMail-Priority': 'High',
        'Importance': 'high'
      }
    });

    console.log(`✅ [EMAIL] Admin password change email sent to ${adminEmail}`);
    console.log(`✅ [EMAIL] Message ID: ${info.messageId}`);
    console.log(`✅ [EMAIL] Sent at: ${new Date().toISOString()}`);
    
    return { 
      success: true, 
      messageId: info.messageId,
      recipient: adminEmail,
      admin: adminName,
      sentAt: new Date().toISOString()
    };
    
  } catch (error) {
    console.error(`❌ [EMAIL] Failed to send admin password change email to ${adminEmail}`);
    console.error(`❌ [EMAIL] Error details:`, error);
    
    if (error instanceof Error) {
      console.error(`❌ [EMAIL] Error name: ${error.name}`);
      console.error(`❌ [EMAIL] Error message: ${error.message}`);
    }
    
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown email error',
      recipient: adminEmail,
      admin: adminName
    };

  }
}

// Add to your lib/email.ts

export async function sendTeacherRegistrationNotification(
  adminEmail: string,
  adminName: string,
  teacherData: {
    name: string;
    email: string;
    department?: string;
    role: 'senior' | 'junior';
    registrationDate: Date;
  }
) {
  try {
    console.log(`📧 [EMAIL] Sending teacher registration notification to admin: ${adminEmail}`);

    // Validate inputs
    if (!adminEmail || !adminName || !teacherData.name || !teacherData.email) {
      console.error(`❌ [EMAIL] Missing required fields for teacher registration notification`);
      return { 
        success: false, 
        error: 'Missing required fields' 
      };
    }

    const roleTitle = teacherData.role === 'senior' ? 'Senior Evaluator' : 'Junior Evaluator';
    const formattedDate = new Date(teacherData.registrationDate).toLocaleString('en-US', {
      dateStyle: 'full',
      timeStyle: 'medium'
    });

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Teacher Registration Notification</title>
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
          .info-box {
            background: #f9f9f9;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
          }
          .info-item {
            margin: 10px 0;
            padding: 8px 0;
            border-bottom: 1px solid #eee;
          }
          .info-item:last-child {
            border-bottom: none;
          }
          .info-label {
            font-weight: bold;
            color: #3F51B5;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          .info-value {
            font-size: 16px;
            color: #1A237E;
            margin-top: 4px;
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
          .icon {
            font-size: 48px;
            margin-bottom: 10px;
          }
          .warning {
            background: #fff3cd;
            border-left-color: #ffc107;
          }
          .info-text {
            font-size: 12px;
            color: #666;
            margin-top: 15px;
            text-align: center;
          }
          .badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
          }
          .badge-senior {
            background: #1A237E;
            color: white;
          }
          .badge-junior {
            background: #4CAF50;
            color: white;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="icon">👨‍🏫</div>
            <h1>FYP Automation System</h1>
            <p>New Teacher Registration</p>
          </div>
          
          <div class="content">
            <div class="greeting">
              <strong>Dear ${adminName},</strong>
            </div>
            
            <p>A new teacher has registered in the FYP Automation System and requires your approval.</p>
            
            <div class="message-box">
              <p>📢 <strong>New Registration Alert!</strong> A teacher has created an account and is waiting for administrative approval.</p>
            </div>
            
            <div class="info-box">
              <h3 style="color: #1A237E; margin-top: 0;">Teacher Details</h3>
              <div class="info-item">
                <div class="info-label">👤 Name</div>
                <div class="info-value">${teacherData.name}</div>
              </div>
              <div class="info-item">
                <div class="info-label">📧 Email</div>
                <div class="info-value">${teacherData.email}</div>
              </div>
              ${teacherData.department ? `
              <div class="info-item">
                <div class="info-label">🏛️ Department</div>
                <div class="info-value">${teacherData.department}</div>
              </div>
              ` : ''}
              <div class="info-item">
                <div class="info-label">🎯 Role</div>
                <div class="info-value">
                  <span class="badge ${teacherData.role === 'senior' ? 'badge-senior' : 'badge-junior'}">
                    ${roleTitle}
                  </span>
                </div>
              </div>
              <div class="info-item">
                <div class="info-label">📅 Registration Date</div>
                <div class="info-value">${formattedDate}</div>
              </div>
            </div>
            
            <div style="text-align: center;">
              <a href="https://fyp-automation-fast.vercel.app/admin/teachers/pending" class="button">👀 Review Registration</a>
            </div>
            
            <div class="message-box warning">
              <p>⚠️ <strong>Action Required:</strong> Please review this teacher's registration and approve or reject it.</p>
              <p style="font-size: 14px; margin-top: 10px;">💡 Approved teachers will be able to evaluate Final Year Projects and be assigned to juries.</p>
            </div>
            
            <div class="info-text">
              <p>As an administrator, you have the authority to approve or reject teacher registrations.</p>
              <p>You will receive another notification once the teacher is approved and credentials are generated.</p>
            </div>
            
            <p>Best regards,<br>
            <strong>FYP Automation Team</strong><br>
            <span style="font-size: 12px; color: #666;">Final Year Project Management System</span></p>
          </div>
          
          <div class="footer">
            <p>© 2025 FYP Automation System | This is an automated message, please do not reply.</p>
            <p>Sent from the FYP Automation System</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const textContent = `
      FYP Automation System - New Teacher Registration
      ================================================
      
      Dear ${adminName},
      
      A new teacher has registered in the FYP Automation System and requires your approval.
      
      TEACHER DETAILS:
      ----------------
      Name: ${teacherData.name}
      Email: ${teacherData.email}
      ${teacherData.department ? `Department: ${teacherData.department}` : ''}
      Role: ${roleTitle}
      Registration Date: ${formattedDate}
      
      Action Required: Please review this teacher's registration and approve or reject it.
      
      Review URL: https://fyp-automation-fast.vercel.app/admin/teachers/pending
      
      Approved teachers will be able to evaluate Final Year Projects and be assigned to juries.
      
      Best regards,
      FYP Automation Team
    `;

    const info = await transporter.sendMail({
      from: `"FYP Automation System" <ammarmazher10@gmail.com>`,
      to: adminEmail,
      subject: `👨‍🏫 New Teacher Registration - Action Required`,
      html: htmlContent,
      text: textContent,
      headers: {
        'X-Priority': '1',
        'X-MSMail-Priority': 'High',
        'Importance': 'high'
      }
    });

    console.log(`✅ [EMAIL] Teacher registration notification sent to admin ${adminEmail}`);
    console.log(`✅ [EMAIL] Message ID: ${info.messageId}`);
    console.log(`✅ [EMAIL] Sent at: ${new Date().toISOString()}`);
    
    return { 
      success: true, 
      messageId: info.messageId,
      recipient: adminEmail,
      admin: adminName,
      sentAt: new Date().toISOString()
    };
    
  } catch (error) {
    console.error(`❌ [EMAIL] Failed to send teacher registration notification to admin ${adminEmail}`);
    console.error(`❌ [EMAIL] Error details:`, error);
    
    if (error instanceof Error) {
      console.error(`❌ [EMAIL] Error name: ${error.name}`);
      console.error(`❌ [EMAIL] Error message: ${error.message}`);
    }
    
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown email error',
      recipient: adminEmail
    };
  }
}

// Add to your lib/email.ts

export async function sendGroupRegistrationNotification(
  adminEmail: string,
  adminName: string,
  groupData: {
    groupName: string;
    projectTitle: string;
    members: Array<{ name: string; email: string; rollNo?: string }>;
    supervisor?: string;
    registrationDate: Date;
  }
) {
  try {
    console.log(`📧 [EMAIL] Sending group registration notification to admin: ${adminEmail}`);

    // Validate inputs
    if (!adminEmail || !adminName || !groupData.groupName || !groupData.members || groupData.members.length === 0) {
      console.error(`❌ [EMAIL] Missing required fields for group registration notification`);
      return { 
        success: false, 
        error: 'Missing required fields' 
      };
    }

    const formattedDate = new Date(groupData.registrationDate).toLocaleString('en-US', {
      dateStyle: 'full',
      timeStyle: 'medium'
    });

    const membersList = groupData.members.map((member, index) => 
      `${index + 1}. ${member.name} (${member.email})${member.rollNo ? ` - ${member.rollNo}` : ''}`
    ).join('\n');

    const membersHtml = groupData.members.map((member, index) => `
      <div class="info-item">
        <div class="info-label">Student ${index + 1}</div>
        <div class="info-value">
          <strong>${member.name}</strong><br>
          ${member.email}${member.rollNo ? `<br>Roll No: ${member.rollNo}` : ''}
        </div>
      </div>
    `).join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Group Registration Notification</title>
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
          .info-box {
            background: #f9f9f9;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
          }
          .info-item {
            margin: 10px 0;
            padding: 8px 0;
            border-bottom: 1px solid #eee;
          }
          .info-item:last-child {
            border-bottom: none;
          }
          .info-label {
            font-weight: bold;
            color: #3F51B5;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          .info-value {
            font-size: 16px;
            color: #1A237E;
            margin-top: 4px;
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
          .icon {
            font-size: 48px;
            margin-bottom: 10px;
          }
          .warning {
            background: #fff3cd;
            border-left-color: #ffc107;
          }
          .info-text {
            font-size: 12px;
            color: #666;
            margin-top: 15px;
            text-align: center;
          }
          .badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
            background: #4CAF50;
            color: white;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="icon">👥</div>
            <h1>FYP Automation System</h1>
            <p>New Group Registration</p>
          </div>
          
          <div class="content">
            <div class="greeting">
              <strong>Dear ${adminName},</strong>
            </div>
            
            <p>A new student group has registered in the FYP Automation System and requires your approval.</p>
            
            <div class="message-box">
              <p>📢 <strong>New Group Registration Alert!</strong> A student group has submitted their project proposal and is waiting for administrative approval.</p>
            </div>
            
            <div class="info-box">
              <h3 style="color: #1A237E; margin-top: 0;">Group Details</h3>
              <div class="info-item">
                <div class="info-label">👥 Group Name</div>
                <div class="info-value"><strong>${groupData.groupName}</strong></div>
              </div>
              <div class="info-item">
                <div class="info-label">📝 Project Title</div>
                <div class="info-value">${groupData.projectTitle || 'Not specified'}</div>
              </div>
              ${groupData.supervisor ? `
              <div class="info-item">
                <div class="info-label">👨‍🏫 Supervisor</div>
                <div class="info-value">${groupData.supervisor}</div>
              </div>
              ` : ''}
              <div class="info-item">
                <div class="info-label">📅 Registration Date</div>
                <div class="info-value">${formattedDate}</div>
              </div>
            </div>
            
            <div class="info-box">
              <h3 style="color: #1A237E; margin-top: 0;">Group Members</h3>
              ${membersHtml}
            </div>
            
            <div style="text-align: center;">
              <a href="https://fyp-automation-fast.vercel.app/admin/groups/pending" class="button">👀 Review Group</a>
            </div>
            
            <div class="message-box warning">
              <p>⚠️ <strong>Action Required:</strong> Please review this group's registration and approve or reject it.</p>
              <p style="font-size: 14px; margin-top: 10px;">💡 Approved groups will be able to submit their Final Year Project proposals and participate in evaluations.</p>
            </div>
            
            <div class="info-text">
              <p>As an administrator, you have the authority to approve or reject group registrations.</p>
              <p>You will receive another notification once the group is approved and assigned to a jury.</p>
            </div>
            
            <p>Best regards,<br>
            <strong>FYP Automation Team</strong><br>
            <span style="font-size: 12px; color: #666;">Final Year Project Management System</span></p>
          </div>
          
          <div class="footer">
            <p>© 2025 FYP Automation System | This is an automated message, please do not reply.</p>
            <p>Sent from the FYP Automation System</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const textContent = `
      FYP Automation System - New Group Registration
      ==============================================
      
      Dear ${adminName},
      
      A new student group has registered in the FYP Automation System and requires your approval.
      
      GROUP DETAILS:
      --------------
      Group Name: ${groupData.groupName}
      Project Title: ${groupData.projectTitle || 'Not specified'}
      ${groupData.supervisor ? `Supervisor: ${groupData.supervisor}` : ''}
      Registration Date: ${formattedDate}
      
      GROUP MEMBERS:
      --------------
      ${membersList}
      
      Action Required: Please review this group's registration and approve or reject it.
      
      Review URL: https://fyp-automation-fast.vercel.app/admin/groups/pending
      
      Approved groups will be able to submit their Final Year Project proposals and participate in evaluations.
      
      Best regards,
      FYP Automation Team
    `;

    const info = await transporter.sendMail({
      from: `"FYP Automation System" <ammarmazher10@gmail.com>`,
      to: adminEmail,
      subject: `👥 New Group Registration - Action Required`,
      html: htmlContent,
      text: textContent,
      headers: {
        'X-Priority': '1',
        'X-MSMail-Priority': 'High',
        'Importance': 'high'
      }
    });

    console.log(`✅ [EMAIL] Group registration notification sent to admin ${adminEmail}`);
    console.log(`✅ [EMAIL] Message ID: ${info.messageId}`);
    console.log(`✅ [EMAIL] Sent at: ${new Date().toISOString()}`);
    
    return { 
      success: true, 
      messageId: info.messageId,
      recipient: adminEmail,
      admin: adminName,
      sentAt: new Date().toISOString()
    };
    
  } catch (error) {
    console.error(`❌ [EMAIL] Failed to send group registration notification to admin ${adminEmail}`);
    console.error(`❌ [EMAIL] Error details:`, error);
    
    if (error instanceof Error) {
      console.error(`❌ [EMAIL] Error name: ${error.name}`);
      console.error(`❌ [EMAIL] Error message: ${error.message}`);
    }
    
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown email error',
      recipient: adminEmail
    };
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
              <a href="https://fyp-automation-fast.vercel.app/register" class="button">🔄 Submit New Application</a>
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

// lib/email.ts - Add these functions

// ============================================
// Teacher Jury Assignment Email
// ============================================
export async function sendTeacherJuryAssignment(
  teacherEmail: string,
  teacherName: string,
  juryId: number,
  role: 'senior' | 'junior',
  groupCount: number,
  assignmentLink: string
) {
  try {
    console.log(`📧 [EMAIL] Sending jury assignment email to: ${teacherEmail}`);
    console.log(`📧 [EMAIL] Teacher: ${teacherName}`);
    console.log(`📧 [EMAIL] Role: ${role}, Jury ID: ${juryId}`);

    if (!teacherEmail || !teacherName) {
      console.error(`❌ [EMAIL] Missing required fields`);
      return { success: false, error: 'Missing recipient or teacher name' };
    }

    const roleTitle = role === 'senior' ? 'Senior Evaluator' : 'Junior Evaluator';
    const roleIcon = role === 'senior' ? '👨‍🏫' : '👨‍🎓';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Jury Assignment Notification</title>
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
          .info-box {
            background: #f0f4ff;
            border-left: 4px solid #3F51B5;
            padding: 15px 20px;
            margin: 20px 0;
            border-radius: 8px;
          }
          .details-box {
            background: #f9f9f9;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
          }
          .detail-item {
            margin: 10px 0;
          }
          .detail-label {
            font-weight: bold;
            color: #3F51B5;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          .detail-value {
            font-size: 16px;
            font-weight: bold;
            color: #1A237E;
            margin-left: 10px;
          }
          .button-group {
            display: flex;
            gap: 15px;
            justify-content: center;
            margin: 25px 0;
          }
          .btn-accept {
            background: linear-gradient(135deg, #1A237E 0%, #3F51B5 100%);
            color: white;
            text-decoration: none;
            padding: 12px 25px;
            border-radius: 6px;
            display: inline-block;
            font-weight: bold;
          }
          .btn-reject {
            background: linear-gradient(135deg, #8B0000 0%, #DC143C 100%);
            color: white;
            text-decoration: none;
            padding: 12px 25px;
            border-radius: 6px;
            display: inline-block;
            font-weight: bold;
          }
          .btn-accept:hover, .btn-reject:hover {
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
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="icon">${roleIcon}</div>
            <h1>FYP Automation System</h1>
            <p>Jury Assignment Notification</p>
          </div>
          
          <div class="content">
            <div class="greeting">
              <strong>Dear ${teacherName},</strong>
            </div>
            
            <p>You have been assigned as a <strong>${roleTitle}</strong> for the Final Year Project evaluations.</p>
            
            <div class="info-box">
              <p>📢 <strong>Jury Assignment Details</strong></p>
              <p>You have been selected to evaluate <strong>${groupCount}</strong> project(s) as part of Jury #${juryId}.</p>
            </div>
            
            <div class="details-box">
              <div class="detail-item">
                <span class="detail-label">🎯 Role:</span>
                <span class="detail-value">${roleTitle}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">🆔 Jury ID:</span>
                <span class="detail-value">JRY-${juryId}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">📊 Projects to Evaluate:</span>
                <span class="detail-value">${groupCount}</span>
              </div>
            </div>
            
            <div class="button-group">
              <a href="${assignmentLink}?action=accept&juryId=${juryId}" class="btn-accept">✓ Accept Assignment</a>
              <a href="${assignmentLink}?action=reject&juryId=${juryId}" class="btn-reject">✗ Request Change</a>
            </div>
            
            <p style="font-size: 14px; color: #666; text-align: center;">
              Please click Accept to confirm your participation, or Request Change if you have a conflict.
            </p>
            
            <p>Best regards,<br>
            <strong>FYP Automation Team</strong><br>
            <span style="font-size: 12px; color: #666;">Final Year Project Management System</span></p>
          </div>
          
          <div class="footer">
            <p>© 2025 FYP Automation System | This is an automated message, please do not reply.</p>
            <p>If you have any concerns, please contact the FYP coordinator.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const textContent = `
      FYP Automation System - Jury Assignment
      ========================================
      
      Dear ${teacherName},
      
      You have been assigned as a ${roleTitle} for the Final Year Project evaluations.
      
      Jury Assignment Details:
      - Role: ${roleTitle}
      - Jury ID: JRY-${juryId}
      - Projects to Evaluate: ${groupCount}
      
      Please visit the following link to accept or request changes:
      ${assignmentLink}?action=accept&juryId=${juryId}
      
      Best regards,
      FYP Automation Team
    `;

    const info = await transporter.sendMail({
      from: `"FYP Automation System" <ammarmazher10@gmail.com>`,
      to: teacherEmail,
      subject: `📋 Jury Assignment: You've been selected as ${roleTitle}`,
      html: htmlContent,
      text: textContent,
      headers: {
        'X-Priority': '1',
        'X-MSMail-Priority': 'High',
        'Importance': 'high'
      }
    });

    console.log(`✅ [EMAIL] Jury assignment email sent to ${teacherEmail}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ [EMAIL] Failed to send jury assignment email to ${teacherEmail}`);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// ============================================
// Teacher Schedule Update Email
// ============================================
export async function sendTeacherScheduleUpdate(
  teacherEmail: string,
  teacherName: string,
  scheduleDetails: {
    groupName: string;
    date: string;
    time: string;
    venue: string;
    projectTitle: string;
  }[]
) {
  try {
    console.log(`📧 [EMAIL] Sending schedule update email to: ${teacherEmail}`);

    const scheduleRows = scheduleDetails.map(s => `
      <tr style="border-bottom: 1px solid #e0e0e0;">
        <td style="padding: 10px;"><strong>${s.groupName}</strong></td>
        <td style="padding: 10px;">${s.projectTitle || 'N/A'}</td>
        <td style="padding: 10px;">${s.date}</td>
        <td style="padding: 10px;">${s.time}</td>
        <td style="padding: 10px;">${s.venue}</td>
      </tr>
    `).join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Schedule Update Notification</title>
        <style>
          body { font-family: 'Segoe UI', sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0; }
          .container { max-width: 700px; margin: 20px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #1A237E 0%, #3F51B5 100%); color: white; padding: 30px; text-align: center; }
          .content { padding: 30px; }
          .greeting { font-size: 18px; margin-bottom: 20px; }
          .info-box { background: #f0f4ff; border-left: 4px solid #3F51B5; padding: 15px 20px; margin: 20px 0; border-radius: 8px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th { background: #1A237E; color: white; padding: 12px; text-align: left; }
          td { padding: 10px; border-bottom: 1px solid #e0e0e0; }
          .button { background: linear-gradient(135deg, #1A237E 0%, #3F51B5 100%); color: white; text-decoration: none; padding: 12px 25px; border-radius: 6px; display: inline-block; margin: 20px 0; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #e0e0e0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📅 Schedule Updated</h1>
            <p>FYP Automation System</p>
          </div>
          <div class="content">
            <div class="greeting"><strong>Dear ${teacherName},</strong></div>
            <p>Your evaluation schedule has been updated. ${scheduleDetails.length} new group(s) have been assigned to you.</p>
            <div class="info-box">📢 Please review your updated schedule below.</div>
            <table>
              <thead><tr><th>Group</th><th>Project</th><th>Date</th><th>Time</th><th>Venue</th></tr></thead>
              <tbody>${scheduleRows}</tbody>
            </table>
            <div style="text-align: center;">
              <a href="https://fyp-automation-fast.vercel.app/teacher/dashboard" class="button">📋 View Full Schedule</a>
            </div>
            <p>Best regards,<br><strong>FYP Automation Team</strong></p>
          </div>
          <div class="footer"><p>© 2025 FYP Automation System | This is an automated message.</p></div>
        </div>
      </body>
      </html>
    `;

    const info = await transporter.sendMail({
      from: `"FYP Automation System" <ammarmazher10@gmail.com>`,
      to: teacherEmail,
      subject: `📅 Schedule Update: ${scheduleDetails.length} New Group(s) Assigned`,
      html: htmlContent,
      text: `Dear ${teacherName},\n\nYour evaluation schedule has been updated. ${scheduleDetails.length} new group(s) have been assigned to you.\n\nPlease log in to view your full schedule.\n\nBest regards,\nFYP Automation Team`,
    });

    console.log(`✅ [EMAIL] Schedule update email sent to ${teacherEmail}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ [EMAIL] Failed to send schedule update email to ${teacherEmail}`);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// ============================================
// Teacher Jury Conflict/Change Request Email
// ============================================
export async function sendTeacherConflictNotification(
  teacherEmail: string,
  teacherName: string,
  conflictDetails: {
    existingGroup: string;
    newGroup: string;
    date: string;
    time: string;
    venue: string;
  }
) {
  try {
    console.log(`📧 [EMAIL] Sending conflict notification to: ${teacherEmail}`);

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Schedule Conflict Notification</title>
        <style>
          body { font-family: 'Segoe UI', sans-serif; line-height: 1.6; background-color: #f4f4f4; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #8B0000 0%, #DC143C 100%); color: white; padding: 30px; text-align: center; }
          .content { padding: 30px; }
          .conflict-box { background: #fff5f5; border-left: 4px solid #DC143C; padding: 15px 20px; margin: 20px 0; border-radius: 8px; }
          .button { background: linear-gradient(135deg, #1A237E 0%, #3F51B5 100%); color: white; text-decoration: none; padding: 12px 25px; border-radius: 6px; display: inline-block; margin: 20px 0; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #e0e0e0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header"><h1>⚠️ Schedule Conflict Detected</h1><p>FYP Automation System</p></div>
          <div class="content">
            <div class="greeting"><strong>Dear ${teacherName},</strong></div>
            <p>A scheduling conflict has been detected in your evaluation assignments.</p>
            <div class="conflict-box">
              <p><strong>📅 Date:</strong> ${conflictDetails.date}</p>
              <p><strong>⏰ Time:</strong> ${conflictDetails.time}</p>
              <p><strong>📍 Venue:</strong> ${conflictDetails.venue}</p>
              <p><strong>⚠️ Existing Group:</strong> ${conflictDetails.existingGroup}</p>
              <p><strong>➕ New Group:</strong> ${conflictDetails.newGroup}</p>
            </div>
            <p>Please contact the FYP coordinator to resolve this scheduling conflict.</p>
            <div style="text-align: center;">
              <a href="${process.env.NEXTAUTH_URL}/teacher/schedule" class="button">📋 View Schedule</a>
            </div>
            <p>Best regards,<br><strong>FYP Automation Team</strong></p>
          </div>
          <div class="footer"><p>© 2025 FYP Automation System | This is an automated message.</p></div>
        </div>
      </body>
      </html>
    `;

    const info = await transporter.sendMail({
      from: `"FYP Automation System" <ammarmazher10@gmail.com>`,
      to: teacherEmail,
      subject: `⚠️ Schedule Conflict Detected - Action Required`,
      html: htmlContent,
    });

    console.log(`✅ [EMAIL] Conflict notification sent to ${teacherEmail}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ [EMAIL] Failed to send conflict notification to ${teacherEmail}`);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// lib/email.ts - Add this function

// ============================================
// Teacher Credentials Email
// ============================================
export async function sendTeacherCredentials(
  teacherEmail: string,
  teacherName: string,
  username: string,
  password: string,
  role: 'senior' | 'junior'
) {
  try {
    console.log(`📧 [EMAIL] Sending teacher credentials email to: ${teacherEmail}`);
    console.log(`📧 [EMAIL] Teacher: ${teacherName}`);
    console.log(`📧 [EMAIL] Role: ${role}`);

    // Validate inputs
    if (!teacherEmail || !teacherName || !username || !password) {
      console.error(`❌ [EMAIL] Missing required fields for teacher credentials`);
      return { 
        success: false, 
        error: 'Missing recipient, teacher name, username, or password' 
      };
    }

    const roleTitle = role === 'senior' ? 'Senior Evaluator' : 'Junior Evaluator';
    const roleIcon = role === 'senior' ? '👨‍🏫' : '👨‍🎓';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Teacher Account Credentials</title>
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
            font-size: 18px;
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
          .icon {
            font-size: 48px;
            margin-bottom: 10px;
          }
          .warning {
            background: #fff3cd;
            border-left-color: #ffc107;
          }
          .info-text {
            font-size: 12px;
            color: #666;
            margin-top: 15px;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="icon">${roleIcon}</div>
            <h1>FYP Automation System</h1>
            <p>Teacher Account Credentials</p>
          </div>
          
          <div class="content">
            <div class="greeting">
              <strong>Dear ${teacherName},</strong>
            </div>
            
            <p>Welcome to the FYP Automation System! Your teacher account has been created with the role of <strong>${roleTitle}</strong>.</p>
            
            <div class="message-box">
              <p>📢 <strong>Your account is now active!</strong> You can now access the FYP Automation System using the credentials below.</p>
            </div>
            
            <div class="credentials">
              <div class="credential-item">
                <div class="credential-label">🔑 USERNAME / EMAIL</div>
                <div class="credential-value">${username}</div>
              </div>
              <div class="credential-item">
                <div class="credential-label">🔐 PASSWORD</div>
                <div class="credential-value">${password}</div>
              </div>
            </div>
            
            <div style="text-align: center;">
              <a href="https://fyp-automation-fast.vercel.app/login" class="button">🚀 Login to Dashboard</a>
            </div>
            
            <div class="message-box warning">
              <p>⚠️ <strong>Important:</strong> Please keep these credentials secure. Do not share them with anyone.</p>
              <p style="font-size: 14px; margin-top: 10px;">💡 For security reasons, please change your password after your first login.</p>
            </div>
            
            <div class="info-text">
              <p>As a ${roleTitle.toLowerCase()}, you will be responsible for evaluating Final Year Projects.</p>
              <p>You will receive email notifications when groups are assigned to your jury and when schedules are created.</p>
            </div>
            
            <p>If you have any questions or need assistance, please contact the FYP coordinator.</p>
            
            <p>Best regards,<br>
            <strong>FYP Automation Team</strong><br>
            <span style="font-size: 12px; color: #666;">Final Year Project Management System</span></p>
          </div>
          
          <div class="footer">
            <p>© 2025 FYP Automation System | This is an automated message, please do not reply.</p>
            <p>Sent from the FYP Automation System</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const textContent = `
      FYP Automation System - Teacher Account Credentials
      ===================================================
      
      Dear ${teacherName},
      
      Welcome to the FYP Automation System! Your teacher account has been created with the role of ${roleTitle}.
      
      LOGIN CREDENTIALS:
      ------------------
      Username/Email: ${username}
      Password: ${password}
      
      Login URL: https://fyp-automation-fast.vercel.app/login
      
      Important: Please keep these credentials secure. For security reasons, please change your password after your first login.
      
      As a ${roleTitle.toLowerCase()}, you will be responsible for evaluating Final Year Projects. You will receive email notifications when groups are assigned to your jury and when schedules are created.
      
      Best regards,
      FYP Automation Team
    `;

    const info = await transporter.sendMail({
      from: `"FYP Automation System" <ammarmazher10@gmail.com>`,
      to: teacherEmail,
      subject: `📋 Welcome to FYP Automation System - Your Account Credentials (${roleTitle})`,
      html: htmlContent,
      text: textContent,
      headers: {
        'X-Priority': '1',
        'X-MSMail-Priority': 'High',
        'Importance': 'high'
      }
    });

    console.log(`✅ [EMAIL] Teacher credentials email sent to ${teacherEmail}`);
    console.log(`✅ [EMAIL] Message ID: ${info.messageId}`);
    console.log(`✅ [EMAIL] Sent at: ${new Date().toISOString()}`);
    
    return { 
      success: true, 
      messageId: info.messageId,
      recipient: teacherEmail,
      teacher: teacherName,
      role: role,
      sentAt: new Date().toISOString()
    };
    
  } catch (error) {
    console.error(`❌ [EMAIL] Failed to send teacher credentials email to ${teacherEmail}`);
    console.error(`❌ [EMAIL] Error details:`, error);
    
    if (error instanceof Error) {
      console.error(`❌ [EMAIL] Error name: ${error.name}`);
      console.error(`❌ [EMAIL] Error message: ${error.message}`);
    }
    
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown email error',
      recipient: teacherEmail,
      teacher: teacherName
    };
  }
}