import React, { useState } from "react";

export default function UserProfilePage() {
  const [tab, setTab] = useState("templates");
  return (
    <div className="card" style={{ maxWidth: 900 }}>
      <h2>My Profile</h2>
      <div style={{ display: 'flex', gap: 24, marginBottom: 24 }}>
        <button onClick={() => setTab("templates")} style={{ fontWeight: tab === "templates" ? 700 : 400 }}>My Templates</button>
        <button onClick={() => setTab("forms")} style={{ fontWeight: tab === "forms" ? 700 : 400 }}>My Forms</button>
      </div>
      {tab === "templates" ? (
        <div>{/* TODO: Sortable table of user's templates */}<p>Templates table coming soon...</p></div>
      ) : (
        <div>{/* TODO: Sortable table of user's filled forms */}<p>Forms table coming soon...</p></div>
      )}
    </div>
  );
} 