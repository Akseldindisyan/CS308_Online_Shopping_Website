import { Routes, Route } from "react-router-dom";
import Login from "./login/login";
import PMDashboard from "./pm_admin/PMDashboard";
import AppContent from "./AppContent";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<AppContent />} />

      <Route path="/pm-admin/*" element={<PMDashboard />} />
    </Routes>
  );
}
