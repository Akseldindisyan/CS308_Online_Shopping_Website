import { useEffect, useState } from "react";
import Topbar from "../components/Topbar";
import { fetchAllProductsAdmin, createProduct, deleteProduct, setProductActive, type CreateProductRequest } from "../../api/products";
import { getCategories, type CategoryDTO } from "../../api/categories";
import type { ProductCardDTO, UUID } from "../../data/types";

const emptyForm: CreateProductRequest = {
  productName: "", price: 0, stock: 0, category: "",
  model: "", serialNumber: "", desc: "", distInfo: "",
  country: "", imageUrl: "", active: true, warrantyStatus: "",
};

export default function Products() {
  const [products, setProducts] = useState<ProductCardDTO[]>([]);
  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<CreateProductRequest>(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [prods, cats] = await Promise.all([
        fetchAllProductsAdmin({ page: 0, size: 200, sort: "id" }),
        getCategories(),
      ]);
      setProducts(prods.content);
      setCategories(cats);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = async () => {
    if (!form.productName.trim()) return;
    setSubmitting(true);
    try {
      const created = await createProduct(form);
      setProducts((prev) => [...prev, {
        id: created.id, name: created.productName, category: created.category,
        price: created.price, stock: created.stock, active: created.active,
        imageUrl: created.image_url, rating: created.rating,
      }]);
      setForm(emptyForm);
      setShowModal(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create product");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async (id: UUID) => {
    try {
      await deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to remove product");
    }
  };

  const toggleActive = async (id: UUID, current: boolean) => {
    try {
      const updated = await setProductActive(id, !current);
      setProducts((prev) => prev.map((p) => p.id === id ? { ...p, active: updated.active } : p));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update product");
    }
  };

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
        {error && <div style={{ color: "#F87171", marginBottom: 12 }}>{error}</div>}

        {showModal && (
          <div className="pm-modal-overlay">
            <div className="pm-modal" style={{ maxWidth: 560 }}>
              <div className="pm-modal-title">Add New Product</div>
              <div className="pm-form-grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
                <div className="pm-form-row" style={{ gridColumn: "1 / -1" }}>
                  <label className="pm-form-label">Product Name *</label>
                  <input className="pm-input" placeholder="e.g. Wireless Earbuds" value={form.productName} onChange={(e) => setForm({ ...form, productName: e.target.value })} />
                </div>
                <div className="pm-form-row">
                  <label className="pm-form-label">Category</label>
                  <select className="pm-input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                    <option value="">-- select --</option>
                    {categories.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
                <div className="pm-form-row">
                  <label className="pm-form-label">Price (₺)</label>
                  <input className="pm-input" type="number" min="0" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
                </div>
                <div className="pm-form-row">
                  <label className="pm-form-label">Initial Stock</label>
                  <input className="pm-input" type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} />
                </div>
                <div className="pm-form-row">
                  <label className="pm-form-label">Model</label>
                  <input className="pm-input" placeholder="Model no." value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} />
                </div>
                <div className="pm-form-row">
                  <label className="pm-form-label">Serial Number</label>
                  <input className="pm-input" placeholder="S/N" value={form.serialNumber} onChange={(e) => setForm({ ...form, serialNumber: e.target.value })} />
                </div>
                <div className="pm-form-row" style={{ gridColumn: "1 / -1" }}>
                  <label className="pm-form-label">Description</label>
                  <input className="pm-input" placeholder="Short description" value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })} />
                </div>
                <div className="pm-form-row">
                  <label className="pm-form-label">Country of Origin</label>
                  <input className="pm-input" placeholder="e.g. Turkey" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
                </div>
                <div className="pm-form-row">
                  <label className="pm-form-label">Distributor Info</label>
                  <input className="pm-input" placeholder="Distributor name / info" value={form.distInfo} onChange={(e) => setForm({ ...form, distInfo: e.target.value })} />
                </div>
                <div className="pm-form-row" style={{ gridColumn: "1 / -1" }}>
                  <label className="pm-form-label">Image URL</label>
                  <input className="pm-input" placeholder="https://..." value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} />
                </div>
                <div className="pm-form-row">
                  <label className="pm-form-label">Warranty Status</label>
                  <select className="pm-input" value={form.warrantyStatus} onChange={(e) => setForm({ ...form, warrantyStatus: e.target.value })}>
                    <option value="">-- none --</option>
                    <option value="active">Active</option>
                    <option value="expired">Expired</option>
                  </select>
                </div>
                <div className="pm-form-row" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <input type="checkbox" id="active-check" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
                  <label htmlFor="active-check" className="pm-form-label" style={{ marginBottom: 0 }}>Active</label>
                </div>
              </div>
              <div className="pm-modal-actions">
                <button className="pm-btn pm-btn-outline" onClick={() => { setShowModal(false); setForm(emptyForm); }}>Cancel</button>
                <button className="pm-btn pm-btn-primary" onClick={handleAdd} disabled={submitting}>
                  {submitting ? "Adding…" : "Add Product"}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="pm-panel">
          {loading ? (
            <div style={{ padding: 24, color: "var(--text-dim)" }}>Loading products…</div>
          ) : (
            <div className="pm-table-wrap">
              <table>
                <thead>
                  <tr><th>ID</th><th>Product Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {filtered.map((p) => (
                    <tr key={p.id}>
                      <td style={{ color: "var(--text-dim)", fontSize: 11 }}>{p.id.slice(0, 8)}…</td>
                      <td className="pm-col-main">{p.name}</td>
                      <td>{p.category}</td>
                      <td style={{ color: "var(--text-muted)" }}>₺{p.price.toLocaleString()}</td>
                      <td style={{ color: p.stock < 10 ? "#F87171" : "var(--text-muted)" }}>{p.stock}</td>
                      <td><span className={p.active ? "pm-pill pm-pill-green" : "pm-pill pm-pill-gray"}>{p.active ? "Active" : "Inactive"}</span></td>
                      <td>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button className="pm-btn pm-btn-sm pm-btn-outline" onClick={() => toggleActive(p.id, p.active)}>
                            {p.active ? "Deactivate" : "Activate"}
                          </button>
                          <button className="pm-btn pm-btn-sm pm-btn-danger" onClick={() => handleRemove(p.id)}>Remove</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
