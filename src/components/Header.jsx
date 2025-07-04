import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "./App"; // Adjust if stored elsewhere
import { account } from "./lib/appwrite";

export default function Header() {
  const { authUser, setAuthUser } = useAuth();
  const location = useLocation();
  const [loggingOut, setLoggingOut] = useState(false);

  const isAdmin = authUser?.isAdmin && !authUser?.isBlocked;

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await account.deleteSession("current");
      setAuthUser(null);
      window.location.href = "/";
    } catch (err) {
      console.error("Logout failed", err);
      setLoggingOut(false);
    }
  };

  const isActive = (path) =>
    location.pathname === path
      ? "font-bold text-blue-600"
      : "text-gray-700 dark:text-gray-300";

  return (
    <header className="w-full border-b bg-white dark:bg-[#18181b] shadow-sm">
      <div className="max-w-6xl mx-auto flex justify-between items-center px-4 py-3">
        {/* Navigation Left */}
        <div className="flex items-center gap-6">
          <Link to="/" className="text-xl font-bold text-gray-900 dark:text-white">FormBuilder</Link>
          <Link to="/" className={isActive("/")}>Home</Link>
          {authUser && (
            <>
              <Link to="/dashboard" className={isActive("/dashboard")}>Dashboard</Link>
              <Link to="/template/create" className={isActive("/template/create")}>Create Template</Link>
              {isAdmin && (
                <Link to="/admin" className={isActive("/admin")}>Admin Panel</Link>
              )}
            </>
          )}
        </div>

        {/* Navigation Right */}
        <div className="flex items-center gap-4">
          {authUser ? (
            <>
              <Link
                to={`/profile/${authUser.userId}`}
                className="text-sm font-medium hover:underline text-gray-800 dark:text-gray-100"
              >
                {authUser.name}
              </Link>
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="text-sm font-medium text-red-600"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className={isActive("/login")}>Login</Link>
              <Link to="/register" className={isActive("/register")}>Register</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
