import React, { useState } from "react";
import { account, databases } from "../lib/appwrite";
import { ID, Permission, Role, Query } from "appwrite";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();
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
      // Step 1: Create Appwrite Auth account
      await account.create(ID.unique(), form.email, form.password, form.name);

      // Step 2: Clear existing session if any
      try {
        await account.deleteSession("current");
      } catch (_) {}

      // Step 3: Login
      await account.createEmailPasswordSession(form.email, form.password);

      // Step 4: Get Auth user
      const user = await account.get();
      const authUserId = user.$id;

      // Step 5: Check if already exists in DB
      const res = await databases.listDocuments(dbId, usersCol, [
        Query.equal("authUserId", authUserId),
      ]);

      const exists = res.documents.length > 0;

      // Step 6: Create if not exists
      if (!exists) {
        await databases.createDocument(
          dbId,
          usersCol,
          ID.unique(),
          {
            authUserId,
            name: user.name || "Unnamed",
            email: user.email,
            avatarUrl: user.prefs?.avatarUrl || "",
            isAdmin,
            isBlocked: false,
            isApproved: false,
            language: "en",
            theme: "light",
          },
          [
            Permission.read(Role.user(authUserId)),
            Permission.update(Role.user(authUserId)),
            Permission.delete(Role.user(authUserId)),
          ]
        );
      }

      // Step 7: Navigate to dashboard
      navigate("/dashboard");

    } catch (err) {
      console.error("Registration Error:", err);
      setError(err.message || "Registration failed");
    }
  };

  return (
    <div className="card">
      <h2>Register</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          name="name"
          placeholder="Name"
          value={form.name}
          onChange={handleChange}
          required
        />
        <input
          name="email"
          placeholder="Email"
          type="email"
          value={form.email}
          onChange={handleChange}
          required
        />
        <input
          name="password"
          placeholder="Password"
          type="password"
          value={form.password}
          onChange={handleChange}
          required
        />

        <div style={{ margin: "18px 0" }}>
          <label style={{ fontWeight: 600, display: "block", marginBottom: 6 }}>
            Are you an admin?
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input
              type="checkbox"
              name="isAdmin"
              checked={isAdmin}
              onChange={(e) => setIsAdmin(e.target.checked)}
            />
            Yes, I want to be an admin (requires approval)
          </label>
        </div>

        <button type="submit">Register</button>
      </form>
      <p style={{ textAlign: "center", marginTop: 16 }}>
        Already have an account?{" "}
        <button type="button" onClick={() => navigate("/")}>
          Login
        </button>
      </p>
    </div>
  );
}
