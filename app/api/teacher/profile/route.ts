// app/api/teacher/profile/route.ts
import { executeQuery } from "@/app/lib/db.server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");
    
    if (!email) {
      return NextResponse.json(
        { message: "Email not provided" },
        { status: 400 },
      );
    }
    
    const teacherDetails = await executeQuery(
      'SELECT * FROM TEACHERS WHERE EMAIL = ?',
      [email],
    );
    
    // Return the first object directly, not an array
    const teacher = Array.isArray(teacherDetails) && teacherDetails.length > 0 
      ? teacherDetails[0] 
      : null;
    
    if (!teacher) {
      return NextResponse.json(
        { message: "Teacher not found" },
        { status: 404 },
      );
    }
    
    return NextResponse.json(teacher);
  } catch (error) {
    console.error("Error fetching teacher:", error);
    return NextResponse.json(
      { message: "Error in fetching teacher details", error: String(error) },
      { status: 500 },
    );
  }
}