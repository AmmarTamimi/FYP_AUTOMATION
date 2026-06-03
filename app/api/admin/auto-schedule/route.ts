// app/api/admin/auto-schedule/route.ts (Fixed version)
import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/app/lib/db.server";
import { sendTeacherScheduleUpdate } from "@/app/lib/email";

interface TeacherAssignment {
  groupId: number;
  groupUsername: string;
  projectTitle: string;
  date: string;
  time: string;
  venue: string;
  scheduleId: number;
}

export async function POST(req: NextRequest) {
  try {
    const { startDate, endDate } = await req.json();

    console.log("=== AUTO SCHEDULING STARTED ===");
    console.log(`Date Range: ${startDate} to ${endDate}`);

    // Step 1: Get all verified groups with their assigned juries AND project titles
    const groups = await executeQuery(
      `SELECT DISTINCT
        sg.groupId, 
        sg.groupUsername, 
        sg.juryId, 
        sg.leaderEmail,
        COALESCE(p.PROJECTTITLE, 'No Project Title') as projectTitle
       FROM studentgroup sg
       LEFT JOIN project p ON sg.groupId = p.GROUPID
       WHERE sg.status = 'VERIFIED' 
         AND sg.juryId IS NOT NULL
         AND sg.groupId NOT IN (SELECT groupId FROM schedule)
       ORDER BY sg.groupId`,
      []
    );

    if ((groups as any[]).length === 0) {
      return NextResponse.json({
        success: false,
        message: "No unassigned verified groups found",
      });
    }

    // Step 2: Get all juries with their teacher IDs
    const juries = await executeQuery(
      `SELECT juryId, seniorId, juniorId FROM jury`,
      []
    );

    const juryMap = new Map();
    for (const jury of juries as any[]) {
      juryMap.set(jury.juryId, {
        seniorId: jury.seniorId,
        juniorId: jury.juniorId,
        teachers: [jury.seniorId, jury.juniorId].filter((id) => id !== null),
      });
    }

    // Step 3: Get all venues
    const venues = await executeQuery(
      `SELECT VenueId, name, capacity FROM venue ORDER BY VenueId`,
      []
    );

    // Step 4: Generate dates
    const dates = [];
    let currentDate = new Date(startDate);
    const endDateTime = new Date(endDate);
    while (currentDate <= endDateTime) {
      dates.push(currentDate.toISOString().split("T")[0]);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Step 5: Get all time slots
    const timeSlots = await executeQuery(
      `SELECT slotNum, startTime, endTime FROM timeslot ORDER BY startTime`,
      []
    );

    // ✅ FIX 1: Use lowercase 'number'
    const teacherAssignments = new Map<number, TeacherAssignment[]>();

    // Step 6: Track occupied resources using Set
    const occupiedVenueSlot = new Set();
    const occupiedTeacherSlot = new Set();
    const dailyGroupCount = new Map();
    dates.forEach((date) => dailyGroupCount.set(date, 0));

    // Load existing schedules from database
    console.log("Loading existing schedules from database...");
    const existingSchedules = await executeQuery(
      `SELECT s.dateVal, s.slotNum, s.venueId, s.juryId
       FROM schedule s
       WHERE s.dateVal BETWEEN ? AND ?`,
      [startDate, endDate]
    );

    // Populate occupied sets with existing schedules
    for (const schedule of existingSchedules as any[]) {
      const venueKey = `${schedule.venueId}-${schedule.dateVal}-${schedule.slotNum}`;
      occupiedVenueSlot.add(venueKey);
      
      const jury = juryMap.get(schedule.juryId);
      if (jury) {
        for (const teacherId of jury.teachers) {
          const teacherKey = `${teacherId}-${schedule.dateVal}-${schedule.slotNum}`;
          occupiedTeacherSlot.add(teacherKey);
          console.log(`📌 Existing: Teacher ${teacherId} occupied on ${schedule.dateVal} at slot ${schedule.slotNum}`);
        }
      }
      
      dailyGroupCount.set(schedule.dateVal, (dailyGroupCount.get(schedule.dateVal) || 0) + 1);
    }

    console.log(`Loaded ${existingSchedules.length} existing schedules`);
    console.log(`Occupied venue slots: ${occupiedVenueSlot.size}`);
    console.log(`Occupied teacher slots: ${occupiedTeacherSlot.size}`);

    // Calculate target per day including existing schedules
    const totalGroupsToSchedule = (groups as any[]).length;
    const totalExistingGroups = (existingSchedules as any[]).length;
    const targetPerDay = Math.ceil((totalGroupsToSchedule + totalExistingGroups) / dates.length);

    const assignedGroups = [];
    const failedGroups = [];
    const totalGroups = totalGroupsToSchedule;

    // Step 7: Smart assignment with teacher-level conflict prevention
    for (const group of groups as any[]) {
      let assigned = false;
      const jury = juryMap.get(group.juryId);

      if (!jury) {
        console.log(`No jury found for group ${group.groupUsername}`);
        failedGroups.push(group);
        continue;
      }

      const juryTeachers = jury.teachers;
      console.log(`\n=== Scheduling group ${group.groupUsername} (Jury ${group.juryId}) ===`);
      console.log(`Teachers in this jury: ${juryTeachers.join(", ")}`);

      const sortedDates = [...dates].sort(
        (a, b) => (dailyGroupCount.get(a) || 0) - (dailyGroupCount.get(b) || 0)
      );

      for (const date of sortedDates) {
        if (assigned) break;
        if ((dailyGroupCount.get(date) || 0) >= targetPerDay + 1) continue;

        for (const slot of timeSlots as any[]) {
          if (assigned) break;

          for (const venue of venues as any[]) {
            const venueKey = `${venue.VenueId}-${date}-${slot.slotNum}`;

            if (occupiedVenueSlot.has(venueKey)) continue;

            let teacherAvailable = true;
            let busyTeacher = null;

            for (const teacherId of juryTeachers) {
              const teacherKey = `${teacherId}-${date}-${slot.slotNum}`;
              if (occupiedTeacherSlot.has(teacherKey)) {
                teacherAvailable = false;
                busyTeacher = teacherId;
                break;
              }
            }

            if (!teacherAvailable) {
              console.log(`  ❌ Teacher ${busyTeacher} is already occupied on ${date} at slot ${slot.slotNum}`);
              continue;
            }

            const dayName = new Date(date).toLocaleDateString("en-US", {
              weekday: "long",
            });

            const result = await executeQuery(
              `INSERT INTO schedule (day, dateVal, juryId, slotNum, groupId, venueId) 
               VALUES (?, ?, ?, ?, ?, ?)`,
              [dayName, date, group.juryId, slot.slotNum, group.groupId, venue.VenueId]
            );

            occupiedVenueSlot.add(venueKey);

            // ✅ FIX 3: Push assignment for each teacher
            const newAssignment: TeacherAssignment = {
              groupId: group.groupId,
              groupUsername: group.groupUsername,
              projectTitle: group.projectTitle || "No Project Title",
              date: date,
              time: `${slot.startTime} - ${slot.endTime}`,
              venue: venue.name,
              scheduleId: (result as any).insertId
            };

            for (const teacherId of juryTeachers) {
              const teacherKey = `${teacherId}-${date}-${slot.slotNum}`;
              occupiedTeacherSlot.add(teacherKey);
              
              // ✅ Add assignment to teacher's list
              if (!teacherAssignments.has(teacherId)) {
                teacherAssignments.set(teacherId, []);
              }
              teacherAssignments.get(teacherId)!.push(newAssignment);
              
              console.log(`  ✅ Teacher ${teacherId} marked as occupied on ${date} at slot ${slot.slotNum}`);
            }

            dailyGroupCount.set(date, (dailyGroupCount.get(date) || 0) + 1);

            assignedGroups.push({
              groupId: group.groupId,
              groupUsername: group.groupUsername,
              date: date,
              day: dayName,
              startTime: slot.startTime,
              endTime: slot.endTime,
              venue: venue.name,
              scheduleId: (result as any).insertId,
            });

            assigned = true;
            console.log(`✅ SUCCESS: Assigned ${group.groupUsername} to ${date} at ${slot.startTime} in ${venue.name}`);

            break;
          }
        }
      }

      if (!assigned) {
        failedGroups.push(group);
        console.log(`❌ FAILED: Could not assign group ${group.groupUsername}`);
      }
    }

    // ✅ AFTER ALL SCHEDULING IS DONE, SEND EMAIL NOTIFICATIONS TO TEACHERS
    console.log("\n=== SENDING TEACHER NOTIFICATIONS ===");
    
    for (const [teacherId, assignments] of teacherAssignments) {
      try {
        const teacherInfo = await executeQuery(
          `SELECT name, email FROM teachers WHERE teacherId = ?`,
          [teacherId]
        );
        
        const teacherName = (teacherInfo as any[])[0]?.name;
        const teacherEmail = (teacherInfo as any[])[0]?.email;
        
        if (teacherEmail && teacherName && assignments.length > 0) {
          const scheduleDetails = assignments.map((a: TeacherAssignment) => ({
            groupName: a.groupUsername,
            projectTitle: a.projectTitle,
            date: new Date(a.date).toLocaleDateString(),
            time: a.time,
            venue: a.venue
          }));
          
          await sendTeacherScheduleUpdate(
            teacherEmail,
            teacherName,
            scheduleDetails
          );
          
          console.log(`✅ Email sent to ${teacherName} (${teacherEmail}) for ${assignments.length} new assignment(s)`);
        }
      } catch (emailError) {
        console.error(`❌ Failed to send email to teacher ${teacherId}:`, emailError);
      }
    }

    const assignedCount = assignedGroups.length;

    return NextResponse.json({
      success: true,
      message: `Scheduling complete: ${assignedCount} groups scheduled, ${failedGroups.length} groups could not be scheduled`,
      summary: {
        totalGroups,
        assignedCount,
        unassignedCount: failedGroups.length,
        assignedGroups,
        failedGroups: failedGroups.map((g) => g.groupUsername),
      },
    });
  } catch (error) {
    console.error("Auto scheduling error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error during auto scheduling",
        error: String(error),
      },
      { status: 500 }
    );
  }
}