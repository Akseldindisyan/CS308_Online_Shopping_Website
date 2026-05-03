import { useState, useEffect, useCallback, type FormEvent } from 'react'
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
  const [sortBy, setSortBy] = useState('id')
  const [inStockOnly, setInStockOnly] = useState(false)
  const [loading, setLoading] = useState(true)
  const [addingToCart, setAddingToCart] = useState<UUID | null>(null)
  const username = getStoredUsername()
  const { showToast } = useToast()

  const loadProducts = useCallback(async (
    queryText: string,
    options?: { sort?: string; inStock?: boolean; setLoadingState?: boolean },
  ) => {
    const trimmedQuery = queryText.trim()
    const nextSort = options?.sort ?? sortBy
    const nextInStock = options?.inStock ?? inStockOnly
    const shouldSetLoadingState = options?.setLoadingState ?? true

    if (shouldSetLoadingState) {
      setIsSearching(true)
    }

    setSearchError('')
    try {
      if (trimmedQuery) {
        const data = await searchProducts({
          name: trimmedQuery,
          page: 0,
          size: 10,
          sort: nextSort,
          inStock: nextInStock,
        })
        setProducts(data)
        setSearchActive(true)
        return
      }

      const data = await fetchAllProducts({
        page: 0,
        size: 10,
        sort: nextSort,
        inStock: nextInStock,
      })
      setProducts(data)
      setSearchActive(false)
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : 'Failed to load products')
    } finally {
      if (shouldSetLoadingState) {
        setIsSearching(false)
      }
    }
  }, [inStockOnly, sortBy])

  // Initial load — all products + ensure guest token exists
  useEffect(() => {
    const init = async () => {
      try {
        if (!getStoredGuestToken()) {
          await createGuestToken().catch((err) =>
            console.error('Failed to create guest token:', err),
          )
        }
        await loadProducts('', {
          sort: 'id',
          inStock: false,
          setLoadingState: false,
        })
      } catch (err) {
        setSearchError(
          err instanceof Error ? err.message : 'Failed to load products',
        )
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [loadProducts])

  const handleSearchSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    await loadProducts(searchText)
  }

  const handleResetSearch = async () => {
    setSearchText('')
    await loadProducts('')
  }

  const handleSortChange = async (nextSort: string) => {
    setSortBy(nextSort)
    await loadProducts(searchActive ? searchText : '', { sort: nextSort })
  }

  const handleInStockToggle = async (nextInStock: boolean) => {
    setInStockOnly(nextInStock)
    await loadProducts(searchActive ? searchText : '', { inStock: nextInStock })
  }

  const handleResetFilters = async () => {
    setSortBy('id')
    setInStockOnly(false)
    await loadProducts(searchActive ? searchText : '', {
      sort: 'id',
      inStock: false,
    })
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
    showToast('Logged out successfully', 'success')
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

        <section className="catalog-layout" aria-label="Product catalog and filters">
          <aside className="filter-sidebar" aria-label="Filters">
            <div className="filter-card">
              <div className="filter-header">
                <h2>Filters</h2>
                <button
                  type="button"
                  className="btn-secondary"
                  disabled={isSearching || (sortBy === 'id' && !inStockOnly)}
                  onClick={() => void handleResetFilters()}
                >
                  Clear
                </button>
              </div>

              <fieldset className="filter-section">
                <legend>Sort by</legend>
                <label className="filter-option" htmlFor="sort-products">
                  <span>Product order</span>
                  <select
                    id="sort-products"
                    value={sortBy}
                    onChange={(event) => void handleSortChange(event.target.value)}
                    disabled={isSearching}
                  >
                    <option value="id">Default</option>
                    <option value="price_asc">Price: low to high</option>
                    <option value="price_desc">Price: high to low</option>
                    <option value="rating_desc">Highest rated</option>
                    <option value="rating_asc">Lowest rated</option>
                  </select>
                </label>
              </fieldset>

              <fieldset className="filter-section">
                <legend>Availability</legend>
                <label className="stock-filter" htmlFor="in-stock-only">
                  <input
                    id="in-stock-only"
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(event) => void handleInStockToggle(event.target.checked)}
                    disabled={isSearching}
                  />
                  <span>In stock only</span>
                </label>
              </fieldset>
            </div>
          </aside>

          <div className="catalog-results">
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
          </div>
        </section>
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