import { useMemo, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { products, type Product } from './product_page/productData'
import { searchProducts } from './api/products'
import type { ProductCardDTO } from './data/types'

const categories = [
  'Laptops',
  'Phones',
  'Tablets',
  'Headphones',
  'Gaming',
  'Accessories',
]

function isBackendProduct(product: Product | ProductCardDTO): product is ProductCardDTO {
  return typeof product.id === 'string'
}


function AppContent() {
  const [searchText, setSearchText] = useState('')
  const [searchResults, setSearchResults] = useState<ProductCardDTO[] | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState('')

  const productCards = useMemo<(Product | ProductCardDTO)[]>(
    () => (searchResults === null ? products : searchResults),
    [searchResults],
  )

  const handleSearchSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const name = searchText.trim()

    if (!name) {
      setSearchResults(null)
      setSearchError('')
      return
    }

    setIsSearching(true)
    setSearchError('')

    try {
      const data = await searchProducts({ name, page: 0 })
      setSearchResults(data)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Search failed.'
      setSearchError(message)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const handleResetSearch = () => {
    setSearchText('')
    setSearchResults(null)
    setSearchError('')
  }

  const searchActive = searchResults !== null

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
            <Link to="/login" className="btn-secondary">
              Login / Register
            </Link>
            <Link to="/cart" className="btn-primary">
              My Cart
            </Link>
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
          {searchActive ? (
            <p className="search-info">
              Showing search results for "{searchText.trim()}".
            </p>
          ) : null}
          {searchError ? <p className="search-error">{searchError}</p> : null}
        </section>

        <section className="product-grid" aria-label="Technology products">
          {productCards.length === 0 ? (
            <article className="product-card">
              <h2>No products found</h2>
              <p className="rating">Try a different keyword.</p>
            </article>
          ) : (
            productCards.map((product) => {
              const backendProduct = isBackendProduct(product)
              const imageSrc = backendProduct
                ? product.imageUrl ?? 'https://via.placeholder.com/640x400?text=Product'
                : product.image

              return (
                <article key={product.id} className="product-card">
                  <img
                    src={imageSrc}
                    alt={product.name}
                    className="product-image"
                    loading="lazy"
                  />
                  <span className="product-category">
                    {backendProduct ? `Category #${product.categoryId ?? 'N/A'}` : product.category}
                  </span>
                  <h2>{product.name}</h2>
                  {backendProduct ? (
                    <p className="rating">Stock: {product.stock} • {product.active ? 'Active' : 'Inactive'}</p>
                  ) : (
                    <p className="rating">Rating: {product.rating} / 5</p>
                  )}
                  <p className="price">${product.price}</p>
                  <div className="product-actions">
                    {backendProduct ? (
                      <button type="button" className="btn-secondary" disabled>
                        Details
                      </button>
                    ) : (
                      <Link to={`/product/${product.id}`} className="btn-secondary">
                        Details
                      </Link>
                    )}
                    <button type="button" className="btn-action">
                      Add to Cart
                    </button>
                  </div>
                </article>
              )
            })
          )}
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
