// next-auth.d.ts
import { DefaultSession } from "next-auth";

// Extend the DefaultSession and DefaultUser types from next-auth
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username: string;
      // Optionally add other properties if needed
      // name?: string | null;
      // email?: string | null;
      // image?: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    username: string;
    password: string;  // Keep password if you need it in the user object, but avoid passing to session
  }
}
