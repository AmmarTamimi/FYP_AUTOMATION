// lib/db.js
import mysql from 'mysql2/promise';

// Create the connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER|| 'root',       // Your MySQL user
    password: '', // Your MySQL password
    database: process.env.DB_DBNAME || 'fyp_project', // You will create this
    waitForConnections: true,
    connectionLimit: 10,
});

//helper to run queries

export async function executeQuery(query:string, params: any = []){
  try {
    const [rows] = await pool.execute(query,params);
    return rows;
  } catch (error) {
    console.log("Query execution error: ",error);
    throw error;
  }
}

export async function testConnection() {
    try {
        const result = await executeQuery('SELECT 1 as connected');
        console.log('✅ MySQL Connected Successfully');
        return true;
    } catch (error) {
        console.error('❌ MySQL Connection Failed:', error);
        return false;
    }
}