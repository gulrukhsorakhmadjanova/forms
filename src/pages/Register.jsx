import React, { useState } from "react";
import { account, databases } from "../lib/appwrite";
import { ID, Permission, Role, Query } from "appwrite";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../App"; // ✅ Import useAuth to update user context

export default function Register() {
  const navigate = useNavigate();
  const { setAuthUser } = useAuth(); // ✅ Use context setter
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState("");

  const dbId = import.meta.env.VITE_APPWRITE_DB_ID;
  const usersCol = import.meta.env.VITE_APPWRITE_USERS_COLLECTION_ID;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // Step 1: Register user (creates session)
      await account.create(ID.unique(), form.email, form.password, form.name);

      // Step 2: Delete existing session if any
      try {
        await account.deleteSession("current");
      } catch (_) {}

      // Step 3: Login again to create clean session
      await account.createEmailPasswordSession(form.email, form.password);

      // Step 4: Get Authenticated User
      const user = await account.get();
      const authUserId = user.$id;

      // Step 5: Check if user already exists in DB
      const res = await databases.listDocuments(dbId, usersCol, [
        Query.equal("authUserId", authUserId),
      ]);

      let dbUser;
      if (res.documents.length > 0) {
        dbUser = res.documents[0];
      } else {
        dbUser = await databases.createDocument(
          dbId,
          usersCol,
          ID.unique(),
          {
            authUserId,
            name: form.name,
            email: form.email,
            isAdmin,
            isBlocked: false,
            avatarUrl: user.prefs?.avatarUrl || "",
          },
          [
            Permission.read(Role.user(authUserId)),
            Permission.update(Role.user(authUserId)),
            Permission.delete(Role.user(authUserId)),
          ]
        );
      }

      // ✅ Set authUser to DB user object for context (matches AuthProvider)
      setAuthUser({
        userId: dbUser.authUserId,
        name: dbUser.name,
        email: dbUser.email,
        isAdmin: dbUser.isAdmin,
        isBlocked: dbUser.isBlocked,
      });

      // Step 7: Go to dashboard
      navigate("/");

    } catch (err) {
      console.error("Registration Error:", err);
      setError(err.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center transition-colors duration-300">
      <div className="w-full max-w-md bg-white dark:bg-[#23232a] rounded-xl shadow-lg p-8 transition-colors duration-300">
        <h2 className="text-2xl font-bold text-center mb-2 text-gray-900 dark:text-gray-100">Register</h2>
        {error && (
          <p className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200 px-3 py-2 rounded mb-4 text-center text-sm transition-colors duration-300">
            {error}
          </p>
        )}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            name="name"
            placeholder="Name"
            value={form.name}
            onChange={handleChange}
            required
            className="border border-gray-300 dark:border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-[#18181b] text-gray-900 dark:text-gray-100 transition-colors duration-300"
          />
          <input
            name="email"
            placeholder="Email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
            className="border border-gray-300 dark:border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-[#18181b] text-gray-900 dark:text-gray-100 transition-colors duration-300"
          />
          <input
            name="password"
            placeholder="Password"
            type="password"
            value={form.password}
            onChange={handleChange}
            required
            className="border border-gray-300 dark:border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-[#18181b] text-gray-900 dark:text-gray-100 transition-colors duration-300"
          />

          <div className="my-2">
            <label className="block font-semibold mb-1 text-gray-900 dark:text-gray-100">Are you an admin?</label>
            <label className="flex items-center gap-2 text-sm text-gray-900 dark:text-gray-100">
              <input
                type="checkbox"
                name="isAdmin"
                checked={isAdmin}
                onChange={(e) => setIsAdmin(e.target.checked)}
                className="accent-blue-600"
              />
              Yes, I want to be an admin (requires approval)
            </label>
          </div>

          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded transition-colors mt-2">
            Register
          </button>
        </form>
        <div className="border-t border-gray-200 dark:border-gray-700 mt-8 pt-4 text-center transition-colors duration-300">
          <span className="text-gray-500 dark:text-gray-300 text-sm">Already have an account?</span>
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="ml-2 text-blue-600 dark:text-blue-400 hover:underline font-medium text-sm bg-transparent border-none cursor-pointer transition-colors duration-300"
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
}
