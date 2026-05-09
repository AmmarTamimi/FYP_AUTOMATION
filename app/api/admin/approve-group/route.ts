import { NextResponse, NextRequest } from "next/server";
import { executeQuery } from "@/app/lib/db.server";

// app/api/admin/approve-group/route.ts - Add more logging
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const groupId = body.groupId;
        const password = body.password;
        
        console.log("=== APPROVE GROUP DEBUG ===");
        console.log("Group ID:", groupId);
        console.log("Password:", password);
        
        // Check if group exists
        const checkGroup = await executeQuery(
            'SELECT groupId, status FROM studentgroup WHERE groupId = ?',
            [groupId]
        );
        
        console.log("Check result:", JSON.stringify(checkGroup, null, 2));
        
        // If group exists, try to update
        if ((checkGroup as any[]).length > 0) {
            console.log("Attempting UPDATE...");
            const updateResult = await executeQuery(
                'UPDATE studentgroup SET status = "VERIFIED", groupPass = ? WHERE groupId = ?',
                [password, groupId]
            );
            console.log("Update result:", updateResult);
        }
        
        return NextResponse.json({ success: true });
        
    } catch (error) {
        console.error("ERROR DETAILS:", error);
        return NextResponse.json(
            { message: (error as Error).message, stack: (error as Error).stack },
            { status: 500 }
        );
    }
}