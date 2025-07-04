import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { databases } from "../lib/appwrite";
import { useAuth } from "../App";

export default function TemplateViewPage() {
  const { id } = useParams();
  const { authUser } = useAuth();

  const [template, setTemplate] = useState(null);
  const [likes, setLikes] = useState([]);
  const [comments, setComments] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [usersMap, setUsersMap] = useState({});
  const [hasLiked, setHasLiked] = useState(false);
  const [likeDocId, setLikeDocId] = useState(null);

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
      }
    }

    fetchData();
  }, [id, authUser]);

  const handleLike = async () => {
    if (!authUser) return alert("Please log in to like.");

    if (hasLiked) {
      await databases.deleteDocument(dbId, likesCol, likeDocId);
      setLikes((prev) => prev.filter((l) => l.$id !== likeDocId));
      setHasLiked(false);
      setLikeDocId(null);
    } else {
      const newLike = await databases.createDocument(dbId, likesCol, "unique()", {
        templateId: id,
        userId: authUser.userId,
        createdAt: new Date().toISOString(),
      });
      setLikes((prev) => [...prev, newLike]);
      setHasLiked(true);
      setLikeDocId(newLike.$id);
    }
  };

  if (!template) {
    return <div className="p-6 text-gray-700 dark:text-gray-200">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white dark:bg-[#1f1f27] text-gray-900 dark:text-gray-100 rounded-xl shadow-lg mt-10 space-y-8">
      <div>
        <h2 className="text-3xl font-bold mb-2">{template.title}</h2>
        <p className="text-lg text-gray-600 dark:text-gray-300">{template.description}</p>
        <p className="text-sm text-gray-500 mt-1">Topic: <span className="font-medium">{template.topic}</span></p>
        {template.imageUrl && (
          <img
            src={template.imageUrl}
            alt="template"
            className="my-4 rounded-lg shadow-md max-h-72 w-full object-cover"
          />
        )}
        <div className="text-sm text-gray-500 mt-2">
          Tags: <span className="text-gray-700 dark:text-gray-300">{template.tags?.join(", ") || "None"}</span>
        </div>
      </div>

      {/* Like Section */}
      <div className="flex items-center justify-between">
        {authUser && (
          <button
            onClick={handleLike}
            className={`px-5 py-2 rounded-lg font-semibold transition ${
              hasLiked
                ? "bg-red-500 hover:bg-red-600 text-white"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            {hasLiked ? "❤️ Unlike" : "🤍 Like"}
          </button>
        )}
        <p className="text-sm text-gray-600 dark:text-gray-300">Likes: {likes.length}</p>
      </div>

      {/* Users who liked */}
      <div>
        <h3 className="text-xl font-semibold mb-2">Liked by</h3>
        {likes.length === 0 ? (
          <p className="text-gray-500 italic">No one has liked this yet.</p>
        ) : (
          <ul className="list-disc ml-6 space-y-1 text-gray-800 dark:text-gray-200">
            {likes.map((like) => (
              <li key={like.$id}>{usersMap[like.userId] || "Unknown User"}</li>
            ))}
          </ul>
        )}
      </div>

      {/* Questions */}
      <div>
        <h3 className="text-xl font-semibold mb-2">Questions</h3>
        {questions.length === 0 ? (
          <p className="text-gray-500 italic">No questions added to this template.</p>
        ) : (
          <ul className="space-y-4">
            {questions.map((q, i) => (
              <li key={q.$id} className="bg-gray-100 dark:bg-[#2d2d3a] p-4 rounded-lg shadow-sm">
                <p className="text-lg font-medium mb-1">{i + 1}. {q.title}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                  {q.description || "No description"}
                </p>
                <p className="text-xs text-gray-500">Type: {q.type}</p>
                {q.options?.length > 0 && (
                  <p className="text-sm mt-1">Options: <span className="text-gray-800 dark:text-gray-200">{q.options.join(", ")}</span></p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Comments */}
      <div>
        <h3 className="text-xl font-semibold mb-2">Comments</h3>
        {comments.length === 0 ? (
          <p className="text-gray-500 italic">No comments yet.</p>
        ) : (
          <ul className="space-y-3 list-disc ml-6">
            {comments.map((c) => (
              <li key={c.$id} className="text-gray-800 dark:text-gray-200">
                <strong>{usersMap[c.userId] || "Anonymous"}:</strong> {c.content}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
