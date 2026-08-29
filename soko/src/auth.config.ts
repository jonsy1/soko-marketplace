import type { NextAuthConfig } from 'next-auth';

// This file must stay free of Prisma/bcrypt imports so it can be bundled
// into the Edge middleware. The real Credentials provider (which needs
// Prisma) is added on top of this in src/auth.ts, which only runs in the
// Node.js runtime (API routes, server components).
export const authConfig: NextAuthConfig = {
  pages: {
    signIn: '/login',
  },
  session: { strategy: 'jwt' },
  providers: [],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = (user as any).id;
        token.role = (user as any).role;
      }
      if (trigger === 'update' && session?.role) {
        token.role = session.role;
      }
      if (trigger === 'update' && session?.name) {
        token.name = session.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
      }
      return session;
    },
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = request.nextUrl;

      const protectedPrefixes = ['/dashboard'];
      const isProtected = protectedPrefixes.some((p) => pathname.startsWith(p));

      if (!isProtected) return true;
      if (!isLoggedIn) return false;

      const role = (auth?.user as any)?.role;
      if (pathname.startsWith('/dashboard/admin') && role !== 'ADMIN') return false;
      if (pathname.startsWith('/dashboard/business') && role !== 'BUSINESS' && role !== 'ADMIN') {
        return false;
      }
      return true;
    },
  },
};