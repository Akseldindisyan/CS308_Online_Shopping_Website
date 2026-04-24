import { useState } from 'react'
import { Link } from 'react-router-dom'
import { wishlist, products, type WishlistEntry } from '../data'
import '../App.css'
import './wishlist.css'

// Mock: logged-in customer id
const CURRENT_USER_ID = 'USR-2841'
const CURRENT_USER_EMAIL = 'alice@example.com'

export default function Wishlist() {
  const [items, setItems] = useState<WishlistEntry[]>(
    // Show all demo wishlist items for visibility in demo mode
    wishlist.filter(w => w.userId === CURRENT_USER_ID).length > 0
      ? wishlist.filter(w => w.userId === CURRENT_USER_ID)
      : wishlist.slice(0, 4)
  )
  const [addedToCart, setAddedToCart] = useState<Set<number>>(new Set())

  const removeItem = (productId: number) => {
    setItems(prev => prev.filter(w => w.productId !== productId))
  }

  const handleAddToCart = (productId: number) => {
    setAddedToCart(prev => new Set(prev).add(productId))
  }

  const wishlistProducts = items
    .map(item => ({ entry: item, product: products.find(p => p.id === item.productId) }))
    .filter(x => x.product !== undefined)

  return (
    <main className="wl-page">
      <div className="wl-breadcrumb" aria-label="Breadcrumb">
        <Link to="/">Home</Link>
        <span>/</span>
        <span>Wishlist</span>
      </div>

      <header className="wl-header">
        <div>
          <h1>My Wishlist</h1>
          <p>{items.length} saved {items.length === 1 ? 'item' : 'items'}</p>
        </div>
        {items.length > 0 && (
          <span className="wl-chip">
            Logged in as {CURRENT_USER_EMAIL}
          </span>
        )}
      </header>

      {wishlistProducts.length === 0 ? (
        <div className="wl-empty">
          <div className="wl-empty-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </div>
          <h2>Your wishlist is empty</h2>
          <p>Save products you like and come back to them anytime.</p>
          <Link to="/" className="btn-action">Browse Products</Link>
        </div>
      ) : (
        <div className="wl-grid">
          {wishlistProducts.map(({ entry, product }) => {
            if (!product) return null
            const inCart = addedToCart.has(product.id)
            const isDiscounted = product.discountRate > 0

            return (
              <article key={entry.productId} className="wl-card">
                <button
                  className="wl-remove-btn"
                  onClick={() => removeItem(product.id)}
                  aria-label={`Remove ${product.name} from wishlist`}
                  title="Remove from wishlist"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>

                <Link to={`/product/${product.id}`} className="wl-img-link">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="wl-card-image"
                    loading="lazy"
                  />
                </Link>

                <div className="wl-card-body">
                  <span className="product-category">{product.category}</span>
                  <h2 className="wl-card-name">
                    <Link to={`/product/${product.id}`}>{product.name}</Link>
                  </h2>

                  <div className="wl-rating">
                    <span className="wl-star">★</span>
                    {product.rating.toFixed(1)} / 5
                  </div>

                  <div className="wl-price-row">
                    {isDiscounted ? (
                      <>
                        <span className="wl-price-original">${product.price.toLocaleString()}</span>
                        <span className="wl-price-new">${product.discountedPrice.toLocaleString()}</span>
                        <span className="wl-discount-badge">-{product.discountRate}%</span>
                      </>
                    ) : (
                      <span className="wl-price">${product.price.toLocaleString()}</span>
                    )}
                  </div>

                  <div className="wl-stock-line">
                    {product.stock > 0 ? (
                      <span className="wl-in-stock">
                        <span className="wl-stock-dot in" />
                        {product.stock} in stock
                      </span>
                    ) : (
                      <span className="wl-out-stock">
                        <span className="wl-stock-dot out" />
                        Out of stock
                      </span>
                    )}
                  </div>

                  <div className="wl-actions">
                    <button
                      type="button"
                      className={`btn-action wl-cart-btn ${inCart ? 'wl-cart-added' : ''}`}
                      onClick={() => handleAddToCart(product.id)}
                      disabled={product.stock === 0 || inCart}
                    >
                      {inCart ? '✓ Added' : 'Add to Cart'}
                    </button>
                    <Link to={`/product/${product.id}`} className="btn-secondary wl-detail-btn">
                      Details
                    </Link>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </main>
  )
}
