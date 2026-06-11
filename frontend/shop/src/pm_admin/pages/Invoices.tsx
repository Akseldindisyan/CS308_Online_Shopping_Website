import { useEffect, useState } from "react";
import Topbar from "../components/Topbar";
import { getAllInvoices } from "../../api/invoices";
import type { InvoiceDTO } from "../../data/types";

export default function Invoices() {
  const [invoices, setInvoices] = useState<InvoiceDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setInvoices(await getAllInvoices());
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load invoices");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const total = invoices.reduce((s, i) => s + i.totalPrice, 0);

  return (
    <>
      <Topbar title="Invoices" subtitle={`${invoices.length} invoices total`} />
      <div className="pm-content">
        {error && <div style={{ color: "#F87171", marginBottom: 12 }}>{error}</div>}
        <div className="pm-stat-grid">
          <div className="pm-stat"><div className="pm-stat-label">Total Invoices</div><div className="pm-stat-val">{invoices.length}</div></div>
          <div className="pm-stat"><div className="pm-stat-label">Total Revenue</div><div className="pm-stat-val" style={{ color: "var(--green)" }}>₺{total.toLocaleString()}</div></div>
        </div>
        <div className="pm-panel">
          {loading ? (
            <div style={{ padding: 24, color: "var(--text-dim)" }}>Loading invoices…</div>
          ) : (
            <div className="pm-table-wrap">
              <table>
                <thead>
                  <tr><th>Invoice ID</th><th>Customer ID</th><th>Items</th><th>Total</th><th>Date</th></tr>
                </thead>
                <tbody>
                  {invoices.map((inv) => (
                    <tr key={inv.invoiceId}>
                      <td className="pm-col-main">{inv.invoiceId.slice(0, 8)}…</td>
                      <td>{inv.customerId.slice(0, 8)}…</td>
                      <td>
                        {inv.items.map((it) => (
                          <div key={it.productId} style={{ fontSize: 13 }}>
                            {it.productName} <span style={{ color: "var(--text-dim)" }}>×{it.quantity}</span>
                          </div>
                        ))}
                      </td>
                      <td>₺{inv.totalPrice.toLocaleString()}</td>
                      <td>{inv.date}</td>
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
