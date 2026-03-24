import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Overview from "./pages/Overview";
import Products from "./pages/Products";
import Categories from "./pages/Categories";
import Stock from "./pages/Stock";
import Deliveries from "./pages/Deliveries";
import Invoices from "./pages/Invoices";
import Comments from "./pages/Comments";
import "./pm-admin.css";

export default function PMDashboard() {
    useEffect(() => {
        const root = document.getElementById("root");
        if (!root) return;
        root.classList.add("pm-admin-active");
        return () => root.classList.remove("pm-admin-active");
    }, []);

    return (
        <div className="pm-shell">
            <Sidebar />
            <main className="pm-main">
                <Routes>
                    <Route index element={<Navigate to="/pm-admin/overview" replace />} />
                    <Route path="overview" element={<Overview />} />
                    <Route path="products" element={<Products />} />
                    <Route path="categories" element={<Categories />} />
                    <Route path="stock" element={<Stock />} />
                    <Route path="deliveries" element={<Deliveries />} />
                    <Route path="invoices" element={<Invoices />} />
                    <Route path="comments" element={<Comments />} />
                </Routes>
            </main>
        </div>
    );
}