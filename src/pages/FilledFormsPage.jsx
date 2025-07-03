import React, { useEffect, useState } from "react";
import { databases } from "../lib/appwrite";
import { useParams } from "react-router-dom";
import { useAuth } from "../App";
import { Query } from "appwrite";

export default function FilledFormsPage() {
  const { userId } = useParams();
  const { authUser } = useAuth();
  const [forms, setForms] = useState([]);
  const [templatesMap, setTemplatesMap] = useState({});
  const [questionsMap, setQuestionsMap] = useState({});
  const [loading, setLoading] = useState(true);

  const dbId = import.meta.env.VITE_APPWRITE_DB_ID;
  const formsCol = import.meta.env.VITE_APPWRITE_FORMS_COLLECTION_ID;
  const templatesCol = import.meta.env.VITE_APPWRITE_TEMPLATES_COLLECTION_ID;
  const questionsCol = import.meta.env.VITE_APPWRITE_QUESTIONS_COLLECTION_ID;

  useEffect(() => {
    const viewingUserId = userId || authUser?.userId;
    if (!viewingUserId) return;
    async function fetchData() {
      setLoading(true);
      try {
        // 1. Get all forms filled by this user
        const formsRes = await databases.listDocuments(dbId, formsCol, [
          Query.equal("createdBy", viewingUserId),
        ]);
        const userForms = formsRes.documents;
        setForms(userForms);

        // 2. Get all unique templateIds
        const templateIds = [...new Set(userForms.map((f) => f.templateId))];
        // 3. Fetch all templates
        const templateResults = await Promise.all(
          templateIds.map((tid) => databases.getDocument(dbId, templatesCol, tid))
        );
        const tMap = {};
        templateResults.forEach((t) => {
          tMap[t.$id] = t;
        });
        setTemplatesMap(tMap);

        // 4. Fetch all questions for these templates
        const allQuestions = await Promise.all(
          templateIds.map((tid) =>
            databases.listDocuments(dbId, questionsCol, [
              Query.equal("templateId", tid),
            ])
          )
        );
        const qMap = {};
        allQuestions.forEach((qRes, idx) => {
          qMap[templateIds[idx]] = qRes.documents.sort((a, b) => a.order - b.order);
        });
        setQuestionsMap(qMap);
      } catch (err) {
        setForms([]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [authUser, userId]);

  if (!authUser && !userId) {
    return <div className="p-8 text-center text-gray-600 dark:text-gray-300">Please log in to view filled forms.</div>;
  }

  if (loading) {
    return <div className="p-8 text-center text-gray-600 dark:text-gray-300">Loading filled forms...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto mt-8 p-6 bg-white dark:bg-[#23232a] rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">Filled Forms</h2>
      {forms.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-300">No forms found.</p>
      ) : (
        <div className="space-y-8">
          {forms.map((form) => {
            const template = templatesMap[form.templateId];
            const questions = questionsMap[form.templateId] || [];
            return (
              <div key={form.$id} className="border border-gray-200 dark:border-gray-700 p-4 rounded bg-gray-50 dark:bg-[#18181b]">
                <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">
                  Template: {template?.title || "Unknown Template"}
                </h3>
                <div className="mb-2 text-gray-700 dark:text-gray-300">
                  <b>Description:</b> {template?.description || "No description"}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">Answers:</h4>
                  <ul className="list-disc ml-6 text-gray-900 dark:text-gray-100">
                    {questions.map((q, idx) => (
                      <li key={q.$id} className="mb-1">
                        <b>{q.title}:</b> {form.answers?.[idx] || <span className="italic text-gray-400">No answer</span>}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
