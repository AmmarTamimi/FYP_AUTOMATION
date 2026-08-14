import { executeQuery } from "@/app/lib/db.server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const res = await executeQuery('SELECT * FROM jury');
        return NextResponse.json(res);
    } catch (error) {
        return NextResponse.json({error: "internal server error: " + error},{status: 500});
    }
}