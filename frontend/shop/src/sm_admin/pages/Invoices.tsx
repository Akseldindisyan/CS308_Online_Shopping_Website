import { useEffect, useState } from "react";
import Topbar from "../components/Topbar";
import { getAllInvoices } from "../../api/invoices";
import type { InvoiceDTO } from "../../data/types";

function formatDate(date: string | null): string {
    if (!date) return "N/A";

    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return date;

    return parsed.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

function getDateValue(date: string | null): string {
    if (!date) return "";

    return date.slice(0, 10);
}

const printInvoice = (inv: InvoiceDTO) => {
    const win = window.open("", "_blank");
    if (!win) return;
    const itemRows = inv.items.map((item) => `
                <tr>
                    <td>${item.productName}</td>
                    <td>${item.quantity}</td>
                    <td>₺${item.unitPrice.toLocaleString()}</td>
                    <td>₺${item.totalPrice.toLocaleString()}</td>
                </tr>
    `).join("");

    win.document.write(`
        <html>
        <head><title>Invoice ${inv.invoiceId}</title>
        <style>
            body { font-family: 'Segoe UI', system-ui, sans-serif; padding: 40px; color: #1a1a1a; }
            h1 { font-size: 24px; margin-bottom: 8px; }
            .meta { color: #666; margin-bottom: 24px; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; }
            th, td { padding: 10px 12px; text-align: left; border-bottom: 1px solid #e5e5e5; }
            th { font-size: 11px; text-transform: uppercase; color: #888; letter-spacing: 0.05em; }
            .total { font-size: 18px; font-weight: 600; margin-top: 24px; }
            .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e5e5e5; font-size: 12px; color: #888; }
        </style>
        </head>
        <body>
            <h1>Invoice ${inv.invoiceId}</h1>
            <div class="meta">Date: ${formatDate(inv.date)}</div>
            <table>
                <thead><tr><th>Product</th><th>Quantity</th><th>Unit Price</th><th>Total</th></tr></thead>
                <tbody>${itemRows}</tbody>
            </table>
            <div class="total">Total: ₺${inv.totalPrice.toLocaleString()}</div>
            <p>Customer: ${inv.customerId}</p>
            <div class="footer">Teknosu Online Store — Generated on ${new Date().toLocaleDateString()}</div>
        </body></html>
    `);
    win.document.close();
    win.print();
};

export default function Invoices() {
    const [invoices, setInvoices] = useState<InvoiceDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    useEffect(() => {
        let cancelled = false;

        (async () => {
            try {
                setLoading(true);
                setError(null);
                const loadedInvoices = await getAllInvoices();
                if (!cancelled) setInvoices(loadedInvoices);
            } catch (err) {
                if (!cancelled) {
                    setError(err instanceof Error ? err.message : "Failed to load invoices");
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, []);

    const filtered = invoices.filter((inv) => {
        const dateValue = getDateValue(inv.date);
        if (startDate && dateValue < startDate) return false;
        if (endDate && dateValue > endDate) return false;
        return true;
    });

    const totalRevenue = filtered.reduce((sum, inv) => sum + inv.totalPrice, 0);

    return (
        <>
            <Topbar
                title="Invoices"
                subtitle={`${filtered.length} invoices found`}
                actions={
                    <div className="pm-topbar-actions">
                        <input
                            type="date"
                            className="pm-input"
                            style={{ width: 160 }}
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                        <input
                            type="date"
                            className="pm-input"
                            style={{ width: 160 }}
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                        <button
                            className="pm-btn pm-btn-outline"
                            onClick={() => { setStartDate(""); setEndDate(""); }}
                        >
                            Clear
                        </button>
                        <button
                            className="pm-btn pm-btn-outline"
                            onClick={() => window.print()}
                        >
                            Print All
                        </button>
                        <button
                            className="pm-btn pm-btn-primary"
                            onClick={() => window.print()}
                        >
                            Export PDF
                        </button>
                    </div>
                }
            />

            <div className="pm-content">
                {error && (
                    <div style={{ color: "#F87171", marginBottom: 12 }}>
                        {error}
                    </div>
                )}

                <div className="pm-stat-grid">
                    <div className="pm-stat">
                        <span className="pm-stat-label">Total Invoices</span>
                        <span className="pm-stat-val">{filtered.length}</span>
                    </div>
                    <div className="pm-stat">
                        <span className="pm-stat-label">Total Revenue</span>
                        <span className="pm-stat-val">₺{totalRevenue.toLocaleString()}</span>
                    </div>
                </div>

                <div className="pm-panel">
                    <div className="pm-panel-title">Invoice List</div>
                    {loading ? (
                        <div style={{ padding: 24, color: "var(--text-dim)" }}>Loading invoices...</div>
                    ) : filtered.length === 0 ? (
                        <div style={{ padding: 24, color: "var(--text-dim)" }}>No invoices found.</div>
                    ) : (
                        <div className="pm-table-wrap">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Invoice ID</th>
                                        <th>Customer ID</th>
                                        <th>Items</th>
                                        <th>Total (₺)</th>
                                        <th>Date</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((inv) => (
                                        <tr key={inv.invoiceId}>
                                            <td className="pm-col-main">{inv.invoiceId.slice(0, 8)}...</td>
                                            <td>{inv.customerId.slice(0, 8)}...</td>
                                            <td>
                                                {inv.items.map((item) => (
                                                    <div key={item.invoiceItemId} style={{ fontSize: 13 }}>
                                                        {item.productName}{" "}
                                                        <span style={{ color: "var(--text-dim)" }}>x{item.quantity}</span>
                                                    </div>
                                                ))}
                                            </td>
                                            <td>₺{inv.totalPrice.toLocaleString()}</td>
                                            <td>{formatDate(inv.date)}</td>
                                            <td>
                                                <span className="pm-pill pm-pill-gray">
                                                    {inv.status ?? "N/A"}
                                                </span>
                                            </td>
                                            <td>
                                                <button
                                                    className="pm-btn pm-btn-sm pm-btn-outline"
                                                    onClick={() => printInvoice(inv)}
                                                >
                                                    Print
                                                </button>
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
