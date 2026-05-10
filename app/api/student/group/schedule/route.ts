// app/api/student/group/schedule/route.ts
import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/app/lib/db.server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const groupId = searchParams.get('groupId');
    
    if (!groupId) {
      return NextResponse.json(
        { message: "Group ID not provided" },
        { status: 400 }
      );
    }
    
    const schedule = await executeQuery(
      `SELECT 
        s.ScheduleId,
        s.day,
        s.dateVal,
        ts.startTime,
        ts.endTime,
        ts.slotNum,
        v.name as venue,
        v.capacity as venueCapacity,
        j.juryId,
        t1.name as seniorName,
        t2.name as juniorName
       FROM schedule s
       JOIN timeslot ts ON s.slotNum = ts.slotNum
       JOIN venue v ON s.venueId = v.VenueId
       LEFT JOIN jury j ON s.juryId = j.juryId
       LEFT JOIN teachers t1 ON j.seniorId = t1.teacherId
       LEFT JOIN teachers t2 ON j.juniorId = t2.teacherId
       WHERE s.groupId = ?
       ORDER BY s.dateVal, ts.startTime`,
      [groupId]
    );
    
    if ((schedule as any[]).length === 0) {
      return NextResponse.json(null);
    }
    
    // Format the schedule data
    const formattedSchedule = (schedule as any[]).map(s => ({
      scheduleId: s.ScheduleId,
      day: s.day,
      date: s.dateVal,
      startTime: s.startTime,
      endTime: s.endTime,
      venue: s.venue,
      venueCapacity: s.venueCapacity,
      juryId: s.juryId,
      seniorName: s.seniorName,
      juniorName: s.juniorName
    }));
    
    return NextResponse.json(formattedSchedule);
    
  } catch (error) {
    console.error("Error fetching schedule:", error);
    return NextResponse.json(
      { message: "Error fetching schedule", error: String(error) },
      { status: 500 }
    );
  }
}