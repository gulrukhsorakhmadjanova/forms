import React, { useState } from "react";
import { account, databases } from "../lib/appwrite";
import { useNavigate } from "react-router-dom";
import { ID, Query } from "appwrite";
import { useAuth } from "../App"; // ✅ Import the Auth context

export default function Login() {
  const navigate = useNavigate();
  const { setAuthUser } = useAuth(); // ✅ Use Auth context to update user state
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const dbId = import.meta.env.VITE_APPWRITE_DB_ID;
  const usersCol = import.meta.env.VITE_APPWRITE_USERS_COLLECTION_ID;

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // Step 1: End current session if exists
      try {
        await account.deleteSession("current");
      } catch (_) {}

      // Step 2: Login
      await account.createEmailPasswordSession(form.email, form.password);

      // Step 3: Get Appwrite Auth User
      const user = await account.get();
      const authUserId = user.$id;

      // Step 4: Check if user already exists in DB
      const res = await databases.listDocuments(dbId, usersCol, [
        Query.equal("authUserId", authUserId),
      ]);

      let dbUser;
      if (res.documents.length > 0) {
        dbUser = res.documents[0];
      } else {
        dbUser = await databases.createDocument(dbId, usersCol, ID.unique(), {
          authUserId: authUserId,
          name: user.name || "Unnamed User",
          email: user.email,
          avatarUrl: user.prefs?.avatarUrl || "",
          isAdmin: false,
          isBlocked: false,
        });
      }

      // ✅ Set authUser to DB user object for context (matches AuthProvider)
      setAuthUser({
        userId: dbUser.authUserId,
        name: dbUser.name,
        email: dbUser.email,
        isAdmin: dbUser.isAdmin,
        isBlocked: dbUser.isBlocked,
      });

      // Step 6: Redirect to dashboard
      navigate("/");

    } catch (err) {
      console.error("Login Error:", err);
      if (err.message.includes("Unknown attribute")) {
        setError("Invalid document structure: Unknown attribute(s) in user record.");
      } else {
        setError(err.message || "Login failed. Please try again.");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center transition-colors duration-300">
      <div className="w-full max-w-md bg-white dark:bg-[#23232a] rounded-xl shadow-lg p-8 transition-colors duration-300">
        <h2 className="text-2xl font-bold text-center mb-2 text-gray-900 dark:text-gray-100">Login</h2>
        <p className="text-center text-gray-500 dark:text-gray-300 mb-6 text-base transition-colors duration-300">Sign in to your account</p>
        {error && (
          <p className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200 px-3 py-2 rounded mb-4 text-center text-sm transition-colors duration-300">
            {error}
          </p>
        )}
        <form onSubmit={handleSubmit} autoComplete="off" className="flex flex-col gap-4">
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
            className="border border-gray-300 dark:border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-[#18181b] text-gray-900 dark:text-gray-100 transition-colors duration-300"
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
            className="border border-gray-300 dark:border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-[#18181b] text-gray-900 dark:text-gray-100 transition-colors duration-300"
          />
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded transition-colors mt-2">
            Login
          </button>
        </form>
        <div className="border-t border-gray-200 dark:border-gray-700 mt-8 pt-4 text-center transition-colors duration-300">
          <span className="text-gray-500 dark:text-gray-300 text-sm">Don't have an account?</span>
          <button
            type="button"
            onClick={() => navigate("/register")}
            className="ml-2 text-blue-600 dark:text-blue-400 hover:underline font-medium text-sm bg-transparent border-none cursor-pointer transition-colors duration-300"
          >
            Register
          </button>
        </div>
      </div>
    </div>
  );
}
