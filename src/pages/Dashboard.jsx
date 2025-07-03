import React, { useEffect, useState } from "react";
import { account, databases } from "../lib/appwrite";
import { useNavigate } from "react-router-dom";

const DB_ID = import.meta.env.VITE_APPWRITE_DB_ID;
const TEMPLATES_COLLECTION_ID = import.meta.env.VITE_APPWRITE_TEMPLATES_COLLECTION_ID;

function TemplateList() {
  const [templates, setTemplates] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTemplates = async () => {
      setLoading(true);
      try {
        const res = await databases.listDocuments(DB_ID, TEMPLATES_COLLECTION_ID);
        setTemplates(res.documents);
      } catch (err) {
        setTemplates([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTemplates();
  }, []);

  const filteredTemplates = templates.filter((t) =>
    t.title?.toLowerCase().includes(search.toLowerCase()) ||
    (t.tags && t.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase())))
  );

  return (
    <div className="card" style={{ maxWidth: 700, marginTop: 32 }}>
      <h2 style={{ marginBottom: 16 }}>All Templates</h2>
      <input
        type="text"
        placeholder="Search by title or tag..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ marginBottom: 16, width: "100%", padding: 8 }}
      />
      {loading ? (
        <p>Loading templates...</p>
      ) : filteredTemplates.length === 0 ? (
        <p>No templates found.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", padding: 8, fontWeight: 500, borderBottom: "1px solid #eee" }}>Title</th>
              <th style={{ textAlign: "left", padding: 8, fontWeight: 500, borderBottom: "1px solid #eee" }}>Topic</th>
              <th style={{ textAlign: "left", padding: 8, fontWeight: 500, borderBottom: "1px solid #eee" }}>Tags</th>
              <th style={{ textAlign: "left", padding: 8, borderBottom: "1px solid #eee" }}></th>
            </tr>
          </thead>
          <tbody>
            {filteredTemplates.map((t) => (
              <tr key={t.$id} style={{ borderTop: "1px solid #eee" }}>
                <td style={{ padding: 8 }}>{t.title}</td>
                <td style={{ padding: 8 }}>{t.topic}</td>
                <td style={{ padding: 8 }}>{(t.tags || []).join(", ")}</td>
                <td style={{ padding: 8 }}>
                  <button onClick={() => navigate(`/template/${t.$id}`)} style={{ background: "none", color: "#2563eb", border: "none", fontWeight: 500, cursor: "pointer" }}>Details</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await account.get();
        setUser(currentUser);
      } catch {
        navigate("/");
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    await account.deleteSession("current");
    navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-[#fafafb]">
      <div className="card" style={{ maxWidth: 400, width: "100%", marginTop: 48 }}>
        <h2 style={{ textAlign: "center", marginBottom: 8 }}>Dashboard</h2>
        {user ? (
          <div style={{ textAlign: "center" }}>
            <p style={{ fontWeight: 500, fontSize: 18 }}>Welcome, {user.name}</p>
            <p style={{ color: "#888", marginBottom: 16 }}>{user.email}</p>
            <button onClick={handleLogout} style={{ background: "none", color: "#2563eb", border: "none", fontWeight: 500, cursor: "pointer", marginBottom: 16 }}>Logout</button>
            <hr style={{ margin: "24px 0" }} />
            <h3 style={{ fontSize: 18, marginBottom: 8 }}>Your Filled Forms</h3>
            <div style={{ marginBottom: 16 }}>
              <p style={{ color: "#aaa" }}>No forms filled yet.</p>
              <button onClick={() => navigate("/form/create")}
                style={{ background: "none", color: "#2563eb", border: "none", fontWeight: 500, cursor: "pointer" }}>
                Fill New Form
              </button>
            </div>
          </div>
        ) : (
          <p>Loading user...</p>
        )}
      </div>
      <TemplateList />
    </div>
  );
}
