import { useEffect, useState } from "react";
import Topbar from "../components/Topbar";
import { getRevenueReport, type RevenueReport } from "../../api/sales";
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
    const [report, setReport] = useState<RevenueReport | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError("");
        getRevenueReport(startDate || undefined, endDate || undefined)
            .then((data) => { if (!cancelled) setReport(data); })
            .catch((err) => {
                if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load revenue report");
            })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, [startDate, endDate]);

    const chartData = report?.daily ?? [];
    const topProducts = (report?.products ?? []).slice(0, 5);
    const totalRevenue = report?.totalRevenue ?? 0;
    const totalCost = report?.totalCost ?? 0;
    const totalProfit = report?.totalProfit ?? 0;
    const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

    const subtitleText =
        startDate && endDate ? `${startDate} – ${endDate}`
            : startDate ? `From ${startDate}`
            : endDate ? `Until ${endDate}`
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
                        <button className="pm-btn pm-btn-primary" onClick={() => window.print()}>
                            Export
                        </button>
                    </>
                }
            />

            <div className="pm-content">
                {error && <p style={{ color: "#F87171" }}>{error}</p>}
                {loading && <p style={{ color: "var(--text-muted)" }}>Loading…</p>}

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
                            style={{ color: profitMargin >= 0 ? "#22C55E" : "#F87171" }}
                        >
                            {profitMargin.toFixed(1)}%
                        </span>
                    </div>
                </div>

                <div className="pm-panel">
                    <div className="pm-panel-title">Revenue vs Cost vs Profit</div>
                    <div className="sm-chart-container">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(248,250,252,0.08)" />
                                <XAxis
                                    dataKey="date"
                                    tick={{ fill: "rgba(248,250,252,0.55)", fontSize: 11 }}
                                    tickFormatter={(val: string) =>
                                        new Date(val).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                                    }
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
                                    formatter={(value) => `₺${Number(value ?? 0).toLocaleString()}`}
                                    labelFormatter={(label) => {
                                        const v = typeof label === "string" || typeof label === "number" ? String(label) : "";
                                        return v
                                            ? new Date(v).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
                                            : "";
                                    }}
                                />
                                <Legend wrapperStyle={{ color: "rgba(248,250,252,0.55)", fontSize: 12 }} />
                                <Bar dataKey="revenue" name="Revenue" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="cost" name="Cost" fill="#F87171" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="profit" name="Profit" fill="#22C55E" radius={[4, 4, 0, 0]} />
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
                                            <th>Date</th><th>Revenue</th><th>Cost</th><th>Profit</th><th>Margin %</th>
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
                                            chartData.map((row) => {
                                                const margin = row.revenue > 0 ? (row.profit / row.revenue) * 100 : 0;
                                                return (
                                                    <tr key={row.date}>
                                                        <td>
                                                            {new Date(row.date).toLocaleDateString("en-US", {
                                                                month: "short", day: "numeric", year: "numeric",
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

                    <div className="pm-col-main">
                        <div className="pm-panel">
                            <div className="pm-panel-title">Top Profitable Products</div>
                            <div className="pm-table-wrap">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Product</th><th>Revenue</th><th>Cost</th><th>Profit</th><th>Margin %</th>
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
                                            topProducts.map((prod) => {
                                                const margin = prod.revenue > 0 ? (prod.profit / prod.revenue) * 100 : 0;
                                                const pill = margin >= 0 ? "pm-pill pm-pill-green" : "pm-pill pm-pill-red";
                                                return (
                                                    <tr key={prod.name}>
                                                        <td>{prod.name}</td>
                                                        <td>₺{prod.revenue.toLocaleString()}</td>
                                                        <td>₺{prod.cost.toLocaleString()}</td>
                                                        <td>₺{prod.profit.toLocaleString()}</td>
                                                        <td><span className={pill}>{margin.toFixed(1)}%</span></td>
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