import { useState } from "react";
import Topbar from "../components/Topbar";
import { initProducts, initCategories, type Product } from "../data";

export default function Stock() {
  const [products, setProducts] = useState<Product[]>(initProducts);
  const [editing, setEditing]   = useState<number | null>(null);
  const [editVal, setEditVal]   = useState("");
  const [filter, setFilter]     = useState<"all" | "low" | "out">("all");

  const filtered = products.filter((p) => {
    if (filter === "low") return p.stock > 0 && p.stock < 10;
    if (filter === "out") return p.stock === 0;
    return true;
  });

  const handleSave = (id: number) => {
    const val = Number(editVal);
    if (isNaN(val) || val < 0) return;
    setProducts((prev) => prev.map((p) => p.id === id ? { ...p, stock: val } : p));
    setEditing(null);
  };

  const level = (s: number) =>
    s === 0  ? { label: "Out of Stock", cls: "pm-pill pm-pill-red" }   :
    s < 10   ? { label: "Low",          cls: "pm-pill pm-pill-amber" } :
    s < 30   ? { label: "Medium",       cls: "pm-pill pm-pill-blue" }  :
               { label: "Good",         cls: "pm-pill pm-pill-green" };

  const fillColor = (s: number) =>
    s === 0 ? "#F87171" : s < 10 ? "#FBBF24" : s < 30 ? "#3B82F6" : "#22C55E";

  return (
    <>
      <Topbar
        title="Stock Management"
        subtitle={`${products.filter((p) => p.stock < 10).length} items need attention`}
        actions={
          <div style={{ display: "flex", gap: 8 }}>
            {(["all", "low", "out"] as const).map((f) => (
              <button key={f} className={`pm-btn pm-btn-sm ${filter === f ? "pm-btn-primary" : "pm-btn-outline"}`} onClick={() => setFilter(f)}>
                {f === "all" ? "All" : f === "low" ? "Low Stock" : "Out of Stock"}
              </button>
            ))}
          </div>
        }
      />
      <div className="pm-content">
        <div className="pm-panel">
          <div className="pm-table-wrap">
            <table>
              <thead><tr><th>Product</th><th>Category</th><th>Current Stock</th><th>Level</th><th>Update Stock</th></tr></thead>
              <tbody>
                {filtered.map((p) => {
                  const cat = initCategories.find((c) => c.id === p.categoryId);
                  const { label, cls } = level(p.stock);
                  return (
                    <tr key={p.id}>
                      <td className="pm-col-main">{p.name}</td>
                      <td>{cat?.name}</td>
                      <td>
                        <div className="pm-stock-bar-wrap">
                          <span style={{ minWidth: 28 }}>{p.stock}</span>
                          <div className="pm-stock-bar">
                            <div className="pm-stock-fill" style={{ width: `${Math.min((p.stock / 80) * 100, 100)}%`, background: fillColor(p.stock) }} />
                          </div>
                        </div>
                      </td>
                      <td><span className={cls}>{label}</span></td>
                      <td>
                        {editing === p.id ? (
                          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                            <input className="pm-input" type="number" value={editVal} onChange={(e) => setEditVal(e.target.value)} style={{ width: 80, padding: "5px 8px" }} autoFocus onKeyDown={(e) => e.key === "Enter" && handleSave(p.id)} />
                            <button className="pm-btn pm-btn-sm pm-btn-green" onClick={() => handleSave(p.id)}>Save</button>
                            <button className="pm-btn pm-btn-sm pm-btn-outline" onClick={() => setEditing(null)}>Cancel</button>
                          </div>
                        ) : (
                          <button className="pm-btn pm-btn-sm pm-btn-outline" onClick={() => { setEditing(p.id); setEditVal(String(p.stock)); }}>Edit</button>
                        )}
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
