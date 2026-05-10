// app/api/teacher/groups/route.ts
import { executeQuery } from "@/app/lib/db.server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const teacherId = searchParams.get("teacherId");
    
    console.log("=== TEACHER GROUPS API ===");
    console.log("Teacher ID received:", teacherId);
    
    if (!teacherId) {
      return NextResponse.json(
        { message: "teacher ID not provided" },
        { status: 400 },
      );
    }
    
    // Get the jury IDs where teacher is senior or junior
    const juryRes = await executeQuery(
      'SELECT juryId FROM jury WHERE seniorId = ? OR juniorId = ?',
      [teacherId, teacherId]
    );
    
    console.log("Jury query result:", juryRes);
    
    // If no jury found, return empty array
    if (!Array.isArray(juryRes) || juryRes.length === 0) {
      console.log("No juries found for teacher");
      return NextResponse.json([]);
    }
    
    // Extract jury IDs
    const juryIds = juryRes.map((j: any) => j.juryId);
    console.log("Jury IDs:", juryIds);
    
    // Get groups for those juries
    const placeholders = juryIds.map(() => '?').join(',');
    const studentGroups = await executeQuery(
      `SELECT sg.groupId, sg.juryId, sg.groupUsername, sg.leaderEmail, sg.status, sg.supervisorEmail
       FROM studentgroup sg
       WHERE sg.juryId IN (${placeholders})`,
      juryIds
    );
    
    console.log("Groups found:", studentGroups);
    console.log("Number of groups:", (studentGroups as any[]).length);
    
    return NextResponse.json(studentGroups);
    
  } catch (error) {
    console.error("Error fetching groups:", error);
    return NextResponse.json(
      { message: "Error in fetching groups" },
      { status: 500 },
    );
  }
}