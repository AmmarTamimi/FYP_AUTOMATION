import { executeQuery } from "@/app/lib/db.server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req:NextRequest){
    try {
        const {searchParams} = new URL(req.url);
        const name = searchParams.get('username');
        if(!name){
            return NextResponse.json({message: 'group username not provided'},{status:500});
        }
        const groupDetails = await executeQuery('SELECT * FROM studentgroup WHERE GROUPUSERNAME = ?',[name]);
        return NextResponse.json(groupDetails);
    } catch (error) {
        return NextResponse.json({message: 'Error in fetching group details',error},{status: 500});
    }
}