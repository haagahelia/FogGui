"use client";
import Link from "next/link";
import { signOut } from 'next-auth/react';

const MenuBar = () => {
  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <h2 className="text-xl font-bold">FOG GUI</h2>

        <ul className="flex space-x-4">
          <li>
            <Link href="/dashboard" className="hover:text-gray-400">Dashboard</Link>
          </li>
          <li>
            <Link href="/hosts" className="hover:text-gray-400">Hosts</Link>
          </li>
          <li>
            <Link href="/groups" className="hover:text-gray-400">Groups</Link>
          </li>
          <li>
            <Link href="/images" className="hover:text-gray-400">Images</Link>
          </li>
          <li>
            <Link href="/tasks" className="hover:text-gray-400">Tasks</Link>
          </li>
          <li>
          <Link
                href="/"
                className="hover:text-red-400"
                onClick={(e) => {
                  e.preventDefault();
                  const confirmed = window.confirm("Are you sure you want to log out from FOG GUI?");
                  if (confirmed) {
                    signOut({ callbackUrl: '/' });
                  }
                }}
              >
                Logout
              </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default MenuBar;
