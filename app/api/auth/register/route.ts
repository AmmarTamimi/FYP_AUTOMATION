import { executeQuery } from "@/app/lib/db.server";
import { mkdir, writeFile } from "fs/promises";
import { NextRequest, NextResponse } from "next/server";
import path from "path";

export async function POST(req: NextRequest) {
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
    const domainJson = formData.get("domain") as string;  // JSON array of domains
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
    const domains = JSON.parse(domainJson);  // Array of domain strings

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

    // 3. Insert group as pending
    const insertQuery = `INSERT INTO studentgroup (groupusername, leaderemail, supervisorEmail, status) VALUES (?, ?, ?, 'PENDING')`;
    const response = await executeQuery(insertQuery, [
      groupUsername,
      leaderEmail,
      supervisorEmail,
    ]);

    // Get the new group ID
    const newGroupId = (response as any).insertId;

    // 4. Add members into students table
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

    for (const member of members) {
      // Extract batch from roll number (k213094 → 2021)
      const match = member.rollNo?.match(/k(\d{2})\d{4}/i);
      let memberBatch = new Date().getFullYear();

      if (match) {
        const year = parseInt(match[1]);
        memberBatch = 2000 + year;
      }

      const addMemQuery = `INSERT INTO students (GROUPID, EMAIL, NAME, SECTION, BATCH, DEPTID) 
                           VALUES (?, ?, ?, ?, ?, ?)`;

      await executeQuery(addMemQuery, [
        newGroupId,
        member.email,
        member.name,
        member.section,
        memberBatch,
        deptId,
      ]);
    }

    // 5. Save proposal document
    let documentPath = null;
    if (document) {
      const uploadDir = path.join(
        process.cwd(),
        "public",
        "uploads",
        "proposals",
      );
      await mkdir(uploadDir, { recursive: true });
      const timestamp = Date.now();
      const filename = `${groupUsername}_${timestamp}_${document.name}`;
      const buffer = Buffer.from(await document.arrayBuffer());
      const filePath = path.join(uploadDir, filename);
      await writeFile(filePath, buffer);
      documentPath = `/uploads/proposals/${filename}`;
    }

    // 6. Insert project details - ONE ROW PER DOMAIN (same PROJECTID for all domains)
    // First, get the next PROJECTID
    const nextIdResult = await executeQuery(
      "SELECT IFNULL(MAX(PROJECTID), 0) + 1 as nextId FROM project"
    );
    const newProjectId = (nextIdResult as any[])[0]?.nextId;

    // Insert one row for each domain
    for (const domainName of domains) {
      const projectQuery = `
        INSERT INTO project (PROJECTID, DOMAIN, GROUPID, PROPOSALDOCUMENT, PROJECTTITLE) 
        VALUES (?, ?, ?, ?, ?)
      `;
      await executeQuery(projectQuery, [
        newProjectId,
        domainName.trim(),        // Each domain gets its own row
        newGroupId,
        documentPath,
        projectTitle,
      ]);
    }

    console.log(`Inserted ${domains.length} project rows for ProjectID: ${newProjectId}`);

    // ✅ Send success response
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
    console.error("Registration error:", error);
    return NextResponse.json(
      { message: "Internal server error: " + (error as Error).message },
      { status: 500 },
    );
  }
}