import { executeQuery } from "@/app/lib/db.server";
import { sendAdminPasswordChangedEmail } from "@/app/lib/email";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req:NextRequest) {
    try {
        const {username,
          currentPassword,
          newPassword} = await req.json();

        const userPass = await executeQuery(`SELECT password from admin where username = ?`,[username]);
        console.log("user pass: ",userPass);
        const pass = (userPass as any[])[0]?.password
        const isMatch = pass === currentPassword;

        if(!isMatch){
            return NextResponse.json({message: 'current password is not correct: '},{status: 400});
        }

        await executeQuery(`update admin set password = ? where username = ?`,[newPassword,username]);

        await sendAdminPasswordChangedEmail(username,username,newPassword,'admin');

        return NextResponse.json({success: true,message: 'Password changed!'},{status: 200});
    } catch (error) {
        return NextResponse.json({message: 'internal server error: ',error},{status: 500});
    }
}