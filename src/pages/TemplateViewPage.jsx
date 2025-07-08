import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { databases } from "../lib/appwrite";
import { useAuth, useTheme, useLanguage } from "../App";
import { ID } from "appwrite";

export default function TemplateViewPage() {
  const { id } = useParams();
  const { authUser } = useAuth();
  const { isDark } = useTheme();
  const { t } = useLanguage();

  const [template, setTemplate] = useState(null);
  const [likes, setLikes] = useState([]);
  const [comments, setComments] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [usersMap, setUsersMap] = useState({});
  const [hasLiked, setHasLiked] = useState(false);
  const [likeDocId, setLikeDocId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const dbId = import.meta.env.VITE_APPWRITE_DB_ID;
  const templatesCol = import.meta.env.VITE_APPWRITE_TEMPLATES_COLLECTION_ID;
  const likesCol = import.meta.env.VITE_APPWRITE_LIKES_COLLECTION_ID;
  const commentsCol = import.meta.env.VITE_APPWRITE_COMMENTS_COLLECTION_ID;
  const questionsCol = import.meta.env.VITE_APPWRITE_QUESTIONS_COLLECTION_ID;
  const usersCol = import.meta.env.VITE_APPWRITE_USERS_COLLECTION_ID;

  useEffect(() => {
    async function fetchData() {
      try {
        const tempRes = await databases.getDocument(dbId, templatesCol, id);
        setTemplate(tempRes);

        const [likesRes, commentsRes, questionsRes, usersRes] = await Promise.all([
          databases.listDocuments(dbId, likesCol),
          databases.listDocuments(dbId, commentsCol),
          databases.listDocuments(dbId, questionsCol),
          databases.listDocuments(dbId, usersCol),
        ]);

        const templateLikes = likesRes.documents.filter((l) => l.templateId === id);
        const templateComments = commentsRes.documents.filter((c) => c.templateId === id);
        const templateQuestions = questionsRes.documents
          .filter((q) => q.templateId === id)
          .sort((a, b) => a.order - b.order);

        const userMap = {};
        usersRes.documents.forEach((u) => {
          userMap[u.authUserId] = u.name;
        });

        setLikes(templateLikes);
        setComments(templateComments);
        setQuestions(templateQuestions);
        setUsersMap(userMap);

        if (authUser) {
          const like = templateLikes.find((l) => l.userId === authUser.userId);
          if (like) {
            setHasLiked(true);
            setLikeDocId(like.$id);
          }
        }
      } catch (err) {
        console.error("Failed to fetch template details:", err);
        setError("Failed to load template details");
      }
    }

    fetchData();
  }, [id, authUser]);

  const handleLike = async () => {
    if (!authUser) {
      alert("Please log in to like templates.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      if (hasLiked) {
        // Unlike: Delete the like document
        await databases.deleteDocument(dbId, likesCol, likeDocId);
        setLikes((prev) => prev.filter((l) => l.$id !== likeDocId));
        setHasLiked(false);
        setLikeDocId(null);
      } else {
        // Like: Create a new like document
        const newLike = await databases.createDocument(
          dbId, 
          likesCol, 
          ID.unique(), 
          {
            templateId: id,
            userId: authUser.userId,
          }
        );
        setLikes((prev) => [...prev, newLike]);
        setHasLiked(true);
        setLikeDocId(newLike.$id);
      }
    } catch (err) {
      console.error("Like/Unlike error:", err);
      setError(err.message || "Failed to update like status");
    } finally {
      setLoading(false);
    }
  };

  if (!template) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${isDark ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900'}`}>
        <div className={`p-6 text-center ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('loading')}</div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <div className={`max-w-4xl mx-auto p-8 rounded-xl shadow-lg mt-10 space-y-8 transition-colors duration-300 ${
        isDark ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'
      }`}>
        <div>
          <h2 className={`text-3xl font-bold mb-2 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>{template.title}</h2>
          <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{template.description}</p>
          <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('topic')}: <span className="font-medium">{template.topic}</span></p>
          {template.imageUrl && (
            <img
              src={template.imageUrl}
              alt="template"
              className="my-4 rounded-lg shadow-md max-h-72 w-full object-cover"
            />
          )}
          <div className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {t('tags')}: <span className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{template.tags?.join(", ") || t('none')}</span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className={`px-4 py-3 rounded transition-colors duration-300 ${
            isDark ? 'bg-red-900 text-red-200 border border-red-700' : 'bg-red-100 text-red-700 border border-red-400'
          }`}>
            {error}
          </div>
        )}

        {/* Like Section */}
        <div className="flex items-center justify-between">
          {authUser && (
            <button
              onClick={handleLike}
              disabled={loading}
              className={`px-5 py-2 rounded-lg font-semibold transition-colors duration-300 ${
                hasLiked
                  ? "bg-red-500 hover:bg-red-600 text-white"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? t('loading') : hasLiked ? "❤️ " + t('unlike') : "🤍 " + t('like')}
            </button>
          )}
          <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{t('likes')}: {likes.length}</p>
        </div>

        {/* Liked by section */}
        <div>
          <h3 className={`text-xl font-semibold mb-2 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>{t('likedBy')}</h3>
          {likes.length === 0 ? (
            <p className={`italic ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('noOneLikedYet')}</p>
          ) : (
            <ul className={`list-disc ml-6 space-y-1 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
              {likes.map((like) => (
                <li key={like.$id}>{usersMap[like.userId] || t('unknownUser')}</li>
              ))}
            </ul>
          )}
        </div>

        {/* Questions */}
        <div>
          <h3 className={`text-xl font-semibold mb-2 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>{t('questions')}</h3>
          {questions.length === 0 ? (
            <p className={`italic ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('noQuestionsAdded')}</p>
          ) : (
            <ul className="space-y-4">
              {questions.map((q, i) => (
                <li key={q.$id} className={`p-4 rounded-lg shadow-sm transition-colors duration-300 ${
                  isDark ? 'bg-gray-700 text-gray-100' : 'bg-gray-50 text-gray-900'
                }`}>
                  <p className={`text-lg font-medium mb-1 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>{i + 1}. {q.title}</p>
                  <p className={`text-sm mb-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    {q.description || t('noDescription')}
                  </p>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('type')}: {q.type}</p>
                  {q.options?.length > 0 && (
                    <p className={`text-sm mt-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      {t('options')}: <span className={`${isDark ? 'text-gray-200' : 'text-gray-800'}`}>{q.options.join(", ")}</span>
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Comments */}
        <div>
          <h3 className={`text-xl font-semibold mb-2 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>{t('comments')}</h3>
          {comments.length === 0 ? (
            <p className={`italic ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('noCommentsYet')}</p>
          ) : (
            <ul className="space-y-3 list-disc ml-6">
              {comments.map((c) => (
                <li key={c.$id} className={`${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                  <strong>{usersMap[c.userId] || "Anonymous"}:</strong> {c.content}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}