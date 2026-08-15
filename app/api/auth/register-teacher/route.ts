// app/api/auth/register-teacher/route.ts
import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/app/lib/db.server";

function determineTeacherLevel(qualification: string, experience: number): "senior" | "junior" {
    const isPhD = qualification.toLowerCase().includes('phd') || 
                  qualification.toLowerCase().includes('doctorate');
    const hasExperience = experience >= 5;
    
    if (isPhD || hasExperience) {
        return 'senior';
    }
    return 'junior';
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { 
            name, 
            email, 
            password, 
            department, 
            specialization, 
            qualification, 
            experience, 
            designation 
        } = body;

        // Validate required fields
        if (!name || !email || !password || !department || !specialization || !qualification || !designation) {
            return NextResponse.json(
                { message: "All fields are required" },
                { status: 400 }
            );
        }

        // Validate email domain
        if (!email.endsWith('@nu.edu.pk')) {
            return NextResponse.json(
                { message: "Email must be @nu.edu.pk domain" },
                { status: 400 }
            );
        }

        // Check if email already exists
        const existingTeacher = await executeQuery(
            "SELECT TEACHERID FROM teachers WHERE EMAIL = ?",
            [email]
        );

        if ((existingTeacher as any[]).length > 0) {
            return NextResponse.json(
                { message: "Email already registered" },
                { status: 400 }
            );
        }

        // Get department ID
        const dept = await executeQuery(
            "SELECT DEPTID FROM departments WHERE NAME = ?",
            [department]
        );

        const deptId = (dept as any[])[0]?.DEPTID;

        if (!deptId) {
            return NextResponse.json(
                { message: "Invalid department" },
                { status: 400 }
            );
        }

        // Determine role automatically
        const autoRole = determineTeacherLevel(qualification, parseInt(experience));

        // ✅ Insert with STATUS = 'PENDING'
        const result = await executeQuery(
            `INSERT INTO teachers 
             (NAME, EMAIL, USERNAME, PASSWORD, SPECIALIZATION, QUALIFICATION, EXPERIENCE, ROLE, DESIGNATION, DEPTID, STATUS) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING')`,
            [name, email, email, password, specialization, qualification, 
             parseInt(experience), autoRole, designation, deptId]
        );

        return NextResponse.json({
            success: true,
            message: "Registration successful! Your account is pending admin approval.",
            teacherId: (result as any).insertId
        }, { status: 201 });

    } catch (error) {
        console.error("Teacher registration error:", error);
        return NextResponse.json(
            { message: "Error in teacher registration", error: String(error) },
            { status: 500 }
        );
    }
}