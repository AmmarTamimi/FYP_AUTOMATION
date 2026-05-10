// app/api/admin/approve-group/route.ts
import { NextResponse, NextRequest } from "next/server";
import { executeQuery } from "@/app/lib/db.server";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const groupId = body.groupId;
        
        console.log("=== REJECT GROUP DEBUG ===");
        console.log("Group ID:", groupId);
        
        
        // Check if group exists
        const checkGroup = await executeQuery(
            'SELECT groupId, status FROM studentgroup WHERE groupId = ?',
            [groupId]
        );
        
        console.log("Check result:", JSON.stringify(checkGroup, null, 2));
        
        if ((checkGroup as any[]).length === 0) {
            return NextResponse.json(
                { message: 'Group not found' },
                { status: 404 }
            );
        }
        
        const groupStatus = (checkGroup as any[])[0]?.status;
        
        if (groupStatus === 'DENIED') {
            return NextResponse.json(
                { message: `Group is already ${groupStatus}.` },
                { status: 400 }
            );
        }
        
        // ✅ FIXED: Use single quotes around the string value
        const updateResult = await executeQuery(
            "UPDATE studentgroup SET status = 'DENIED' WHERE groupId = ?",
            [groupId]
        );
        
        console.log("Update result:", updateResult);
        
        const groupDetails = await executeQuery(
            'SELECT groupUsername, leaderEmail FROM studentgroup WHERE groupId = ?',
            [groupId]
        );
        
        const leaderEmail = (groupDetails as any[])[0]?.leaderEmail;
        const groupUsername = (groupDetails as any[])[0]?.groupUsername;
        
        return NextResponse.json({ 
            success: true, 
            message: 'Group denied successfully',
            leaderEmail: leaderEmail,
            groupUsername: groupUsername,
        });
        
    } catch (error) {
        console.error("ERROR DETAILS:", error);
        return NextResponse.json(
            { message: (error as Error).message, stack: (error as Error).stack },
            { status: 500 }
        );
    }
}