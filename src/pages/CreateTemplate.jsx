import React, { useState } from "react";
import { databases, account } from "../lib/appwrite";
import { ID } from "appwrite";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import ReactTagInput from "@pathofdev/react-tag-input";
import "@pathofdev/react-tag-input/build/index.css";
import { useTheme } from "../App";

const topics = ["Education", "Quiz", "Other"];
const types = ["string-line", "multi-line", "integer", "checkbox", "drop-down"];

export default function CreateTemplate() {
  const navigate = useNavigate();
  const { isDark } = useTheme();
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
        <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>Create Template</h2>
        {error && <p className={`mb-2 ${isDark ? 'text-red-400' : 'text-red-600'}`}>{error}</p>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input name="title" placeholder="Title" onChange={handleChange} required className={`border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300 ${isDark ? 'border-gray-600 bg-gray-900 text-gray-100' : 'border-gray-300 bg-white text-gray-900'}`} />
          <textarea name="description" placeholder="Description (markdown allowed)" onChange={handleChange} required className={`border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300 ${isDark ? 'border-gray-600 bg-gray-900 text-gray-100' : 'border-gray-300 bg-white text-gray-900'}`} />
          <div className={`my-2 p-3 rounded transition-colors duration-300 ${isDark ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
            <b className={isDark ? 'text-gray-200' : 'text-gray-800'}>Preview:</b>
            <div className={`border p-2 rounded min-h-[40px] transition-colors duration-300 ${isDark ? 'border-gray-700 bg-gray-900 text-gray-100' : 'border-gray-200 bg-white text-gray-900'}`}>
              <ReactMarkdown>{form.description}</ReactMarkdown>
            </div>
          </div>
          <select name="topic" onChange={handleChange} value={form.topic} className={`border rounded px-3 py-2 transition-colors duration-300 ${isDark ? 'border-gray-600 bg-gray-900 text-gray-100' : 'border-gray-300 bg-white text-gray-900'}`}>
            {topics.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <label className={isDark ? 'text-gray-200' : 'text-gray-800'}>Tags:</label>
          <ReactTagInput
            tags={tags}
            onChange={setTags}
            placeholder="Type and press enter"
          />
          <input name="imageUrl" placeholder="Image URL (optional)" onChange={handleChange} className={`border rounded px-3 py-2 transition-colors duration-300 ${isDark ? 'border-gray-600 bg-gray-900 text-gray-100' : 'border-gray-300 bg-white text-gray-900'}`} />
          <label className={`flex items-center gap-2 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
            <input type="checkbox" name="isPublic" onChange={handleChange} /> Make Public
          </label>

          <h3 className={`text-lg font-semibold mt-4 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>Questions</h3>
          {questions.map((q, i) => (
            <div key={i} className={`mb-4 p-4 border rounded-lg transition-colors duration-300 ${isDark ? 'border-gray-700 bg-gray-900 text-gray-100' : 'border-gray-200 bg-gray-50 text-gray-900'}`}>
              <input placeholder="Title" value={q.title} onChange={e => handleQuestionChange(i, "title", e.target.value)} required className={`border rounded px-3 py-2 mb-2 w-full transition-colors duration-300 ${isDark ? 'border-gray-600 bg-gray-800 text-gray-100' : 'border-gray-300 bg-white text-gray-900'}`} />
              <textarea placeholder="Description" value={q.description} onChange={e => handleQuestionChange(i, "description", e.target.value)} className={`border rounded px-3 py-2 mb-2 w-full transition-colors duration-300 ${isDark ? 'border-gray-600 bg-gray-800 text-gray-100' : 'border-gray-300 bg-white text-gray-900'}`} />
              <select value={q.type} onChange={e => handleQuestionChange(i, "type", e.target.value)} className={`border rounded px-3 py-2 mb-2 w-full transition-colors duration-300 ${isDark ? 'border-gray-600 bg-gray-800 text-gray-100' : 'border-gray-300 bg-white text-gray-900'}`}>
                {types.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              {(q.type === 'drop-down' || q.type === 'checkbox') && (
                <input placeholder="Options (comma-separated)" value={q.options} onChange={e => handleQuestionChange(i, "options", e.target.value)} className={`border rounded px-3 py-2 mb-2 w-full transition-colors duration-300 ${isDark ? 'border-gray-600 bg-gray-800 text-gray-100' : 'border-gray-300 bg-white text-gray-900'}`} />
              )}
              <input type="number" placeholder="Order" value={q.order} onChange={e => handleQuestionChange(i, "order", parseInt(e.target.value))} className={`border rounded px-3 py-2 mb-2 w-full transition-colors duration-300 ${isDark ? 'border-gray-600 bg-gray-800 text-gray-100' : 'border-gray-300 bg-white text-gray-900'}`} />
              <label className={`flex items-center gap-2 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                <input type="checkbox" checked={q.showInTable} onChange={e => handleQuestionChange(i, "showInTable", e.target.checked)} />
                Show in Table
              </label>
              <button type="button" onClick={() => removeQuestion(i)} className="mt-2 text-red-600 dark:text-red-400 hover:underline">Remove Question</button>
            </div>
          ))}
          <button type="button" onClick={addQuestion} className="mb-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition-colors">+ Add Question</button>
          <button type="submit" className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded transition-colors">Save Template</button>
        </form>
      </div>
    </div>
  );
}
