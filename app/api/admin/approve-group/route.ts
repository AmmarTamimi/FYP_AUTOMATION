// app/api/admin/approve-group/route.ts
import { NextResponse, NextRequest } from "next/server";
import { executeQuery } from "@/app/lib/db.server";
import { sendGroupCredentials } from "@/app/lib/email";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const groupId = body.groupId;
    const password = body.password;

    console.log("=== APPROVE GROUP DEBUG ===");
    console.log("Group ID:", groupId);
    console.log("Password:", password);

    // Check if group exists
    const checkGroup = await executeQuery(
      "SELECT groupId, status FROM studentgroup WHERE groupId = ?",
      [groupId],
    );

    console.log("Check result:", JSON.stringify(checkGroup, null, 2));

    if ((checkGroup as any[]).length === 0) {
      return NextResponse.json({ message: "Group not found" }, { status: 404 });
    }

    const groupStatus = (checkGroup as any[])[0]?.status;

    if (groupStatus !== "PENDING") {
      return NextResponse.json(
        { message: `Group is already ${groupStatus}. Cannot approve again.` },
        { status: 400 },
      );
    }

    // ✅ FIXED: Use single quotes around the string value
    const updateResult = await executeQuery(
      "UPDATE studentgroup SET status = 'VERIFIED', groupPass = ? WHERE groupId = ?",
      [password, groupId],
    );

    console.log("Update result:", updateResult);

    const groupDetails = await executeQuery(
      "SELECT groupUsername, leaderEmail FROM studentgroup WHERE groupId = ?",
      [groupId],
    );

    const leaderEmail = (groupDetails as any[])[0]?.leaderEmail;
    const groupUsername = (groupDetails as any[])[0]?.groupUsername;
    // After successful approval, send email
    if (leaderEmail && groupUsername && password) {
      const emailResult = await sendGroupCredentials(
        leaderEmail,
        groupUsername,
        password,
      );
      console.log(`Email sent to ${leaderEmail}:`, emailResult.success);
    }
    return NextResponse.json({
      success: true,
      message: "Group approved successfully",
      leaderEmail: leaderEmail,
      groupUsername: groupUsername,
      password: password,
    });
  } catch (error) {
    console.error("ERROR DETAILS:", error);
    return NextResponse.json(
      { message: (error as Error).message, stack: (error as Error).stack },
      { status: 500 },
    );
  }
}
