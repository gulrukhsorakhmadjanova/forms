import React from "react";
import { useTheme, useLanguage } from "../App";

export default function NotFoundPage() {
  const { isDark } = useTheme();
  const { t } = useLanguage();

  return (
    <div className="card max-w-md mx-auto mt-16 bg-white dark:bg-gray-800 rounded-xl shadow-lg transition-colors duration-300 text-center">
      <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-gray-100">{t('pageNotFound')}</h2>
      <p className="text-gray-700 dark:text-gray-300">{t('pageNotFoundMessage')}</p>
    </div>
  );
} 