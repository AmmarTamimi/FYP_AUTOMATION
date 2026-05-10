// app/api/test-cloudinary/route.ts
import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';

// Hardcode credentials for testing
cloudinary.config({
  cloud_name: 'dvcihuzpz',
  api_key: '713972188835876',
  api_secret: 'CxbUqONTu...', // Replace with your FULL secret (click "Show" in Cloudinary dashboard)
  secure: true,
});

export async function GET() {
  try {
    console.log("Testing Cloudinary connection...");
    
    // Simple test upload
    const result = await cloudinary.uploader.upload('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', {
      folder: 'fyp_test'
    });
    
    return NextResponse.json({ 
      success: true, 
      url: result.secure_url,
      message: "Cloudinary is working!"
    });
  } catch (error) {
    console.error("Cloudinary error:", error);
    return NextResponse.json({ 
      success: false, 
      error: (error as Error).message,
      stack: (error as Error).stack
    }, { status: 500 });
  }
}