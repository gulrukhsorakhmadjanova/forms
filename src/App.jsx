import React, { useState, createContext, useContext, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useParams, useLocation } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import CreateTemplate from "./pages/CreateTemplate";
import "./App.css";
import { databases, account } from "./lib/appwrite";
import { ID } from "appwrite";
import HomePage from "./pages/HomePage";
import UserProfilePage from "./pages/UserProfilePage";
import TemplateViewPage from "./pages/TemplateViewPage";
import FillFormPage from "./pages/FillFormPage";
import FormViewPage from "./pages/FormViewPage";
import SearchPage from "./pages/SearchPage";
import AdminPage from "./pages/AdminPage";
import BlockedPage from "./pages/BlockedPage";
import NotFoundPage from "./pages/NotFoundPage";

// Theme context
const ThemeContext = createContext();
export const useTheme = () => useContext(ThemeContext);

// Language context
const LanguageContext = createContext();
export const useLanguage = () => useContext(LanguageContext);

// Auth context
const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

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
  },
};

function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");
  useEffect(() => {
    document.body.dataset.theme = theme;
    localStorage.setItem("theme", theme);
  }, [theme]);
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

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

function AuthProvider({ children }) {
  const [authUser, setAuthUser] = useState(null); // { userId, name, email, isAdmin, isApproved, isBlocked, ... }
  const [loading, setLoading] = useState(true);

  // Try to load user from Appwrite session on mount
  useEffect(() => {
    async function fetchUser() {
      setLoading(true);
      try {
        const user = await account.get();
        const userId = user.$id;
        const dbId = import.meta.env.VITE_APPWRITE_DB_ID;
        const usersCol = import.meta.env.VITE_APPWRITE_USERS_COLLECTION_ID;
        const res = await databases.listDocuments(dbId, usersCol, []);
        const dbUser = res.documents.find(u => u.userId === userId);
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

function Header() {
  const { theme, setTheme } = useTheme();
  const { lang, setLang, t } = useLanguage();
  const { authUser, setAuthUser } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);
  const navigate = window.location.pathname;

  // Theme toggle handler
  const handleThemeToggle = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  // Language switcher handler
  const handleLangChange = (e) => {
    setLang(e.target.value);
  };

  // Logout handler
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

  // Only show Templates/Dashboard if admin
  const isAdmin = authUser && authUser.isAdmin && authUser.isApproved && !authUser.isBlocked;

  return (
    <header style={{ display: "flex", alignItems: "center", padding: 16, justifyContent: "space-between" }}>
      <nav style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <Link to="/">Home</Link>
        {isAdmin && <Link to="/dashboard">{t.dashboard}</Link>}
        <Link to="/template/create">{t.createTemplate}</Link>
      </nav>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginLeft: "auto" }}>
        {/* Theme toggle */}
        <button onClick={handleThemeToggle} title={theme === "light" ? t.dark : t.light} style={{ fontSize: 20, background: "none", border: "none", cursor: "pointer" }}>
          {theme === "light" ? "🌙" : "☀️"}
        </button>
        {/* Language switcher */}
        <select value={lang} onChange={handleLangChange} style={{ fontWeight: 500, borderRadius: 6, padding: "4px 10px" }}>
          <option value="en">EN</option>
          <option value="uz">UZ</option>
          <option value="ru">RU</option>
        </select>
        {/* User info and auth links */}
        {authUser ? (
          <>
            <span style={{ fontWeight: 500, marginRight: 8 }}>{authUser.name}</span>
            <button onClick={handleLogout} disabled={loggingOut} style={{ background: "#e11d48", color: "#fff", border: "none", borderRadius: 6, padding: "6px 16px", fontWeight: 500, cursor: "pointer" }}>
              {t.logout}
            </button>
          </>
        ) : (
          <>
            <Link to="/login">{t.login}</Link>
            <Link to="/register">{t.register}</Link>
          </>
        )}
      </div>
    </header>
  );
}

function FormCreate() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const templateId = params.get("template");
  const [questions, setQuestions] = useState([]);
  const [template, setTemplate] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // Fetch template
        const tpl = await databases.getDocument(
          import.meta.env.VITE_APPWRITE_DB_ID,
          import.meta.env.VITE_APPWRITE_TEMPLATES_COLLECTION_ID,
          templateId
        );
        setTemplate(tpl);
        // Fetch questions
        const res = await databases.listDocuments(
          import.meta.env.VITE_APPWRITE_DB_ID,
          import.meta.env.VITE_APPWRITE_QUESTIONS_COLLECTION_ID,
          [
            // Only questions for this template, ordered by 'order'
            // Appwrite Query: equal("templateId", templateId), orderAsc("order")
          ]
        );
        setQuestions(res.documents.filter(q => q.templateId === templateId).sort((a, b) => a.order - b.order));
      } catch (err) {
        setError("Could not load form");
      }
      setLoading(false);
    }
    if (templateId) fetchData();
  }, [templateId]);

  const handleChange = (qid, value) => {
    setAnswers(a => ({ ...a, [qid]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    try {
      const user = await account.get();
      const answerArr = questions.map(q => ({ questionId: q.$id, answer: answers[q.$id] || "" }));
      await databases.createDocument(
        import.meta.env.VITE_APPWRITE_DB_ID,
        import.meta.env.VITE_APPWRITE_FORMS_COLLECTION_ID,
        ID.unique(),
        {
          templateId,
          answers: answerArr,
          createdBy: user.$id,
          emailCopy: false, // Add checkbox if you want
        }
      );
      setSuccess(true);
    } catch (err) {
      setError("Could not submit form");
    }
  };

  if (!templateId) return <div className="card"><p className="error">No template selected.</p></div>;
  if (loading) return <div className="card"><p>Loading...</p></div>;
  if (error) return <div className="card"><p className="error">{error}</p></div>;
  if (!template) return null;

  return (
    <div className="card" style={{ maxWidth: 700 }}>
      <h2>Fill Out: {template.title}</h2>
      {success && <p style={{ color: 'green' }}>Form submitted!</p>}
      <form onSubmit={handleSubmit}>
        {questions.map(q => (
          <div key={q.$id} style={{ marginBottom: 18 }}>
            <label><b>{q.title}</b></label>
            <div style={{ fontSize: 13, color: '#888', marginBottom: 4 }}>{q.description}</div>
            {q.type === "single-line" && (
              <input type="text" value={answers[q.$id] || ""} onChange={e => handleChange(q.$id, e.target.value)} />
            )}
            {q.type === "multi-line" && (
              <textarea value={answers[q.$id] || ""} onChange={e => handleChange(q.$id, e.target.value)} />
            )}
            {q.type === "integer" && (
              <input type="number" min="0" value={answers[q.$id] || ""} onChange={e => handleChange(q.$id, e.target.value)} />
            )}
            {q.type === "checkbox" && (
              <input type="checkbox" checked={!!answers[q.$id]} onChange={e => handleChange(q.$id, e.target.checked)} />
            )}
            {q.type === "dropdown" && q.options && (
              <select value={answers[q.$id] || ""} onChange={e => handleChange(q.$id, e.target.value)}>
                <option value="">Select...</option>
                {q.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            )}
          </div>
        ))}
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

function TemplateDetails() {
  const { id } = useParams();
  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchTemplate() {
      setLoading(true);
      try {
        const res = await databases.getDocument(
          import.meta.env.VITE_APPWRITE_DB_ID,
          import.meta.env.VITE_APPWRITE_TEMPLATES_COLLECTION_ID,
          id
        );
        setTemplate(res);
      } catch (err) {
        setError("Template not found");
      }
      setLoading(false);
    }
    fetchTemplate();
  }, [id]);

  if (loading) return <div className="card"><p>Loading...</p></div>;
  if (error) return <div className="card"><p className="error">{error}</p></div>;
  if (!template) return null;

  return (
    <div className="card" style={{ maxWidth: 700 }}>
      <h2>{template.title}</h2>
      <p><b>Topic:</b> {template.topic}</p>
      <p><b>Description:</b> {template.description}</p>
      <p><b>Tags:</b> {(template.tags || []).join(", ")}</p>
      <p><b>Created By:</b> {template.createdBy}</p>
      <p><b>Public:</b> {template.isPublic ? "Yes" : "No"}</p>
      {template.imageURL && <img src={template.imageURL} alt="Template" style={{maxWidth: 200, margin: '16px 0'}} />}
      <button style={{marginTop: 16}} onClick={() => window.location.href = `/form/create?template=${template.$id}`}>Fill Out This Form</button>
    </div>
  );
}

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
              <Route path="/profile" element={<UserProfilePage />} />
              <Route path="/template/create" element={<CreateTemplate />} />
              <Route path="/template/:id" element={<TemplateViewPage />} />
              <Route path="/template/:id/fill" element={<FillFormPage />} />
              <Route path="/form/:id" element={<FormViewPage />} />
              <Route path="/search" element={<SearchPage />} />
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
