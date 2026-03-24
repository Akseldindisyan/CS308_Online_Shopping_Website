import { useState } from "react";
import Topbar from "../components/Topbar";
import { initDeliveries, initProducts, type Delivery } from "../data";

const statusPill: Record<string, string> = { completed: "pm-pill pm-pill-green", "in-transit": "pm-pill pm-pill-blue", preparing: "pm-pill pm-pill-amber", delayed: "pm-pill pm-pill-red" };
const statusLabel: Record<string, string> = { completed: "Completed", "in-transit": "In Transit", preparing: "Preparing", delayed: "Delayed" };

export default function Deliveries() {
  const [deliveries, setDeliveries] = useState<Delivery[]>(initDeliveries);
  const [filter, setFilter] = useState<"all" | "pending" | "completed">("all");

  const filtered = deliveries.filter((d) =>
    filter === "pending" ? !d.completed : filter === "completed" ? d.completed : true
  );

  const markDone = (id: string) =>
    setDeliveries((prev) => prev.map((d) => d.deliveryId === id ? { ...d, completed: true, status: "completed" } : d));

  return (
    <>
      <Topbar
        title="Deliveries"
        subtitle={`${deliveries.filter((d) => !d.completed).length} pending · ${deliveries.filter((d) => d.status === "delayed").length} delayed`}
        actions={
          <div style={{ display: "flex", gap: 8 }}>
            {(["all", "pending", "completed"] as const).map((f) => (
              <button key={f} className={`pm-btn pm-btn-sm ${filter === f ? "pm-btn-primary" : "pm-btn-outline"}`} onClick={() => setFilter(f)}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        }
      />
      <div className="pm-content">
        <div className="pm-panel">
          <div className="pm-table-wrap">
            <table>
              <thead><tr><th>Delivery ID</th><th>Customer ID</th><th>Product</th><th>Qty</th><th>Total Price</th><th>Delivery Address</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>
                {filtered.map((d) => {
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
                      <td>
                        {!d.completed
                          ? <button className="pm-btn pm-btn-sm pm-btn-green" onClick={() => markDone(d.deliveryId)}>Mark Done</button>
                          : <span style={{ fontSize: 12, color: "var(--text-dim)" }}>—</span>}
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