// app/api/teacher/groups/route.ts
import { executeQuery } from "@/app/lib/db.server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const teacherId = searchParams.get("teacherId");
    
    if (!teacherId) {
      return NextResponse.json(
        { message: "teacher ID not provided" },
        { status: 400 },
      );
    }
    
    // Get the jury IDs where teacher is senior or junior
    const juryRes = await executeQuery(
      'SELECT JURYID FROM JURY WHERE SENIORID = ? OR JUNIORID = ?',
      [teacherId, teacherId]
    );
    
    // If no jury found, return empty array
    if (!Array.isArray(juryRes) || juryRes.length === 0) {
      return NextResponse.json([]);
    }
    
    // Extract jury IDs
    const juryIds = juryRes.map((j: any) => j.JURYID);
    
    // Get groups for those juries
    const placeholders = juryIds.map(() => '?').join(',');
    const studentGroups = await executeQuery(
      `SELECT * FROM STUDENTGROUP WHERE JURYID IN (${placeholders})`,
      juryIds
    );
    
    return NextResponse.json(studentGroups);
    
  } catch (error) {
    console.error("Error fetching groups:", error);
    return NextResponse.json(
      { message: "Error in fetching groups" },
      { status: 500 },
    );
  }
}