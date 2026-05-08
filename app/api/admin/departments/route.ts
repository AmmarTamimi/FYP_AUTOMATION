import { NextResponse, NextRequest } from "next/server";
import { executeQuery } from "@/app/lib/db.server";

export async function GET(req: NextRequest){
    try {
       const departments = await executeQuery('SELECT * FROM DEPARTMENTS');
       return NextResponse.json(departments);
    } catch (error) {
        return NextResponse.json({message: 'Error in geting departments'},{status: 500})
    }
}

export async function POST(req: NextRequest){
    try {
        const body = await req.json();
        const deptName = body.name;
        const res = await executeQuery('INSERT INTO DEPARTMENTS (name) values (?)',[deptName]);
        return NextResponse.json({
            success: true, 
            message: 'Group approved successfully',
        })
    } catch (error) {
        return NextResponse.json({message: 'Error in adding department',error},{status: 500});
    }
}