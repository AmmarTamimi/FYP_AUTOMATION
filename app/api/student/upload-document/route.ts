// app/api/student/upload-document/route.ts
import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/app/lib/db.server";
import { getCloudinaryInstance } from "@/app/lib/cloudinary";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const document = formData.get('document') as File;
    const groupId = formData.get('groupId') as string;
    
    console.log("=== UPLOAD DOCUMENT API CALLED ===");
    console.log("Group ID:", groupId);
    console.log("File name:", document?.name);
    console.log("File size:", document?.size);
    console.log("File type:", document?.type);
    
    // Validate inputs
    if (!document || !groupId) {
      return NextResponse.json(
        { message: "Missing required fields: document and groupId" },
        { status: 400 }
      );
    }
    
    // Validate file type
    if (document.type !== 'application/pdf') {
      return NextResponse.json(
        { message: "Only PDF files are allowed" },
        { status: 400 }
      );
    }
    
    // Validate file size (5MB)
    if (document.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { message: "File size must be less than 5MB" },
        { status: 400 }
      );
    }
    
    // Check if group exists and belongs to the student
    const groupCheck = await executeQuery(
      `SELECT groupId FROM studentgroup WHERE groupId = ?`,
      [groupId]
    );
    
    if ((groupCheck as any[]).length === 0) {
      return NextResponse.json(
        { message: "Group not found" },
        { status: 404 }
      );
    }
    
    // Get group username for filename
    const groupInfo = await executeQuery(
      `SELECT groupUsername FROM studentgroup WHERE groupId = ?`,
      [groupId]
    );
    const groupUsername = (groupInfo as any[])[0]?.groupUsername;
    
    // Upload to Cloudinary
    let documentUrl = null;
    
    try {
      const cloudinary = getCloudinaryInstance();
      
      // Convert file to base64
      const buffer = Buffer.from(await document.arrayBuffer());
      const base64String = buffer.toString("base64");
      const dataUri = `data:${document.type};base64,${base64String}`;
      
      const timestamp = Date.now();
      const filename = `${groupUsername}_${timestamp}_${document.name.replace(/\s/g, "_")}`;
      
      const result = await cloudinary.uploader.upload(dataUri, {
        folder: "fyp_proposals",
        resource_type: "raw",
        public_id: filename,
      });
      
      documentUrl = result.secure_url;
      console.log("File uploaded to Cloudinary:", documentUrl);
      
    } catch (uploadError) {
      console.error("Cloudinary upload error:", uploadError);
      return NextResponse.json(
        { message: "Failed to upload file to cloud storage" },
        { status: 500 }
      );
    }
    
    // Check if project already exists for this group
    const existingProject = await executeQuery(
      `SELECT PROJECTID FROM project WHERE GROUPID = ?`,
      [groupId]
    );
    
    if ((existingProject as any[]).length > 0) {
      // Update existing project
      await executeQuery(
        `UPDATE project SET PROPOSALDOCUMENT = ? WHERE GROUPID = ?`,
        [documentUrl, groupId]
      );
      console.log("Updated existing project with new document");
    } else {
      // Create new project (this should not happen normally as project is created during registration)
      // Get domains from existing project or set default
      const projectIdResult = await executeQuery(
        `SELECT IFNULL(MAX(PROJECTID), 0) + 1 as nextId FROM project`
      );
      const newProjectId = (projectIdResult as any[])[0]?.nextId;
      
      await executeQuery(
        `INSERT INTO project (PROJECTID, DOMAIN, GROUPID, PROPOSALDOCUMENT, PROJECTTITLE) 
         VALUES (?, 'Pending', ?, ?, 'Pending')`,
        [newProjectId, groupId, documentUrl]
      );
      console.log("Created new project record");
    }
    
    return NextResponse.json({
      success: true,
      message: "Document uploaded successfully",
      documentUrl: documentUrl
    });
    
  } catch (error) {
    console.error("Upload document error:", error);
    return NextResponse.json(
      { message: "Internal server error: " + (error as Error).message },
      { status: 500 }
    );
  }
}