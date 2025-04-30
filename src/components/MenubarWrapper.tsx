"use client";

import { usePathname } from "next/navigation";
import MenuBar from "./MenuBar";
import { SessionProvider } from "next-auth/react";
import { Session } from "next-auth";

type MenubarWrapperProps = {
  session: Session | null;
};

export default function MenubarWrapper({ session }: MenubarWrapperProps) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/";

  if (isLoginPage) return null;

  return (
    <SessionProvider session={session}>
      <MenuBar session={session} /> {/* Pass session to MenuBar */}
    </SessionProvider>
  );
}
