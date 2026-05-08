import { executeQuery } from "@/app/lib/db.server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const groupId = searchParams.get("groupId");
    if (!groupId) {
      return NextResponse.json(
        { message: "Group ID not provided" },
        { status: 500 },
      );
    }
    // Get projects with concatenated domains
    const projectQuery = `
  SELECT 
    PROJECTID,
    GROUP_CONCAT(DISTINCT DOMAIN SEPARATOR ', ') as domains,
    PROPOSALDOCUMENT,
    PROJECTTITLE
  FROM PROJECT 
  WHERE GROUPID = ?
  GROUP BY PROJECTID, PROPOSALDOCUMENT, PROJECTTITLE
`;
    const projectDetails = await executeQuery(
      projectQuery,
      [groupId],
    );
    return NextResponse.json(projectDetails);
  } catch (error) {
    return NextResponse.json(
      { message: "Error in fetching project details", error },
      { status: 500 },
    );
  }
}
