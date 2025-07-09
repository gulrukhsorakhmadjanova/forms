import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import { useTheme } from "../contexts/ThemeContext";
import { account } from "../lib/appwrite";

export default function Header() {
    const { authUser, setAuthUser } = useAuth();
    const { currentLanguage, changeLanguage, t } = useLanguage();
    const { isDark, toggleTheme } = useTheme();
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
      <header className={`w-full border-b shadow-sm z-50 sticky top-0 transition-colors duration-300 ${
        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
          <nav className="flex items-center gap-6 text-sm font-medium">
            <Link to="/" className="text-blue-600 dark:text-blue-400 font-bold text-lg">FormBuilder</Link>
            {isAdmin && (
              <Link to="/admin" className={`${location.pathname === "/admin" ? "underline" : ""} ${
                isDark ? 'text-gray-200 hover:text-gray-100' : 'text-gray-700 hover:text-gray-900'
              }`}>
                {t('adminPanel')}
              </Link>
            )}
            <Link to="/template/create" className={`${location.pathname === "/template/create" ? "underline" : ""} ${
              isDark ? 'text-gray-200 hover:text-gray-100' : 'text-gray-700 hover:text-gray-900'
            }`}>
              {t('createTemplate')}
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            {/* Enhanced Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-sm hover:shadow-md ${
                isDark 
                  ? 'bg-gray-800 border-gray-600 hover:bg-gray-700 dark:focus:ring-offset-gray-800' 
                  : 'bg-white border-gray-200 hover:bg-gray-50'
              }`}
              title={isDark ? t('light') : t('dark')}
              aria-label={isDark ? t('light') : t('dark')}
            >
              {isDark ? (
                <svg className="w-5 h-5 text-yellow-500 transition-transform duration-200 hover:scale-110" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-gray-700 transition-transform duration-200 hover:scale-110" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>
            
            <select
              value={currentLanguage} 
              onChange={(e) => changeLanguage(e.target.value)} 
              className={`px-3 py-1 rounded border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 transition-colors shadow-sm ${
                isDark 
                  ? 'border-gray-600 bg-gray-800 text-gray-100' 
                  : 'border-gray-300 bg-white text-gray-900'
              }`}
            >
              <option value="en">{t('english')}</option>
              <option value="uz">{t('uzbek')}</option>
              <option value="ru">{t('russian')}</option>
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
                  {t('logout')}
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className={`text-sm ${
                  isDark ? 'text-gray-200 hover:text-gray-100' : 'text-gray-700 hover:text-gray-900'
                }`}>{t('login')}</Link>
                <Link to="/register" className={`text-sm ${
                  isDark ? 'text-gray-200 hover:text-gray-100' : 'text-gray-700 hover:text-gray-900'
                }`}>{t('register')}</Link>
              </>
            )}
          </div>
        </div>
      </header>
    );
  }
  