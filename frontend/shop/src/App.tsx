import { Routes, Route } from "react-router-dom";
import Login from "./login/login";
import PMDashboard from "./pm_admin/PMDashboard";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/pm-admin/*" element={<PMDashboard />} />
    </Routes>
  );
}
