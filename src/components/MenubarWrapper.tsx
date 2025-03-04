"use client"; 
import { usePathname } from "next/navigation";
import MenuBar from "./MenuBar";

export default function MenubarWrapper() {
  const pathname = usePathname();
  const isLoginPage = pathname === "/"; // Hide menubar on login page

  return isLoginPage ? null : <MenuBar />;
}
