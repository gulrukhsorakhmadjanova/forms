import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { account, databases } from "../lib/appwrite";

export default function HomePage() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  // 🔐 Fetch current user (if logged in)
  useEffect(() => {
    account.get()
      .then((u) => setUser(u))
      .catch(() => setUser(null)); // Not logged in
  }, []);

  // 📦 Fetch templates
  useEffect(() => {
    async function fetchTemplates() {
      setLoading(true);
      try {
        const res = await databases.listDocuments(
          import.meta.env.VITE_APPWRITE_DB_ID,
          import.meta.env.VITE_APPWRITE_TEMPLATES_COLLECTION_ID,
          []
        );
        setTemplates(res.documents);
      } catch {
        setTemplates([]);
      }
      setLoading(false);
    }
    fetchTemplates();
  }, []);

  const filtered = templates.filter((t) =>
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    (t.tags && t.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase())))
  );

  // 🔒 Try to access filled forms page
  const handleViewFilledForms = () => {
    if (!user) {
      alert("⚠️ You must be registered and logged in to view your filled forms.");
      return;
    }
    navigate("/filled-forms");
  };

  return (
    <div className="card" style={{ maxWidth: 900 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2>Welcome to the Form Builder</h2>
        <div style={{ display: 'flex', gap: 10 }}>
          {!user ? (
            <>
              <button onClick={() => navigate("/register")}>Register</button>
              <button onClick={() => navigate("/login")}>Login</button>
            </>
          ) : (
            <>
              <button onClick={() => navigate("/dashboard")}>Dashboard</button>
              <button onClick={handleViewFilledForms}>Filled Forms</button>
            </>
          )}
        </div>
      </div>

      <p>Create, share, and analyze custom forms and surveys.</p>
      <hr style={{ margin: "24px 0" }} />

      <h3>Browse Templates</h3>
      <input
        placeholder="Search by title or tag..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ marginBottom: 16, width: "100%", maxWidth: 400 }}
      />
      {loading ? (
        <p>Loading...</p>
      ) : filtered.length === 0 ? (
        <p>No templates found.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", padding: 8 }}>Title</th>
              <th style={{ textAlign: "left", padding: 8 }}>Topic</th>
              <th style={{ textAlign: "left", padding: 8 }}>Tags</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((t) => (
              <tr key={t.$id} style={{ borderTop: "1px solid #eee" }}>
                <td style={{ padding: 8 }}>{t.title}</td>
                <td style={{ padding: 8 }}>{t.topic}</td>
                <td style={{ padding: 8 }}>{(t.tags || []).join(", ")}</td>
                <td style={{ padding: 8 }}>
                  <button onClick={() => navigate(`/template/${t.$id}`)}>
                    Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
