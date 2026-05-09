import { executeQuery } from "@/app/lib/db.server";
import { NextResponse, NextRequest } from "next/server";

export async function POST(req: NextRequest){
    try {
        const body = await req.json();
        const deptId = body.deptId;
        const response = await executeQuery('DELETE FROM departments WHERE DEPTID = ?',[deptId]);
        return NextResponse.json({
            success: true,
            message: 'department deleted!'
        });
    } catch (error) {
        return NextResponse.json({message: 'Error in deleting department', error},{status: 500});
    }
}