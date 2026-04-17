import type { JSX } from "react";
import { useNavigate, useLocation } from "react-router-dom";

type NavItem = {
    path: string;
    label: string;
    badge?: number;
    badgeColor?: "blue" | "green";
    icon: JSX.Element;
};

const IconGrid = () => <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M2 2h5v5H2zm7 0h5v5H9zm0 7h5v5H9zM2 9h5v5H2z" /></svg>;
const IconBox = () => <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1L1 4.5v7L8 15l7-3.5v-7L8 1zm0 1.8l4.8 2.4-4.8 2.4L3.2 5.2 8 2.8zM2 6.3l5.5 2.75V13L2 10.25V6.3zm6.5 6.7V9.05L14 6.3v3.95L8.5 13z" /></svg>;
const IconList = () => <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M1 3h14v2H1zm0 4h14v2H1zm0 4h14v2H1z" /></svg>;
const IconStack = () => <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M1 2h14v3H1zm0 5h14v3H1zm0 5h14v3H1z" /></svg>;
const IconTruck = () => <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M1 3h9v7H1zm9 2h2l2 2v3h-4zM3 11a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm8 0a1.5 1.5 0 100 3 1.5 1.5 0 000-3z" /></svg>;
const IconDoc = () => <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M4 1h6l4 4v10H4V1zm6 0v4h4M6 8h5M6 11h5M6 5h2" /></svg>;
const IconChat = () => <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M2 2h12v9H9l-3 3V11H2z" /></svg>;

const BASE = "/pm-admin";

const sections: { title: string; items: NavItem[] }[] = [
    {
        title: "General",
        items: [{ path: `${BASE}/overview`, label: "Overview", icon: <IconGrid /> }],
    },
    {
        title: "Product Management",
        items: [
            { path: `${BASE}/products`, label: "Products", icon: <IconBox /> },
            { path: `${BASE}/categories`, label: "Categories", icon: <IconList /> },
            { path: `${BASE}/stock`, label: "Stock", icon: <IconStack />, badge: 3, badgeColor: "blue" },
        ],
    },
    {
        title: "Operations",
        items: [
            { path: `${BASE}/invoices`, label: "Invoices", icon: <IconDoc /> },
            { path: `${BASE}/deliveries`, label: "Deliveries", icon: <IconTruck />, badge: 5, badgeColor: "green" },
            { path: `${BASE}/comments`, label: "Comments", icon: <IconChat />, badge: 8, badgeColor: "blue" },
        ],
    },
];

export default function Sidebar() {
    const navigate = useNavigate();
    const { pathname } = useLocation();

    return (
        <aside style={{
            background: "var(--space)",
            borderRight: "1px solid var(--border)",
            display: "flex",
            flexDirection: "column",
            minHeight: "100vh",
        }}>
            {/* Logo */}
            <div style={{ padding: "20px 20px 16px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: "var(--blue)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="#fff"><path d="M2 2h5v5H2zm7 0h5v5H9zm0 7h5v5H9zM2 9h5v5H2z" /></svg>
                </div>
                <div>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>PM Panel</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Product Manager</div>
                </div>
            </div>

            {/* Nav */}
            <nav style={{ flex: 1, paddingBottom: 16 }}>
                {sections.map((sec) => (
                    <div key={sec.title}>
                        <div style={{ padding: "16px 20px 8px", fontSize: 10, fontWeight: 500, color: "var(--text-dim)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                            {sec.title}
                        </div>
                        {sec.items.map((item) => {
                            const isActive = pathname === item.path || pathname.startsWith(item.path + "/");
                            return (
                                <button
                                    key={item.path}
                                    onClick={() => navigate(item.path)}
                                    style={{
                                        width: "calc(100% - 16px)",
                                        margin: "2px 8px",
                                        padding: "9px 12px",
                                        borderRadius: 8,
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 10,
                                        cursor: "pointer",
                                        border: "none",
                                        background: isActive ? "var(--blue-dim)" : "transparent",
                                        color: isActive ? "var(--blue)" : "var(--text-muted)",
                                        fontSize: 13,
                                        fontWeight: isActive ? 500 : 400,
                                        textAlign: "left",
                                        transition: "background 0.15s",
                                    }}
                                >
                                    <span style={{ flexShrink: 0, opacity: isActive ? 1 : 0.7 }}>{item.icon}</span>
                                    {item.label}
                                    {item.badge !== undefined && (
                                        <span style={{
                                            marginLeft: "auto",
                                            fontSize: 10,
                                            padding: "2px 7px",
                                            borderRadius: 99,
                                            background: item.badgeColor === "green" ? "var(--green)" : "var(--blue)",
                                            color: "#fff",
                                            fontWeight: 500,
                                        }}>
                                            {item.badge}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                ))}
            </nav>

            {/* User */}
            <div style={{ padding: 16, borderTop: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--blue-dim)", border: "1px solid var(--blue)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 500, color: "var(--blue)", flexShrink: 0 }}>
                    EP
                </div>
                <div>
                    <div style={{ fontSize: 13 }}>Emre Pekcan</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Product Manager</div>
                </div>
            </div>
        </aside>
    );
}