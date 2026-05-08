// test-v5.js
const oracledb = require('oracledb');

oracledb.oracleClientLib = "D:\\ORACLE\\instantclient_23_0";

// Try each format one by one
const connectionStrings = [
    "localhost:1521:XE",           // Format 1: SID (most common for 11g)
    "localhost:1521/XE",           // Format 2: Service name
    "127.0.0.1:1521:XE",           // Format 3: IP address instead of localhost
    "localhost:1521/ORCL",         // Format 4: Different service name
    "(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=localhost)(PORT=1521))(CONNECT_DATA=(SID=XE)))"  // Format 5: Full TNS
];

async function test(connectString) {
    console.log(`\nTesting: ${connectString}`);
    try {
        const connection = await oracledb.getConnection({
            user: "FYP_PROJECT",
            password: "123",
            connectString: connectString
        });
        
        const result = await connection.execute("SELECT 'Connected!' as msg FROM DUAL");
        console.log("✅ SUCCESS! Result:", result.rows);
        await connection.close();
        return true;
    } catch (err) {
        console.log("❌ Failed:", err.message);
        return false;
    }
}

async function testAll() {
    console.log("=== Testing all connection formats ===\n");
    for (const cs of connectionStrings) {
        await test(cs);
    }
}

testAll();