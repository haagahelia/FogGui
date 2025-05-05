"use client";
import { useSession } from "next-auth/react";
import { useState } from "react";

const ChangePasswordPage = () => {
  const { data: session } = useSession();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword || !newPassword) {
      setError("Both fields are required.");
      return;
    }

    const res = await fetch("/api/change-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: session?.user?.username,
        currentPassword,
        newPassword,
      }),
    });

    const data = await res.json();

    if (data.success) {
      setMessage("Password changed successfully!");
    } else {
      setError(data.error || "Something went wrong");
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4">Change Password</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {message && <p className="text-green-500 mb-4">{message}</p>}
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label htmlFor="currentPassword" className="block mb-2 text-lg">
            Current Password
          </label>
          <input
            type="password"
            id="currentPassword"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
          />
        </div>
        <div className="mb-6">
          <label htmlFor="newPassword" className="block mb-2 text-lg">
            New Password
          </label>
          <input
            type="password"
            id="newPassword"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white py-2 px-6 rounded-md hover:bg-blue-600"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default ChangePasswordPage;
