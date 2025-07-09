import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { account, databases } from "../lib/appwrite";
import { ID } from "appwrite";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import { useTheme } from "../contexts/ThemeContext";
import RegisterForm from "../components/RegisterForm";
import AlreadyHaveAccount from "../components/AlreadyHaveAccount";

export default function Register() {
  const navigate = useNavigate();
  const { setAuthUser } = useAuth();
  const { t } = useLanguage();
  const { isDark } = useTheme();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // Create user account
      await account.create(ID.unique(), form.email, form.password, form.name);
      
      // Login to get session
      await account.createEmailPasswordSession(form.email, form.password);
      const user = await account.get();

      // Create user document in database
      const dbId = import.meta.env.VITE_APPWRITE_DB_ID;
      const usersCol = import.meta.env.VITE_APPWRITE_USERS_COLLECTION_ID;

      await databases.createDocument(dbId, usersCol, ID.unique(), {
        authUserId: user.$id,
        name: form.name,
        email: form.email,
        isAdmin: isAdmin,
        isBlocked: false,
      });

      // Set auth user
      setAuthUser({
        userId: user.$id,
        name: form.name,
        email: form.email,
        isAdmin: isAdmin,
        isBlocked: false,
      });

      navigate("/");
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
      <div className={`w-full max-w-md rounded-xl shadow-xl p-8 transition-colors duration-300 border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <h2 className={`text-2xl font-bold text-center mb-2 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>{t('register')}</h2>
        {error && (
          <p className={`px-3 py-2 rounded mb-4 text-center text-sm transition-colors duration-300 ${
            isDark ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-700'
          }`}>
            {error}
          </p>
        )}
        <RegisterForm
          form={form}
          isAdmin={isAdmin}
          setForm={setForm}
          setIsAdmin={setIsAdmin}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          isDark={isDark}
          t={t}
        />
        <AlreadyHaveAccount isDark={isDark} t={t} navigate={navigate} />
      </div>
    </div>
  );
}
