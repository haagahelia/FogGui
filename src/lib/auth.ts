import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { openDb } from '@/lib/db';

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const db = await openDb();

        // Fetch the user from the database
        const user = await db.get('SELECT * FROM users WHERE username = ?', [
          credentials.username,
        ]);

        // Check if the user exists and the password matches
        if (user && bcrypt.compareSync(credentials.password, user.password)) {
          return { id: user.id, username: user.username }; // Return the user object
        }

        return null; // Return null if credentials are invalid
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET, // Add a secret to your .env file
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.username = token.username;
      return session;
    },
  },
});