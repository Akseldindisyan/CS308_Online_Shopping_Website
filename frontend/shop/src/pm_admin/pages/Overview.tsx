import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Topbar from "../components/Topbar";
import { fetchAllProductsAdmin } from "../../api/products";
import { getAllDeliveries, updateDeliveryStatus } from "../../api/deliveries";
import { apiRequest } from "../../api/client";
import type { ProductCardDTO, Delivery, DeliveryStatus } from "../../data/types";

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

const statusPill: Record<string, string> = {
  PENDING:    "pm-pill pm-pill-amber",
  IN_TRANSIT: "pm-pill pm-pill-blue",
  COMPLETED:  "pm-pill pm-pill-green",
};

const statusLabel: Record<string, string> = {
  PENDING:    "Pending",
  IN_TRANSIT: "In Transit",
  COMPLETED:  "Delivered",
};

const todayLabel = () => {
  return new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
};

export default function Overview() {
  const navigate = useNavigate();

  const [products, setProducts]   = useState<ProductCardDTO[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [reviews, setReviews]     = useState<AdminReview[]>([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [prods, dels, revs] = await Promise.all([
          fetchAllProductsAdmin({ page: 0, size: 200, sort: "id" }).then((r) => r.content),
          getAllDeliveries(),
          apiRequest<AdminReview[]>("/api/review/pending"),
        ]);
        setProducts(prods);
        setDeliveries(dels);
        setReviews(revs);
      } catch (e) {
        console.error("Overview load error:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleApprove = async (id: string) => {
    await apiRequest<void>(`/api/review/${id}/approve`, { method: "POST" });
    setReviews((prev) => prev.filter((r) => r.id !== id));
  };

  const handleReject = async (id: string) => {
    await apiRequest<void>(`/api/review/${id}/reject`, { method: "POST" });
    setReviews((prev) => prev.filter((r) => r.id !== id));
  };

  const handleStatusChange = async (deliveryId: string, status: DeliveryStatus) => {
    const updated = await updateDeliveryStatus(deliveryId, status);
    setDeliveries((prev) => prev.map((d) => (d.deliveryId === deliveryId ? updated : d)));
  };

  const lowStock      = products.filter((p) => p.stock < 10).length;
  const pending       = reviews.length;
  const undelivered   = deliveries.filter((d) => !d.completed).length;
  const inTransit     = deliveries.filter((d) => d.status === "IN_TRANSIT").length;

  const STATUS_OPTIONS: DeliveryStatus[] = ["PENDING", "IN_TRANSIT", "COMPLETED"];

  return (
    <>
      <Topbar
        title="Overview"
        subtitle={todayLabel()}
        actions={
          <>
            <button className="pm-btn pm-btn-primary" onClick={() => navigate("/pm-admin/products")}>
              + Add Product
            </button>
          </>
        }
      />
      <div className="pm-content">

        {/* ── Stats ── */}
        <div className="pm-stat-grid">
          <div className="pm-stat">
            <div className="pm-stat-label">Total Products</div>
            <div className="pm-stat-val">{loading ? "…" : products.length}</div>
            <div className="pm-stat-change pm-neutral">
              {loading ? "" : `${products.filter((p) => p.active).length} active`}
            </div>
          </div>
          <div className="pm-stat">
            <div className="pm-stat-label">Pending Deliveries</div>
            <div className="pm-stat-val">{loading ? "…" : undelivered}</div>
            <div className={`pm-stat-change ${inTransit > 0 ? "pm-neutral" : "pm-neutral"}`}>
              {loading ? "" : `${inTransit} in transit`}
            </div>
          </div>
          <div className="pm-stat">
            <div className="pm-stat-label">Awaiting Review</div>
            <div className="pm-stat-val">{loading ? "…" : pending}</div>
            <div className="pm-stat-change pm-neutral">Pending approval</div>
          </div>
          <div className="pm-stat">
            <div className="pm-stat-label">Low Stock Alerts</div>
            <div className="pm-stat-val">{loading ? "…" : lowStock}</div>
            <div className={`pm-stat-change ${lowStock > 0 ? "pm-down" : "pm-neutral"}`}>
              {loading ? "" : lowStock > 0 ? "Needs update" : "All good"}
            </div>
          </div>
        </div>

        <div className="pm-grid-2">
          {/* ── Products ── */}
          <div className="pm-panel">
            <div className="pm-panel-title">
              Products
              <button className="pm-panel-link" onClick={() => navigate("/pm-admin/products")}>View all</button>
            </div>
            {loading ? (
              <div style={{ padding: 16, color: "var(--text-dim)" }}>Loading…</div>
            ) : (
              <div className="pm-table-wrap">
                <table>
                  <thead>
                    <tr><th>Product</th><th>Category</th><th>Stock</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    {products.slice(0, 5).map((p) => {
                      const pct = Math.min((p.stock / 80) * 100, 100);
                      const fillColor = p.stock === 0 ? "#F87171" : p.stock < 10 ? "#FBBF24" : "#22C55E";
                      return (
                        <tr key={p.id}>
                          <td className="pm-col-main">{p.name}</td>
                          <td>{p.category}</td>
                          <td>
                            <div className="pm-stock-bar-wrap">
                              <span style={{ minWidth: 24 }}>{p.stock}</span>
                              <div className="pm-stock-bar">
                                <div className="pm-stock-fill" style={{ width: `${pct}%`, background: fillColor }} />
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className={p.active ? "pm-pill pm-pill-green" : "pm-pill pm-pill-gray"}>
                              {p.active ? "Active" : "Inactive"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* ── Pending Comments ── */}
          <div className="pm-panel">
            <div className="pm-panel-title">
              Pending Comments
              <button className="pm-panel-link" onClick={() => navigate("/pm-admin/comments")}>View all</button>
            </div>
            {loading ? (
              <div style={{ padding: 16, color: "var(--text-dim)" }}>Loading…</div>
            ) : reviews.length === 0 ? (
              <div style={{ padding: 16, color: "var(--text-dim)" }}>No pending comments.</div>
            ) : (
              reviews.slice(0, 3).map((c) => (
                <div key={c.id} className="pm-comment-card">
                  <div className="pm-comment-header">
                    <span className="pm-comment-author">{c.username}</span>
                    <span className="pm-comment-product">{c.product_name}</span>
                  </div>
                  <div className="pm-comment-body">"{c.comment}"</div>
                  <div className="pm-comment-footer">
                    <button className="pm-btn pm-btn-sm pm-btn-approve" onClick={() => handleApprove(c.id)}>Approve</button>
                    <button className="pm-btn pm-btn-sm pm-btn-reject"  onClick={() => handleReject(c.id)}>Reject</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ── Delivery List ── */}
        <div className="pm-panel">
          <div className="pm-panel-title">
            Recent Deliveries
            <button className="pm-panel-link" onClick={() => navigate("/pm-admin/deliveries")}>View all</button>
          </div>
          {loading ? (
            <div style={{ padding: 16, color: "var(--text-dim)" }}>Loading…</div>
          ) : deliveries.length === 0 ? (
            <div style={{ padding: 16, color: "var(--text-dim)" }}>No deliveries found.</div>
          ) : (
            <div className="pm-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Delivery ID</th>
                    <th>Customer ID</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Address</th>
                    <th>Status</th>
                    <th>Change Status</th>
                  </tr>
                </thead>
                <tbody>
                  {deliveries.slice(0, 5).map((d) => (
                    <tr key={d.deliveryId}>
                      <td className="pm-col-main">{d.deliveryId.slice(0, 8)}…</td>
                      <td>{d.customerId.slice(0, 8)}…</td>
                      <td>
                        {d.items.map((it) => (
                          <div key={it.productId} style={{ fontSize: 13 }}>
                            {it.productName} <span style={{ color: "var(--text-dim)" }}>×{it.quantity}</span>
                          </div>
                        ))}
                      </td>
                      <td>₺{d.totalPrice.toLocaleString()}</td>
                      <td style={{ fontSize: 13 }}>{d.address || "—"}</td>
                      <td>
                        <span className={statusPill[d.status] ?? "pm-pill"}>
                          {statusLabel[d.status] ?? d.status}
                        </span>
                      </td>
                      <td>
                        <select
                          className="pm-select pm-select-sm"
                          value={d.status}
                          onChange={(e) => handleStatusChange(d.deliveryId, e.target.value as DeliveryStatus)}
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>{statusLabel[s] ?? s}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </>
  );
}
