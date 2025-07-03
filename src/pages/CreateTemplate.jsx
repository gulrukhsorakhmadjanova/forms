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

      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "auto" }}>
      <h2>Create Template</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        <input name="title" placeholder="Title" onChange={handleChange} required /><br /><br />
        <textarea name="description" placeholder="Description (markdown allowed)" onChange={handleChange} required /><br />
        <div style={{ margin: "8px 0", background: isDark ? "#23232a" : "#f8f8fa", padding: 8, borderRadius: 6 }}>
          <b>Preview:</b>
          <div style={{ border: "1px solid #eee", padding: 8, borderRadius: 6, minHeight: 40, background: isDark ? "#18181b" : "#fff", color: isDark ? "#fff" : "#23232a" }}>
            <ReactMarkdown>{form.description}</ReactMarkdown>
          </div>
        </div>
        <select name="topic" onChange={handleChange} value={form.topic}>
          {topics.map((t) => <option key={t} value={t}>{t}</option>)}
        </select><br /><br />
        <label>Tags:</label>
        <ReactTagInput
          tags={tags}
          onChange={setTags}
          placeholder="Type and press enter"
        /><br /><br />
        <input name="imageUrl" placeholder="Image URL (optional)" onChange={handleChange} /><br /><br />
        <label>
          <input type="checkbox" name="isPublic" onChange={handleChange} /> Make Public
        </label><br /><br />

        <h3>Questions</h3>
        {questions.map((q, i) => (
          <div key={i} style={{ marginBottom: 16, padding: 12, border: "1px solid #ddd", borderRadius: 8 }}>
            <input placeholder="Title" value={q.title} onChange={e => handleQuestionChange(i, "title", e.target.value)} required /><br />
            <textarea placeholder="Description" value={q.description} onChange={e => handleQuestionChange(i, "description", e.target.value)} /><br />
            <select value={q.type} onChange={e => handleQuestionChange(i, "type", e.target.value)}>
              {types.map(t => <option key={t} value={t}>{t}</option>)}
            </select><br />
            {["drop-down"].includes(q.type) && (
              <input placeholder="Options (comma-separated)" value={q.options} onChange={e => handleQuestionChange(i, "options", e.target.value)} />
            )}<br />
            <input type="number" placeholder="Order" value={q.order} onChange={e => handleQuestionChange(i, "order", parseInt(e.target.value))} /><br />
            <label>
              <input type="checkbox" checked={q.showInTable} onChange={e => handleQuestionChange(i, "showInTable", e.target.checked)} />
              Show in Table
            </label><br />
            <button type="button" onClick={() => removeQuestion(i)}>Remove Question</button>
          </div>
        ))}
        <button type="button" onClick={addQuestion} style={{ marginBottom: 16 }}>+ Add Question</button><br />
        <button type="submit">Save Template</button>
      </form>
    </div>
  );
}
