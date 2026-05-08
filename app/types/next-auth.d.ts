// types/next-auth.d.ts
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      studentId?: string | null;
      teacherId?: string | null;
      department?: string | null;
      batch?: number | null;
    } & DefaultSession["user"]
  }

  interface User {
    role?: string;
    studentId?: string | null;
    teacherId?: string | null;
    department?: string | null;
    batch?: number | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role?: string;
    studentId?: string | null;
    teacherId?: string | null;
    department?: string | null;
    batch?: number | null;
  }
}