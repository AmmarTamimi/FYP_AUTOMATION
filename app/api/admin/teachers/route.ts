import { NextResponse, NextRequest } from "next/server";
import { executeQuery } from "@/app/lib/db.server";

// Helper function to determine teacher level
function determineTeacherLevel(qualification: string, experience: number): 'senior' | 'junior' {
    // Senior criteria: PhD OR 5+ years experience
    const isPhD = qualification.toLowerCase().includes('phd') || 
                  qualification.toLowerCase().includes('doctorate');
    const hasExperience = experience >= 5;
    
    if (isPhD || hasExperience) {
        return 'senior';
    }
    return 'junior';
}

export async function GET(req: NextRequest){
    try {
       const teachers = await executeQuery('SELECT * FROM TEACHERS');
       return NextResponse.json(teachers);
    } catch (error) {
        return NextResponse.json({message: 'Error in getting teachers'},{status: 500})
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { name, email, department, specialization, qualification, experience, role } = body;

        // ✅ Validate required fields
        if (!name || !email || !department) {
            return NextResponse.json(
                { message: 'Name, email, and department are required' },
                { status: 400 }
            );
        }

        // ✅ Determine role automatically based on qualification and experience
        const experienceNum = parseInt(experience);
        const autoRole = determineTeacherLevel(qualification, experienceNum);
        
        console.log(`Teacher ${name}: Qualification: ${qualification}, Experience: ${experienceNum} years → Role: ${autoRole}`);

        // ✅ Check for duplicate teacher (by email or name)
        const existingTeacher = await executeQuery(
            'SELECT TEACHERID, NAME, EMAIL FROM TEACHERS WHERE EMAIL = ? OR NAME = ?',
            [email, name]
        );

        if (Array.isArray(existingTeacher) && existingTeacher.length > 0) {
            const existing = (existingTeacher as any[])[0];
            const conflictField = existing.EMAIL === email ? 'Email' : 'Name';
            return NextResponse.json(
                { message: `${conflictField} already exists. Teacher already registered.` },
                { status: 400 }
            );
        }

        // ✅ Fetch department ID
        const dept = await executeQuery(
            'SELECT DEPTID FROM DEPARTMENTS WHERE NAME = ?',
            [department]
        );

        const deptId = (dept as any[])[0]?.DEPTID;

        if (!deptId) {
            return NextResponse.json(
                { message: 'Invalid department. Department not found.' },
                { status: 400 }
            );
        }

        // ✅ Generate password
        const password = `${name.replace(/\s/g, '')}_123`;

        // ✅ Add teacher with auto-determined role
        const result = await executeQuery(
            `INSERT INTO TEACHERS 
             (EMAIL, USERNAME, NAME, PASSWORD, SPECIALIZATION, QUALIFICATION, EXPERIENCE, ROLE, DEPTID) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [email, email, name, password, specialization, qualification, experienceNum, autoRole, deptId]
        );

        // ✅ Get the new teacher ID
        const newTeacherId = (result as any).insertId;

        // ✅ Send success response
        return NextResponse.json({
            success: true,
            message: 'Teacher added successfully',
            teacherId: newTeacherId,
            determinedRole: autoRole,
            credentials: {
                email: email,
                username: email,
                password: password
            }
        }, { status: 201 });

    } catch (error) {
        console.error('Error adding teacher:', error);
        return NextResponse.json(
            { message: 'Error in adding teacher!', error: (error as Error).message },
            { status: 500 }
        );
    }
}