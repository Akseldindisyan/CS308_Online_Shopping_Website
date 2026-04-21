import { useState } from "react";
import Topbar from "../components/Topbar";
import { invoices, products, type Invoice } from "../../data";

const printInvoice = (inv: Invoice) => {
    const prod = products.find((p) => p.id === inv.productId);
    const win = window.open("", "_blank");
    if (!win) return;
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
            .status { display: inline-block; padding: 4px 12px; border-radius: 99px; font-size: 12px; font-weight: 500; }
            .paid { background: #dcfce7; color: #16a34a; }
            .unpaid { background: #fef2f2; color: #dc2626; }
            .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e5e5e5; font-size: 12px; color: #888; }
        </style>
        </head>
        <body>
            <h1>Invoice ${inv.invoiceId}</h1>
            <div class="meta">Date: ${new Date(inv.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</div>
            <table>
                <thead><tr><th>Product</th><th>Quantity</th><th>Unit Price</th><th>Total</th></tr></thead>
                <tbody><tr>
                    <td>${prod?.name ?? "Unknown"}</td>
                    <td>${inv.quantity}</td>
                    <td>₺${inv.unitPrice.toLocaleString()}</td>
                    <td>₺${inv.totalPrice.toLocaleString()}</td>
                </tr></tbody>
            </table>
            <div class="total">Total: ₺${inv.totalPrice.toLocaleString()}</div>
            <p>Customer: ${inv.customerId}</p>
            <p>Status: <span class="status ${inv.paid ? "paid" : "unpaid"}">${inv.paid ? "Paid" : "Unpaid"}</span></p>
            <div class="footer">Teknosu Online Store — Generated on ${new Date().toLocaleDateString()}</div>
        </body></html>
    `);
    win.document.close();
    win.print();
};

export default function Invoices() {
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const filtered = invoices.filter((inv) => {
        if (startDate && inv.date < startDate) return false;
        if (endDate && inv.date > endDate) return false;
        return true;
    });

    const paidCount = filtered.filter((inv) => inv.paid).length;
    const unpaidCount = filtered.filter((inv) => !inv.paid).length;
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
                <div className="pm-stat-grid">
                    <div className="pm-stat">
                        <span className="pm-stat-label">Total Invoices</span>
                        <span className="pm-stat-val">{filtered.length}</span>
                    </div>
                    <div className="pm-stat">
                        <span className="pm-stat-label">Paid</span>
                        <span className="pm-stat-val" style={{ color: "#16a34a" }}>{paidCount}</span>
                    </div>
                    <div className="pm-stat">
                        <span className="pm-stat-label">Unpaid</span>
                        <span className="pm-stat-val" style={{ color: "#F87171" }}>{unpaidCount}</span>
                    </div>
                    <div className="pm-stat">
                        <span className="pm-stat-label">Total Revenue</span>
                        <span className="pm-stat-val">₺{totalRevenue.toLocaleString()}</span>
                    </div>
                </div>

                <div className="pm-panel">
                    <div className="pm-panel-title">Invoice List</div>
                    <div className="pm-table-wrap">
                        <table>
                            <thead>
                                <tr>
                                    <th>Invoice ID</th>
                                    <th>Customer ID</th>
                                    <th>Product</th>
                                    <th>Qty</th>
                                    <th>Unit Price (₺)</th>
                                    <th>Total (₺)</th>
                                    <th>Date</th>
                                    <th>Payment</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((inv) => {
                                    const prod = products.find((p) => p.id === inv.productId);
                                    const formattedDate = new Date(inv.date).toLocaleDateString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                    });
                                    return (
                                        <tr key={inv.invoiceId}>
                                            <td className="pm-col-main">{inv.invoiceId}</td>
                                            <td>{inv.customerId}</td>
                                            <td>{prod?.name ?? "Unknown"}</td>
                                            <td>{inv.quantity}</td>
                                            <td>₺{inv.unitPrice.toLocaleString()}</td>
                                            <td>₺{inv.totalPrice.toLocaleString()}</td>
                                            <td>{formattedDate}</td>
                                            <td>
                                                <span className={`pm-pill ${inv.paid ? "pm-pill-green" : "pm-pill-red"}`}>
                                                    {inv.paid ? "Paid" : "Unpaid"}
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
