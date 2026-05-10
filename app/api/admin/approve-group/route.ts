// app/api/admin/approve-group/route.ts
import { NextResponse, NextRequest } from "next/server";
import { executeQuery, getConnection } from "@/app/lib/db.server";
import { sendGroupCredentials } from "@/app/lib/email";

export async function POST(req: NextRequest) {
  let connection;
  
  try {
    const body = await req.json();
    const groupId = body.groupId;
    const password = body.password;

    console.log("=== APPROVE GROUP DEBUG ===");
    console.log("Group ID:", groupId);
    console.log("Password:", password);

    // Check if group exists (outside transaction)
    const checkGroup = await executeQuery(
      "SELECT groupId, status, groupUsername, leaderEmail FROM studentgroup WHERE groupId = ?",
      [groupId],
    );

    console.log("Check result:", JSON.stringify(checkGroup, null, 2));

    if ((checkGroup as any[]).length === 0) {
      return NextResponse.json({ message: "Group not found" }, { status: 404 });
    }

    const groupData = (checkGroup as any[])[0];
    const groupStatus = groupData.status;
    const groupUsername = groupData.groupUsername;
    const leaderEmail = groupData.leaderEmail;

    if (groupStatus !== "PENDING") {
      return NextResponse.json(
        { message: `Group is already ${groupStatus}. Cannot approve again.` },
        { status: 400 },
      );
    }

    // ============================================
    // START TRANSACTION
    // ============================================
    connection = await getConnection();
    await connection.beginTransaction();
    console.log("📦 Transaction started");

    // Update group status and set password
    await connection.execute(
      "UPDATE studentgroup SET status = 'VERIFIED', groupPass = ? WHERE groupId = ?",
      [password, groupId],
    );

    console.log(`✅ Group ${groupId} approved`);

    // Commit transaction
    await connection.commit();
    console.log("✅ Transaction committed");

    // ============================================
    // Send email (outside transaction)
    // ============================================
    let emailSent = false;
    if (leaderEmail && groupUsername && password) {
      const emailResult = await sendGroupCredentials(leaderEmail, groupUsername, password);
      emailSent = emailResult.success;
      console.log(`📧 Email sent to ${leaderEmail}: ${emailSent ? 'SUCCESS' : 'FAILED'}`);
    }

    return NextResponse.json({
      success: true,
      message: "Group approved successfully",
      leaderEmail: leaderEmail,
      groupUsername: groupUsername,
      password: password,
      emailSent: emailSent
    });
    
  } catch (error) {
    // Rollback on error
    if (connection) {
      await connection.rollback();
      console.error("❌ Transaction rolled back");
    }
    console.error("ERROR DETAILS:", error);
    return NextResponse.json(
      { message: (error as Error).message, stack: (error as Error).stack },
      { status: 500 },
    );
  } finally {
    if (connection) connection.release();
  }
}