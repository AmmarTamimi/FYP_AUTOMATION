// app/api/test-email/route.ts
import { NextResponse } from "next/server";
import { sendGroupCredentials, sendGroupRejectionEmail } from "@/app/lib/email";

export async function GET() {
  try {
    // Test data for the email
    const testLeaderEmail = 'k243054@nu.edu.pk';
    const testGroupUsername = 'test_group_demo';
    const testPassword = 'DemoPass123!';
    const reason = "Project details are not well defined"
    
    console.log(`🧪 [TEST] Sending test credentials email to: ${testLeaderEmail}`);
    console.log(`🧪 [TEST] Group: ${testGroupUsername}`);
    console.log(`🧪 [TEST] Password: ${testPassword}`);
    
    // Send the actual credentials email
    const result = await sendGroupCredentials(
      testLeaderEmail, 
      testGroupUsername, 
      testPassword
    );
    
    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        message: 'Test email sent successfully!',
        messageId: result.messageId,
        recipient: testLeaderEmail,
        group: testGroupUsername
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        error: result.error,
        message: 'Failed to send test email'
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('❌ [TEST] Email test error:', error);
    return NextResponse.json({ 
      success: false, 
      error: String(error),
      message: 'Exception occurred while sending test email'
    }, { status: 500 });
  }
}