import React, { useState } from "react";
import { databases, account } from "../lib/appwrite";
import { ID } from "appwrite";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import ReactTagInput from "@pathofdev/react-tag-input";
import "@pathofdev/react-tag-input/build/index.css";
import { useTheme } from "../contexts/ThemeContext";
import { useLanguage } from "../contexts/LanguageContext";
import TemplateFormFields from "../components/TemplateFormFields";
import TemplateQuestionsList from "../components/TemplateQuestionsList";
import AddQuestionButton from "../components/AddQuestionButton";

const topics = ["Education", "Quiz", "Other"];
const types = ["string-line", "multi-line", "integer", "checkbox", "drop-down"];

export default function CreateTemplate() {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const [form, setForm] = useState({
    title: "",
    description: "",
    topic: "Other",
    isPublic: false,
    imageUrl: ""
  });
  const [tags, setTags] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleQuestionChange = (index, field, value) => {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      { title: "", description: "", type: "string-line", options: "", order: questions.length + 1, showInTable: false }
    ]);
  };

  const removeQuestion = (index) => {
    const updated = [...questions];
    updated.splice(index, 1);
    setQuestions(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const user = await account.get();

      // 1. Create Template
      const tpl = await databases.createDocument(
        import.meta.env.VITE_APPWRITE_DB_ID,
        import.meta.env.VITE_APPWRITE_TEMPLATES_COLLECTION_ID,
        ID.unique(),
        {
          title: form.title,
          description: form.description,
          topic: form.topic,
          isPublic: form.isPublic,
          imageUrl: form.imageUrl,
          tags,
          createdBy: user.$id,
        }
      );

      // 2. Add questions
      for (const q of questions) {
        await databases.createDocument(
          import.meta.env.VITE_APPWRITE_DB_ID,
          import.meta.env.VITE_APPWRITE_QUESTIONS_COLLECTION_ID,
          ID.unique(),
          {
            templateId: tpl.$id,
            title: q.title,
            description: q.description,
            type: q.type,
            options: q.options ? q.options.split(",").map(o => o.trim()) : [],
            order: q.order,
            showInTable: q.showInTable
          }
        );
      }

      navigate("/");
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <div className={`max-w-xl w-full mx-auto p-6 rounded-xl shadow-lg transition-colors duration-300 ${isDark ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'}`}>
        <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>{t('createTemplate')}</h2>
        {error && <p className={`mb-2 ${isDark ? 'text-red-400' : 'text-red-600'}`}>{error}</p>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <TemplateFormFields
            form={form}
            handleChange={handleChange}
            tags={tags}
            setTags={setTags}
            isDark={isDark}
            t={t}
          />

          <h3 className={`text-lg font-semibold mt-4 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>{t('questions')}</h3>
          <TemplateQuestionsList
            questions={questions}
            handleQuestionChange={handleQuestionChange}
            removeQuestion={removeQuestion}
            isDark={isDark}
            t={t}
          />
          <AddQuestionButton onClick={addQuestion} t={t} />
          <button type="submit" className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded transition-colors">{t('saveTemplate')}</button>
        </form>
      </div>
    </div>
  );
}
