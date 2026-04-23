// ─── Categories ──────────────────────────────────────────────────────────────
import { useState } from "react";
import Topbar from "../components/Topbar";
import { initCategories, initProducts, type Category } from "../data";

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>(initCategories);
  const [newName, setNewName] = useState("");

  const handleAdd = () => {
    if (!newName.trim()) return;
    setCategories((prev) => [...prev, { id: Date.now(), name: newName.trim() }]);
    setNewName("");
  };

  return (
    <>
      <Topbar title="Categories" subtitle={`${categories.length} categories`} />
      <div className="pm-content">
        <div className="pm-grid-2" style={{ alignItems: "start" }}>
          <div className="pm-panel">
            <div className="pm-panel-title">All Categories</div>
            <table>
              <thead><tr><th>Category Name</th><th>Products</th><th>Action</th></tr></thead>
              <tbody>
                {categories.map((c) => {
                  const count = initProducts.filter((p) => p.categoryId === c.id).length;
                  return (
                    <tr key={c.id}>
                      <td className="pm-col-main">{c.name}</td>
                      <td>{count}</td>
                      <td>
                        <button className="pm-btn pm-btn-sm pm-btn-danger" onClick={() => setCategories((prev) => prev.filter((x) => x.id !== c.id))}>
                          Remove
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="pm-panel">
            <div className="pm-panel-title">Add New Category</div>
            <div className="pm-form-row" style={{ marginBottom: 14 }}>
              <label className="pm-form-label">Category Name</label>
              <input className="pm-input" placeholder="e.g. Sports & Outdoors" value={newName} onChange={(e) => setNewName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAdd()} />
            </div>
            <button className="pm-btn pm-btn-primary" onClick={handleAdd}>Add Category</button>
          </div>
        </div>
      </div>
    </>
  );
}
