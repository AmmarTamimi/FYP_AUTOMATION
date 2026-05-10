import { executeQuery } from "@/app/lib/db.server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req:NextRequest){
    try {
        const {searchParams} = new URL(req.url);
        const groupId = searchParams.get('groupId');
        if(!groupId){
            return NextResponse.json({message: 'group groupId not provided'},{status:500});
        }
        const groupDetails = await executeQuery('SELECT * FROM studentgroup WHERE groupId = ?',[groupId]);
        return NextResponse.json(groupDetails);
    } catch (error) {
        return NextResponse.json({message: 'Error in fetching group details',error},{status: 500});
    }
}