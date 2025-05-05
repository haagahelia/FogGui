import "./../styles/globals.css";
import MenubarWrapper from "@/components/MenubarWrapper";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import SessionProviderWrapper from "@/components/SessionProviderWrapper";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en">
      <body>
        <SessionProviderWrapper session={session}>
          <MenubarWrapper /> {/* Remove session prop here */}
          <main>{children}</main>
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
