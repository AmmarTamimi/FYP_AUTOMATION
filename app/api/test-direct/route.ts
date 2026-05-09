import { NextResponse } from "next/server";
import { executeQuery } from "@/app/lib/db.server";

export async function GET() {
  try {
    // Test simple query
    const test = await executeQuery("SELECT 1 as test");
    
    // Test admin table
    const admins = await executeQuery("SELECT USERNAME FROM ADMIN");
    
    return NextResponse.json({
      success: true,
      databaseConnected: true,
      testResult: test,
      admins: admins,
      adminCount: (admins as any[]).length
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}