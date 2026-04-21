import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Overview from "./pages/Overview";
import Pricing from "./pages/Pricing";
import Invoices from "./pages/Invoices";
import Revenue from "./pages/Revenue";
import "../pm_admin/pm-admin.css";
import "./sm-admin.css";

export default function SMDashboard() {
    useEffect(() => {
        const root = document.getElementById("root");
        if (!root) return;
        root.classList.add("sm-admin-active");
        return () => root.classList.remove("sm-admin-active");
    }, []);

    return (
        <div className="pm-shell">
            <Sidebar />
            <main className="pm-main">
                <Routes>
                    <Route index element={<Navigate to="/sm-admin/overview" replace />} />
                    <Route path="overview" element={<Overview />} />
                    <Route path="pricing" element={<Pricing />} />
                    <Route path="invoices" element={<Invoices />} />
                    <Route path="revenue" element={<Revenue />} />
                </Routes>
            </main>
        </div>
    );
}
