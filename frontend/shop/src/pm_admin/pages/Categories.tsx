import { useEffect, useState } from "react";
import Topbar from "../components/Topbar";
import { getCategories, addCategory, removeCategory, type CategoryDTO } from "../../api/categories";

export default function Categories() {
  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      setCategories(await getCategories());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async () => {
    if (!newName.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const created = await addCategory(newName.trim());
      setCategories((prev) => [...prev, created]);
      setNewName("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to add category");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async (id: string) => {
    setError(null);
    try {
      await removeCategory(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to remove category");
    }
  };

  return (
    <>
      <Topbar title="Categories" subtitle={`${categories.length} categories`} />
      <div className="pm-content">
        {error && <div style={{ color: "#F87171", marginBottom: 12 }}>{error}</div>}
        <div className="pm-grid-2" style={{ alignItems: "start" }}>
          <div className="pm-panel">
            <div className="pm-panel-title">All Categories</div>
            {loading ? (
              <div style={{ padding: 16, color: "var(--text-dim)" }}>Loading…</div>
            ) : (
              <table>
                <thead><tr><th>Category Name</th><th>Action</th></tr></thead>
                <tbody>
                  {categories.map((c) => (
                    <tr key={c.id}>
                      <td className="pm-col-main">{c.name}</td>
                      <td>
                        <button className="pm-btn pm-btn-sm pm-btn-danger" onClick={() => handleRemove(c.id)}>
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <div className="pm-panel">
            <div className="pm-panel-title">Add New Category</div>
            <div className="pm-form-row" style={{ marginBottom: 14 }}>
              <label className="pm-form-label">Category Name</label>
              <input
                className="pm-input"
                placeholder="e.g. Sports & Outdoors"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              />
            </div>
            <button className="pm-btn pm-btn-primary" onClick={handleAdd} disabled={submitting}>
              {submitting ? "Adding…" : "Add Category"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
