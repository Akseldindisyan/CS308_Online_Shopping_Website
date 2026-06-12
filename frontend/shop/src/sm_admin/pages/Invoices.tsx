import { useEffect, useState } from "react";
import Topbar from "../components/Topbar";
import { getSalesInvoices, type SalesInvoice } from "../../api/sales";

const money = (v: number) => `₺${v.toLocaleString("tr-TR", { maximumFractionDigits: 2 })}`;

const fmtDate = (value: string | null) => {
    if (!value) return "—";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const printInvoice = (inv: SalesInvoice) => {
    const win = window.open("", "_blank");
    if (!win) return;
    const rows = inv.items
        .map(
            (it) => `<tr>
                <td>${it.productName}</td>
                <td>${it.quantity}</td>
                <td>₺${it.unitPrice.toLocaleString()}</td>
                <td>₺${it.totalPrice.toLocaleString()}</td>
            </tr>`,
        )
        .join("");
    win.document.write(`
        <html><head><title>Invoice ${inv.invoiceId}</title>
        <style>
            body { font-family: 'Segoe UI', system-ui, sans-serif; padding: 40px; color: #1a1a1a; }
            h1 { font-size: 24px; margin-bottom: 8px; }
            .meta { color: #666; margin-bottom: 24px; line-height: 1.6; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; }
            th, td { padding: 10px 12px; text-align: left; border-bottom: 1px solid #e5e5e5; }
            th { font-size: 11px; text-transform: uppercase; color: #888; letter-spacing: 0.05em; }
            .total { font-size: 18px; font-weight: 600; margin-top: 24px; }
            .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e5e5e5; font-size: 12px; color: #888; }
        </style>
        </head><body>
            <h1>Invoice</h1>
            <div class="meta">
                No: ${inv.invoiceId}<br/>
                Date: ${fmtDate(inv.date)}<br/>
                Customer: ${inv.customerName}
            </div>
            <table>
                <thead><tr><th>Product</th><th>Quantity</th><th>Unit Price</th><th>Total</th></tr></thead>
                <tbody>${rows}</tbody>
            </table>
            <div class="total">Total: ₺${inv.totalPrice.toLocaleString()}</div>
            <p>Customer: ${inv.customerId}</p>
            <div class="footer">Teknosu Online Store — Generated on ${new Date().toLocaleDateString()}</div>
        </body></html>
    `);
    win.document.close();
    win.focus();
    win.print();
};

export default function Invoices() {
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [invoices, setInvoices] = useState<SalesInvoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError("");
        getSalesInvoices(startDate || undefined, endDate || undefined)
            .then((data) => { if (!cancelled) setInvoices(data); })
            .catch((err) => {
                if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load invoices");
            })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, [startDate, endDate]);

    const totalRevenue = invoices.reduce((s, i) => s + i.totalPrice, 0);
    const itemsSold = invoices.reduce(
        (s, i) => s + i.items.reduce((a, it) => a + it.quantity, 0),
        0,
    );
    const rangeLabel =
        startDate && endDate ? `${startDate} – ${endDate}`
            : startDate ? `From ${startDate}`
            : endDate ? `Until ${endDate}`
            : "All time";

    return (
        <>
            <Topbar
                title="Invoices"
                subtitle={`${invoices.length} invoices found`}
                actions={
                    <>
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
                        <button className="pm-btn pm-btn-outline" onClick={() => window.print()}>
                            Print All
                        </button>
                        <button className="pm-btn pm-btn-primary" onClick={() => window.print()}>
                            Export PDF
                        </button>
                    </>
                }
            />

            <div className="pm-content">
                <div className="pm-stat-grid">
                    <div className="pm-stat">
                        <span className="pm-stat-label">Total Invoices</span>
                        <span className="pm-stat-val">{invoices.length}</span>
                    </div>
                    <div className="pm-stat">
                        <span className="pm-stat-label">Items Sold</span>
                        <span className="pm-stat-val">{itemsSold}</span>
                    </div>
                    <div className="pm-stat">
                        <span className="pm-stat-label">Total Revenue</span>
                        <span className="pm-stat-val">{money(totalRevenue)}</span>
                    </div>
                    <div className="pm-stat">
                        <span className="pm-stat-label">Date Range</span>
                        <span className="pm-stat-val" style={{ fontSize: 14 }}>{rangeLabel}</span>
                    </div>
                </div>

                <div className="pm-panel">
                    <div className="pm-panel-title">Invoice List</div>

                    {loading && <p style={{ color: "var(--text-muted)" }}>Loading…</p>}
                    {error && <p style={{ color: "#F87171" }}>{error}</p>}
                    {!loading && !error && invoices.length === 0 && (
                        <p style={{ color: "var(--text-muted)" }}>No invoices for the selected range.</p>
                    )}

                    {!loading && !error && invoices.length > 0 && (
                        <div className="pm-table-wrap">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Invoice ID</th>
                                        <th>Customer</th>
                                        <th>Items</th>
                                        <th>Total (₺)</th>
                                        <th>Date</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoices.map((inv) => (
                                        <tr key={inv.invoiceId}>
                                            <td className="pm-col-main">{inv.invoiceId.slice(0, 8)}</td>
                                            <td>{inv.customerName}</td>
                                            <td style={{ maxWidth: 280, color: "var(--text-muted)" }}>
                                                {inv.items.map((i) => i.productName).join(", ") || "—"}
                                            </td>
                                            <td>{money(inv.totalPrice)}</td>
                                            <td>{fmtDate(inv.date)}</td>
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