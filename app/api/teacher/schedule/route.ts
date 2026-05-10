// app/api/teacher/schedule/route.ts
import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/app/lib/db.server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const teacherId = searchParams.get('teacherId');
    
    console.log("=== TEACHER SCHEDULE API START ===");
    console.log("Teacher ID received:", teacherId);
    
    if (!teacherId) {
      return NextResponse.json(
        { message: "Teacher ID not provided" },
        { status: 400 }
      );
    }
    
    // Get all juries where this teacher is senior or junior
    const juries = await executeQuery(
      `SELECT juryId FROM jury WHERE seniorId = ? OR juniorId = ?`,
      [teacherId, teacherId]
    );
    
    console.log("Juries found:", juries);
    
    if ((juries as any[]).length === 0) {
      return NextResponse.json([]);
    }
    
    const juryIds = (juries as any[]).map(j => j.juryId);
    const placeholders = juryIds.map(() => '?').join(',');
    
    // Get unique schedules for these juries (use DISTINCT to avoid duplicates)
    const schedules = await executeQuery(
      `SELECT DISTINCT
        s.ScheduleId,
        s.dateVal,
        s.day,
        ts.startTime,
        ts.endTime,
        v.name as venue,
        v.capacity as venueCapacity,
        sg.groupId,
        sg.groupUsername,
        sg.leaderEmail,
        COALESCE(p.PROJECTTITLE, 'No Project Title') as projectTitle,
        sg.status
       FROM schedule s
       JOIN timeslot ts ON s.slotNum = ts.slotNum
       JOIN venue v ON s.venueId = v.VenueId
       JOIN studentgroup sg ON s.groupId = sg.groupId
       LEFT JOIN project p ON sg.groupId = p.GROUPID
       WHERE s.juryId IN (${placeholders})
       ORDER BY s.dateVal, ts.startTime`,
      juryIds
    );
    
    console.log("Unique schedules found:", (schedules as any[]).length);
    
    return NextResponse.json(schedules);
    
  } catch (error) {
    console.error("Error fetching teacher schedule:", error);
    return NextResponse.json(
      { message: "Error fetching schedule", error: String(error) },
      { status: 500 }
    );
  }
}