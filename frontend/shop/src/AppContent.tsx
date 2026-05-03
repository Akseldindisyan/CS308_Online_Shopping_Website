import { useCallback, useMemo, useState, useEffect, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { clearAuthToken, getStoredUsername, createGuestToken, getStoredGuestToken } from './api/auth'
import type { ProductCardDTO } from './data/types'
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
  const navigate = useNavigate()
  const [searchText, setSearchText] = useState('')
  const [submittedSearchText, setSubmittedSearchText] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState('')
  const [products, setProducts] = useState<ProductCardDTO[]>([])
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [minRating, setMinRating] = useState('')
  const [stockStatus, setStockStatus] = useState('all')
  const [sortBy, setSortBy] = useState('default')
  const username = getStoredUsername()

  const visibleProducts = useMemo(
    () =>
      activeCategory === null
        ? products
        : products.filter((product) => product.category === activeCategory),
    [activeCategory, products],
  )

  const fetchProducts = useCallback(async (url = 'http://localhost:8080/api/products?page=0&size=10') => {
    const response = await fetch(url)
    return response.json() as Promise<ProductCardDTO[]>
  }, [])

  const handleSearchSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const url = "http://localhost:8080/api/products/search?page=0&size=5&name="
    const name = searchText.trim()

    if (!name) {
      //setIsSearching(false)
      handleResetSearch()
      return

    }

    setIsSearching(true)
    setSearchError('')

    try {
      const data = await fetchProducts(url + encodeURIComponent(name))
      setProducts(data)
      setSubmittedSearchText(name)
    }
    catch(err) {
      console.error(err)
      setSearchError('Unable to load products. Please try again.')
    }
    setIsSearching(false)
    
  }

  const handleResetSearch = async () => {
    setSearchText('')
    setSubmittedSearchText('')
    setSearchError('')
    setIsSearching(true)

    try {
      const data = await fetchProducts()
      setProducts(data)
    } catch (err) {
      console.error(err)
      setSearchError('Unable to load products. Please try again.')
    }

    setIsSearching(false)
  }

  const handleLogout = () => {
    clearAuthToken()
    navigate('/login')
    }

  const handleResetFilters = () => {
    setMinPrice('')
    setMaxPrice('')
    setMinRating('')
    setStockStatus('all')
    setSortBy('default')
  }

  const searchActive = submittedSearchText.length > 0

  useEffect(() => {
    const initGuestToken = async () => {
      const existingToken = getStoredGuestToken()
      if (!existingToken) {
        try {
          await createGuestToken()
        } catch (error) {
          console.error("Failed to create guest token:", error)
        }
      }
    }
    initGuestToken()
  }, [])

  useEffect(() => {
      fetchProducts().then(setProducts).catch((error) => {
        console.error(error)
        setSearchError('Unable to load products. Please try again.')
      })
    }, [fetchProducts])

      
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
            {searchActive ? (
              <button type="button" className="btn-secondary" onClick={handleResetSearch}>
                Clear
              </button>
            ) : null}
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
          <button
            type="button"
            className={activeCategory === null ? 'active' : ''}
            aria-pressed={activeCategory === null}
            onClick={() => setActiveCategory(null)}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              type="button"
              key={category}
              className={activeCategory === category ? 'active' : ''}
              aria-pressed={activeCategory === category}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </button>
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
          {searchActive ? (
            <p className="search-info">
              Showing search results for "{submittedSearchText}".
            </p>
          ) : null}
          {activeCategory ? (
            <p className="search-info">
              Showing {visibleProducts.length} product{visibleProducts.length === 1 ? '' : 's'} in {activeCategory}.
            </p>
          ) : null}
          {searchError ? <p className="search-error">{searchError}</p> : null}
        </section>

        <section className="catalog-controls" aria-label="Product filters and sorting">
          <div className="filter-panel">
            <div className="control-group">
              <label htmlFor="min-price">Min price</label>
              <input
                id="min-price"
                type="number"
                min="0"
                placeholder="$0"
                value={minPrice}
                onChange={(event) => setMinPrice(event.target.value)}
              />
            </div>

            <div className="control-group">
              <label htmlFor="max-price">Max price</label>
              <input
                id="max-price"
                type="number"
                min="0"
                placeholder="$2000"
                value={maxPrice}
                onChange={(event) => setMaxPrice(event.target.value)}
              />
            </div>

            <div className="control-group">
              <label htmlFor="min-rating">Rating</label>
              <select
                id="min-rating"
                value={minRating}
                onChange={(event) => setMinRating(event.target.value)}
              >
                <option value="">Any rating</option>
                <option value="4">4+ stars</option>
                <option value="3">3+ stars</option>
                <option value="2">2+ stars</option>
                <option value="1">1+ stars</option>
              </select>
            </div>

            <div className="control-group">
              <label htmlFor="stock-status">Availability</label>
              <select
                id="stock-status"
                value={stockStatus}
                onChange={(event) => setStockStatus(event.target.value)}
              >
                <option value="all">All products</option>
                <option value="in-stock">In stock</option>
                <option value="out-of-stock">Out of stock</option>
              </select>
            </div>
          </div>

          <div className="sort-panel">
            <div className="control-group">
              <label htmlFor="sort-products">Sort by</label>
              <select
                id="sort-products"
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
              >
                <option value="default">Default</option>
                <option value="price-asc">Price: low to high</option>
                <option value="price-desc">Price: high to low</option>
                <option value="rating-desc">Highest rated</option>
                <option value="name-asc">Name: A to Z</option>
              </select>
            </div>

            <button type="button" className="btn-secondary" onClick={handleResetFilters}>
              Reset filters
            </button>
          </div>
        </section>

        <section className="product-grid" aria-label="Technology products">
          {visibleProducts.map((product) => (
            <article key={product.id} className="product-card">
              <span className="product-category">{product.category}</span>
              <img
                src={product.imageUrl || 'https://via.placeholder.com/300x200?text=No+Image'}
                alt={product.name}
                className="product-image"
              />
              <h2>{product.name}</h2>
              <p className="rating">Rating: {product.rating ?? 'N/A'} / 5</p>
              <p className="price">${product.price}</p>
              <div className="product-actions">
                <Link to={`/product/${product.id}`} className="btn-secondary">
                  Details
                </Link>
                { product.stock > 0 ? (
                <button type="button" className="btn-action">
                  Add to Cart
                </button>
                ) : (
                  <button type="button" className="btn-action" disabled style={{ backgroundColor: 'gray', cursor: 'not-allowed' }}>
                    Out of Stock
                  </button>
                 )
  }
              </div>
            </article>
          ))}
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
