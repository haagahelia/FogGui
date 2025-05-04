"use client";
import { useState } from "react";

const CreateAccountPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !password) {
      setError("Both fields are required.");
      return;
    }

    const res = await fetch("/api/create-account", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        password,
      }),
    });

    const data = await res.json();

    if (data.success) {
      setMessage("Account created successfully!");
    } else {
      setError(data.error || "Something went wrong");
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4">Create New Account</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {message && <p className="text-green-500 mb-4">{message}</p>}
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label htmlFor="username" className="block mb-2 text-lg">
            Username
          </label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
          />
        </div>
        <div className="mb-6">
          <label htmlFor="password" className="block mb-2 text-lg">
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white py-2 px-6 rounded-md hover:bg-blue-600"
        >
          Create Account
        </button>
      </form>
    </div>
  );
};

export default CreateAccountPage;
