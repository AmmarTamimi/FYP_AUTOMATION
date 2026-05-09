import { NextResponse } from "next/server";
import { executeQuery } from "../../lib/db.server";

export async function GET() {
  const diagnostics: any = {};

  // 1. Check if environment variables are loaded
  diagnostics.env = {
    hasDbHost: !!process.env.DB_HOST,
    hasDbUser: !!process.env.DB_USER,
    hasDbPassword: !!process.env.DB_PASSWORD,
    hasDbName: !!process.env.DB_NAME,
    hasDbPort: !!process.env.DB_PORT,
    dbHost: process.env.DB_HOST,
    dbPort: process.env.DB_PORT,
  };

  // 2. Try a simple database query
  try {
    const result = await executeQuery("SELECT 1 as connected, NOW() as time");
    diagnostics.dbQuery = { success: true, result };
  } catch (error: any) {
    diagnostics.dbQuery = { success: false, error: error.message };
  }

  // 3. Try getting table count
  try {
    const tables = await executeQuery("SHOW TABLES");
    diagnostics.tables = { count: tables.length, names: tables.map((t: any) => Object.values(t)[0]) };
  } catch (error: any) {
    diagnostics.tables = { error: error.message };
  }

  return NextResponse.json(diagnostics);
}