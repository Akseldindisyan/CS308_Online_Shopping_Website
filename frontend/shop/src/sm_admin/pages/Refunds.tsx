import { useEffect, useState } from "react";
import Topbar from "../components/Topbar";
import {
    getPendingRefunds,
    acceptRefund,
    rejectRefund,
    type RefundResponse,
} from "../../api/refunds";

const money = (v: number) => `₺${v.toLocaleString("tr-TR", { maximumFractionDigits: 2 })}`;

const fmtDate = (value: string | null) => {
    if (!value) return "—";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const refundTotal = (r: RefundResponse) =>
    (r.items ?? []).reduce((s, it) => s + it.totalPrice, 0);

export default function Refunds() {
    const [refunds, setRefunds] = useState<RefundResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [busyId, setBusyId] = useState<string | null>(null);

    const load = () => {
        setLoading(true);
        setError("");
        getPendingRefunds()
            .then(setRefunds)
            .catch((err) => setError(err instanceof Error ? err.message : "Failed to load refunds"))
            .finally(() => setLoading(false));
    };

    useEffect(() => { load(); }, []);

    const handleAccept = async (id: string) => {
        setBusyId(id);
        setError("");
        try {
            await acceptRefund(id);
            setRefunds((prev) => prev.filter((r) => r.refundId !== id));
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to accept refund");
        } finally {
            setBusyId(null);
        }
    };

    const handleReject = async (id: string) => {
        setBusyId(id);
        setError("");
        try {
            await rejectRefund(id);
            setRefunds((prev) => prev.filter((r) => r.refundId !== id));
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to reject refund");
        } finally {
            setBusyId(null);
        }
    };

    const totalPending = refunds.length;
    const totalValue = refunds.reduce((s, r) => s + refundTotal(r), 0);

    return (
        <>
            <Topbar
                title="Refunds"
                subtitle={`${totalPending} pending request${totalPending === 1 ? "" : "s"}`}
                actions={
                    <button className="pm-btn pm-btn-outline" onClick={load}>
                        Refresh
                    </button>
                }
            />

            <div className="pm-content">
                <div className="pm-stat-grid">
                    <div className="pm-stat">
                        <span className="pm-stat-label">Pending Requests</span>
                        <span className="pm-stat-val">{totalPending}</span>
                    </div>
                    <div className="pm-stat">
                        <span className="pm-stat-label">Total Refund Value</span>
                        <span className="pm-stat-val">{money(totalValue)}</span>
                    </div>
                </div>

                <div className="pm-panel">
                    <div className="pm-panel-title">Pending Refund Requests</div>

                    {loading && <p style={{ color: "var(--text-muted)" }}>Loading…</p>}
                    {error && <p style={{ color: "#F87171" }}>{error}</p>}
                    {!loading && !error && refunds.length === 0 && (
                        <p style={{ color: "var(--text-muted)" }}>No pending refund requests.</p>
                    )}

                    {!loading && !error && refunds.length > 0 && (
                        <div className="pm-table-wrap">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Refund ID</th>
                                        <th>Customer</th>
                                        <th>Items</th>
                                        <th>Amount (₺)</th>
                                        <th>Date</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {refunds.map((r) => {
                                        const busy = busyId === r.refundId;
                                        return (
                                            <tr key={r.refundId}>
                                                <td className="pm-col-main">{r.refundId.slice(0, 8)}</td>
                                                <td>{r.customerName}</td>
                                                <td style={{ maxWidth: 280, color: "var(--text-muted)" }}>
                                                    {(r.items ?? []).map((i) => i.productName).join(", ") || "—"}
                                                </td>
                                                <td>{money(refundTotal(r))}</td>
                                                <td>{fmtDate(r.date)}</td>
                                                <td style={{ display: "flex", gap: 8 }}>
                                                    <button
                                                        className="pm-btn pm-btn-sm pm-btn-primary"
                                                        disabled={busy}
                                                        onClick={() => handleAccept(r.refundId)}
                                                    >
                                                        {busy ? "…" : "Accept"}
                                                    </button>
                                                    <button
                                                        className="pm-btn pm-btn-sm pm-btn-outline"
                                                        disabled={busy}
                                                        onClick={() => handleReject(r.refundId)}
                                                    >
                                                        {busy ? "…" : "Reject"}
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}