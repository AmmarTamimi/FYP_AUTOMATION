import { NextResponse, NextRequest } from "next/server";
import { executeQuery } from "@/app/lib/db.server";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        
        const email = formData.get('email') as string;
        const password = formData.get('pass') as string;
        const role = formData.get('role') as string;

        console.log("=== LOGIN ATTEMPT ===");
        console.log("Email:", email);
        console.log("Role:", role);
        console.log("Password length:", password?.length);

        // ============================================
        // ADMIN LOGIN
        // ============================================
        if (role === 'ADMIN') {
            console.log("Checking ADMIN...");
            const adminResult = await executeQuery(
                'SELECT ADMINID as id, USERNAME as name, PASSWORD FROM ADMIN WHERE USERNAME = ?',
                [email]
            );
            
            console.log("Admin query result:", adminResult);
            
            if ((adminResult as any[]).length === 0) {
                console.log("Admin not found");
                return NextResponse.json(
                    { message: 'Admin not found' },
                    { status: 401 }
                );
            }
            
            const admin = (adminResult as any[])[0];
            console.log("Admin found:", admin.name);
            console.log("Stored password:", admin.PASSWORD);
            console.log("Provided password:", password);
            
            if (admin.PASSWORD !== password) {
                console.log("Password mismatch");
                return NextResponse.json(
                    { message: 'Invalid password' },
                    { status: 401 }
                );
            }
            
            console.log("Admin login successful");
            return NextResponse.json({
                success: true,
                user: {
                    id: admin.id,
                    name: admin.name,
                    role: 'ADMIN'
                }
            });
        }
        
        // ============================================
        // TEACHER LOGIN
        // ============================================
        if (role === 'TEACHER') {
            console.log("Checking TEACHER...");
            const teacherResult = await executeQuery(
                'SELECT TEACHERID as id, NAME as name, EMAIL, PASSWORD FROM TEACHERS WHERE EMAIL = ?',
                [email]
            );
            
            console.log("Teacher query result:", teacherResult);
            
            if ((teacherResult as any[]).length === 0) {
                console.log("Teacher not found");
                return NextResponse.json(
                    { message: 'Teacher not found' },
                    { status: 401 }
                );
            }
            
            const teacher = (teacherResult as any[])[0];
            console.log("Teacher found:", teacher.name);
            
            if (teacher.PASSWORD !== password) {
                console.log("Password mismatch");
                return NextResponse.json(
                    { message: 'Invalid password' },
                    { status: 401 }
                );
            }
            
            console.log("Teacher login successful");
            return NextResponse.json({
                success: true,
                user: {
                    id: teacher.id,
                    name: teacher.name,
                    email: teacher.EMAIL,
                    role: 'TEACHER'
                }
            });
        }
        
        // ============================================
        // STUDENT GROUP LOGIN
        // ============================================
        if (role === 'student') {
            console.log("Checking STUDENT GROUP...");
            const groupResult = await executeQuery(
                'SELECT GROUPID as id, GROUPUSERNAME as name, GROUPPASS as password, LEADEREMAIL FROM STUDENTGROUP WHERE GROUPUSERNAME = ?',
                [email]
            );
            
            console.log("Group query result:", groupResult);
            
            if ((groupResult as any[]).length === 0) {
                console.log("Group not found");
                return NextResponse.json(
                    { message: 'Group not found' },
                    { status: 401 }
                );
            }
            
            const group = (groupResult as any[])[0];
            console.log("Group found:", group.name);
            
            if (group.password !== password) {
                console.log("Password mismatch");
                return NextResponse.json(
                    { message: 'Invalid password' },
                    { status: 401 }
                );
            }
            
            console.log("Group login successful");
            
            const membersResult = await executeQuery(
                'SELECT STDID as id, NAME, EMAIL, SECTION FROM STUDENTS WHERE GROUPID = ?',
                [group.id]
            );
            
            return NextResponse.json({
                success: true,
                user: {
                    id: group.id,
                    name: group.name,
                    role: 'STUDENT',
                    leaderEmail: group.LEADEREMAIL,
                    members: membersResult
                }
            });
        }
        
        console.log("Invalid role:", role);
        return NextResponse.json(
            { message: 'Invalid role specified' },
            { status: 400 }
        );
        
    } catch (error) {
        console.error("Login error details:", error);
        return NextResponse.json(
            { message: 'Internal server error', error: String(error) },
            { status: 500 }
        );
    }
}