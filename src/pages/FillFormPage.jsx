import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ID, Query } from "appwrite";
import { account, databases } from "../lib/appwrite";

export default function FillFormPage() {
  const { id: templateId } = useParams();
  const navigate = useNavigate();

  const [template, setTemplate] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [emailCopy, setEmailCopy] = useState(false);
  const [user, setUser] = useState(null);
  const [comment, setComment] = useState(""); // 🆕 comment field
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const dbId = import.meta.env.VITE_APPWRITE_DB_ID;
  const formsCol = import.meta.env.VITE_APPWRITE_FORMS_COLLECTION_ID;
  const templatesCol = import.meta.env.VITE_APPWRITE_TEMPLATES_COLLECTION_ID;
  const questionsCol = import.meta.env.VITE_APPWRITE_QUESTIONS_COLLECTION_ID;
  const commentsCol = import.meta.env.VITE_APPWRITE_COMMENTS_COLLECTION_ID;

  // 🔐 Get user
  useEffect(() => {
    account
      .get()
      .then((u) => setUser(u))
      .catch(() => {
        alert("⚠️ Please log in to fill out the form.");
        navigate("/login");
      });
  }, []);

  // 📦 Fetch template and questions
  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      setLoading(true);
      try {
        const tempRes = await databases.getDocument(dbId, templatesCol, templateId);
        setTemplate(tempRes);

        const qRes = await databases.listDocuments(dbId, questionsCol, [
          Query.equal("templateId", templateId),
          Query.orderAsc("order"),
        ]);
        setQuestions(qRes.documents);
      } catch (err) {
        console.error(err);
        setError("Failed to load template.");
      }
      setLoading(false);
    };

    loadData();
  }, [user]);

  const handleChange = (qId, value) => {
    setAnswers((prev) => ({ ...prev, [qId]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const formattedAnswers = questions.map((q) => {
        const answer = answers[q.$id] || "";
        return `Q: ${q.title} | A: ${answer}`;
      });

      // 📝 Save the form
      await databases.createDocument(dbId, formsCol, ID.unique(), {
        templateId,
        createdBy: user.$id,
        emailCopy,
        answers: formattedAnswers,
      });

      // 💬 Save the comment if it's not empty
      if (comment.trim() !== "") {
        await databases.createDocument(dbId, commentsCol, ID.unique(), {
          templateId,
          userId: user.$id,
          content: comment.trim(),
        });
      }

      alert("✅ Form and comment submitted!");
      navigate("/filled-forms");
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to submit form.");
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div className="card" style={{ maxWidth: 800, margin: "auto" }}>
      <h2>{template?.title}</h2>
      <p>{template?.description}</p>

      <form onSubmit={handleSubmit}>
        {questions.map((q) => (
          <div key={q.$id} style={{ marginBottom: 16 }}>
            <label><b>{q.title}</b></label>
            <p>{q.description}</p>
            {q.type === "string-line" && (
              <input
                type="text"
                className="border p-1 rounded w-full"
                value={answers[q.$id] || ""}
                onChange={(e) => handleChange(q.$id, e.target.value)}
              />
            )}
            {q.type === "multi-line" && (
              <textarea
                className="border p-1 rounded w-full"
                rows={4}
                value={answers[q.$id] || ""}
                onChange={(e) => handleChange(q.$id, e.target.value)}
              />
            )}
            {q.type === "integer" && (
              <input
                type="number"
                className="border p-1 rounded w-full"
                value={answers[q.$id] || ""}
                onChange={(e) => handleChange(q.$id, e.target.value)}
              />
            )}
            {q.type === "checkbox" && (
              <input
                type="checkbox"
                checked={answers[q.$id] || false}
                onChange={(e) => handleChange(q.$id, e.target.checked)}
              />
            )}
            {q.type === "drow-down" && (
              <select
                className="border p-1 rounded w-full"
                value={answers[q.$id] || ""}
                onChange={(e) => handleChange(q.$id, e.target.value)}
              >
                <option value="">Select...</option>
                {q.options?.map((opt, idx) => (
                  <option key={idx} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            )}
          </div>
        ))}

        {/* ✅ Email Copy */}
        <label className="flex items-center gap-2 mb-4">
          <input
            type="checkbox"
            checked={emailCopy}
            onChange={(e) => setEmailCopy(e.target.checked)}
          />
          Send me a copy of my responses
        </label>

        {/* ✅ Comment */}
        <div className="mb-4">
          <label><b>Your Comment (optional)</b></label>
          <textarea
            className="border p-1 rounded w-full"
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Leave your feedback..."
          />
        </div>

        {/* ✅ Submit */}
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          Submit Form
        </button>
      </form>
    </div>
  );
}
