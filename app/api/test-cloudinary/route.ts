// app/api/test-cloudinary/route.ts
import { NextResponse } from "next/server";
import { getCloudinaryInstance } from "@/app/lib/cloudinary";

export async function GET() {
  try {
    // Get a new instance that is configured right now
    const cloudinary = getCloudinaryInstance();

    const result = await cloudinary.uploader.upload('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', {
      folder: 'fyp_test'
    });

    return NextResponse.json({
      success: true,
      url: result.secure_url,
    });
  } catch (error: any) {
    console.error("Cloudinary error:", error);
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}