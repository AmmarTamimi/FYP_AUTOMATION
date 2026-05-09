import { NextResponse, NextRequest } from "next/server";
import { executeQuery } from "@/app/lib/db.server";

export async function GET(req: NextRequest){
    try {
       const students = await executeQuery('SELECT * FROM students');
       return NextResponse.json(students);
    } catch (error) {
        return NextResponse.json({message: 'Error in geting students'},{status: 500})
    }
}