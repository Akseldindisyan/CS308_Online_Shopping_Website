import { useMemo, useState, useEffect, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { products } from './product_page/productData'
import { searchProducts } from './api/products'
import { clearAuthToken, getStoredUsername, createGuestToken, getStoredGuestToken } from './api/auth'
import type { ProductCardDTO } from './data/types'
import './App.css'

type Product = {
  id: number
  name: string
  category: string
  price: number
  rating: number
  image: string
}

const categories = [
  'Laptops',
  'Phones',
  'Tablets',
  'Headphones',
  'Gaming',
  'Accessories',
  'Camera',
]

function isBackendProduct(product: Product | ProductCardDTO): product is ProductCardDTO {
  return typeof product.id === 'string'
}


function AppContent() {
  const navigate = useNavigate()
  const [searchText, setSearchText] = useState('')
  const [searchResults, setSearchResults] = useState<ProductCardDTO[] | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState('')
  const [products, setProducts] = useState<Product[]>([])
  const username = getStoredUsername()
  console.log(searchResults)

  const productCards = useMemo<(Product | ProductCardDTO)[]>(
    () => (searchResults === null ? products : searchResults),
    [searchResults],
  )

  const handleSearchSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    let url = "http://localhost:8080/api/products/search?page=0&size=5&name="
    let name = searchText.trim()

    if (!name) {
      url = "http://localhost:8080/api/products?page=0&size=10"
      name = ""
    }

    setIsSearching(true)
    setSearchError('')

    try {
      const response = await fetch(url + name);
      const data = await response.json()
      setProducts(data)
      console.log(data)
    }
    catch(err) {
      console.log(err)
    }
    setIsSearching(false)
    
  }

  const handleResetSearch = () => {
    setSearchText('')
    setSearchResults(null)
    setSearchError('')
  }

  const handleLogout = () => {
    clearAuthToken()
    navigate
    }

  const searchActive = searchResults !== null

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
      fetch('http://localhost:8080/api/products?page=0&size=10')
      .then(res => res.json())
      .then(data => setProducts(data))
    }, [])
    console.log(products);

      
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
          {products.map((product) => (
            <article key={product.id} className="product-card">
              <span className="product-category">{product.category}</span>
              <h2>{product.name}</h2>
              <p className="rating">Rating: {product.rating} / 5</p>
              <p className="price">${product.price}</p>
              <div className="product-actions">
                <Link to={`/product/${product.id}`} className="btn-secondary">
                  Details
                </Link>
                <button type="button" className="btn-action">
                  Add to Cart
                </button>
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
