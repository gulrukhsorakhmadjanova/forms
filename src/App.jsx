import React, { useState, createContext, useContext, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
} from "react-router-dom";
import { account, databases } from "./lib/appwrite";
import { ID } from "appwrite";

// Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import CreateTemplate from "./pages/CreateTemplate";
import HomePage from "./pages/HomePage";
import UserProfilePage from "./pages/UserProfilePage";
import TemplateViewPage from "./pages/TemplateViewPage";
import FillFormPage from "./pages/FillFormPage";
import AdminPage from "./pages/AdminPage";
import BlockedPage from "./pages/BlockedPage";
import NotFoundPage from "./pages/NotFoundPage";
import FilledFormsPage from "./pages/FilledFormsPage";

// Contexts
const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

// Translations
const translations = {
  en: {
    login: "Login",
    register: "Register",
    dashboard: "Dashboard",
    templates: "Templates",
    createTemplate: "Create Template",
    dark: "Dark",
    light: "Light",
    english: "English",
    uzbek: "Uzbek",
    russian: "Russian",
    logout: "Logout",
    adminPanel: "Admin Panel",
  },
  uz: {
    login: "Kirish",
    register: "Ro'yxatdan o'tish",
    dashboard: "Boshqaruv paneli",
    templates: "Shablonlar",
    createTemplate: "Shablon yaratish",
    dark: "Qorong'u",
    light: "Yorug'",
    english: "Inglizcha",
    uzbek: "O'zbekcha",
    russian: "Ruscha",
    logout: "Chiqish",
    adminPanel: "Admin Paneli",
  },
  ru: {
    login: "Войти",
    register: "Регистрация",
    dashboard: "Панель",
    templates: "Шаблоны",
    createTemplate: "Создать шаблон",
    dark: "Тёмная",
    light: "Светлая",
    english: "Английский",
    uzbek: "Узбекский",
    russian: "Русский",
    logout: "Выйти",
    adminPanel: "Панель Админа",
  },
};

// Auth Provider
function AuthProvider({ children }) {
  const [authUser, setAuthUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      setLoading(true);
      try {
        const user = await account.get();
        const userId = user.$id;
        const dbId = import.meta.env.VITE_APPWRITE_DB_ID;
        const usersCol = import.meta.env.VITE_APPWRITE_USERS_COLLECTION_ID;

        const res = await databases.listDocuments(dbId, usersCol);
        const dbUser = res.documents.find((u) => u.authUserId === userId);

        if (dbUser) {
          setAuthUser({
            userId,
            name: dbUser.name,
            email: dbUser.email,
            isAdmin: dbUser.isAdmin,
            isBlocked: dbUser.isBlocked,
          });
        } else {
          setAuthUser(null);
        }
      } catch {
        setAuthUser(null);
      }
      setLoading(false);
    }

    fetchUser();
  }, []);

  return (
    <AuthContext.Provider value={{ authUser, setAuthUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

// Header
function Header() {
  const { authUser, setAuthUser } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);
  const location = useLocation();

  const isAdmin = authUser?.isAdmin && !authUser?.isBlocked;

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await account.deleteSession("current");
      setAuthUser(null);
      window.location.href = "/";
    } catch {
      setLoggingOut(false);
    }
  };

  return (
    <header className="w-full border-b bg-white dark:bg-[#18181b] dark:border-gray-700 shadow-sm z-50 sticky top-0">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-2">
        <nav className="flex items-center gap-6 text-sm font-medium">
          <Link to="/" className="text-blue-600 dark:text-blue-400 font-bold text-lg">FormBuilder</Link>
          {isAdmin && (
            <>
              <Link to="/dashboard" className={location.pathname === "/dashboard" ? "underline" : ""}>{translations.en.dashboard}</Link>
              <Link to="/admin" className={location.pathname === "/admin" ? "underline" : ""}>{translations.en.adminPanel}</Link>
            </>
          )}
          <Link to="/template/create" className={location.pathname === "/template/create" ? "underline" : ""}>{translations.en.createTemplate}</Link>
        </nav>
        <div className="flex items-center gap-3">
          <select
            value="en" // Removed theme and language logic
            onChange={(e) => {}} // Removed theme and language logic
            className="px-2 py-1 rounded border dark:border-gray-600 text-sm"
          >
            <option value="en">{translations.en.english}</option>
            <option value="uz">{translations.uz.uzbek}</option>
            <option value="ru">{translations.ru.russian}</option>
          </select>
          {authUser ? (
            <>
              <Link
                to="/profile"
                className="text-sm font-semibold hover:underline text-blue-600 dark:text-blue-400 cursor-pointer"
              >
                {authUser.name}
              </Link>
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="text-red-600 text-sm font-medium"
              >
                {translations.en.logout}
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm">{translations.en.login}</Link>
              <Link to="/register" className="text-sm">{translations.en.register}</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

// App
export default function App() {
  return (
        <AuthProvider>
          <Router>
            <Header />
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/template/create" element={<CreateTemplate />} />
              <Route path="/template/:id" element={<TemplateViewPage />} />
              <Route path="/template/:id/fill" element={<FillFormPage />} />
          <Route path="/profile" element={<UserProfilePage />} /> {/* self profile */}
          <Route path="/profile/:userId" element={<UserProfilePage />} /> {/* public profiles */}
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/blocked" element={<BlockedPage />} />
          <Route path="/filled-forms" element={<FilledFormsPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Router>
        </AuthProvider>
  );
}
