import React from "react";
import PropTypes from "prop-types";

export default function RegisterForm({ form, isAdmin, setForm, setIsAdmin, handleChange, handleSubmit, isDark, t }) {
  return (
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
        </label>
      </div>

      <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-all duration-200 mt-2 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
        {t('register')}
      </button>
    </form>
  );
}

RegisterForm.propTypes = {
  form: PropTypes.object.isRequired,
  isAdmin: PropTypes.bool.isRequired,
  setForm: PropTypes.func.isRequired,
  setIsAdmin: PropTypes.func.isRequired,
  handleChange: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  isDark: PropTypes.bool.isRequired,
  t: PropTypes.func.isRequired,
}; 