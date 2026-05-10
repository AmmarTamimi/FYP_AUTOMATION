// app/api/admin/reject-group/route.ts
import { NextResponse, NextRequest } from "next/server";
import { executeQuery } from "@/app/lib/db.server";
import { sendGroupRejectionEmail } from "@/app/lib/email";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const groupId = body.groupId;
    const reason = body.reason || "The application did not meet the required criteria.";
    
    console.log(`=== Rejecting Group ID: ${groupId} ===`);
    console.log(`Reason: ${reason}`);
    
    // Get group details before updating
    const groupDetails = await executeQuery(
      'SELECT groupUsername, leaderEmail FROM studentgroup WHERE groupId = ?',
      [groupId]
    );
    
    if ((groupDetails as any[]).length === 0) {
      return NextResponse.json(
        { message: 'Group not found' },
        { status: 404 }
      );
    }
    
    const groupUsername = (groupDetails as any[])[0]?.groupUsername;
    const leaderEmail = (groupDetails as any[])[0]?.leaderEmail;
    
    // Update group status to DENIED
    await executeQuery(
      "UPDATE studentgroup SET status = 'DENIED' WHERE groupId = ?",
      [groupId]
    );
    
    // Send rejection email
    let emailSent = false;
    if (leaderEmail && groupUsername) {
      const emailResult = await sendGroupRejectionEmail(leaderEmail, groupUsername, reason);
      emailSent = emailResult.success;
      
      if (emailResult.success) {
        console.log(`✅ Rejection email sent to ${leaderEmail}`);
      } else {
        console.warn(`❌ Failed to send rejection email to ${leaderEmail}`);
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Group rejected successfully',
      emailSent: emailSent,
      notification: emailSent 
        ? 'Rejection email sent to group leader.'
        : 'Group rejected but email could not be sent.'
    });
    
  } catch (error) {
    console.error('Error rejecting group:', error);
    return NextResponse.json(
      { message: 'Error in rejecting group' },
      { status: 500 }
    );
  }
}