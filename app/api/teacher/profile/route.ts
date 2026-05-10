// app/api/teacher/profile/route.ts
import { executeQuery } from "@/app/lib/db.server";
import { NextRequest, NextResponse } from "next/server";

// app/api/teacher/profile/route.ts - Add logging
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");
    
    console.log("=== TEACHER PROFILE API ===");
    console.log("Email received:", email);
    
    if (!email) {
      return NextResponse.json(
        { message: "Email not provided" },
        { status: 400 },
      );
    }
    
    const teacherDetails = await executeQuery(
      'SELECT teacherId, name, email, specialization, qualification, experience, role FROM teachers WHERE email = ?',
      [email],
    );
    
    console.log("Teacher query result:", teacherDetails);
    
    // Return the first object directly, not an array
    const teacher = Array.isArray(teacherDetails) && teacherDetails.length > 0 
      ? teacherDetails[0] 
      : null;
    
    console.log("Processed teacher object:", teacher);
    
    if (!teacher) {
      console.log("❌ Teacher not found");
      return NextResponse.json(
        { message: "Teacher not found" },
        { status: 404 },
      );
    }
    
    console.log("✅ Teacher found:", teacher.name);
    return NextResponse.json(teacher);
  } catch (error) {
    console.error("Error fetching teacher:", error);
    return NextResponse.json(
      { message: "Error in fetching teacher details", error: String(error) },
      { status: 500 },
    );
  }
}


// app/api/teacher/profile/route.ts - Complete PUT method

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, specialization, qualification, experience } = body;
    
    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 });
    }
    
    // Get current teacher info
    const currentTeacher = await executeQuery(
      `SELECT teacherId, name, role FROM teachers WHERE email = ?`,
      [email]
    );
    
    const teacherData = (currentTeacher as any[])[0];
    if (!teacherData) {
      return NextResponse.json({ message: "Teacher not found" }, { status: 404 });
    }
    
    const teacherId = teacherData.teacherId;
    const oldRole = teacherData.role;
    
    // Determine new role
    const newRole = determineRole(qualification, experience);
    
    // If role is not changing, just update
    if (oldRole === newRole) {
      await executeQuery(
        `UPDATE teachers 
         SET specialization = ?, qualification = ?, experience = ?
         WHERE email = ?`,
        [specialization, qualification, experience, email]
      );
      
      return NextResponse.json({
        success: true,
        message: "Profile updated successfully",
        roleChanged: false
      });
    }
    
    // ============================================
    // ROLE IS CHANGING - Need to reassign juries
    // ============================================
    
    // Step 1: Find all juries where this teacher is involved
    const affectedJuries = await executeQuery(
      `SELECT j.JURYID, j.SENIORID, j.JUNIORID, 
              s1.name as seniorName, s2.name as juniorName,
              COUNT(sg.GROUPID) as groupCount
       FROM jury j
       LEFT JOIN teachers s1 ON j.SENIORID = s1.teacherId
       LEFT JOIN teachers s2 ON j.JUNIORID = s2.teacherId
       LEFT JOIN studentgroup sg ON j.JURYID = sg.JURYID
       WHERE j.SENIORID = ? OR j.JUNIORID = ?
       GROUP BY j.JURYID`,
      [teacherId, teacherId]
    );
    
    if ((affectedJuries as any[]).length === 0) {
      // No juries affected - safe to update
      await executeQuery(
        `UPDATE teachers 
         SET specialization = ?, qualification = ?, experience = ?, role = ?
         WHERE email = ?`,
        [specialization, qualification, experience, newRole, email]
      );
      
      return NextResponse.json({
        success: true,
        message: `Profile updated. Role changed from ${oldRole} to ${newRole}.`,
        roleChanged: true,
        oldRole: oldRole,
        newRole: newRole
      });
    }
    
    // Step 2: Try to reassign each affected jury
    const reassignmentResults = [];
    let allReassigned = true;
    
    for (const jury of affectedJuries as any[]) {
      const result = await reassignJury(jury.JURYID, teacherId, oldRole, newRole);
      reassignmentResults.push(result);
      if (!result.success) {
        allReassigned = false;
      }
    }
    
    // Step 3: If all reassignments succeeded, update teacher role
    if (allReassigned) {
      await executeQuery(
        `UPDATE teachers 
         SET specialization = ?, qualification = ?, experience = ?, role = ?
         WHERE email = ?`,
        [specialization, qualification, experience, newRole, email]
      );
      
      return NextResponse.json({
        success: true,
        message: `Profile updated. Role changed from ${oldRole} to ${newRole}. ${reassignmentResults.length} jury/ies reassigned.`,
        roleChanged: true,
        reassignments: reassignmentResults
      });
    }
    
    // Step 4: Cannot reassign - block the update
    return NextResponse.json(
      { 
        message: `Cannot update role from ${oldRole} to ${newRole}. ${reassignmentResults.length} jury/ies could not be reassigned. Please contact admin.`,
        reassignments: reassignmentResults,
        blocked: true
      },
      { status: 400 }
    );
    
  } catch (error) {
    console.error("Error updating teacher:", error);
    return NextResponse.json(
      { message: "Error updating teacher profile" },
      { status: 500 }
    );
  }
}

// Helper function to reassign a single jury
async function reassignJury(juryId: number, teacherId: number, oldRole: string, newRole: string) {
  try {
    // Get current jury details
    const jury = await executeQuery(
      `SELECT SENIORID, JUNIORID FROM jury WHERE JURYID = ?`,
      [juryId]
    );
    
    const seniorId = (jury as any[])[0]?.SENIORID;
    const juniorId = (jury as any[])[0]?.JUNIORID;
    
    // Determine which position the teacher holds
    const isSenior = seniorId === teacherId;
    const isJunior = juniorId === teacherId;
    
    // Case 1: Teacher was senior, now becoming junior
    if (isSenior && newRole === 'junior') {
      // Need to find a new senior teacher (same specialization, lowest load)
      const projectDomains = await executeQuery(
        `SELECT DISTINCT p.DOMAIN 
         FROM project p
         JOIN studentgroup sg ON p.GROUPID = sg.GROUPID
         WHERE sg.JURYID = ?`,
        [juryId]
      );
      
      const domains = (projectDomains as any[]).map(d => d.DOMAIN);
      
      // Find available senior teacher
      let availableSenior = null;
      for (const domain of domains) {
        const teachers = await executeQuery(
          `SELECT teacherId, name, 
              (SELECT COUNT(*) FROM jury WHERE SENIORID = teacherId OR JUNIORID = teacherId) as currentLoad
           FROM teachers 
           WHERE role = 'senior' 
             AND teacherId != ?
             AND specialization LIKE CONCAT('%', ?, '%')
           ORDER BY currentLoad ASC
           LIMIT 1`,
          [teacherId, domain]
        );
        
        if ((teachers as any[]).length > 0) {
          availableSenior = (teachers as any[])[0];
          break;
        }
      }
      
      if (!availableSenior) {
        return { 
          juryId, 
          success: false, 
          message: `No available senior teacher found for reassignment` 
        };
      }
      
      // Update jury with new senior
      await executeQuery(
        `UPDATE jury SET SENIORID = ? WHERE JURYID = ?`,
        [availableSenior.teacherId, juryId]
      );
      
      return { 
        juryId, 
        success: true, 
        message: `Reassigned to senior: ${availableSenior.name}` 
      };
    }
    
    // Case 2: Teacher was junior, now becoming senior
    if (isJunior && newRole === 'senior') {
      // Find available junior teacher
      const projectDomains = await executeQuery(
        `SELECT DISTINCT p.DOMAIN 
         FROM project p
         JOIN studentgroup sg ON p.GROUPID = sg.GROUPID
         WHERE sg.JURYID = ?`,
        [juryId]
      );
      
      const domains = (projectDomains as any[]).map(d => d.DOMAIN);
      
      let availableJunior = null;
      for (const domain of domains) {
        const teachers = await executeQuery(
          `SELECT teacherId, name, 
              (SELECT COUNT(*) FROM jury WHERE SENIORID = teacherId OR JUNIORID = teacherId) as currentLoad
           FROM teachers 
           WHERE role = 'junior' 
             AND teacherId != ?
             AND specialization LIKE CONCAT('%', ?, '%')
           ORDER BY currentLoad ASC
           LIMIT 1`,
          [teacherId, domain]
        );
        
        if ((teachers as any[]).length > 0) {
          availableJunior = (teachers as any[])[0];
          break;
        }
      }
      
      if (!availableJunior) {
        return { 
          juryId, 
          success: false, 
          message: `No available junior teacher found for reassignment` 
        };
      }
      
      // Update jury with new junior
      await executeQuery(
        `UPDATE jury SET JUNIORID = ? WHERE JURYID = ?`,
        [availableJunior.teacherId, juryId]
      );
      
      return { 
        juryId, 
        success: true, 
        message: `Reassigned to junior: ${availableJunior.name}` 
      };
    }
    
    return { juryId, success: true, message: "No reassignment needed" };
    
  } catch (error) {
    console.error(`Error reassigning jury ${juryId}:`, error);
    return { juryId, success: false, message: "Error during reassignment" };
  }
}

// Role determination helper
function determineRole(qualification: string, experience: number): 'senior' | 'junior' {
  const isPhD = qualification.toLowerCase().includes('phd') || 
                qualification.toLowerCase().includes('doctorate');
  const hasExperience = experience >= 5;
  
  if (isPhD || hasExperience) {
    return 'senior';
  }
  return 'junior';
}