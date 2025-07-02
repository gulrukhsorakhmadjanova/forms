import React, { useEffect, useState } from "react";
import { account, databases } from "../lib/appwrite";
import { useNavigate } from "react-router-dom";

export default function FilledForms() {
  const navigate = useNavigate();
  const [forms, setForms] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const dbId = import.meta.env.VITE_APPWRITE_DB_ID;
  const formsCol = import.meta.env.VITE_APPWRITE_FORMS_COLLECTION_ID;

  // Step 1: Get current user
  useEffect(() => {
    account.get()
      .then((u) => setUser(u))
      .catch(() => {
        alert("⚠️ You need to log in to view your filled forms.");
        navigate("/login");
      });
  }, []);

  // Step 2: Fetch filled forms
  useEffect(() => {
    if (!user) return;

    async function fetchForms() {
      setLoading(true);
      try {
        const res = await databases.listDocuments(dbId, formsCol, [
          // Only show forms filled by current user
          Appwrite.Query.equal("createdBy", user.$id),
        ]);
        setForms(res.documents);
      } catch {
        setForms([]);
      }
      setLoading(false);
    }

    fetchForms();
  }, [user]);

  return (
    <div className="card" style={{ maxWidth: 900 }}>
      <h2>Your Filled Forms</h2>
      {loading ? (
        <p>Loading...</p>
      ) : forms.length === 0 ? (
        <p>No forms submitted yet.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", padding: 8 }}>Form ID</th>
              <th style={{ textAlign: "left", padding: 8 }}>Template</th>
              <th style={{ textAlign: "left", padding: 8 }}>Email Copy</th>
              <th style={{ textAlign: "left", padding: 8 }}>Submitted</th>
            </tr>
          </thead>
          <tbody>
            {forms.map((f) => (
              <tr key={f.$id} style={{ borderTop: "1px solid #eee" }}>
                <td style={{ padding: 8 }}>{f.$id}</td>
                <td style={{ padding: 8 }}>{f.templateId}</td>
                <td style={{ padding: 8 }}>{f.emailCopy ? "Yes" : "No"}</td>
                <td style={{ padding: 8 }}>
                  {new Date(f.$createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
