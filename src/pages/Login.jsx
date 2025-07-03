import React, { useState } from "react";
import { account, databases } from "../lib/appwrite";
import { useNavigate } from "react-router-dom";
import { ID, Query } from "appwrite";

export default function Login() {
  const navigate = useNavigate();
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

      const alreadyExists = res.documents.length > 0;

      // Step 5: If not, create user record in DB
      if (!alreadyExists) {
        await databases.createDocument(dbId, usersCol, ID.unique(), {
          authUserId: authUserId,
          name: user.name || "Unnamed User",
          email: user.email,
          avatarUrl: user.prefs?.avatarUrl || "",
          isAdmin: false,
          isBlocked: false,
          language: "en",
          theme: "light",
          isApproved: false, // Optional: for admin-only access
        });
      }

      // Step 6: Redirect to dashboard
      navigate("/dashboard");

    } catch (err) {
      console.error("Login Error:", err);
      setError(err.message || "Login failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafafb]">
      <div className="card" style={{ maxWidth: 400, width: "100%" }}>
        <h2 style={{ textAlign: "center", marginBottom: 8 }}>Login</h2>
        <p style={{ textAlign: "center", color: "#888", marginBottom: 24, fontSize: 15 }}>Sign in to your account</p>
        {error && <p className="error">{error}</p>}
        <form onSubmit={handleSubmit} autoComplete="off">
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
            className="mb-3"
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
            className="mb-3"
          />
          <button type="submit" className="w-full" style={{ marginTop: 8 }}>Login</button>
        </form>
        <div style={{ borderTop: "1px solid #eee", margin: "24px 0 0 0", paddingTop: 16, textAlign: "center" }}>
          <span style={{ color: "#888", fontSize: 15 }}>Don't have an account?</span>
          <button type="button" onClick={() => navigate("/register")}
            style={{ background: "none", color: "#2563eb", border: "none", fontWeight: 500, marginLeft: 8, cursor: "pointer" }}>
            Register
          </button>
        </div>
      </div>
    </div>
  );
}
