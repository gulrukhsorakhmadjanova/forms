import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { account, databases } from "../lib/appwrite";
import { ID } from "appwrite";
import { useAuth } from "../App";
import { useLanguage } from "../App";
import { useTheme } from "../App";

export default function Login() {
  const navigate = useNavigate();
  const { setAuthUser } = useAuth();
  const { t } = useLanguage();
  const { isDark } = useTheme();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Debug function to check environment variables
  // Removed checkEnvironment and testConnection functions

  // Check environment on component mount
  // Removed useEffect for checkEnvironment

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
        
        {/* Debug Section */}
        {/* Removed debug UI section */}
        
        {error && (
          <p className={`px-3 py-2 rounded mb-4 text-center text-sm transition-colors duration-300 ${
            isDark ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-700'
          }`}>
            {error}
          </p>
        )}
        <form onSubmit={handleSubmit} autoComplete="off" className="flex flex-col gap-4">
          <input
            name="email"
            type="email"
            placeholder={t('email')}
            value={form.email}
            onChange={handleChange}
            required
            disabled={loading}
            className={`border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 transition-all duration-200 shadow-sm hover:shadow-md ${
              isDark 
                ? 'border-gray-600 bg-gray-900 text-gray-100' 
                : 'border-gray-300 bg-white text-gray-900'
            } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          />
          <input
            name="password"
            type="password"
            placeholder={t('password')}
            value={form.password}
            onChange={handleChange}
            required
            disabled={loading}
            className={`border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 transition-all duration-200 shadow-sm hover:shadow-md ${
              isDark 
                ? 'border-gray-600 bg-gray-900 text-gray-100' 
                : 'border-gray-300 bg-white text-gray-900'
            } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          />
          <button 
            type="submit" 
            disabled={loading}
            className={`w-full font-semibold py-3 rounded-lg transition-all duration-200 mt-2 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              loading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {loading ? 'Logging in...' : t('login')}
          </button>
        </form>
        <div className={`border-t mt-8 pt-4 text-center transition-colors duration-300 ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>{t('dontHaveAccount')}</span>
          <button
            type="button"
            onClick={() => navigate("/register")}
            className="ml-2 text-blue-600 dark:text-blue-400 hover:underline font-medium text-sm bg-transparent border-none cursor-pointer transition-colors duration-300"
          >
            {t('register')}
          </button>
        </div>
      </div>
    </div>
  );
}
