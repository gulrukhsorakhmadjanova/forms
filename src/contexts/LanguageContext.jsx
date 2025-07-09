import React, { createContext, useContext, useState } from "react";
import translations from "../translations/index";

const LanguageContext = createContext();
export const useLanguage = () => useContext(LanguageContext);

export function LanguageProvider({ children }) {
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    return localStorage.getItem("language") || "en";
  });

  const changeLanguage = (lang) => {
    setCurrentLanguage(lang);
    localStorage.setItem("language", lang);
  };

  const t = (key) => {
    return translations[currentLanguage]?.[key] || translations.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ currentLanguage, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}
