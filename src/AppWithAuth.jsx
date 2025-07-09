import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import Header from "./components/Header";

// Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import CreateTemplate from "./pages/CreateTemplate";
import HomePage from "./pages/HomePage";
import UserProfilePage from "./pages/UserProfilePage";
import TemplateViewPage from "./pages/TemplateViewPage";
import FillFormPage from "./pages/FillFormPage";
import AdminPage from "./pages/AdminPage";
import BlockedPage from "./pages/BlockedPage";
import NotFoundPage from "./pages/NotFoundPage";
import FilledFormsPage from "./pages/FilledFormsPage";

export default function AppWithAuth() {
  const { loading } = useAuth();
  if (loading) return <div className="text-center p-10">Loading...</div>;

  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/template/create" element={<CreateTemplate />} />
        <Route path="/template/:id" element={<TemplateViewPage />} />
        <Route path="/template/:id/fill" element={<FillFormPage />} />
        <Route path="/profile" element={<UserProfilePage />} />
        <Route path="/profile/:userId" element={<UserProfilePage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/blocked" element={<BlockedPage />} />
        <Route path="/filled-forms" element={<FilledFormsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}
