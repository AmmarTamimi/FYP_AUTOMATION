import { NextResponse, NextRequest } from "next/server";
import { executeQuery, getConnection } from "@/app/lib/db.server";

export async function POST(req: NextRequest) {
  let connection;
  
  try {
    const body = await req.json();
    const teacherId = body.teacherId;
    const reason = body.reason;

    console.log("=== REJECT TEACHER DEBUG ===");
    console.log("Teacher ID:", teacherId);
    console.log("Reason:", reason);

    if (!teacherId) {
      return NextResponse.json(
        { message: "Teacher ID is required" },
        { status: 400 }
      );
    }

    if (!reason || !reason.trim()) {
      return NextResponse.json(
        { message: "Rejection reason is required" },
        { status: 400 }
      );
    }

    // Check if teacher exists
    const checkTeacher = await executeQuery(
      `SELECT TeacherId, name, email, STATUS 
       FROM teachers 
       WHERE TeacherId = ?`,
      [teacherId],
    );

    if ((checkTeacher as any[]).length === 0) {
      return NextResponse.json(
        { message: "Teacher not found" },
        { status: 404 }
      );
    }

    const teacherData = (checkTeacher as any[])[0];
    const teacherStatus = teacherData.STATUS;
    const teacherName = teacherData.name;
    const teacherEmail = teacherData.email;

    if (teacherStatus !== "PENDING") {
      return NextResponse.json(
        { message: `Teacher is already ${teacherStatus}. Cannot reject.` },
        { status: 400 },
      );
    }

    // ============================================
    // START TRANSACTION
    // ============================================
    connection = await getConnection();
    await connection.beginTransaction();
    console.log("📦 Transaction started");

    // Update teacher status to REJECTED
    await connection.execute(
      `UPDATE teachers 
       SET STATUS = 'REJECTED'
       WHERE TeacherId = ?`,
      [teacherId],
    );

    console.log(`✅ Teacher ${teacherId} rejected`);

    // Commit transaction
    await connection.commit();
    console.log("✅ Transaction committed");

    return NextResponse.json({
      success: true,
      message: "Teacher rejected successfully",
      data: {
        teacherId: teacherId,
        name: teacherName,
        email: teacherEmail,
        reason: reason.trim()
      }
    });
    
  } catch (error) {
    if (connection) {
      await connection.rollback();
      console.error("❌ Transaction rolled back");
    }
    console.error("ERROR DETAILS:", error);
    return NextResponse.json(
      { 
        message: "Failed to reject teacher",
        error: (error as Error).message 
      },
      { status: 500 },
    );
  } finally {
    if (connection) connection.release();
  }
}