import React, { useEffect, useState } from "react";
import { databases } from "../lib/appwrite";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { useLanguage } from "../contexts/LanguageContext";
import { Query } from "appwrite";
import FilledFormsList from "../components/FilledFormsList";

export default function FilledFormsPage() {
  const { authUser } = useAuth();
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const [forms, setForms] = useState([]);
  const [templatesMap, setTemplatesMap] = useState({});
  const [questionsMap, setQuestionsMap] = useState({});

  const dbId = import.meta.env.VITE_APPWRITE_DB_ID;
  const formsCol = import.meta.env.VITE_APPWRITE_FORMS_COLLECTION_ID;
  const templatesCol = import.meta.env.VITE_APPWRITE_TEMPLATES_COLLECTION_ID;
  const questionsCol = import.meta.env.VITE_APPWRITE_QUESTIONS_COLLECTION_ID;

  useEffect(() => {
    async function fetchData() {
      try {
        const [formsRes, templatesRes, questionsRes] = await Promise.all([
          databases.listDocuments(dbId, formsCol, [
            Query.equal("createdBy", authUser.userId),
          ]),
          databases.listDocuments(dbId, templatesCol),
          databases.listDocuments(dbId, questionsCol),
        ]);

        setForms(formsRes.documents);

        const tMap = {};
        templatesRes.documents.forEach((t) => {
          tMap[t.$id] = t;
        });
        setTemplatesMap(tMap);

        const qMap = {};
        questionsRes.documents.forEach((q) => {
          if (!qMap[q.templateId]) qMap[q.templateId] = [];
          qMap[q.templateId].push(q);
        });
        setQuestionsMap(qMap);
      } catch (err) {
        console.error("Failed to fetch filled forms:", err);
      }
    }

    if (authUser) {
      fetchData();
    }
  }, [authUser]);

  // Helper function to parse formatted answer strings
  const parseAnswers = (answersArray) => {
    if (!Array.isArray(answersArray)) return [];
    
    return answersArray.map(answerStr => {
      // Handle the format "Q: Question Title | A: Answer"
      if (answerStr.includes('|')) {
        const parts = answerStr.split('|');
        if (parts.length >= 2) {
          const question = parts[0].replace('Q:', '').trim();
          const answer = parts[1].replace('A:', '').trim();
          return { question, answer };
        }
      }
      
      // Handle "Open Answer: ..." format
      if (answerStr.startsWith('Open Answer:')) {
        return { question: t('openAnswer'), answer: answerStr.replace('Open Answer:', '').trim() };
      }
      
      // Fallback for other formats
      return { question: t('unknownQuestion'), answer: answerStr };
    });
  };

  if (!authUser) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${isDark ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900'}`}>
        <div className={`text-center p-10`}>
          {t('pleaseLoginToView')}
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900'}`}>
      <div className={`max-w-4xl mx-auto mt-0 p-6 rounded-xl shadow-lg transition-colors duration-300 ${isDark ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'}`}>
        <h2 className={`text-2xl font-bold mb-6 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>{t('filledForms')}</h2>
        {forms.length === 0 ? (
          <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>{t('noFilledFormsFound')}</p>
        ) : (
          <FilledFormsList
            forms={forms}
            templatesMap={templatesMap}
            questionsMap={questionsMap}
            parseAnswers={parseAnswers}
            isDark={isDark}
            t={t}
          />
        )}
      </div>
    </div>
  );
}
