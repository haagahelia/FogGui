"use client";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import MenuBar from "./MenuBar";

export default function MenubarWrapper() {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  if (pathname === "/" || status === "loading") return null;

  return <MenuBar session={session} />;
}