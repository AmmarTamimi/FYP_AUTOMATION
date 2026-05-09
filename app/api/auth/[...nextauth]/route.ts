// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { executeQuery } from "@/app/lib/db.server";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        identifier: { label: "Email or Username", type: "text" },
        password: { label: "Password", type: "password" },
        role: { label: "Role", type: "text" },
      },
     async authorize(credentials) {
  if (!credentials?.identifier || !credentials?.password) {
    return null;
  }

  const role = credentials.role; // Will be 'ADMIN', 'TEACHER', or 'STUDENT'
  const email = credentials.identifier;
  const password = credentials.password;

  // ADMIN LOGIN
  if (role === 'ADMIN') {
    const adminResult = await executeQuery(
      'SELECT AdminId as id, username as name, password FROM admin WHERE username = ?',
      [email]
    );
    
    if ((adminResult as any[]).length > 0) {
      const admin = (adminResult as any[])[0];
      if (admin.password === password) {
        return {
          id: admin.id,
          name: admin.name,
          email: email,
          role: 'ADMIN',
        };
      }
    }
  }
  
  // TEACHER LOGIN
  if (role === 'TEACHER') {
    const teacherResult = await executeQuery(
      'SELECT TeacherId as id, name, email, password FROM teachers WHERE email = ?',
      [email]
    );
    
    if ((teacherResult as any[]).length > 0) {
      const teacher = (teacherResult as any[])[0];
      if (teacher.password === password) {
        return {
          id: teacher.id,
          name: teacher.name,
          email: teacher.email,
          role: 'TEACHER',
        };
      }
    }
  }
  
  // STUDENT LOGIN
  if (role === 'STUDENT') {
    const groupResult = await executeQuery(
      'SELECT groupId as id, groupUsername as name, groupPass as password FROM studentgroup WHERE groupUsername = ?',
      [email]
    );
    
    if ((groupResult as any[]).length > 0) {
      const group = (groupResult as any[])[0];
      if (group.password === password) {
        return {
          id: group.id,
          name: group.name,
          email: email,
          role: 'STUDENT',
        };
      }
    }
  }

  return null;
}
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };