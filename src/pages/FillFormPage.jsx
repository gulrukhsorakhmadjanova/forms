import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ID, Query } from "appwrite";
import { account, databases } from "../lib/appwrite";
import { useTheme, useLanguage } from "../App";

export default function FillFormPage() {
  const { id: templateId } = useParams();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { t } = useLanguage();

  const [template, setTemplate] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [emailCopy, setEmailCopy] = useState(false);
  const [user, setUser] = useState(null);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const dbId = import.meta.env.VITE_APPWRITE_DB_ID;
  const formsCol = import.meta.env.VITE_APPWRITE_FORMS_COLLECTION_ID;
  const templatesCol = import.meta.env.VITE_APPWRITE_TEMPLATES_COLLECTION_ID;
  const questionsCol = import.meta.env.VITE_APPWRITE_QUESTIONS_COLLECTION_ID;
  const commentsCol = import.meta.env.VITE_APPWRITE_COMMENTS_COLLECTION_ID;

  useEffect(() => {
    account
      .get()
      .then((u) => setUser(u))
      .catch(() => {
        alert(t('pleaseLoginToFill'));
        navigate("/login");
      });
  }, []);

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
        setError(t('failedToLoadTemplate'));
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
        let answer = answers[q.$id];
        if (Array.isArray(answer)) {
          answer = answer.join(", ");
        }
        answer = answer || "";
        return `Q: ${q.title} | A: ${answer}`;
      });

      if (answers["open-answer"]) {
        formattedAnswers.push(`Open Answer: ${answers["open-answer"]}`);
      }

      await databases.createDocument(dbId, formsCol, ID.unique(), {
        templateId,
        createdBy: user.$id,
        emailCopy,
        answers: formattedAnswers,
      });

      if (comment.trim() !== "") {
        await databases.createDocument(dbId, commentsCol, ID.unique(), {
          templateId,
          userId: user.$id,
          content: comment.trim(),
        });
      }

      alert(t('formAndCommentSubmitted'));
      navigate("/filled-forms");
    } catch (err) {
      console.error(err);
      setError(err.message || t('failedToSubmitForm'));
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${isDark ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900'}`}>
        <div className={`p-6 text-center ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('loading')}</div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${isDark ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900'}`}>
        <div className={`p-6 text-center ${isDark ? 'text-red-400' : 'text-red-600'}`}>{error}</div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <div className={`max-w-2xl mx-auto my-8 rounded-xl shadow-lg transition-colors duration-300 p-6 ${
        isDark ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'
      }`}>
        <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>{template?.title}</h2>
        <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{template?.description}</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {questions.map((q) => (
            <div key={q.$id} className="mb-2">
              <label className={`font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>{q.title}</label>
              <p className={`mb-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{q.description}</p>
              {q.type === "string-line" && (
                <input
                  type="text"
                  className={`border p-2 rounded w-full transition-colors duration-300 ${isDark ? 'border-gray-600 bg-gray-900 text-gray-100' : 'border-gray-300 bg-white text-gray-900'}`}
                  value={answers[q.$id] || ""}
                  onChange={(e) => handleChange(q.$id, e.target.value)}
                />
              )}
              {q.type === "multi-line" && (
                <textarea
                  className={`border p-2 rounded w-full transition-colors duration-300 ${isDark ? 'border-gray-600 bg-gray-900 text-gray-100' : 'border-gray-300 bg-white text-gray-900'}`}
                  rows={4}
                  value={answers[q.$id] || ""}
                  onChange={(e) => handleChange(q.$id, e.target.value)}
                />
              )}
              {q.type === "integer" && (
                <input
                  type="number"
                  className={`border p-2 rounded w-full transition-colors duration-300 ${isDark ? 'border-gray-600 bg-gray-900 text-gray-100' : 'border-gray-300 bg-white text-gray-900'}`}
                  value={answers[q.$id] || ""}
                  onChange={(e) => handleChange(q.$id, e.target.value)}
                />
              )}
              {q.type === "checkbox" && ((Array.isArray(q.options) ? q.options : typeof q.options === 'string' ? q.options.split(',').map(o => o.trim()) : []).length > 0) ? (
                <div className="flex flex-col gap-1">
                  {(Array.isArray(q.options) ? q.options : typeof q.options === 'string' ? q.options.split(',').map(o => o.trim()) : []).map((opt, idx) => (
                    <label key={idx} className={`flex items-center gap-2 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                      <input
                        type="checkbox"
                        checked={Array.isArray(answers[q.$id]) ? answers[q.$id].includes(opt) : false}
                        onChange={e => {
                          let prev = Array.isArray(answers[q.$id]) ? answers[q.$id] : [];
                          if (e.target.checked) {
                            prev = [...prev, opt];
                          } else {
                            prev = prev.filter(o => o !== opt);
                          }
                          handleChange(q.$id, prev);
                        }}
                        className="accent-blue-600"
                      />
                      {opt}
                    </label>
                  ))}
                </div>
              ) : q.type === "checkbox" && (!q.options || (Array.isArray(q.options) && q.options.length === 0) || (typeof q.options === 'string' && q.options.trim() === '')) ? (
                <input
                  type="checkbox"
                  checked={answers[q.$id] || false}
                  onChange={e => handleChange(q.$id, e.target.checked)}
                  className="accent-blue-600"
                />
              ) : null}
              {q.type === "drop-down" && (
                <select
                  className={`border p-2 rounded w-full transition-colors duration-300 ${isDark ? 'border-gray-600 bg-gray-900 text-gray-100' : 'border-gray-300 bg-white text-gray-900'}`}
                  value={answers[q.$id] || ""}
                  onChange={(e) => handleChange(q.$id, e.target.value)}
                >
                  <option value="">{t('select')}</option>
                  {q.options?.map((opt, idx) => (
                    <option key={idx} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              )}
            </div>
          ))}

          {/* ✅ Open Answer Input - Only show if no checkbox questions */}
          {!questions.some(q => q.type === "checkbox") && (
            <div className="mb-4">
              <label className={`font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>{t('yourAnswer')}</label>
              <textarea
                className={`border p-2 rounded w-full transition-colors duration-300 ${isDark ? 'border-gray-600 bg-gray-900 text-gray-100' : 'border-gray-300 bg-white text-gray-900'}`}
                rows={4}
                value={answers["open-answer"] || ""}
                onChange={(e) => handleChange("open-answer", e.target.value)}
                placeholder={t('typeYourAnswerHere')}
              />
            </div>
          )}

          {/* ✅ Email Copy */}
          <label className={`flex items-center gap-2 mb-4 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
            <input
              type="checkbox"
              checked={emailCopy}
              onChange={(e) => setEmailCopy(e.target.checked)}
              className="accent-blue-600"
            />
            {t('sendMeCopy')}
          </label>

          {/* ✅ Comment Field */}
          <div className="mb-4">
            <label className={`font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>{t('yourComment')}</label>
            <textarea
              className={`border p-2 rounded w-full transition-colors duration-300 ${isDark ? 'border-gray-600 bg-gray-900 text-gray-100' : 'border-gray-300 bg-white text-gray-900'}`}
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={t('leaveYourFeedback')}
            />
          </div>

          {/* ✅ Submit */}
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors">
            {t('submitForm')}
          </button>
        </form>
      </div>
    </div>
  );
}
