// app/api/test-cloudinary/route.ts
import cloudinary from "@/app/lib/cloudinary";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        // Test Cloudinary connection
        const result = await cloudinary.api.ping();
        return NextResponse.json({ 
            success: true, 
            message: "Cloudinary connected!",
            result 
        });
    } catch (error) {
        return NextResponse.json({ 
            success: false, 
            error: (error as Error).message 
        }, { status: 500 });
    }
}