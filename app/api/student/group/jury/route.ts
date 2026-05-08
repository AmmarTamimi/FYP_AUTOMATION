import { executeQuery } from "@/app/lib/db.server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req:NextRequest){
    try {
        
        const {searchParams} = new URL(req.url);
        const juryId = searchParams.get('juryId');
        if(!juryId){
            return NextResponse.json({message: 'group username not provided'},{status:500});
        }
        const query = 'select t1.name as juniorName, t1.email as juniorEmail, t2.name as seniorName, t2.email as seniorEmail from teachers t1 join jury j on t1.teacherId = j.juniorId join teachers t2 on t2.teacherId = j.seniorId where j.juryId = ?'
        const juryDetails = await executeQuery(query,[juryId]);
        return NextResponse.json(juryDetails);
    } catch (error) {
        return NextResponse.json({message: 'Error in fetching jury details',error},{status: 500});
    }
}