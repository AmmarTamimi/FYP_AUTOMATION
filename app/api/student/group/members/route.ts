import { executeQuery } from "@/app/lib/db.server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req:NextRequest){
    try {
        const {searchParams} = new URL(req.url);
        const groupId = searchParams.get('groupId');
        if(!groupId){
            return NextResponse.json({message: 'Group ID not provided'},{status:500});
        }
        const memberDetails = await executeQuery('SELECT * FROM STUDENTS WHERE GROUPID = ?',[groupId]);
        return NextResponse.json(memberDetails);
    } catch (error) {
        return NextResponse.json({message: 'Error in fetching group members details',error},{status: 500});
    }
}