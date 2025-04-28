import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { openDb } from '@/lib/db'; // Your database utility
import { AuthOptions } from 'next-auth';

// Define the shape of your user object
interface User {
  id: string;  // id should be a string
  username: string;
  role: string;
  password: string; // Password included for internal use
}

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
          return null; // If credentials are missing, return null
        }

        const db = await openDb();
        const user = await db.get<User>('SELECT * FROM users WHERE username = ?', [
          credentials.username,
        ]);

        if (!user) return null; // If no user found, return null

        const passwordMatch = bcrypt.compareSync(credentials.password, user.password);
        if (!passwordMatch) return null; // If password does not match, return null

        // Return the user object with id, username, role, and password (internal use only)
        return { 
          id: user.id.toString(), // Convert id to string
          username: user.username, 
          role: user.role, 
          password: user.password 
        };
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: 'jwt' },  // Use JWT for sessions
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.role = user.role;  // Add role to the JWT token
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }): Promise<any> {
      session.user.id = token.id!;
      session.user.username = token.username!;
      session.user.role = token.role!;  // Pass role to the session
    
      return session;
    },
  },
};
