// app/api/test-cloudinary/route.ts
import cloudinary from "@/app/lib/cloudinary";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    console.log("Testing Cloudinary with CLOUDINARY_URL...");
    
    const result = await cloudinary.uploader.upload('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', {
      folder: 'fyp_test'
    });
    
    return NextResponse.json({ 
      success: true, 
      url: result.secure_url 
    });
  } catch (error) {
    console.error("Cloudinary error:", error);
    return NextResponse.json({ 
      success: false, 
      error: (error as Error).message 
    }, { status: 500 });
  }
}