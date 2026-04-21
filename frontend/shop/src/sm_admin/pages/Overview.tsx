import { useNavigate } from "react-router-dom";
import Topbar from "../components/Topbar";
import { products, categories, invoices, wishlist, type Product, type Invoice } from "../../data";

export default function Overview() {
  const navigate = useNavigate();

  // --- Stat calculations ---
  const totalRevenue = invoices
    .filter((inv: Invoice) => inv.paid)
    .reduce((sum: number, inv: Invoice) => sum + inv.totalPrice, 0);

  const activeDiscounts = products.filter((p: Product) => p.discountRate > 0).length;

  const avgProfitMargin =
    products.length > 0
      ? products.reduce((sum: number, p: Product) => sum + ((p.price - p.cost) / p.price) * 100, 0) /
        products.length
      : 0;

  const wishlistCount = wishlist.length;

  // --- Top 5 products by revenue ---
  const revenueByProduct: Record<number, { revenue: number; units: number }> = {};
  invoices.forEach((inv: Invoice) => {
    if (!revenueByProduct[inv.productId]) {
      revenueByProduct[inv.productId] = { revenue: 0, units: 0 };
    }
    revenueByProduct[inv.productId].revenue += inv.totalPrice;
    revenueByProduct[inv.productId].units += inv.quantity;
  });

  const topProducts = Object.entries(revenueByProduct)
    .map(([productId, data]) => ({
      product: products.find((p: Product) => p.id === Number(productId)),
      ...data,
    }))
    .filter((item) => item.product !== undefined)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // --- Last 5 invoices by date desc ---
  const recentInvoices = [...invoices]
    .sort((a: Invoice, b: Invoice) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))
    .slice(0, 5);

  return (
    <>
      <Topbar
        title="Overview"
        subtitle="Sales Manager Dashboard"
        actions={
          <>
            <input className="pm-search" placeholder="Search products, invoices…" />
            <button className="pm-btn pm-btn-primary" onClick={() => navigate("/sm-admin/pricing")}>
              + Set Discount
            </button>
          </>
        }
      />
      <div className="pm-content">

        {/* Stat grid */}
        <div className="pm-stat-grid">
          <div className="pm-stat">
            <div className="pm-stat-label">Total Revenue</div>
            <div className="pm-stat-val">₺{totalRevenue.toLocaleString("tr-TR", { maximumFractionDigits: 0 })}</div>
            <div className="pm-stat-change pm-up">Paid invoices</div>
          </div>
          <div className="pm-stat">
            <div className="pm-stat-label">Active Discounts</div>
            <div className="pm-stat-val">{activeDiscounts}</div>
            <div className="pm-stat-change pm-neutral">Products on sale</div>
          </div>
          <div className="pm-stat">
            <div className="pm-stat-label">Avg Profit Margin</div>
            <div className="pm-stat-val">{avgProfitMargin.toFixed(1)}%</div>
            <div className="pm-stat-change pm-up">Across all products</div>
          </div>
          <div className="pm-stat">
            <div className="pm-stat-label">Wishlist Items</div>
            <div className="pm-stat-val">{wishlistCount}</div>
            <div className="pm-stat-change pm-neutral">Total entries</div>
          </div>
        </div>

        {/* Two-column grid */}
        <div className="pm-grid-2">

          {/* Top Products by Revenue */}
          <div className="pm-panel">
            <div className="pm-panel-title">
              Top Products by Revenue
              <button className="pm-panel-link" onClick={() => navigate("/sm-admin/pricing")}>
                View all
              </button>
            </div>
            <div className="pm-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Revenue</th>
                    <th>Units Sold</th>
                  </tr>
                </thead>
                <tbody>
                  {topProducts.map((item) => {
                    const cat = categories.find((c) => c.id === item.product!.categoryId);
                    return (
                      <tr key={item.product!.id}>
                        <td className="pm-col-main">{item.product!.name}</td>
                        <td>{cat?.name ?? item.product!.category}</td>
                        <td>₺{item.revenue.toLocaleString("tr-TR", { maximumFractionDigits: 0 })}</td>
                        <td>{item.units}</td>
                      </tr>
                    );
                  })}
                  {topProducts.length === 0 && (
                    <tr>
                      <td colSpan={4} style={{ textAlign: "center", color: "var(--text-muted)" }}>
                        No invoice data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Invoices */}
          <div className="pm-panel">
            <div className="pm-panel-title">
              Recent Invoices
              <button className="pm-panel-link" onClick={() => navigate("/sm-admin/invoices")}>
                View all
              </button>
            </div>
            <div className="pm-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Invoice ID</th>
                    <th>Customer</th>
                    <th>Total</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentInvoices.map((inv: Invoice) => (
                    <tr key={inv.invoiceId}>
                      <td className="pm-col-main">#{inv.invoiceId}</td>
                      <td>{inv.customerId}</td>
                      <td>₺{inv.totalPrice.toLocaleString("tr-TR", { maximumFractionDigits: 0 })}</td>
                      <td>
                        <span className={inv.paid ? "pm-pill pm-pill-green" : "pm-pill pm-pill-red"}>
                          {inv.paid ? "Paid" : "Unpaid"}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {recentInvoices.length === 0 && (
                    <tr>
                      <td colSpan={4} style={{ textAlign: "center", color: "var(--text-muted)" }}>
                        No invoices available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
