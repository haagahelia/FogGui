import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import MenubarWrapper from "@/components/MenubarWrapper";
import SessionProviderWrapper from "@/components/SessionProviderWrapper";
import "./../styles/globals.css";

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en">
      <body>
        <SessionProviderWrapper session={session}>
          <MenubarWrapper session={session} />
          <main>{children}</main>
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
