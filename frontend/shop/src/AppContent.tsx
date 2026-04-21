import { Link } from 'react-router-dom'
import './App.css'
import { useEffect, useState } from 'react'
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



function AppContent() {
  const [products, setProducts] = useState<Product[]>([])

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

          <form className="search-wrap" role="search">
            <input
              type="search"
              placeholder="Search technology products..."
              aria-label="Search products"
            />
            <button type="submit">Search</button>
          </form>

          <div className="header-actions">
            <Link to="/login" className="btn-secondary">
              Login / Register
            </Link>
            <button type="button" className="btn-primary">
              My Cart (2)
            </button>
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
        </section>

        <section className="product-grid" aria-label="Technology products">
          {products.map((product) => (
            <article key={product.id} className="product-card">
              <span className="product-category">{product.category}</span>
              <h2>{product.name}</h2>
              <p className="rating">Rating: {product.rating} / 5</p>
              <p className="price">${product.price}</p>
              <div className="product-actions">
                <button type="button" className="btn-secondary">
                  Details
                </button>
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
