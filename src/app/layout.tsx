import "./../styles/globals.css";
import MenubarWrapper from "@/components/MenubarWrapper";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options"; // Your NextAuth config

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await getServerSession(authOptions); // Fetch session on server side

  return (
    <html lang="en">
      <body>
        <MenubarWrapper session={session} /> {/* Pass session as prop */}
        <main>{children}</main>
      </body>
    </html>
  );
}
