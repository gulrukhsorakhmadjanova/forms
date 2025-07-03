import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../App";

export default function Header({ theme, setTheme, lang, setLang, t }) {
  const { authUser } = useAuth();
  const pathname = useLocation().pathname;
  const isAdmin = authUser && authUser.isAdmin;
  const isBlocked = authUser && authUser.isBlocked;
  const isAuthed = !!authUser && !isBlocked;

  return (
    <header className="w-full border-b bg-white dark:bg-[#23232a]">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-2">
        <nav className="flex items-center gap-6">
          <Link to="/" className="font-semibold text-lg tracking-tight">FormBuilder</Link>
          {isAuthed && (
            <>
              <Link to="/template/create" className={pathname === "/template/create" ? "font-bold" : "font-normal"}>Create Template</Link>
              <Link to="/dashboard" className={pathname === "/dashboard" ? "font-bold" : "font-normal"}>Dashboard</Link>
              <Link to="/filled-forms" className={pathname === "/filled-forms" ? "font-bold" : "font-normal"}>Filled Forms</Link>
            </>
          )}
          {isAdmin && (
            <Link to="/admin" className={pathname === "/admin" ? "font-bold" : "font-normal"}>Admin Panel</Link>
          )}
        </nav>
        <div className="flex items-center gap-4">
          <button onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            title={theme === "light" ? t.dark : t.light}
            className="px-2 py-1 rounded border bg-white dark:bg-[#23232a] text-sm">
            {theme === "light" ? "🌙" : "☀️"}
          </button>
          <select value={lang} onChange={e => setLang(e.target.value)} className="px-2 py-1 rounded border bg-white dark:bg-[#23232a] text-sm">
            <option value="en">EN</option>
            <option value="uz">UZ</option>
            <option value="ru">RU</option>
          </select>
          {!isAuthed && (
            <>
              <Link to="/login" className="text-sm">Login</Link>
              <Link to="/register" className="text-sm">Register</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
} 