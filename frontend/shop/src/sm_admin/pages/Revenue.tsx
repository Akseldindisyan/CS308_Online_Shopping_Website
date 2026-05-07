import { useMemo, useState } from "react";
import Topbar from "../components/Topbar";
import { invoices, products } from "../../data";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
type RevenueRow = {
    date: string;
    revenue: number;
    units: number;
};
type ProductRevenueRow = {
    name: string;
    revenue: number;
    units: number;
};
export default function Revenue() {
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const filteredInvoices = useMemo(
        () => invoices.filter((inv) =>
            (!startDate || inv.date >= startDate) && (!endDate || inv.date <= endDate)
        ),
        [startDate, endDate],
    );
    const productLookup = useMemo(
        () => new Map(products.map((product) => [product.id, product] as const)),
        [],
    );
    const chartData: RevenueRow[] = useMemo(() => {
        const byDate = new Map<string, RevenueRow>();
        filteredInvoices.forEach((invoice) => {
            const entry = byDate.get(invoice.date) ?? { date: invoice.date, revenue: 0, units: 0 };
            entry.revenue += invoice.totalPrice;
            entry.units += invoice.quantity;
            byDate.set(invoice.date, entry);
        });
        return Array.from(byDate.values()).sort((a, b) => a.date.localeCompare(b.date));
    }, [filteredInvoices]);
    const totalRevenue = chartData.reduce((sum, row) => sum + row.revenue, 0);
    const totalUnits = chartData.reduce((sum, row) => sum + row.units, 0);
    const averageRevenuePerOrder = chartData.length > 0 ? totalRevenue / chartData.length : 0;
    const topProducts: ProductRevenueRow[] = useMemo(() => {
        const byProduct = new Map<string, ProductRevenueRow>();
        filteredInvoices.forEach((invoice) => {
            const product = productLookup.get(invoice.productId);
            const key = product?.name ?? String(invoice.productId);
            const entry = byProduct.get(key) ?? { name: key, revenue: 0, units: 0 };
            entry.revenue += invoice.totalPrice;
            entry.units += invoice.quantity;
            byProduct.set(key, entry);
        });
        return Array.from(byProduct.values())
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5);
    }, [filteredInvoices, productLookup]);
    const subtitleText =
        startDate && endDate
            ? `${startDate} – ${endDate}`
            : startDate
            ? `From ${startDate}`
            : endDate
            ? `Until ${endDate}`
            : "All time";
    return (
        <>
            <Topbar
                title="Revenue Overview"
                subtitle={subtitleText}
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
                            onClick={() => {
                                setStartDate("");
                                setEndDate("");
                            }}
                        >
                            Clear
                        </button>
                        <button
                            className="pm-btn pm-btn-primary"
                            onClick={() => window.print()}
                        >
                            Export
                        </button>
                    </>
                }
            />
            <div className="pm-content">
                <div className="pm-stat-grid">
                    <div className="pm-stat">
                        <span className="pm-stat-label">Total Revenue</span>
                        <span className="pm-stat-val" style={{ color: "#22C55E" }}>
                            ₺{totalRevenue.toLocaleString()}
                        </span>
                    </div>
                    <div className="pm-stat">
                        <span className="pm-stat-label">Units Sold</span>
                        <span className="pm-stat-val">{totalUnits}</span>
                    </div>
                    <div className="pm-stat">
                        <span className="pm-stat-label">Average Revenue / Day</span>
                        <span className="pm-stat-val">₺{averageRevenuePerOrder.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                    </div>
                    <div className="pm-stat">
                        <span className="pm-stat-label">Days in Range</span>
                        <span className="pm-stat-val">{chartData.length}</span>
                    </div>
                </div>
                <div className="pm-panel">
                    <div className="pm-panel-title">Revenue vs Units Sold</div>
                    <div className="sm-chart-container">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(248,250,252,0.08)" />
                                <XAxis
                                    dataKey="date"
                                    tick={{ fill: "rgba(248,250,252,0.55)", fontSize: 11 }}
                                    tickFormatter={(val: string) => {
                                        const d = new Date(val);
                                        return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                                    }}
                                />
                                <YAxis
                                    yAxisId="left"
                                    tick={{ fill: "rgba(248,250,252,0.55)", fontSize: 11 }}
                                    tickFormatter={(val: number) => `₺${val}`}
                                />
                                <YAxis
                                    yAxisId="right"
                                    orientation="right"
                                    tick={{ fill: "rgba(248,250,252,0.55)", fontSize: 11 }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        background: "#1E293B",
                                        border: "1px solid rgba(248,250,252,0.13)",
                                        borderRadius: 8,
                                        color: "#F8FAFC",
                                        fontSize: 13,
                                    }}
                                    formatter={(value, name) => {
                                        if (name === "Revenue") {
                                            return [`₺${Number(value ?? 0).toLocaleString()}`, name];
                                        }
                                        return [Number(value ?? 0).toLocaleString(), name];
                                    }}
                                    labelFormatter={(label) => {
                                        const dateValue = typeof label === "string" || typeof label === "number"
                                            ? String(label)
                                            : "";
                                        if (!dateValue) {
                                            return "";
                                        }
                                        return new Date(dateValue).toLocaleDateString("en-US", {
                                            month: "long",
                                            day: "numeric",
                                            year: "numeric",
                                        });
                                    }}
                                />
                                <Legend wrapperStyle={{ color: "rgba(248,250,252,0.55)", fontSize: 12 }} />
                                <Bar yAxisId="left" dataKey="revenue" name="Revenue" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                                <Bar yAxisId="right" dataKey="units" name="Units Sold" fill="#22C55E" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="pm-grid-2">
                    <div className="pm-col-main">
                        <div className="pm-panel">
                            <div className="pm-panel-title">Daily Breakdown</div>
                            <div className="pm-table-wrap">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>Revenue</th>
                                            <th>Units Sold</th>
                                            <th>Avg Revenue / Order</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {chartData.length === 0 ? (
                                            <tr>
                                                <td colSpan={4} style={{ textAlign: "center", opacity: 0.5 }}>
                                                    No data for selected range
                                                </td>
                                            </tr>
                                        ) : (
                                            chartData.map((row) => {
                                                const average = row.units > 0 ? row.revenue / row.units : 0;
                                                return (
                                                    <tr key={row.date}>
                                                        <td>
                                                            {new Date(row.date).toLocaleDateString("en-US", {
                                                                month: "short",
                                                                day: "numeric",
                                                                year: "numeric",
                                                            })}
                                                        </td>
                                                        <td>₺{row.revenue.toLocaleString()}</td>
                                                        <td>{row.units}</td>
                                                        <td>₺{average.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                    <div className="pm-col-main">
                        <div className="pm-panel">
                            <div className="pm-panel-title">Top Selling Products</div>
                            <div className="pm-table-wrap">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Product</th>
                                            <th>Revenue</th>
                                            <th>Units</th>
                                            <th>Avg Revenue / Unit</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {topProducts.length === 0 ? (
                                            <tr>
                                                <td colSpan={4} style={{ textAlign: "center", opacity: 0.5 }}>
                                                    No data for selected range
                                                </td>
                                            </tr>
                                        ) : (
                                            topProducts.map((prod) => {
                                                const average = prod.units > 0 ? prod.revenue / prod.units : 0;
                                                return (
                                                    <tr key={prod.name}>
                                                        <td>{prod.name}</td>
                                                        <td>₺{prod.revenue.toLocaleString()}</td>
                                                        <td>{prod.units}</td>
                                                        <td>₺{average.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
