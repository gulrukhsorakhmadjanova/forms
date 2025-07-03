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
import Dashboard from "./pages/Dashboard";
import CreateTemplate from "./pages/CreateTemplate";
import HomePage from "./pages/HomePage";
import UserProfilePage from "./pages/UserProfilePage";
import TemplateViewPage from "./pages/TemplateViewPage";
import FillFormPage from "./pages/FillFormPage";
import FormViewPage from "./pages/FormViewPage";
import SearchPage from "./pages/SearchPage";
import AdminPage from "./pages/AdminPage";
import BlockedPage from "./pages/BlockedPage";
import NotFoundPage from "./pages/NotFoundPage";

// Contexts
const ThemeContext = createContext();
const LanguageContext = createContext();
const AuthContext = createContext();

// Hooks
export const useTheme = () => useContext(ThemeContext);
export const useLanguage = () => useContext(LanguageContext);
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

// Theme Provider
function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");
  useEffect(() => {
    document.body.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Language Provider
function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem("lang") || "en");
  useEffect(() => {
    localStorage.setItem("lang", lang);
  }, [lang]);
  return (
    <LanguageContext.Provider value={{ lang, setLang, t: translations[lang] }}>
      {children}
    </LanguageContext.Provider>
  );
}

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
            isApproved: dbUser.isApproved,
            isBlocked: dbUser.isBlocked,
            language: dbUser.language,
            theme: dbUser.theme,
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

// Header Component
function Header() {
  const { theme, setTheme } = useTheme();
  const { lang, setLang, t } = useLanguage();
  const { authUser, setAuthUser } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);
  const location = useLocation();

  const isAdmin = authUser?.isAdmin && authUser?.isApproved && !authUser?.isBlocked;

  const handleThemeToggle = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const handleLangChange = (e) => {
    setLang(e.target.value);
  };

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
    <header className="w-full border-b bg-white" style={{ minHeight: 56 }}>
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-2">
        <nav className="flex items-center gap-8">
          <Link to="/" className="font-semibold text-lg tracking-tight">FormBuilder</Link>
          {isAdmin && (
            <>
              <Link to="/dashboard" className={location.pathname === "/dashboard" ? "font-bold" : "font-normal"}>{t.dashboard}</Link>
              <Link to="/admin" className={location.pathname === "/admin" ? "font-bold" : "font-normal"}>{t.adminPanel}</Link>
            </>
          )}
          <Link to="/template/create" className={location.pathname === "/template/create" ? "font-bold" : "font-normal"}>{t.createTemplate}</Link>
        </nav>
        <div className="flex items-center gap-4">
          <button onClick={handleThemeToggle} title={theme === "light" ? t.dark : t.light} className="px-2 py-1 rounded border bg-white text-sm">
            {theme === "light" ? "🌙" : "☀️"}
          </button>
          <select value={lang} onChange={handleLangChange} className="px-2 py-1 rounded border bg-white text-sm">
            <option value="en">EN</option>
            <option value="uz">UZ</option>
            <option value="ru">RU</option>
          </select>
          {authUser ? (
            <>
              <span className="font-medium text-sm">{authUser.name}</span>
              <button onClick={handleLogout} disabled={loggingOut} className="px-3 py-1 rounded border bg-white text-sm font-medium" style={{ color: "#e11d48" }}>{t.logout}</button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm">{t.login}</Link>
              <Link to="/register" className="text-sm">{t.register}</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

// App Component
function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <Router>
            <Header />
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/template/create" element={<CreateTemplate />} />
              <Route path="/template/:id" element={<TemplateViewPage />} />
              <Route path="/template/:id/fill" element={<FillFormPage />} />
              <Route path="/form/:id" element={<FormViewPage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/profile" element={<UserProfilePage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/blocked" element={<BlockedPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Router>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
