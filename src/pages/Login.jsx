import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { account, databases } from "../lib/appwrite";
import { ID } from "appwrite";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import { useTheme } from "../contexts/ThemeContext";
import LoginForm from "../components/LoginForm";
import DontHaveAccount from "../components/DontHaveAccount";

export default function Login() {
  const navigate = useNavigate();
  const { setAuthUser } = useAuth();
  const { t } = useLanguage();
  const { isDark } = useTheme();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Validate environment variables
      const dbId = import.meta.env.VITE_APPWRITE_DB_ID;
      const usersCol = import.meta.env.VITE_APPWRITE_USERS_COLLECTION_ID;
      
      if (!dbId || !usersCol) {
        setError("Configuration error. Please contact support.");
        return;
      }

      await account.createEmailPasswordSession(form.email, form.password);
      
      const user = await account.get();
      const userId = user.$id;

      const res = await databases.listDocuments(dbId, usersCol);
      const dbUser = res.documents.find((u) => u.authUserId === userId);

      if (dbUser) {
        if (dbUser.isBlocked) {
          setError("Your account has been blocked.");
          await account.deleteSession("current");
          return;
        }

        setAuthUser({
          userId,
          name: dbUser.name,
          email: dbUser.email,
          isAdmin: dbUser.isAdmin,
          isBlocked: dbUser.isBlocked,
        });

        navigate("/");
      } else {
        setError("User not found in database.");
        await account.deleteSession("current");
      }
    } catch (err) {
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
      <div className={`w-full max-w-md rounded-xl shadow-xl p-8 transition-colors duration-300 border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <h2 className={`text-2xl font-bold text-center mb-2 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>{t('login')}</h2>
        <p className={`text-center mb-6 text-base transition-colors duration-300 ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>{t('signInToAccount')}</p>
        
        {error && (
          <p className={`px-3 py-2 rounded mb-4 text-center text-sm transition-colors duration-300 ${
            isDark ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-700'
          }`}>
            {error}
          </p>
        )}
        <LoginForm
          form={form}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          isDark={isDark}
          t={t}
          loading={loading}
        />
        <DontHaveAccount isDark={isDark} t={t} navigate={navigate} />
      </div>
    </div>
  );
}