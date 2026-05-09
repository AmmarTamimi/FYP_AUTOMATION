import { NextResponse, NextRequest } from "next/server";
import { executeQuery } from "@/app/lib/db.server";

export async function GET(req: NextRequest){
    try {
        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status'); 
        if(!status){
            return NextResponse.json({message: 'Status not provides'},{status: 500})
        }
        if(status === 'PENDING'){
            const groupResult = await executeQuery('SELECT * FROM studentgroup WHERE STATUS = ? ORDER BY GROUPID DESC',[status]);
            return NextResponse.json(groupResult);
        }else if (status === 'VERIFIED'){
            const groupResult = await executeQuery('SELECT * FROM studentgroup WHERE STATUS = ? ORDER BY GROUPID DESC',[status]);
            return NextResponse.json(groupResult);
        }
    } catch (error) {
        return NextResponse.json({message: 'Error in geting groups'},{status: 500})
    }
}