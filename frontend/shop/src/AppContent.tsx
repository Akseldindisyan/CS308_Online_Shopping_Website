import { useState, useEffect, useRef, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import {
  clearAuthToken,
  getStoredUsername,
  createGuestToken,
  getStoredGuestToken,
} from './api/auth'
import { fetchAllProducts, searchProducts } from './api/products'
import { getCategories } from './api/categories'
import { addItemToCart, getCartItemCount } from './api/cart'
import { addToWishlist } from './api/wishlist'
import { getStoredUserId } from './api/auth'
import type { ProductCardDTO, UUID } from './data/types'
import { useToast } from './components/ToastProvider'
import './App.css'
import { useCart } from './hooks/useCart'

const fallbackCategories = ['Laptop', 'Phone', 'Tablet', 'Headphone', 'Camera', 'Printer', 'Accessories']


function AppContent() {
  const requestIdRef = useRef(0)
  const pageSize = 10

  const [categories, setCategories] = useState<string[]>([])
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
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
  const [cartCount, setCartCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const { showToast } = useToast()
  const { items: cartItems } = useCart()

  const refreshCartCount = async () => {
    try {
      const count = await getCartItemCount()
      setCartCount(count)
    } catch (err) {
      console.error('Failed to load cart count:', err)
    }
  }

  const loadCategories = async () => {
    try {
      const cats = await getCategories()
      setCategories(cats.length > 0 ? cats.map((c) => c.name) : fallbackCategories)
    } catch {
      setCategories(fallbackCategories)
    }
  }

  const loadProducts = async (params: {
    queryText: string
    sort: string
    inStock: boolean
    category: string | null
    page: number
    setLoadingState?: boolean
  }) => {
    const requestId = ++requestIdRef.current
    const { queryText, sort, inStock, category, page } = params
    const shouldSetLoadingState = params.setLoadingState ?? true
    const trimmedQuery = queryText.trim()

    if (shouldSetLoadingState) {
      setIsSearching(true)
    }

    setSearchError('')
    try {
      if (trimmedQuery) {
        const result = await searchProducts({
          name: trimmedQuery,
          page,
          size: pageSize,
          sort,
          inStock,
          category: category ?? undefined,
        })
        if (requestId !== requestIdRef.current) return
        setProducts(result.content)
        setCurrentPage(result.number)
        setTotalPages(result.totalPages)
        setSearchActive(true)
        return
      }

      const result = await fetchAllProducts({
        page,
        size: pageSize,
        sort,
        inStock,
        category: category ?? undefined,
      })
      if (requestId !== requestIdRef.current) return
      setProducts(result.content)
      setCurrentPage(result.number)
      setTotalPages(result.totalPages)
      setSearchActive(false)
    } catch (err) {
      if (requestId !== requestIdRef.current) return
      setSearchError(err instanceof Error ? err.message : 'Failed to load products')
    } finally {
      if (shouldSetLoadingState && requestId === requestIdRef.current) {
        setIsSearching(false)
      }
    }
  }

  // Initial load — all products + ensure guest token exists
  useEffect(() => {
    const init = async () => {
      try {
        if (!getStoredGuestToken()) {
          await createGuestToken().catch((err) =>
            console.error('Failed to create guest token:', err),
          )
        }
        await Promise.all([
          loadCategories(),
          loadProducts({
            queryText: '',
            sort: 'id',
            inStock: false,
            category: null,
            page: 0,
            setLoadingState: false,
          }),
          refreshCartCount(),
        ])
      } catch (err) {
        setSearchError(err instanceof Error ? err.message : 'Failed to load products')
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])





  const handleSearchSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    await loadProducts({
      queryText: searchText,
      sort: sortBy,
      inStock: inStockOnly,
      category: activeCategory,
      page: 0,
    })
  }

  const handleResetSearch = async () => {
    setSearchText('')
    await loadProducts({
      queryText: '',
      sort: sortBy,
      inStock: inStockOnly,
      category: activeCategory,
      page: 0,
    })
  }

  const handleSortChange = async (nextSort: string) => {
    setSortBy(nextSort)
    await loadProducts({
      queryText: searchActive ? searchText : '',
      sort: nextSort,
      inStock: inStockOnly,
      category: activeCategory,
      page: 0,
    })
  }

  const handleInStockToggle = async (nextInStock: boolean) => {
    setInStockOnly(nextInStock)
    await loadProducts({
      queryText: searchActive ? searchText : '',
      sort: sortBy,
      inStock: nextInStock,
      category: activeCategory,
      page: 0,
    })
  }

  const handleResetFilters = async () => {
    setSortBy('id')
    setInStockOnly(false)
    setActiveCategory(null)
    await loadProducts({
      queryText: searchActive ? searchText : '',
      sort: 'id',
      inStock: false,
      category: null,
      page: 0,
    })
  }

  const handleCategoryToggle = async (category: string | null) => {
    const nextCategory = activeCategory === category ? null : category
    setActiveCategory(nextCategory)
    await loadProducts({
      queryText: searchActive ? searchText : '',
      sort: sortBy,
      inStock: inStockOnly,
      category: nextCategory,
      page: 0,
    })
  }

  const goToPage = async (page: number) => {
    const clamped = Math.max(0, Math.min(page, Math.max(0, totalPages - 1)))
    await loadProducts({
      queryText: searchActive ? searchText : '',
      sort: sortBy,
      inStock: inStockOnly,
      category: activeCategory,
      page: clamped,
    })
  }

  const handleAddToCart = async (
    productId: UUID,
    productName: string,
    productStock: number,
  ) => {
    const currentInCart =
      cartItems.find((item) => item.productId === productId)?.quantity ?? 0

    if (currentInCart >= productStock) {
      showToast(
        `Cannot add more — only ${productStock} in stock and you already have ${currentInCart} in your cart`,
        'error',
      )
      return
    }

    setAddingToCart(productId)
    try {
      await addItemToCart(productId, 1)
      showToast(`${productName} added to cart`, 'success')
      await refreshCartCount()
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to add to cart', 'error')
    } finally {
      setAddingToCart(null)
    }
  }

  const handleAddToWishlist = async (productId: UUID) => {
    const userId = getStoredUserId()
    if (!userId) { showToast('Please login to use wishlist', 'error'); return }
    try {
      await addToWishlist(userId, productId)
      showToast('Added to wishlist', 'success')
    } catch {
      showToast('Failed to add to wishlist', 'error')
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
            {username && (
              <>
                <Link to="/wishlist" className="btn-secondary">My Wishlist</Link>
                <Link to="/orders" className="btn-secondary">My Orders</Link>
              </>
            )}
            <Link to="/cart" className="btn-primary cart-link">
              My Cart
              {cartCount > 0 && (
                <span className="cart-badge" aria-label={`${cartCount} items in cart`}>
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>
            {username && <span className="user-greeting">Hello, {username}!</span>}
          </div>
        </div>

        <nav className="category-nav" aria-label="Product categories">
          {categories.map((category) => (
            <a
              href="#"
              key={category}
              className={activeCategory === category ? 'is-active' : ''}
              onClick={(event) => {
                event.preventDefault()
                void handleCategoryToggle(category)
              }}
            >
              {category}
            </a>
          ))}
          <a
            href="#"
            className={activeCategory === null ? 'is-active' : ''}
            onClick={(event) => {
              event.preventDefault()
              void handleCategoryToggle(null)
            }}
          >
            All
          </a>
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
                    <option value="A_to_Z">Name A to Z</option>
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
                    <p className="rating">Rating: {(product.rating) == 0 ? "No review" : product.rating + " / 5"}</p>
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
                          product.stock === 0 ||
                          addingToCart === product.id ||
                          (cartItems.find((item) => item.productId === product.id)?.quantity ?? 0) >=
                          product.stock
                        }
                        onClick={() => handleAddToCart(product.id, product.name, product.stock)}
                      >
                        {addingToCart === product.id ? 'Adding…' : 'Add to Cart'}
                      </button>
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => handleAddToWishlist(product.id)}
                      >
                        ♡ Wishlist
                      </button>
                    </div>
                  </article>
                ))}
              </section>
            )}
            {!loading && totalPages > 1 && (
              <div className="pagination-controls" style={{ marginTop: 16 }}>
                <button type="button" onClick={() => void goToPage(currentPage - 1)} disabled={currentPage <= 0}>Prev</button>
                <span style={{ margin: '0 8px' }}>Page {currentPage + 1} of {totalPages}</span>
                <button type="button" onClick={() => void goToPage(currentPage + 1)} disabled={currentPage >= totalPages - 1}>Next</button>
              </div>
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