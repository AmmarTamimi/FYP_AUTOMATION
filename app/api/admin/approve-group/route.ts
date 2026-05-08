import { NextResponse, NextRequest } from "next/server";
import { executeQuery } from "@/app/lib/db.server";

export async function POST(req: NextRequest){
    try {
        // Extract body
        const body = await req.json();
        
        // Validate required fields
        if (!body.groupId || !body.password) {
            return NextResponse.json(
                { message: 'Missing required fields: groupId and password' },
                { status: 400 }
            );
        }
        
        const groupId = body.groupId;
        const password = body.password;
        
        // Check if group exists and is pending
        const checkGroup = await executeQuery(
            'SELECT GROUPID, STATUS FROM STUDENTGROUP WHERE GROUPID = ?',
            [groupId]
        );
        
        if ((checkGroup as any[]).length === 0) {
            return NextResponse.json(
                { message: 'Group not found' },
                { status: 404 }
            );
        }
        
        const groupStatus = (checkGroup as any[])[0]?.STATUS;
        if (groupStatus !== 'PENDING') {
            return NextResponse.json(
                { message: `Group is already ${groupStatus}. Cannot approve again.` },
                { status: 400 }
            );
        }
        
        // Update group to VERIFIED with password
        await executeQuery(
            'UPDATE STUDENTGROUP SET STATUS = "VERIFIED", GROUPPASS = ? WHERE GROUPID = ?',
            [password, groupId]
        );
        
        // Optional: Get group details to send email
        const groupDetails = await executeQuery(
            'SELECT GROUPUSERNAME, LEADEREMAIL FROM STUDENTGROUP WHERE GROUPID = ?',
            [groupId]
        );
        
        const leaderEmail = (groupDetails as any[])[0]?.LEADEREMAIL;
        
        // Here you would send email to leader with credentials
        // await sendEmail(leaderEmail, groupUsername, password);
        
        return NextResponse.json({ 
            success: true, 
            message: 'Group approved successfully',
            leaderEmail: leaderEmail
        });
        
    } catch (error) {
        console.error('Error approving group:', error);
        return NextResponse.json(
            { message: 'Error in approving group' },
            { status: 500 }
        );
    }
}