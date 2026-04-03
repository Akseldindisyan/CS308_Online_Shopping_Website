import { useState } from "react";
import { invoices, products } from "../../data";
import Topbar from "../components/Topbar";
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

export default function Revenue() {
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const filtered = invoices.filter(inv => {
        if (startDate && inv.date < startDate) return false;
        if (endDate && inv.date > endDate) return false;
        return true;
    });

    const byDate = new Map<string, { revenue: number; cost: number; profit: number }>();
    filtered.forEach(inv => {
        const prod = products.find(p => p.id === inv.productId);
        const invCost = inv.quantity * (prod?.cost ?? 0);
        const entry = byDate.get(inv.date) ?? { revenue: 0, cost: 0, profit: 0 };
        entry.revenue += inv.totalPrice;
        entry.cost += invCost;
        entry.profit += inv.totalPrice - invCost;
        byDate.set(inv.date, entry);
    });

    const chartData = Array.from(byDate.entries())
        .map(([date, vals]) => ({ date, ...vals }))
        .sort((a, b) => a.date.localeCompare(b.date));

    const totalRevenue = chartData.reduce((s, d) => s + d.revenue, 0);
    const totalCost = chartData.reduce((s, d) => s + d.cost, 0);
    const totalProfit = totalRevenue - totalCost;
    const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue * 100) : 0;

    // Per-product profit
    const byProduct = new Map<string, { name: string; revenue: number; cost: number; profit: number }>();
    filtered.forEach(inv => {
        const prod = products.find(p => p.id === inv.productId);
        const invCost = inv.quantity * (prod?.cost ?? 0);
        const key = inv.productId;
        const entry = byProduct.get(key) ?? { name: prod?.name ?? inv.productId, revenue: 0, cost: 0, profit: 0 };
        entry.revenue += inv.totalPrice;
        entry.cost += invCost;
        entry.profit += inv.totalPrice - invCost;
        byProduct.set(key, entry);
    });

    const topProducts = Array.from(byProduct.values())
        .sort((a, b) => b.profit - a.profit)
        .slice(0, 5);

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
                title="Revenue & Profit"
                subtitle={subtitleText}
                actions={
                    <>
                        <input
                            type="date"
                            className="pm-input"
                            style={{ width: 160 }}
                            value={startDate}
                            onChange={e => setStartDate(e.target.value)}
                        />
                        <input
                            type="date"
                            className="pm-input"
                            style={{ width: 160 }}
                            value={endDate}
                            onChange={e => setEndDate(e.target.value)}
                        />
                        <button
                            className="pm-btn pm-btn-outline"
                            onClick={() => { setStartDate(""); setEndDate(""); }}
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
                {/* Stat grid */}
                <div className="pm-stat-grid">
                    <div className="pm-stat">
                        <span className="pm-stat-label">Total Revenue</span>
                        <span className="pm-stat-val" style={{ color: "#22C55E" }}>
                            ₺{totalRevenue.toLocaleString()}
                        </span>
                    </div>
                    <div className="pm-stat">
                        <span className="pm-stat-label">Total Cost</span>
                        <span className="pm-stat-val">₺{totalCost.toLocaleString()}</span>
                    </div>
                    <div className="pm-stat">
                        <span className="pm-stat-label">Net Profit</span>
                        <span
                            className="pm-stat-val"
                            style={{ color: totalProfit >= 0 ? "#22C55E" : "#F87171" }}
                        >
                            ₺{totalProfit.toLocaleString()}
                        </span>
                        <span className={`pm-stat-change ${totalProfit >= 0 ? "pm-up" : "pm-down"}`}>
                            {totalProfit >= 0 ? "Profit" : "Loss"}
                        </span>
                    </div>
                    <div className="pm-stat">
                        <span className="pm-stat-label">Profit Margin</span>
                        <span
                            className="pm-stat-val"
                            style={{ color: profitMargin > 0 ? "#22C55E" : undefined }}
                        >
                            {profitMargin.toFixed(1)}%
                        </span>
                    </div>
                </div>

                {/* Chart panel */}
                <div className="pm-panel">
                    <div className="pm-panel-title">Revenue vs Cost vs Profit</div>
                    <div className="sm-chart-container">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
                                    tick={{ fill: "rgba(248,250,252,0.55)", fontSize: 11 }}
                                    tickFormatter={(val: number) => `₺${val}`}
                                />
                                <Tooltip
                                    contentStyle={{
                                        background: "#1E293B",
                                        border: "1px solid rgba(248,250,252,0.13)",
                                        borderRadius: 8,
                                        color: "#F8FAFC",
                                        fontSize: 13,
                                    }}
                                    formatter={(value: number) => [`₺${value.toLocaleString()}`, undefined]}
                                    labelFormatter={(label: string) =>
                                        new Date(label).toLocaleDateString("en-US", {
                                            month: "long",
                                            day: "numeric",
                                            year: "numeric",
                                        })
                                    }
                                />
                                <Legend wrapperStyle={{ color: "rgba(248,250,252,0.55)", fontSize: 12 }} />
                                <Bar dataKey="revenue" name="Revenue" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="cost" name="Cost" fill="#F87171" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="profit" name="Profit" fill="#22C55E" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Two-column grid */}
                <div className="pm-grid-2">
                    {/* Daily Breakdown */}
                    <div className="pm-col-main">
                        <div className="pm-panel">
                            <div className="pm-panel-title">Daily Breakdown</div>
                            <div className="pm-table-wrap">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>Revenue</th>
                                            <th>Cost</th>
                                            <th>Profit</th>
                                            <th>Margin %</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {chartData.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} style={{ textAlign: "center", opacity: 0.5 }}>
                                                    No data for selected range
                                                </td>
                                            </tr>
                                        ) : (
                                            chartData.map(row => {
                                                const margin = row.revenue > 0 ? (row.profit / row.revenue * 100) : 0;
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
                                                        <td>₺{row.cost.toLocaleString()}</td>
                                                        <td style={{ color: row.profit >= 0 ? "#22C55E" : "#F87171" }}>
                                                            ₺{row.profit.toLocaleString()}
                                                        </td>
                                                        <td>{margin.toFixed(1)}%</td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Top Profitable Products */}
                    <div className="pm-col-main">
                        <div className="pm-panel">
                            <div className="pm-panel-title">Top Profitable Products</div>
                            <div className="pm-table-wrap">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Product</th>
                                            <th>Revenue</th>
                                            <th>Cost</th>
                                            <th>Profit</th>
                                            <th>Margin %</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {topProducts.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} style={{ textAlign: "center", opacity: 0.5 }}>
                                                    No data for selected range
                                                </td>
                                            </tr>
                                        ) : (
                                            topProducts.map(prod => {
                                                const margin = prod.revenue > 0 ? (prod.profit / prod.revenue * 100) : 0;
                                                const pillClass = margin >= 0 ? "pm-pill pm-pill-green" : "pm-pill pm-pill-red";
                                                return (
                                                    <tr key={prod.name}>
                                                        <td>{prod.name}</td>
                                                        <td>₺{prod.revenue.toLocaleString()}</td>
                                                        <td>₺{prod.cost.toLocaleString()}</td>
                                                        <td>₺{prod.profit.toLocaleString()}</td>
                                                        <td>
                                                            <span className={pillClass}>
                                                                {margin.toFixed(1)}%
                                                            </span>
                                                        </td>
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
