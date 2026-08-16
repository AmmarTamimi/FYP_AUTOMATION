import { NextResponse, NextRequest } from "next/server";
import { executeQuery, getConnection } from "@/app/lib/db.server";
import { sendTeacherCredentials } from "@/app/lib/email";

export async function POST(req: NextRequest) {
  let connection;
  
  try {
    const body = await req.json();
    const teacherId = body.teacherId;

    console.log("=== APPROVE TEACHER DEBUG ===");
    console.log("Teacher ID:", teacherId);

    if (!teacherId) {
      return NextResponse.json(
        { message: "Teacher ID is required" },
        { status: 400 }
      );
    }

    // Check if teacher exists and is pending
    const checkTeacher = await executeQuery(
      `SELECT TeacherId, name, email, STATUS, role, password as originalPassword
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
    const teacherRole = teacherData.role || "junior";
    const originalPassword = teacherData.originalPassword;

    if (teacherStatus !== "PENDING") {
      return NextResponse.json(
        { message: `Teacher is already ${teacherStatus}. Cannot approve again.` },
        { status: 400 },
      );
    }

    // Generate password if not already set
    const username = teacherData.username || 
      `${teacherName.toLowerCase().replace(/\s/g, '_')}_${Date.now().toString().slice(-4)}`;

      
    // ✅ Use the original password if it exists, otherwise generate one
    let password = originalPassword;
    let isGenerated = false;
    
    if (!password || password.length < 6) {
      // If no password or too short, generate one
      password = Math.random().toString(36).slice(-8);
      isGenerated = true;
      console.log(`⚠️ Generated new password for ${teacherName}`);
    } else {
      console.log(`✅ Using existing password for ${teacherName}`);
    };

    // ============================================
    // START TRANSACTION
    // ============================================
    connection = await getConnection();
    await connection.beginTransaction();
    console.log("📦 Transaction started");

    // Update teacher status to ACTIVE
    await connection.execute(
      `UPDATE teachers 
       SET STATUS = 'ACTIVE',
           username = ?,
           password = ?
       WHERE TeacherId = ?`,
      [username, password, teacherId],
    );

    console.log(`✅ Teacher ${teacherId} approved`);

    // Commit transaction
    await connection.commit();
    console.log("✅ Transaction committed");

    // ============================================
    // Send email (outside transaction)
    // ============================================
    let emailSent = false;
    let emailError = null;

    try {
      if (teacherEmail && username && password) {
        const emailResult = await sendTeacherCredentials(
          teacherEmail,
          teacherName,
          username,
          password,
          teacherRole
        );
        emailSent = emailResult.success;
        emailError = emailResult.error;
        console.log(`📧 Email sent to ${teacherEmail}: ${emailSent ? 'SUCCESS' : 'FAILED'}`);
      }
    } catch (emailErr) {
      console.error("Email sending error:", emailErr);
      emailError = emailErr;
    }

    // Get updated teacher data
    const updatedTeacher = await executeQuery(
      `SELECT TeacherId, name, email, username, STATUS, designation, specialization, role
       FROM teachers 
       WHERE TeacherId = ?`,
      [teacherId],
    );

    return NextResponse.json({
      success: true,
      message: "Teacher approved successfully",
      data: {
        teacher: (updatedTeacher as any[])[0],
        credentials: {
          username: username,
          password: password
        },
        emailSent: emailSent,
        emailError: emailError
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
        message: "Failed to approve teacher",
        error: (error as Error).message 
      },
      { status: 500 },
    );
  } finally {
    if (connection) connection.release();
  }
}