import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { databases } from "../lib/appwrite";
import { Query } from "appwrite";

export default function TemplateViewPage() {
  const { id } = useParams();
  const [likes, setLikes] = useState([]);
  const [comments, setComments] = useState([]);
  const [usersMap, setUsersMap] = useState({}); // userId => name

  const dbId = import.meta.env.VITE_APPWRITE_DB_ID;
  const likesCol = import.meta.env.VITE_APPWRITE_LIKES_COLLECTION_ID;
  const commentsCol = import.meta.env.VITE_APPWRITE_COMMENTS_COLLECTION_ID;
  const usersCol = import.meta.env.VITE_APPWRITE_USERS_COLLECTION_ID;

  useEffect(() => {
    async function loadInteractions() {
      try {
        // Fetch likes
        const likesRes = await databases.listDocuments(dbId, likesCol, [
          Query.equal("templateId", id),
        ]);
        setLikes(likesRes.documents);

        // Fetch comments
        const commentsRes = await databases.listDocuments(dbId, commentsCol, [
          Query.equal("templateId", id),
        ]);
        setComments(commentsRes.documents);

        // Get unique userIds from likes and comments
        const userIds = [
          ...new Set([
            ...likesRes.documents.map((l) => l.userId),
            ...commentsRes.documents.map((c) => c.userId),
          ]),
        ];

        // Fetch user names
        const allUsersRes = await databases.listDocuments(dbId, usersCol, []);
        const userMap = {};
        for (const user of allUsersRes.documents) {
          userMap[user.authUserId] = user.name;
        }
        setUsersMap(userMap);
      } catch (err) {
        console.error("Failed to fetch interactions", err);
      }
    }

    loadInteractions();
  }, [id]);

  return (
    <div className="card" style={{ maxWidth: 800 }}>
      <h2>Template Details</h2>

      {/* 💖 Likes */}
      <div className="mt-4">
        <h4>Likes ❤️ ({likes.length})</h4>
        <ul>
          {likes.map((like) => (
            <li key={like.$id}>
              {usersMap[like.userId] || like.userId} liked this
            </li>
          ))}
        </ul>
      </div>

      {/* 💬 Comments */}
      <div className="mt-4">
        <h4>Comments 💬</h4>
        <ul>
          {comments.map((c) => (
            <li key={c.$id}>
              <b>{usersMap[c.userId] || c.userId}:</b> {c.content}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
