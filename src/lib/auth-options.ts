import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { openDb } from '@/lib/db';  // Your database utility
import { AuthOptions } from 'next-auth';

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials || !credentials.username || !credentials.password) {
          return null;  // If credentials are missing, return null
        }

        const db = await openDb();
        const user = await db.get('SELECT * FROM users WHERE username = ?', [
          credentials.username,
        ]);

        if (!user) return null;  // If no user found, return null

        const passwordMatch = bcrypt.compareSync(credentials.password, user.password);
        if (!passwordMatch) return null;  // If password does not match, return null

        // Return the user object with id and username (ensure these are passed correctly)
        return { id: user.id, username: user.username, password: user.password };  // Password is usually not passed to the session, but it's part of the user object
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: 'jwt' },  // Use JWT for sessions
  callbacks: {
    // This callback is called when the JWT is created
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;  // Add the id to the token
        token.username = user.username;  // Add the username to the token
      }
      return token;  // Return the updated token
    },

    // This callback is called when the session is returned
    async session({ session, token }) {
      // Ensure session.user is defined and not undefined
      if (!session.user) {
        session.user = {} as any;  // Initialize user if not present
      }

      // Now you can safely assign values to session.user
      session.user.id = token.id! as string;  // Explicitly cast id as string
      session.user.username = token.username! as string;  // Explicitly cast username as string

      return session;  // Return the session object with user data
    },
  },
};
