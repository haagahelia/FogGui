"use client"; // This marks it as a client-side component

import { usePathname } from "next/navigation";
import MenuBar from "./MenuBar";
import { SessionProvider } from "next-auth/react"; // Import SessionProvider

export default function MenubarWrapper() {
  const pathname = usePathname();
  const isLoginPage = pathname === "/"; // Hide menubar on login page

  if (isLoginPage) return null;

  return (
    <SessionProvider>
      <MenuBar />
    </SessionProvider>
  );
}
