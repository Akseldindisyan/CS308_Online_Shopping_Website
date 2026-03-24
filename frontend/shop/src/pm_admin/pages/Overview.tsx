import { useNavigate } from "react-router-dom";
import Topbar from "../components/Topbar";
import { initProducts, initDeliveries, initComments, initCategories } from "../data";

const statusPill: Record<string, string> = {
  completed: "pm-pill pm-pill-green",
  "in-transit": "pm-pill pm-pill-blue",
  preparing: "pm-pill pm-pill-amber",
  delayed: "pm-pill pm-pill-red",
};

const statusLabel: Record<string, string> = {
  completed: "Completed",
  "in-transit": "In Transit",
  preparing: "Preparing",
  delayed: "Delayed",
};

export default function Overview() {
  const navigate = useNavigate();
  const lowStock = initProducts.filter((p) => p.stock < 10).length;
  const pending = initComments.filter((c) => c.status === "pending").length;
  const undelivered = initDeliveries.filter((d) => !d.completed).length;

  return (
    <>
      <Topbar
        title="Overview"
        subtitle="Monday, March 24, 2026"
        actions={
          <>
            <input className="pm-search" placeholder="Search products, orders…" />
            <button className="pm-btn pm-btn-outline">Export</button>
            <button className="pm-btn pm-btn-primary" onClick={() => navigate("/pm-admin/products")}>
              + Add Product
            </button>
          </>
        }
      />
      <div className="pm-content">

        <div className="pm-stat-grid">
          <div className="pm-stat">
            <div className="pm-stat-label">Total Products</div>
            <div className="pm-stat-val">{initProducts.length}</div>
            <div className="pm-stat-change pm-up">+2 this week</div>
          </div>
          <div className="pm-stat">
            <div className="pm-stat-label">Pending Deliveries</div>
            <div className="pm-stat-val">{undelivered}</div>
            <div className="pm-stat-change pm-down">
              {initDeliveries.filter((d) => d.status === "delayed").length} delayed
            </div>
          </div>
          <div className="pm-stat">
            <div className="pm-stat-label">Awaiting Review</div>
            <div className="pm-stat-val">{pending}</div>
            <div className="pm-stat-change pm-neutral">Last 24 hours</div>
          </div>
          <div className="pm-stat">
            <div className="pm-stat-label">Low Stock Alerts</div>
            <div className="pm-stat-val">{lowStock}</div>
            <div className="pm-stat-change pm-down">Needs update</div>
          </div>
        </div>

        <div className="pm-grid-2">
          <div className="pm-panel">
            <div className="pm-panel-title">
              Products
              <button className="pm-panel-link" onClick={() => navigate("/pm-admin/products")}>View all</button>
            </div>
            <div className="pm-table-wrap">
              <table>
                <thead>
                  <tr><th>Product</th><th>Category</th><th>Stock</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {initProducts.slice(0, 5).map((p) => {
                    const cat = initCategories.find((c) => c.id === p.categoryId);
                    const pct = Math.min((p.stock / 80) * 100, 100);
                    const fillColor = p.stock < 10 ? "#F87171" : p.stock < 20 ? "#FBBF24" : "#22C55E";
                    return (
                      <tr key={p.id}>
                        <td className="pm-col-main">{p.name}</td>
                        <td>{cat?.name}</td>
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
          </div>

          <div className="pm-panel">
            <div className="pm-panel-title">
              Pending Comments
              <button className="pm-panel-link" onClick={() => navigate("/pm-admin/comments")}>View all</button>
            </div>
            {initComments.filter((c) => c.status === "pending").slice(0, 3).map((c) => {
              const prod = initProducts.find((p) => p.id === c.productId);
              return (
                <div key={c.id} className="pm-comment-card">
                  <div className="pm-comment-header">
                    <span className="pm-comment-author">{c.author}</span>
                    <span className="pm-comment-product">{prod?.name}</span>
                  </div>
                  <div className="pm-comment-body">"{c.text}"</div>
                  <div className="pm-comment-footer">
                    <button className="pm-btn pm-btn-sm pm-btn-approve">Approve</button>
                    <button className="pm-btn pm-btn-sm pm-btn-reject">Reject</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="pm-panel">
          <div className="pm-panel-title">
            Delivery List
            <button className="pm-panel-link" onClick={() => navigate("/pm-admin/deliveries")}>View all</button>
          </div>
          <div className="pm-table-wrap">
            <table>
              <thead>
                <tr><th>Delivery ID</th><th>Customer ID</th><th>Product</th><th>Qty</th><th>Total</th><th>Address</th><th>Status</th></tr>
              </thead>
              <tbody>
                {initDeliveries.map((d) => {
                  const prod = initProducts.find((p) => p.id === d.productId);
                  return (
                    <tr key={d.deliveryId}>
                      <td className="pm-col-main">{d.deliveryId}</td>
                      <td>{d.customerId}</td>
                      <td>{prod?.name}</td>
                      <td>{d.quantity}</td>
                      <td>₺{d.totalPrice.toLocaleString()}</td>
                      <td>
                        <div style={{ color: "var(--text-main)", fontSize: 13 }}>{d.address}</div>
                        <div className="pm-addr-sub">{d.addressDetail}</div>
                      </td>
                      <td><span className={statusPill[d.status]}>{statusLabel[d.status]}</span></td>
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