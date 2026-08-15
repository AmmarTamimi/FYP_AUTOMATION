import { NextResponse, NextRequest } from "next/server";
import { executeQuery } from "@/app/lib/db.server";

export async function GET(req: NextRequest) {
  try {
    console.log("📋 Fetching pending teachers...");

    // Fetch teachers with PENDING status
    const pendingTeachers = await executeQuery(
      `SELECT 
        TeacherId,
        email,
        username,
        name,
        specialization,
        qualification,
        experience,
        role,
        deptId,
        designation,
        STATUS
      FROM teachers 
      WHERE STATUS = 'PENDING'`,
      []
    );

    console.log(`✅ Found ${(pendingTeachers as any[]).length} pending teachers`);

    return NextResponse.json(pendingTeachers);
  } catch (error) {
    console.error("❌ Error fetching pending teachers:", error);
    return NextResponse.json(
      { message: "Failed to fetch pending teachers" },
      { status: 500 }
    );
  }
}