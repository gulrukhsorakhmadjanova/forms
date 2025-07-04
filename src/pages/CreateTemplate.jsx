import React, { useState, useEffect } from "react";
import { databases, account } from "../lib/appwrite";
import { ID } from "appwrite";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import ReactTagInput from "@pathofdev/react-tag-input";
import "@pathofdev/react-tag-input/build/index.css";

const topics = ["Education", "Quiz", "Other"];
const types = ["string-line", "multi-line", "integer", "checkbox", "drop-down"];

export default function CreateTemplate() {
  const navigate = useNavigate();
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
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const checkDark = () => {
      setIsDark(document.body.classList.contains("dark"));
    };
    checkDark();
    const observer = new MutationObserver(checkDark);
    observer.observe(document.body, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

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
    <div className="max-w-xl mx-auto p-6 bg-white dark:bg-[#23232a] rounded-xl shadow-lg transition-colors duration-300">
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Create Template</h2>
      {error && <p className="text-red-600 dark:text-red-400 mb-2">{error}</p>}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input name="title" placeholder="Title" onChange={handleChange} required className="border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-[#18181b] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <textarea name="description" placeholder="Description (markdown allowed)" onChange={handleChange} required className="border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-[#18181b] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <div className="my-2 bg-gray-50 dark:bg-[#23232a] p-3 rounded">
          <b className="text-gray-800 dark:text-gray-200">Preview:</b>
          <div className="border border-gray-200 dark:border-gray-700 p-2 rounded min-h-[40px] bg-white dark:bg-[#18181b] text-gray-900 dark:text-gray-100">
            <ReactMarkdown>{form.description}</ReactMarkdown>
          </div>
        </div>
        <select name="topic" onChange={handleChange} value={form.topic} className="border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-[#18181b] text-gray-900 dark:text-gray-100">
          {topics.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <label className="text-gray-800 dark:text-gray-200">Tags:</label>
        <ReactTagInput
          tags={tags}
          onChange={setTags}
          placeholder="Type and press enter"
        />
        <input name="imageUrl" placeholder="Image URL (optional)" onChange={handleChange} className="border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-[#18181b] text-gray-900 dark:text-gray-100" />
        <label className="flex items-center gap-2 text-gray-800 dark:text-gray-200">
          <input type="checkbox" name="isPublic" onChange={handleChange} /> Make Public
        </label>

        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-4">Questions</h3>
        {questions.map((q, i) => (
          <div key={i} className="mb-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-[#18181b]">
            <input placeholder="Title" value={q.title} onChange={e => handleQuestionChange(i, "title", e.target.value)} required className="border border-gray-300 dark:border-gray-600 rounded px-3 py-2 mb-2 w-full bg-white dark:bg-[#23232a] text-gray-900 dark:text-gray-100" />
            <textarea placeholder="Description" value={q.description} onChange={e => handleQuestionChange(i, "description", e.target.value)} className="border border-gray-300 dark:border-gray-600 rounded px-3 py-2 mb-2 w-full bg-white dark:bg-[#23232a] text-gray-900 dark:text-gray-100" />
            <select value={q.type} onChange={e => handleQuestionChange(i, "type", e.target.value)} className="border border-gray-300 dark:border-gray-600 rounded px-3 py-2 mb-2 w-full bg-white dark:bg-[#23232a] text-gray-900 dark:text-gray-100">
              {types.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            {(q.type === 'drop-down' || q.type === 'checkbox') && (
              <input placeholder="Options (comma-separated)" value={q.options} onChange={e => handleQuestionChange(i, "options", e.target.value)} className="border border-gray-300 dark:border-gray-600 rounded px-3 py-2 mb-2 w-full bg-white dark:bg-[#23232a] text-gray-900 dark:text-gray-100" />
            )}
            <input type="number" placeholder="Order" value={q.order} onChange={e => handleQuestionChange(i, "order", parseInt(e.target.value))} className="border border-gray-300 dark:border-gray-600 rounded px-3 py-2 mb-2 w-full bg-white dark:bg-[#23232a] text-gray-900 dark:text-gray-100" />
            <label className="flex items-center gap-2 text-gray-800 dark:text-gray-200">
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
  );
}
