import "./../styles/globals.css";
import MenuBar from "@/components/MenuBar";
import MenubarWrapper from "@/components/MenubarWrapper";
import { db } from "./api/database";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <MenubarWrapper />
        <main>{children}</main>
      </body>
    </html>
  );
}