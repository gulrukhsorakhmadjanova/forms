import React from "react";
import PropTypes from "prop-types";

export default function LoginForm({ form, handleChange, handleSubmit, isDark, t, loading }) {
  return (
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
  );
}

LoginForm.propTypes = {
  form: PropTypes.object.isRequired,
  handleChange: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  isDark: PropTypes.bool.isRequired,
  t: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
}; 