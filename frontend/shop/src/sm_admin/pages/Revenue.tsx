import { useEffect, useMemo, useState } from "react";
import Topbar from "../components/Topbar";
import { getAllInvoices } from "../../api/invoices";
import type { InvoiceDTO } from "../../data/types";
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
    orders: number;
};
type ProductRevenueRow = {
    name: string;
    revenue: number;
    units: number;
};

const monthByName: Record<string, string> = {
    Jan: "01",
    Feb: "02",
    Mar: "03",
    Apr: "04",
    May: "05",
    Jun: "06",
    Jul: "07",
    Aug: "08",
    Sep: "09",
    Oct: "10",
    Nov: "11",
    Dec: "12",
};

function toDateKey(date: string | null): string {
    if (!date) return "Unknown";

    const parsed = new Date(date);
    if (!Number.isNaN(parsed.getTime())) {
        return parsed.toISOString().slice(0, 10);
    }

    const javaDateMatch = date.match(/^\w{3}\s+(\w{3})\s+(\d{1,2}).*(\d{4})$/);
    if (javaDateMatch) {
        const [, monthName, day, year] = javaDateMatch;
        const month = monthByName[monthName];
        if (month) return `${year}-${month}-${day.padStart(2, "0")}`;
    }

    return date.slice(0, 10);
}

function formatDateLabel(date: string): string {
    if (date === "Unknown") return date;

    const parsed = new Date(`${date}T00:00:00`);
    if (Number.isNaN(parsed.getTime())) return date;

    return parsed.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

export default function Revenue() {
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
                    setError(err instanceof Error ? err.message : "Failed to load revenue data");
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, []);

    const filteredInvoices = useMemo(
        () =>
            invoices.filter((inv) => {
                const dateKey = toDateKey(inv.date);
                if (dateKey === "Unknown") return !startDate && !endDate;
                return (!startDate || dateKey >= startDate) && (!endDate || dateKey <= endDate);
            }),
        [invoices, startDate, endDate],
    );

    const chartData: RevenueRow[] = useMemo(() => {
        const byDate = new Map<string, RevenueRow>();
        filteredInvoices.forEach((invoice) => {
            const dateKey = toDateKey(invoice.date);
            const entry = byDate.get(dateKey) ?? { date: dateKey, revenue: 0, units: 0, orders: 0 };
            entry.revenue += invoice.totalPrice;
            entry.units += invoice.items.reduce((sum, item) => sum + item.quantity, 0);
            entry.orders += 1;
            byDate.set(dateKey, entry);
        });
        return Array.from(byDate.values()).sort((a, b) => a.date.localeCompare(b.date));
    }, [filteredInvoices]);

    const totalRevenue = chartData.reduce((sum, row) => sum + row.revenue, 0);
    const totalUnits = chartData.reduce((sum, row) => sum + row.units, 0);
    const totalOrders = chartData.reduce((sum, row) => sum + row.orders, 0);
    const averageRevenuePerDay = chartData.length > 0 ? totalRevenue / chartData.length : 0;

    const topProducts: ProductRevenueRow[] = useMemo(() => {
        const byProduct = new Map<string, ProductRevenueRow>();
        filteredInvoices.forEach((invoice) => {
            invoice.items.forEach((item) => {
                const key = item.productName || String(item.productId);
                const entry = byProduct.get(key) ?? { name: key, revenue: 0, units: 0 };
                entry.revenue += item.totalPrice;
                entry.units += item.quantity;
                byProduct.set(key, entry);
            });
        });
        return Array.from(byProduct.values())
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5);
    }, [filteredInvoices]);

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
                {error && (
                    <div style={{ color: "#F87171", marginBottom: 12 }}>
                        {error}
                    </div>
                )}

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
                        <span className="pm-stat-label">Orders</span>
                        <span className="pm-stat-val">{totalOrders}</span>
                    </div>
                    <div className="pm-stat">
                        <span className="pm-stat-label">Average Revenue / Day</span>
                        <span className="pm-stat-val">₺{averageRevenuePerDay.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                    </div>
                </div>
                <div className="pm-panel">
                    <div className="pm-panel-title">Revenue vs Units Sold</div>
                    <div className="sm-chart-container">
                        {loading ? (
                            <div style={{ padding: 24, color: "var(--text-dim)" }}>Loading revenue data...</div>
                        ) : chartData.length === 0 ? (
                            <div style={{ padding: 24, color: "var(--text-dim)" }}>No revenue data for selected range.</div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(248,250,252,0.08)" />
                                    <XAxis
                                        dataKey="date"
                                        tick={{ fill: "rgba(248,250,252,0.55)", fontSize: 11 }}
                                        tickFormatter={formatDateLabel}
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
                                            return formatDateLabel(dateValue);
                                        }}
                                    />
                                    <Legend wrapperStyle={{ color: "rgba(248,250,252,0.55)", fontSize: 12 }} />
                                    <Bar yAxisId="left" dataKey="revenue" name="Revenue" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                                    <Bar yAxisId="right" dataKey="units" name="Units Sold" fill="#22C55E" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
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
                                                        <td>{formatDateLabel(row.date)}</td>
                                                        <td>₺{row.revenue.toLocaleString()}</td>
                                                        <td>{row.units}</td>
                                                        <td>₺{(row.orders > 0 ? row.revenue / row.orders : average).toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
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
