import { NextResponse, NextRequest } from "next/server";
import { executeQuery } from "@/app/lib/db.server";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        
        const email = formData.get('email') as string;
        const password = formData.get('pass') as string;
        const role = formData.get('role') as string;

        console.log("Login attempt:", { email, role });

        // ============================================
        // ADMIN LOGIN
        // ============================================
        if (role === 'ADMIN') {
            const adminResult = await executeQuery(
                'SELECT ADMINID as id, USERNAME as name, PASSWORD FROM ADMIN WHERE USERNAME = ?',
                [email]
            );
            
            if ((adminResult as any[]).length === 0) {
                return NextResponse.json(
                    { message: 'Admin not found' },
                    { status: 401 }
                );
            }
            
            const admin = (adminResult as any[])[0];
            
            if (admin.PASSWORD !== password) {
                return NextResponse.json(
                    { message: 'Invalid password' },
                    { status: 401 }
                );
            }
            
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
        if (role === 'teacher') {
            const teacherResult = await executeQuery(
                'SELECT TEACHERID as id, NAME as name, EMAIL, PASSWORD FROM TEACHERS WHERE EMAIL = ?',
                [email]
            );
            
            if ((teacherResult as any[]).length === 0) {
                return NextResponse.json(
                    { message: 'Teacher not found' },
                    { status: 401 }
                );
            }
            
            const teacher = (teacherResult as any[])[0];
            
            if (teacher.PASSWORD !== password) {
                return NextResponse.json(
                    { message: 'Invalid password' },
                    { status: 401 }
                );
            }
            
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
            const groupResult = await executeQuery(
                'SELECT GROUPID as id, GROUPUSERNAME as name, GROUPPASS as password, LEADEREMAIL FROM STUDENTGROUP WHERE GROUPUSERNAME = ?',
                [email]
            );
            
            if ((groupResult as any[]).length === 0) {
                return NextResponse.json(
                    { message: 'Group not found' },
                    { status: 401 }
                );
            }
            
            const group = (groupResult as any[])[0];
            
            if (group.password !== password) {
                return NextResponse.json(
                    { message: 'Invalid password' },
                    { status: 401 }
                );
            }
            
            // Get all members of the group
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
        
        return NextResponse.json(
            { message: 'Invalid role specified' },
            { status: 400 }
        );
        
    } catch (error) {
        console.error("Login error:", error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}