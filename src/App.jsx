import React from "react";
import AppWithAuth from "./AppWithAuth";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { AuthProvider } from "./contexts/AuthContext";

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <AppWithAuth />
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
