import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ID, Query } from "appwrite";
import { account, databases } from "../lib/appwrite";
import { useTheme } from "../contexts/ThemeContext";
import { useLanguage } from "../contexts/LanguageContext";
import FormQuestionList from "../components/FormQuestionList";
import FormCommentBox from "../components/FormCommentBox";
import FormSubmitOptions from "../components/FormSubmitOptions";

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
      <div className={`max-w-2xl mx-auto mt-0 mb-8 rounded-xl shadow-lg transition-colors duration-300 p-6 ${
        isDark ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'
      }`}>
        <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>{template?.title}</h2>
        <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{template?.description}</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <FormQuestionList
            questions={questions}
            answers={answers}
            handleChange={handleChange}
            isDark={isDark}
            t={t}
          />

          <FormSubmitOptions
            emailCopy={emailCopy}
            setEmailCopy={setEmailCopy}
            comment={comment}
            setComment={setComment}
            isDark={isDark}
            t={t}
          />

          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors">
            {t('submitForm')}
          </button>
        </form>
      </div>
    </div>
  );
}
