// app/api/admin/assign-jury/route.ts
import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/app/lib/db.server";

export async function POST(req: NextRequest) {
    try {
        const { groupId } = await req.json();
        
        console.log(`=== Assigning Jury for Group ID: ${groupId} ===`);
        
        // Step 1: Get project domains for this group
        console.log("Step 1: Getting project domains...");
        const projectDomains = await executeQuery(
            `SELECT DISTINCT p.DOMAIN 
             FROM PROJECT p
             WHERE p.GROUPID = ?`,
            [groupId]
        );
        
        console.log("Project domains query result:", projectDomains);
        
        const domains = (projectDomains as any[]).map(d => d.DOMAIN);
        
        if (domains.length === 0) {
            console.log("No domains found!");
            return NextResponse.json(
                { message: "No domains found for this project" },
                { status: 400 }
            );
        }
        
        console.log("Project domains:", domains);
        
        // Step 2: Find all available teachers
        console.log("Step 2: Finding available teachers...");
        let availableTeachers: any[] = [];
        
        for (const domain of domains) {
            console.log(`Searching for teachers with specialization: ${domain}`);
            const teachers = await executeQuery(
                `SELECT 
                    t.TEACHERID,
                    t.NAME,
                    t.EMAIL,
                    t.SPECIALIZATION,
                    t.QUALIFICATION,
                    t.EXPERIENCE,
                    t.ROLE,
                    0 as CURRENT_LOAD
                 FROM TEACHERS t
                 WHERE t.SPECIALIZATION LIKE CONCAT('%', ?, '%')`,
                [domain]
            );
            
            console.log(`Found ${(teachers as any[]).length} teachers for domain ${domain}:`, teachers);
            availableTeachers.push(...(teachers as any[]));
        }
        
        console.log("All available teachers before dedup:", availableTeachers);
        
        // Remove duplicates
        const teacherMap = new Map();
        for (const teacher of availableTeachers) {
            if (!teacherMap.has(teacher.TEACHERID)) {
                // Calculate teacher's current load
                const loadResult = await executeQuery(
                    `SELECT COUNT(*) as total FROM JURY 
                     WHERE SENIORID = ? OR JUNIORID = ?`,
                    [teacher.TEACHERID, teacher.TEACHERID]
                );
                const totalLoad = (loadResult as any[])[0]?.total || 0;
                console.log(`Teacher ${teacher.NAME} current load: ${totalLoad}`);
                
                if (totalLoad < 10) {
                    teacherMap.set(teacher.TEACHERID, {
                        ...teacher,
                        CURRENT_LOAD: totalLoad
                    });
                }
            }
        }
        
        const uniqueTeachers = Array.from(teacherMap.values());
        console.log("Unique teachers available:", uniqueTeachers.map(t => ({ name: t.NAME, role: t.ROLE, load: t.CURRENT_LOAD })));
        
        if (uniqueTeachers.length < 2) {
            console.log("Not enough teachers! Need at least 2, found:", uniqueTeachers.length);
            return NextResponse.json(
                { message: `Not enough teachers available. Found ${uniqueTeachers.length}, need at least 2.` },
                { status: 400 }
            );
        }
        
        // Step 3: Separate senior and junior teachers
        console.log("Step 3: Separating senior and junior teachers...");
        const seniorCandidates = uniqueTeachers.filter(t => t.ROLE === 'senior');
        const juniorCandidates = uniqueTeachers.filter(t => t.ROLE === 'junior');
        
        console.log("Senior candidates:", seniorCandidates.map(t => t.NAME));
        console.log("Junior candidates:", juniorCandidates.map(t => t.NAME));
        
        // Step 4: Select best senior
        let seniorTeacher;
        if (seniorCandidates.length > 0) {
            seniorTeacher = seniorCandidates.sort((a, b) => a.CURRENT_LOAD - b.CURRENT_LOAD)[0];
        } else {
            // If no senior, use teacher with highest experience
            seniorTeacher = uniqueTeachers.sort((a, b) => b.EXPERIENCE - a.EXPERIENCE)[0];
        }
        
        console.log("Selected senior teacher:", seniorTeacher?.NAME);
        
        // Step 5: Select best junior (different from senior)
        let juniorTeacher;
        const otherTeachers = uniqueTeachers.filter(t => t.TEACHERID !== seniorTeacher.TEACHERID);
        
        if (juniorCandidates.length > 0) {
            juniorTeacher = juniorCandidates
                .filter(t => t.TEACHERID !== seniorTeacher.TEACHERID)
                .sort((a, b) => a.CURRENT_LOAD - b.CURRENT_LOAD)[0];
        }
        
        if (!juniorTeacher && otherTeachers.length > 0) {
            juniorTeacher = otherTeachers.sort((a, b) => a.CURRENT_LOAD - b.CURRENT_LOAD)[0];
        }
        
        console.log("Selected junior teacher:", juniorTeacher?.NAME);
        
        if (!juniorTeacher) {
            console.log("Cannot find a junior teacher!");
            return NextResponse.json(
                { message: "Cannot find a junior teacher" },
                { status: 400 }
            );
        }
        
        // Step 6: Find or create jury
        console.log("Step 6: Finding or creating jury...");
        let jury = await executeQuery(
            `SELECT JURYID, NUMOFPROJECTSASSIGNED
             FROM JURY 
             WHERE SENIORID = ? AND JUNIORID = ? AND NUMOFPROJECTSASSIGNED < 10`,
            [seniorTeacher.TEACHERID, juniorTeacher.TEACHERID]
        );
        
        let juryId: number;
        
        if ((jury as any[]).length === 0) {
            console.log("Creating new jury...");
            const newJury = await executeQuery(
                `INSERT INTO JURY (SENIORID, JUNIORID, NUMOFPROJECTSASSIGNED) 
                 VALUES (?, ?, 0)`,
                [seniorTeacher.TEACHERID, juniorTeacher.TEACHERID]
            );
            juryId = (newJury as any).insertId;
            console.log("New jury created with ID:", juryId);
        } else {
            juryId = (jury as any[])[0].JURYID;
            console.log("Existing jury found with ID:", juryId);
        }
        
        // Step 7: Update jury's project count
        console.log("Step 7: Updating jury project count...");
        await executeQuery(
            `UPDATE JURY SET NUMOFPROJECTSASSIGNED = NUMOFPROJECTSASSIGNED + 1 
             WHERE JURYID = ? AND NUMOFPROJECTSASSIGNED < 10`,
            [juryId]
        );
        
        // Step 8: Update student group with jury ID
        console.log("Step 8: Updating student group with jury ID...");
        await executeQuery(
            `UPDATE STUDENTGROUP SET JURYID = ? WHERE GROUPID = ?`,
            [juryId, groupId]
        );
        
        console.log("Jury assignment completed successfully!");
        
        return NextResponse.json({
            success: true,
            message: "Jury assigned successfully",
            data: {
                juryId: juryId,
                seniorTeacher: seniorTeacher.NAME,
                seniorEmail: seniorTeacher.EMAIL,
                juniorTeacher: juniorTeacher.NAME,
                juniorEmail: juniorTeacher.EMAIL,
                domains: domains
            }
        });
        
    } catch (error) {
        console.error("Jury assignment error DETAILS:", error);
        return NextResponse.json(
            { message: "Error assigning jury", error: String(error) },
            { status: 500 }
        );
    }
}