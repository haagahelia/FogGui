"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useState } from "react";
import PersonIcon from "@mui/icons-material/Person";
import {Session} from 'next-auth'

// Define the type for the MenuBar props
interface MenuBarProps {
  session: Session | null;
}

const MenuBar = ({ session }: MenuBarProps) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <h2 className="text-xl font-bold">FOG GUI</h2>
        <ul className="flex space-x-4 items-center">
          <li>
            <Link href="/dashboard" className="hover:text-gray-400">
              Dashboard
            </Link>
          </li>
          <li>
            <Link href="/hosts" className="hover:text-gray-400">
              Hosts
            </Link>
          </li>
          <li>
            <Link href="/groups" className="hover:text-gray-400">
              Groups
            </Link>
          </li>
          <li>
            <Link href="/images" className="hover:text-gray-400">
              Images
            </Link>
          </li>
          <li>
            <Link href="/tasks" className="hover:text-gray-400">
              Tasks
            </Link>
          </li>
          {/* User icon and dropdown */}
          {session?.user && (
            <li className="relative flex items-center">
              <div
                onClick={toggleDropdown} // Toggle dropdown on click
                className="flex items-center cursor-pointer border-l-2 pl-4"
              >
                <div className="rounded-full bg-gray-400 p-2 mr-2">
                  <PersonIcon style={{ color: "white" }} />
                </div>
                <span className="text-white">{session.user.username}</span>
              </div>
              {isDropdownOpen && (
                <div
                  className="absolute left-0 mt-2 w-48 bg-gray-700 text-white rounded-md shadow-lg border border-gray-600"
                  style={{ top: "100%" }} // Position dropdown below the user icon
                >
                  {session.user.role === "admin" && (
                    <>
                      <Link
                        href="/userview"
                        className="block px-4 py-2 hover:bg-gray-600"
                      >
                        Change Password
                      </Link>
                      <Link
                        href="/admin/create-account"
                        className="block px-4 py-2 hover:bg-gray-600"
                      >
                        Create Account
                      </Link>
                    </>
                  )}
                  {session.user.role === "user" && (
                    <Link
                      href="/userview"
                      className="block px-4 py-2 hover:bg-gray-600"
                    >
                      Change Password
                    </Link>
                  )}
                  <Link
                    href="/"
                    className="block px-4 py-2 hover:bg-red-600"
                    onClick={(e) => {
                      e.preventDefault();
                      const confirmed = window.confirm(
                        "Are you sure you want to log out from FOG GUI?"
                      );
                      if (confirmed) {
                        localStorage.removeItem("selectedGroup")
                        signOut({ callbackUrl: "/" });
                      }
                    }}
                  >
                    Logout
                  </Link>
                </div>
              )}
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default MenuBar;
