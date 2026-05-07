import { useEffect, useState } from "react";
import Topbar from "../components/Topbar";

const stars = (n: number) => "★".repeat(n) + "☆".repeat(5 - n);

type AdminReview = {
  id: string;
  username: string;
  comment: string;
  rating: number;
  createdAt: string;
  approved: boolean;
  product_id: string;
  product_name: string;
};

export default function Comments() {
  const [pending, setPending] = useState<AdminReview[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPending = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8080/api/review/pending");
      const data = await res.json();
      setPending(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadPending(); }, []);

  const handleApprove = async (id: string) => {
    await fetch(`http://localhost:8080/api/review/${id}/approve`, { method: "POST" });
    setPending((prev) => prev.filter((r) => r.id !== id));
  };

  const handleReject = async (id: string) => {
    await fetch(`http://localhost:8080/api/review/${id}/reject`, { method: "POST" });
    setPending((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <>
      <Topbar
        title="Comments"
        subtitle={`${pending.length} pending approval`}
      />
      <div className="pm-content">
        <div className="pm-stat-grid">
          <div className="pm-stat">
            <div className="pm-stat-label">Pending</div>
            <div className="pm-stat-val" style={{ color: "#FBBF24" }}>{pending.length}</div>
          </div>
        </div>

        <div className="pm-panel">
          <div className="pm-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Author</th><th>Product</th><th>Rating</th>
                  <th>Comment</th><th>Date</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6}>Loading…</td></tr>
                ) : pending.length === 0 ? (
                  <tr><td colSpan={6}>No pending comments.</td></tr>
                ) : pending.map((c) => (
                  <tr key={c.id}>
                    <td className="pm-col-main" style={{ whiteSpace: "nowrap" }}>{c.username}</td>
                    <td style={{ whiteSpace: "nowrap" }}>{c.product_name}</td>
                    <td>
                      <span style={{
                        color: c.rating >= 4 ? "var(--green)" : c.rating >= 3 ? "#FBBF24" : "#F87171",
                        fontSize: 12, letterSpacing: 1
                      }}>
                        {stars(Math.round(c.rating))}
                      </span>
                    </td>
                    <td style={{ maxWidth: 260 }}>
                      <span style={{ color: "var(--text-muted)", fontSize: 13 }}>"{c.comment}"</span>
                    </td>
                    <td style={{ whiteSpace: "nowrap" }}>{c.createdAt}</td>
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button className="pm-btn pm-btn-sm pm-btn-approve" onClick={() => handleApprove(c.id)}>Approve</button>
                        <button className="pm-btn pm-btn-sm pm-btn-reject" onClick={() => handleReject(c.id)}>Reject</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}