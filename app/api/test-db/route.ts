// app/api/test-db/route.ts
import { NextResponse } from 'next/server';
import { executeQuery, testConnection } from '../../lib/db.server';

// Define types for the results
type TableRow = { [key: string]: string };
type CountRow = { count: number };

export async function GET() {
    try {
        // Test connection
        const isConnected = await testConnection();
        
        if (!isConnected) {
            return NextResponse.json(
                { error: 'Database connection failed' },
                { status: 500 }
            );
        }
        
        // Get all tables - cast to proper type
        const tables = await executeQuery('SHOW TABLES') as TableRow[];
        
        // Get counts - cast to proper type
        const adminCount = await executeQuery('SELECT COUNT(*) as count FROM Admin') as CountRow[];
        const teacherCount = await executeQuery('SELECT COUNT(*) as count FROM Teachers') as CountRow[];
        const studentCount = await executeQuery('SELECT COUNT(*) as count FROM Students') as CountRow[];
        
        return NextResponse.json({
            success: true,
            message: 'Connected to MySQL successfully!',
            tables: tables.map(t => Object.values(t)[0]),
            counts: {
                admin: adminCount[0]?.count || 0,
                teachers: teacherCount[0]?.count || 0,
                students: studentCount[0]?.count || 0
            }
        });
    } catch (error) {
        console.error('Test DB Error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}