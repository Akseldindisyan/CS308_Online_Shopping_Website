import Topbar from "../components/Topbar";
import { initInvoices, initProducts } from "../data";

export default function Invoices() {
  const paid = initInvoices.filter((i) => i.paid).length;
  const unpaid = initInvoices.filter((i) => !i.paid).length;

  return (
    <>
      <Topbar title="Invoices" subtitle={`${initInvoices.length} invoices total`} />
      <div className="pm-content">
        <div className="pm-stat-grid">
          <div className="pm-stat"><div className="pm-stat-label">Total Invoices</div><div className="pm-stat-val">{initInvoices.length}</div></div>
          <div className="pm-stat"><div className="pm-stat-label">Paid</div><div className="pm-stat-val" style={{ color: "var(--green)" }}>{paid}</div></div>
          <div className="pm-stat"><div className="pm-stat-label">Unpaid</div><div className="pm-stat-val" style={{ color: "#F87171" }}>{unpaid}</div></div>
          <div className="pm-stat"><div className="pm-stat-label">This Month</div><div className="pm-stat-val">{initInvoices.length}</div></div>
        </div>
        <div className="pm-panel">
          <div className="pm-table-wrap">
            <table>
              <thead>
                <tr><th>Invoice ID</th><th>Customer ID</th><th>Product</th><th>Qty</th><th>Unit Price</th><th>Total</th><th>Date</th><th>Payment</th></tr>
              </thead>
              <tbody>
                {initInvoices.map((inv) => {
                  const prod = initProducts.find((p) => p.id === inv.productId);
                  return (
                    <tr key={inv.invoiceId}>
                      <td className="pm-col-main">{inv.invoiceId}</td>
                      <td>{inv.customerId}</td>
                      <td>{prod?.name}</td>
                      <td>{inv.quantity}</td>
                      <td>₺{inv.unitPrice.toLocaleString()}</td>
                      <td>₺{inv.totalPrice.toLocaleString()}</td>
                      <td>{inv.date}</td>
                      <td><span className={inv.paid ? "pm-pill pm-pill-green" : "pm-pill pm-pill-red"}>{inv.paid ? "Paid" : "Unpaid"}</span></td>
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