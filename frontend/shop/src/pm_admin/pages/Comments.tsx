import { useState } from "react";
import Topbar from "../components/Topbar";
import { initComments, initProducts, type Comment } from "../data";

const stars = (n: number) => "★".repeat(n) + "☆".repeat(5 - n);

export default function Comments() {
  const [comments, setComments] = useState<Comment[]>(initComments);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");

  const filtered = comments.filter((c) => filter === "all" || c.status === filter);
  const update = (id: number, status: "approved" | "rejected") =>
    setComments((prev) => prev.map((c) => c.id === id ? { ...c, status } : c));

  const pending = comments.filter((c) => c.status === "pending").length;
  const approved = comments.filter((c) => c.status === "approved").length;
  const rejected = comments.filter((c) => c.status === "rejected").length;

  return (
    <>
      <Topbar
        title="Comments"
        subtitle={`${pending} pending approval`}
        actions={
          <div style={{ display: "flex", gap: 8 }}>
            {(["all", "pending", "approved", "rejected"] as const).map((f) => (
              <button key={f} className={`pm-btn pm-btn-sm ${filter === f ? "pm-btn-primary" : "pm-btn-outline"}`} onClick={() => setFilter(f)}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        }
      />
      <div className="pm-content">
        <div className="pm-stat-grid">
          <div className="pm-stat"><div className="pm-stat-label">Total</div><div className="pm-stat-val">{comments.length}</div></div>
          <div className="pm-stat"><div className="pm-stat-label">Pending</div><div className="pm-stat-val" style={{ color: "#FBBF24" }}>{pending}</div></div>
          <div className="pm-stat"><div className="pm-stat-label">Approved</div><div className="pm-stat-val" style={{ color: "var(--green)" }}>{approved}</div></div>
          <div className="pm-stat"><div className="pm-stat-label">Rejected</div><div className="pm-stat-val" style={{ color: "#F87171" }}>{rejected}</div></div>
        </div>
        <div className="pm-panel">
          <div className="pm-table-wrap">
            <table>
              <thead><tr><th>Author</th><th>Product</th><th>Rating</th><th>Comment</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {filtered.map((c) => {
                  const prod = initProducts.find((p) => p.id === c.productId);
                  return (
                    <tr key={c.id}>
                      <td className="pm-col-main" style={{ whiteSpace: "nowrap" }}>{c.author}</td>
                      <td style={{ whiteSpace: "nowrap" }}>{prod?.name}</td>
                      <td>
                        <span style={{ color: c.rating >= 4 ? "var(--green)" : c.rating >= 3 ? "#FBBF24" : "#F87171", fontSize: 12, letterSpacing: 1 }}>
                          {stars(c.rating)}
                        </span>
                      </td>
                      <td style={{ maxWidth: 260 }}><span style={{ color: "var(--text-muted)", fontSize: 13 }}>"{c.text}"</span></td>
                      <td style={{ whiteSpace: "nowrap" }}>{c.date}</td>
                      <td>
                        <span className={c.status === "approved" ? "pm-pill pm-pill-green" : c.status === "rejected" ? "pm-pill pm-pill-red" : "pm-pill pm-pill-amber"}>
                          {c.status.charAt(0).toUpperCase() + c.status.slice(1)}
                        </span>
                      </td>
                      <td>
                        {c.status === "pending" ? (
                          <div style={{ display: "flex", gap: 6 }}>
                            <button className="pm-btn pm-btn-sm pm-btn-approve" onClick={() => update(c.id, "approved")}>Approve</button>
                            <button className="pm-btn pm-btn-sm pm-btn-reject" onClick={() => update(c.id, "rejected")}>Reject</button>
                          </div>
                        ) : (
                          <button className="pm-btn pm-btn-sm pm-btn-outline" onClick={() => update(c.id, c.status === "approved" ? "rejected" : "approved")}>
                            {c.status === "approved" ? "Reject" : "Approve"}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
