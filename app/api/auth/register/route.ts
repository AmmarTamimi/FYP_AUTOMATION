import { getCloudinaryInstance } from "@/app/lib/cloudinary";
import { executeQuery, getConnection } from "@/app/lib/db.server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  let connection;
  
  try {
    // Get the form details
    const formData = await req.formData();

    // ✅ LOG ALL RECEIVED DATA
    console.log("=== RECEIVED FORM DATA ===");
    for (const [key, value] of formData.entries()) {
      if (key === "document") {
        console.log(`${key}: [File] ${(value as File).name}`);
      } else if (key === "domain") {
        console.log(`${key}: ${value} (JSON string)`);
      } else {
        console.log(`${key}: ${value}`);
      }
    }

    const groupUsername = formData.get("groupUsername") as string;
    const leaderEmail = formData.get("leaderEmail") as string;
    const membersJson = formData.get("members") as string;
    const deptName = formData.get("deptName") as string;
    const domainJson = formData.get("domain") as string;
    const document = formData.get("document") as File;
    const projectTitle = formData.get("projectTitle") as string;
    const supervisorEmail = formData.get("supervisorEmail") as string;

    // Validate required fields
    if (!groupUsername || !leaderEmail || !membersJson || !deptName) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 },
      );
    }

    // Parse members and domains
    const members = JSON.parse(membersJson);
    const domains = JSON.parse(domainJson);

    if (!members || members.length < 2) {
      return NextResponse.json(
        { message: "At least two members are required" },
        { status: 400 },
      );
    }

    if (!domains || domains.length === 0) {
      return NextResponse.json(
        { message: "At least one domain is required" },
        { status: 400 },
      );
    }

    // 1. Check if group already exists
    const query = `SELECT GROUPID FROM studentgroup WHERE GROUPUSERNAME = ?`;
    const group = await executeQuery(query, [groupUsername]);

    if (Array.isArray(group) && group.length > 0) {
      return NextResponse.json(
        { message: "Group name already exists" },
        { status: 400 },
      );
    }

    // 2. Leader should not be in multiple groups
    const leaderQuery = `SELECT GROUPID FROM studentgroup WHERE LEADEREMAIL = ?`;
    const leader = await executeQuery(leaderQuery, [leaderEmail]);

    if (Array.isArray(leader) && leader.length > 0) {
      return NextResponse.json(
        { message: "Leader already in another group" },
        { status: 400 },
      );
    }

    // 3. Get department ID
    console.log("Looking for department name:", deptName);
    const deptResult = await executeQuery(
      "SELECT DEPTID FROM departments WHERE NAME = ?",
      [deptName],
    );

    const deptId = (deptResult as any[])[0]?.DEPTID;
    console.log("Department Id is: ", deptId);

    if (!deptId) {
      return NextResponse.json(
        { message: "Invalid department selected" },
        { status: 400 },
      );
    }

    // 4. Upload document to Cloudinary (BEFORE transaction)
    let documentUrl = null;
    if (document) {
      try {
        const cloudinary = getCloudinaryInstance();
        const buffer = Buffer.from(await document.arrayBuffer());
        const base64String = buffer.toString("base64");
        const dataUri = `data:${document.type};base64,${base64String}`;

        const result = await cloudinary.uploader.upload(dataUri, {
          folder: "fyp_proposals",
          resource_type: "raw",
          public_id: `${groupUsername}_${Date.now()}_${document.name.replace(/\s/g, "_")}`,
          access_mode: 'public',
        });

        documentUrl = result.secure_url;
        console.log("File uploaded to Cloudinary:", documentUrl);
      } catch (uploadError) {
        console.error("Cloudinary upload error:", uploadError);
      }
    }

    // ============================================
    // START TRANSACTION
    // ============================================
    connection = await getConnection();
    await connection.beginTransaction();
    
    console.log("=== STARTING DATABASE TRANSACTION ===");

    // 5. Insert group as pending
    const [groupResult] = await connection.execute(
      `INSERT INTO studentgroup (groupusername, leaderemail, supervisorEmail, status) 
       VALUES (?, ?, ?, 'PENDING')`,
      [groupUsername, leaderEmail, supervisorEmail]
    );

    const newGroupId = (groupResult as any).insertId;
    console.log(`✅ Group inserted with ID: ${newGroupId}`);

    // 6. Insert members
    for (const member of members) {
      const match = member.rollNo?.match(/k(\d{2})\d{4}/i);
      let memberBatch = new Date().getFullYear();

      if (match) {
        const year = parseInt(match[1]);
        memberBatch = 2000 + year;
      }

      await connection.execute(
        `INSERT INTO students (groupId, email, name, section, batch, deptId) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [newGroupId, member.email, member.name, member.section, memberBatch, deptId]
      );
    }
    console.log(`✅ ${members.length} members inserted`);

    // 7. Generate new Project ID
    const [nextIdResult] = await connection.execute(
      "SELECT IFNULL(MAX(PROJECTID), 0) + 1 as nextId FROM project"
    );
    const newProjectId = (nextIdResult as any[])[0]?.nextId;

    // 8. Insert project details (one row per domain)
    for (const domainName of domains) {
      await connection.execute(
        `INSERT INTO project (PROJECTID, DOMAIN, GROUPID, PROPOSALDOCUMENT, PROJECTTITLE) 
         VALUES (?, ?, ?, ?, ?)`,
        [newProjectId, domainName.trim(), newGroupId, documentUrl, projectTitle]
      );
    }
    console.log(`✅ ${domains.length} project rows inserted for ProjectID: ${newProjectId}`);

    // 9. Commit transaction
    await connection.commit();
    console.log("✅ TRANSACTION COMMITTED - All data saved");

    // Send success response
    return NextResponse.json(
      {
        success: true,
        message: "Group registered successfully",
        groupId: newGroupId,
        projectId: newProjectId,
        domainsCount: domains.length,
        membersCount: members.length,
      },
      { status: 201 },
    );
    
  } catch (error) {
    // Rollback transaction on error
    if (connection) {
      await connection.rollback();
      console.error("❌ TRANSACTION ROLLED BACK - No changes saved");
    }
    console.error("Registration error:", error);
    return NextResponse.json(
      { message: "Internal server error: " + (error as Error).message },
      { status: 500 },
    );
  } finally {
    // Release connection back to pool
    if (connection) connection.release();
  }
}