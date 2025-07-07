import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { account, databases } from "../lib/appwrite";
import { ID } from "appwrite";
import { useAuth } from "../App";
import { useLanguage } from "../App";
import { useTheme } from "../App";

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
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            name="name"
            placeholder={t('name')}
            value={form.name}
            onChange={handleChange}
            required
            className={`border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 transition-all duration-200 shadow-sm hover:shadow-md ${
              isDark 
                ? 'border-gray-600 bg-gray-900 text-gray-100' 
                : 'border-gray-300 bg-white text-gray-900'
            }`}
          />
          <input
            name="email"
            placeholder={t('email')}
            type="email"
            value={form.email}
            onChange={handleChange}
            required
            className={`border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 transition-all duration-200 shadow-sm hover:shadow-md ${
              isDark 
                ? 'border-gray-600 bg-gray-900 text-gray-100' 
                : 'border-gray-300 bg-white text-gray-900'
            }`}
          />
          <input
            name="password"
            placeholder={t('password')}
            type="password"
            value={form.password}
            onChange={handleChange}
            required
            className={`border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 transition-all duration-200 shadow-sm hover:shadow-md ${
              isDark 
                ? 'border-gray-600 bg-gray-900 text-gray-100' 
                : 'border-gray-300 bg-white text-gray-900'
            }`}
          />

          <div className="my-2">
            <label className={`block font-semibold mb-1 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>{t('areYouAdmin')}</label>
            <label className={`flex items-center gap-2 text-sm ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
              <input
                type="checkbox"
                name="isAdmin"
                checked={isAdmin}
                onChange={(e) => setIsAdmin(e.target.checked)}
                className="accent-blue-600"
              />
              {t('adminRequestText')}
            </label>
          </div>

          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-all duration-200 mt-2 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
            {t('register')}
          </button>
        </form>
        <div className={`border-t mt-8 pt-4 text-center transition-colors duration-300 ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>{t('alreadyHaveAccount')}</span>
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="ml-2 text-blue-600 dark:text-blue-400 hover:underline font-medium text-sm bg-transparent border-none cursor-pointer transition-colors duration-300"
          >
            {t('login')}
          </button>
        </div>
      </div>
    </div>
  );
}
