import React, { useState, useEffect } from "react";
import { databases, account } from "../lib/appwrite";
import { ID } from "appwrite";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import ReactTagInput from "@pathofdev/react-tag-input";
import "@pathofdev/react-tag-input/build/index.css";

const topics = ["Education", "Quiz", "Other"];

export default function CreateTemplate() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    description: "",
    topic: "Other",
    isPublic: false,
    imageURL: ""
  });
  const [tags, setTags] = useState([]);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const user = await account.get();
      await databases.createDocument(
        import.meta.env.VITE_APPWRITE_DB_ID,
        import.meta.env.VITE_APPWRITE_TEMPLATES_COLLECTION_ID,
        ID.unique(),
        {
          title: form.title,
          description: form.description,
          topic: form.topic,
          isPublic: form.isPublic,
          imageURL: form.imageURL,
          tags: tags,
          createdBy: user.$id,
        }
      );
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  return (
    <div style={{ maxWidth: "500px", margin: "auto" }}>
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
        <input name="imageURL" placeholder="Image URL (optional)" onChange={handleChange} /><br /><br />
        <label>
          <input type="checkbox" name="isPublic" onChange={handleChange} /> Make Public
        </label><br /><br />
        <button type="submit">Save Template</button>
      </form>
    </div>
  );
}
