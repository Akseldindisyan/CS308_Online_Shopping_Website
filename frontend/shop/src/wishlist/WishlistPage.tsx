import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getWishlist, removeFromWishlist, type WishlistItem } from '../api/wishlist'
import { addItemToCart } from '../api/cart'
import { getStoredUserId } from '../api/auth'
import { useToast } from '../components/ToastProvider'
import '../App.css'

export default function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { showToast } = useToast()
  const userId = getStoredUserId()

  useEffect(() => {
    if (!userId) { setLoading(false); return }
    getWishlist(userId)
      .then(setItems)
      .catch(() => setError('Failed to load wishlist'))
      .finally(() => setLoading(false))
  }, [userId])

  const handleRemove = async (productId: string) => {
    if (!userId) return
    try {
      await removeFromWishlist(userId, productId)
      setItems(prev => prev.filter(i => i.productId !== productId))
      showToast('Removed from wishlist', 'success')
    } catch {
      showToast('Failed to remove', 'error')
    }
  }

  const handleAddToCart = async (productId: string, productName: string) => {
    try {
      await addItemToCart(productId, 1)
      showToast(`${productName} added to cart`, 'success')
    } catch {
      showToast('Failed to add to cart', 'error')
    }
  }

  if (!userId) return (
    <div className="page">
      <div className="main-content">
        <p>Please <Link to="/login">login</Link> to view your wishlist.</p>
      </div>
    </div>
  )

  return (
    <div className="page">
      <header className="header">
        <div className="header-top">
          <Link to="/" className="logo">TEKNOSU</Link>
          <div className="header-actions">
            <Link to="/cart" className="btn-primary">My Cart</Link>
            <Link to="/orders" className="btn-secondary">My Orders</Link>
          </div>
        </div>
      </header>
      <main className="main-content">
        <h1>My Wishlist</h1>
        {loading && <p>Loading...</p>}
        {error && <p className="search-error">{error}</p>}
        {!loading && items.length === 0 && <p>Your wishlist is empty.</p>}
        <section className="product-grid">
          {items.map(item => (
            <article key={item.productId} className="product-card">
              {item.imageUrl && <img src={item.imageUrl} alt={item.productName} className="product-image" />}
              <h2>{item.productName}</h2>
              {item.rating && <p className="rating">Rating: {item.rating} / 5</p>}
              <p className="price">${item.price}</p>
              <div className="product-actions">
                <button className="btn-action" onClick={() => handleAddToCart(item.productId, item.productName)}>
                  Add to Cart
                </button>
                <button className="btn-secondary" onClick={() => handleRemove(item.productId)}>
                  Remove
                </button>
              </div>
            </article>
          ))}
        </section>
      </main>
    </div>
  )
}