import { useEffect, useState } from "react";
import Topbar from "../components/Topbar";
import type { Delivery, DeliveryStatus } from "../../data/types";
import { getAllDeliveries, getDeliveries, updateDeliveryStatus } from "../../api/deliveries";

const statusPill: Record<string, string> = {
  completed: "pm-pill pm-pill-green",
  "in-transit": "pm-pill pm-pill-blue",
  preparing: "pm-pill pm-pill-amber",
  delayed: "pm-pill pm-pill-red",
};

const statusLabel: Record<DeliveryStatus, string> = {
  completed: "Completed",
  "in-transit": "In Transit",
  preparing: "Preparing",
  delayed: "Delayed",
};

const STATUS_OPTIONS: DeliveryStatus[] = ["preparing", "in-transit", "completed", "delayed"];

export default function Deliveries() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [filter, setFilter] = useState<"all" | "pending" | "completed">("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getAllDeliveries();
        if (!cancelled) setDeliveries(data);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load deliveries");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = deliveries.filter((d) =>
    filter === "pending" ? !d.completed : filter === "completed" ? d.completed : true
  );

  const changeStatus = async (id: string, newStatus: DeliveryStatus) => {
    setUpdatingId(id);
    try {
      const updated = await updateDeliveryStatus(id, newStatus);
      setDeliveries((prev) =>
        prev.map((d) => (d.deliveryId === id ? updated : d))
      );
    } catch (err) {
      console.error("Failed to update delivery:", err);
      setError(err instanceof Error ? err.message : "Failed to update delivery");
    } finally {
      setUpdatingId(null);
    }
  };

  const pendingCount = deliveries.filter((d) => !d.completed).length;
  const delayedCount = deliveries.filter((d) => d.status === "delayed").length;

  return (
    <>
      <Topbar
        title="Deliveries"
        subtitle={`${pendingCount} pending · ${delayedCount} delayed`}
        actions={
          <div style={{ display: "flex", gap: 8 }}>
            {(["all", "pending", "completed"] as const).map((f) => (
              <button
                key={f}
                className={`pm-btn pm-btn-sm ${filter === f ? "pm-btn-primary" : "pm-btn-outline"}`}
                onClick={() => setFilter(f)}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        }
      />
      <div className="pm-content">
        <div className="pm-panel">
          {loading ? (
            <div style={{ padding: 24, color: "var(--text-dim)" }}>Loading deliveries...</div>
          ) : error ? (
            <div style={{ padding: 24, color: "var(--danger, #ef4444)" }}>{error}</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: 24, color: "var(--text-dim)" }}>No deliveries found.</div>
          ) : (
            <div className="pm-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Delivery ID</th>
                    <th>Customer ID</th>
                    <th>Items</th>
                    <th>Total Price</th>
                    <th>Delivery Address</th>
                    <th>Status</th>
                    <th>Change Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((d) => (
                    <tr key={d.deliveryId}>
                      <td className="pm-col-main">{d.deliveryId.slice(0, 8)}…</td>
                      <td>{d.customerId.slice(0, 8)}…</td>
                      <td>
                        {d.items.map((it) => (
                          <div key={it.productId} style={{ fontSize: 13 }}>
                            {it.productName}{" "}
                            <span style={{ color: "var(--text-dim)" }}>×{it.quantity}</span>
                          </div>
                        ))}
                      </td>
                      <td>₺{d.totalPrice.toLocaleString()}</td>
                      <td>
                        <div style={{ color: "var(--text-main)", fontSize: 13 }}>{d.address}</div>
                        {d.addressDetail && <div className="pm-addr-sub">{d.addressDetail}</div>}
                      </td>
                      <td>
                        <span className={statusPill[d.status] ?? "pm-pill"}>
                          {statusLabel[d.status] ?? d.status}
                        </span>
                      </td>
                      <td>
                        <select
                          className="pm-select pm-select-sm"
                          value={d.status}
                          disabled={updatingId === d.deliveryId}
                          onChange={(e) =>
                            changeStatus(d.deliveryId, e.target.value as DeliveryStatus)
                          }
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>
                              {statusLabel[s]}
                            </option>
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