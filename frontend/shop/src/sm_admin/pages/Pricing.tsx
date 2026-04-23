import { useState } from "react";
import Topbar from "../components/Topbar";
import { products as initProducts, wishlist, type Product } from "../../data";

export default function Pricing() {
    const [productList, setProductList] = useState<Product[]>(
        initProducts.map(p => ({ ...p }))
    );
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [discountInput, setDiscountInput] = useState("");
    const [notifications, setNotifications] = useState<string[]>([]);
    const [searchTerm, setSearchTerm] = useState("");

    // Derived stats
    const discountedProducts = productList.filter(p => p.discountRate > 0);
    const avgDiscount =
        discountedProducts.length > 0
            ? Math.round(
                  discountedProducts.reduce((sum, p) => sum + p.discountRate, 0) /
                      discountedProducts.length
              )
            : 0;
    const totalWishlist = wishlist.length;

    // Filtered table rows
    const filtered = productList.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    function openModal(product: Product) {
        setSelectedProduct(product);
        setDiscountInput(product.discountRate > 0 ? String(product.discountRate) : "");
    }

    function closeModal() {
        setSelectedProduct(null);
        setDiscountInput("");
    }

    function applyDiscount() {
        if (!selectedProduct) return;
        const rate = Number(discountInput);
        if (isNaN(rate) || rate < 0 || rate >= 100) return;

        const newPrice = parseFloat(
            (selectedProduct.price * (1 - rate / 100)).toFixed(2)
        );
        const watcherCount = wishlist.filter(
            w => w.productId === selectedProduct.id
        ).length;

        setProductList(prev =>
            prev.map(p =>
                p.id === selectedProduct.id
                    ? { ...p, discountRate: rate, discountedPrice: newPrice }
                    : p
            )
        );
        setNotifications(prev => [
            `✓ Applied ${rate}% discount on ${selectedProduct.name}. Notified ${watcherCount} wishlist user(s).`,
            ...prev,
        ]);
        closeModal();
    }

    function removeDiscount(product: Product) {
        setProductList(prev =>
            prev.map(p =>
                p.id === product.id
                    ? { ...p, discountRate: 0, discountedPrice: p.price }
                    : p
            )
        );
        setNotifications(prev => [
            `✓ Removed discount from ${product.name}`,
            ...prev,
        ]);
    }

    // Live preview in modal
    const previewRate = Number(discountInput) || 0;
    const previewPrice = selectedProduct
        ? (selectedProduct.price * (1 - previewRate / 100)).toFixed(2)
        : "0.00";
    const watchersForModal = selectedProduct
        ? wishlist.filter(w => w.productId === selectedProduct.id).length
        : 0;

    return (
        <>
            <Topbar
                title="Pricing & Discounts"
                subtitle={`${discountedProducts.length} product${discountedProducts.length !== 1 ? "s" : ""} currently discounted`}
                actions={
                    <input
                        className="pm-search"
                        type="text"
                        placeholder="Search products…"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                }
            />

            <div className="pm-content">
                {/* Stat grid */}
                <div className="pm-stat-grid">
                    <div className="pm-stat">
                        <span className="pm-stat-label">Total Products</span>
                        <span className="pm-stat-val">{productList.length}</span>
                    </div>
                    <div className="pm-stat">
                        <span className="pm-stat-label">Discounted</span>
                        <span className="pm-stat-val">
                            {discountedProducts.length}
                        </span>
                        {discountedProducts.length > 0 && (
                            <span className="pm-stat-change pm-up">active</span>
                        )}
                    </div>
                    <div className="pm-stat">
                        <span className="pm-stat-label">Avg Discount</span>
                        <span className="pm-stat-val">{avgDiscount}%</span>
                    </div>
                    <div className="pm-stat">
                        <span className="pm-stat-label">Wishlist Watchers</span>
                        <span className="pm-stat-val">{totalWishlist}</span>
                    </div>
                </div>

                {/* Product table */}
                <div className="pm-panel">
                    <div className="pm-panel-title">Product Pricing</div>
                    <div className="pm-table-wrap">
                        <table>
                            <thead>
                                <tr>
                                    <th className="pm-col-main">Product Name</th>
                                    <th>Category</th>
                                    <th>Base Price (₺)</th>
                                    <th>Discount</th>
                                    <th>Current Price</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map(product => (
                                    <tr key={product.id}>
                                        <td className="pm-col-main">{product.name}</td>
                                        <td>{product.category}</td>
                                        <td>₺{product.price.toLocaleString()}</td>
                                        <td>
                                            {product.discountRate > 0 ? (
                                                <span className="sm-discount-badge">
                                                    -{product.discountRate}%
                                                </span>
                                            ) : (
                                                <span className="pm-pill pm-pill-gray">
                                                    No discount
                                                </span>
                                            )}
                                        </td>
                                        <td>
                                            {product.discountRate > 0 ? (
                                                <div className="sm-price-compare">
                                                    <span className="sm-price-original">
                                                        ₺{product.price.toLocaleString()}
                                                    </span>
                                                    <span className="sm-price-new">
                                                        ₺{product.discountedPrice.toLocaleString()}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span>₺{product.price.toLocaleString()}</span>
                                            )}
                                        </td>
                                        <td>
                                            {product.active ? (
                                                <span className="pm-pill pm-pill-green">
                                                    Active
                                                </span>
                                            ) : (
                                                <span className="pm-pill pm-pill-gray">
                                                    Inactive
                                                </span>
                                            )}
                                        </td>
                                        <td style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                                            <button
                                                className="pm-btn pm-btn-sm pm-btn-primary"
                                                onClick={() => openModal(product)}
                                            >
                                                Set Discount
                                            </button>
                                            {product.discountRate > 0 && (
                                                <button
                                                    className="pm-btn pm-btn-sm pm-btn-danger"
                                                    onClick={() => removeDiscount(product)}
                                                >
                                                    Remove
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {filtered.length === 0 && (
                                    <tr>
                                        <td colSpan={7} style={{ textAlign: "center", color: "var(--pm-muted)" }}>
                                            No products match your search.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Notifications panel */}
                {notifications.length > 0 && (
                    <div className="pm-panel">
                        <div className="pm-panel-title">Notifications Sent</div>
                        <div className="sm-toast-list">
                            {notifications.map((note, i) => (
                                <div key={i} className="sm-toast">
                                    {note}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Discount Modal */}
            {selectedProduct && (
                <div className="sm-modal-overlay" onClick={closeModal}>
                    <div className="pm-modal" onClick={e => e.stopPropagation()}>
                        <div className="pm-modal-title">
                            Set Discount — {selectedProduct.name}
                        </div>

                        <div className="pm-form-grid">
                            <div className="pm-form-row">
                                <span className="pm-form-label">Current Price</span>
                                <span>₺{selectedProduct.price.toLocaleString()}</span>
                            </div>

                            <div className="pm-form-row">
                                <label className="pm-form-label" htmlFor="discount-rate-input">
                                    Discount Rate (%)
                                </label>
                                <input
                                    id="discount-rate-input"
                                    className="pm-input"
                                    type="number"
                                    min={0}
                                    max={99}
                                    value={discountInput}
                                    onChange={e => setDiscountInput(e.target.value)}
                                    placeholder="0"
                                />
                            </div>

                            <div className="pm-form-row">
                                <span className="pm-form-label">New Price</span>
                                <span style={previewRate > 0 ? { color: "var(--pm-green, #22c55e)", fontWeight: 600 } : {}}>
                                    ₺{previewPrice}
                                </span>
                            </div>

                            <div className="pm-form-row">
                                <span className="pm-form-label">Wishlist Users</span>
                                <span>
                                    {watchersForModal} users will be notified
                                </span>
                            </div>
                        </div>

                        <div className="pm-modal-actions">
                            <button className="pm-btn pm-btn-outline" onClick={closeModal}>
                                Cancel
                            </button>
                            <button
                                className="pm-btn pm-btn-green"
                                onClick={applyDiscount}
                                disabled={
                                    discountInput === "" ||
                                    Number(discountInput) < 0 ||
                                    Number(discountInput) >= 100
                                }
                            >
                                Apply Discount
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
