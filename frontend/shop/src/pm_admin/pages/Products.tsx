import { useState } from "react";
import Topbar from "../components/Topbar";
import { initProducts, initCategories, type Product } from "../data";

export default function Products() {
  const [products, setProducts] = useState<Product[]>(initProducts);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", categoryId: 1, stock: "" });

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = () => {
    if (!form.name || !form.stock) return;
    setProducts((prev) => [...prev, {
      id: Date.now(), name: form.name, categoryId: form.categoryId,
      price: 0, stock: Number(form.stock), active: true,
    }]);
    setForm({ name: "", categoryId: 1, stock: "" });
    setShowModal(false);
  };

  const handleRemove = (id: number) => setProducts((prev) => prev.filter((p) => p.id !== id));
  const toggleActive = (id: number) => setProducts((prev) => prev.map((p) => p.id === id ? { ...p, active: !p.active } : p));

  return (
    <>
      <Topbar
        title="Products"
        subtitle={`${products.length} total products`}
        actions={
          <>
            <input className="pm-search" placeholder="Search products…" value={search} onChange={(e) => setSearch(e.target.value)} />
            <button className="pm-btn pm-btn-primary" onClick={() => setShowModal(true)}>+ Add Product</button>
          </>
        }
      />
      <div className="pm-content">
        {showModal && (
          <div className="pm-modal-overlay">
            <div className="pm-modal">
              <div className="pm-modal-title">Add New Product</div>
              <div className="pm-form-grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
                <div className="pm-form-row" style={{ gridColumn: "1 / -1" }}>
                  <label className="pm-form-label">Product Name</label>
                  <input className="pm-input" placeholder="e.g. Wireless Earbuds" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="pm-form-row">
                  <label className="pm-form-label">Category</label>
                  <select className="pm-input" value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: Number(e.target.value) })}>
                    {initCategories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="pm-form-row">
                  <label className="pm-form-label">Initial Stock</label>
                  <input className="pm-input" type="number" placeholder="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
                </div>
              </div>
              <div className="pm-modal-actions">
                <button className="pm-btn pm-btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button className="pm-btn pm-btn-primary" onClick={handleAdd}>Add Product</button>
              </div>
            </div>
          </div>
        )}

        <div className="pm-panel">
          <div className="pm-table-wrap">
            <table>
              <thead>
                <tr><th>ID</th><th>Product Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {filtered.map((p) => {
                  const cat = initCategories.find((c) => c.id === p.categoryId);
                  return (
                    <tr key={p.id}>
                      <td style={{ color: "var(--text-dim)" }}>#{p.id}</td>
                      <td className="pm-col-main">{p.name}</td>
                      <td>{cat?.name}</td>
                      <td style={{ color: "var(--text-muted)" }}>₺{p.price.toLocaleString()}</td>
                      <td style={{ color: p.stock < 10 ? "#F87171" : "var(--text-muted)" }}>{p.stock}</td>
                      <td><span className={p.active ? "pm-pill pm-pill-green" : "pm-pill pm-pill-gray"}>{p.active ? "Active" : "Inactive"}</span></td>
                      <td>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button className="pm-btn pm-btn-sm pm-btn-outline" onClick={() => toggleActive(p.id)}>
                            {p.active ? "Deactivate" : "Activate"}
                          </button>
                          <button className="pm-btn pm-btn-sm pm-btn-danger" onClick={() => handleRemove(p.id)}>Remove</button>
                        </div>
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