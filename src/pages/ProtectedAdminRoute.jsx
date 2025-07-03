// ✅ ProtectedAdminRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../App"; // adjust path if needed

export default function ProtectedAdminRoute({ children }) {
  const { authUser, loading } = useAuth();

  if (loading) return <p>Loading...</p>;

  if (!authUser || !authUser.isAdmin || !authUser.isApproved || authUser.isBlocked) {
    return <Navigate to="/" />;
  }

  return children;
}
