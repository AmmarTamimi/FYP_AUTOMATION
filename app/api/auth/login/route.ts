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
        // admin LOGIN - Use lowercase 'admin'
        // ============================================
        if (role === 'ADMIN') {
            const adminResult = await executeQuery(
                'SELECT AdminId as id, username as name, password FROM admin WHERE username = ?',
                [email]
            );
            
            if ((adminResult as any[]).length === 0) {
                return NextResponse.json(
                    { message: 'admin not found' },
                    { status: 401 }
                );
            }
            
            const admin = (adminResult as any[])[0];
            
            if (admin.password !== password) {
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
        // TEACHER LOGIN - Use lowercase 'teachers'
        // ============================================
        if (role === 'teacher') {
            const teacherResult = await executeQuery(
                'SELECT TeacherId as id, name, email, password FROM teachers WHERE email = ?',
                [email]
            );
            
            if ((teacherResult as any[]).length === 0) {
                return NextResponse.json(
                    { message: 'Teacher not found' },
                    { status: 401 }
                );
            }
            
            const teacher = (teacherResult as any[])[0];
            
            if (teacher.password !== password) {
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
                    email: teacher.email,
                    role: 'TEACHER'
                }
            });
        }
        
        // ============================================
        // STUDENT GROUP LOGIN - Use lowercase 'studentgroup'
        // ============================================
        if (role === 'student') {
            const groupResult = await executeQuery(
                'SELECT groupId as id, groupUsername as name, groupPass as password, leaderEmail FROM studentgroup WHERE groupUsername = ?',
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
                'SELECT stdId as id, name, email, section FROM students WHERE groupId = ?',
                [group.id]
            );
            
            return NextResponse.json({
                success: true,
                user: {
                    id: group.id,
                    name: group.name,
                    role: 'STUDENT',
                    leaderEmail: group.leaderEmail,
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