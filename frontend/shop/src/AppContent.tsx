import { useState, useEffect, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import {
  clearAuthToken,
  getStoredUsername,
  createGuestToken,
  getStoredGuestToken,
} from './api/auth'
import { fetchAllProducts, searchProducts } from './api/products'
import { addItemToCart } from './api/cart'
import type { ProductCardDTO, UUID } from './data/types'
import { useToast } from './components/ToastProvider'
import './App.css'

const categories = [
  'Laptops',
  'Phones',
  'Tablets',
  'Headphones',
  'Gaming',
  'Accessories',
  'Camera',
]

function AppContent() {
  const [searchText, setSearchText] = useState('')
  const [products, setProducts] = useState<ProductCardDTO[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState('')
  const [searchActive, setSearchActive] = useState(false)
  const [loading, setLoading] = useState(true)
  const [addingToCart, setAddingToCart] = useState<UUID | null>(null)
  const username = getStoredUsername()
  const { showToast } = useToast()

  // Initial load — all products + ensure guest token exists
  useEffect(() => {
    const init = async () => {
      try {
        if (!getStoredGuestToken()) {
          await createGuestToken().catch((err) =>
            console.error('Failed to create guest token:', err),
          )
        }
        const data = await fetchAllProducts({ page: 0, size: 10 })
        setProducts(data)
      } catch (err) {
        setSearchError(
          err instanceof Error ? err.message : 'Failed to load products',
        )
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  const handleSearchSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const name = searchText.trim()
    setIsSearching(true)
    setSearchError('')

    try {
      if (name) {
        const data = await searchProducts({ name, page: 0 })
        setProducts(data)
        setSearchActive(true)
      } else {
        const data = await fetchAllProducts({ page: 0, size: 10 })
        setProducts(data)
        setSearchActive(false)
      }
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : 'Search failed')
    } finally {
      setIsSearching(false)
    }
  }

  const handleResetSearch = async () => {
    setSearchText('')
    setSearchError('')
    setSearchActive(false)
    setIsSearching(true)
    try {
      const data = await fetchAllProducts({ page: 0, size: 10 })
      setProducts(data)
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : 'Failed to reload')
    } finally {
      setIsSearching(false)
    }
  }

  const handleAddToCart = async (productId: UUID, productName: string) => {
    setAddingToCart(productId)
    try {
      await addItemToCart(productId, 1)
      showToast(`${productName} added to cart`, 'success')
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Failed to add to cart',
        'error',
      )
    } finally {
      setAddingToCart(null)
    }
  }

  const handleLogout = () => {
    clearAuthToken()
    window.location.reload()
  }

  return (
    <div className="page">
      <header className="header">
        <div className="header-top">
          <div className="logo" aria-label="Shop logo">
            TEKNOSU
          </div>

          <form className="search-wrap" role="search" onSubmit={handleSearchSubmit}>
            <input
              type="search"
              placeholder="Search technology products..."
              aria-label="Search products"
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
            />
            <button type="submit" disabled={isSearching}>
              {isSearching ? 'Searching...' : 'Search'}
            </button>
            {searchActive && (
              <button
                type="button"
                className="btn-secondary"
                onClick={handleResetSearch}
              >
                Clear
              </button>
            )}
          </form>

          <div className="header-actions">
            {username ? (
              <button type="button" className="btn-secondary" onClick={handleLogout}>
                Logout
              </button>
            ) : (
              <Link to="/login" className="btn-secondary">
                Login / Register
              </Link>
            )}
            <Link to="/cart" className="btn-primary">
              My Cart
            </Link>
            {username && <span className="user-greeting">Hello, {username}!</span>}
          </div>
        </div>

        <nav className="category-nav" aria-label="Product categories">
          {categories.map((category) => (
            <a href="#" key={category}>
              {category}
            </a>
          ))}
        </nav>
      </header>

      <main className="main-content">
        <section className="intro">
          <h1>Technology Products You Will Love</h1>
          <p>
            Discover high-performance devices and accessories with fast delivery
            and secure checkout.
          </p>
          {searchActive && (
            <p className="search-info">
              Showing search results for "{searchText.trim()}".
            </p>
          )}
          {searchError && <p className="search-error">{searchError}</p>}
        </section>

        {loading ? (
          <p>Loading products…</p>
        ) : products.length === 0 ? (
          <p>No products found.</p>
        ) : (
          <section className="product-grid" aria-label="Technology products">
            {products.map((product) => (
              <article key={product.id} className="product-card">
                {product.imageUrl && (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="product-image"
                  />
                )}
                <span className="product-category">{product.category}</span>
                <h2>{product.name}</h2>
                <p className="rating">Rating: {product.rating} / 5</p>
                <p className="price">${product.price}</p>
                {product.stock === 0 && (
                  <p className="out-of-stock">Out of stock</p>
                )}
                <div className="product-actions">
                  <Link to={`/product/${product.id}`} className="btn-secondary">
                    Details
                  </Link>
                  <button
                    type="button"
                    className="btn-action"
                    disabled={
                      product.stock === 0 || addingToCart === product.id
                    }
                    onClick={() => handleAddToCart(product.id, product.name)}
                  >
                    {addingToCart === product.id ? 'Adding…' : 'Add to Cart'}
                  </button>
                </div>
              </article>
            ))}
          </section>
        )}
      </main>

      <footer className="footer">
        <div>
          <h3>Contact Us</h3>
          <p>Email: support@teknosu.mock</p>
          <p>Phone: +90 212 555 01 23</p>
          <p>Address: Istanbul Tech Avenue, No: 42</p>
        </div>
        <div>
          <h3>Customer Care</h3>
          <p>Shipping Information</p>
          <p>Return Policy</p>
          <p>FAQ</p>
        </div>
        <div>
          <h3>About</h3>
          <p>About Teknosu</p>
          <p>Privacy Policy</p>
          <p>Terms of Service</p>
        </div>
      </footer>
    </div>
  )
}

export default AppContent