import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import './product_page.css'
import { products } from './productData'
import StarRating from './rating'
import { FaStar } from "react-icons/fa";


function ProductPage() {
  const { id } = useParams()
  const product = products.find((item) => item.id === Number(id))
  const [selectedImage, setSelectedImage] = useState('')
  const [statusMessage, setStatusMessage] = useState('')

  useEffect(() => {
    setSelectedImage(product?.image ?? '')
    setStatusMessage('')
  }, [product])

  if (!product) {
    return (
      <main className="product-page">
        <section className="product-not-found">
          <h1>Product not found</h1>
          <p>The item you selected is unavailable in this demo catalog.</p>
          <Link to="/" className="btn-secondary">
            Back to products
          </Link>
        </section>
      </main>
    )
  }

  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(product.price)

  const mainImage = selectedImage || product.image

  return (
    <main className="product-page">
      <div className="product-breadcrumb" aria-label="Breadcrumb">
        <Link to="/">Home</Link>
        <span>/</span>
        <span>{product.category}</span>
        <span>/</span>
        <span>{product.name}</span>
      </div>

      <section className="product-detail-layout">
        <div>
          <article className="product-gallery-card">
            <img src={mainImage} alt={product.name} className="product-main-image" />

            <div className="product-thumbnails" aria-label="Product gallery">
              {product.images.map((image, index) => (
                <button
                  key={image}
                  type="button"
                  className={`product-thumb ${mainImage === image ? 'active' : ''}`}
                  onClick={() => setSelectedImage(image)}
                  aria-label={`View image ${index + 1} of ${product.name}`}
                >
                  <img src={image} alt={`${product.name} preview ${index + 1}`} />
                </button>
              ))}
            </div>
          </article>

          
        </div>

        <article className="product-summary-card">
          <span className="product-badge">{product.category}</span>
          <h1>{product.name}</h1>

          <div className="product-meta">
            <span><FaStar color='#ffc107'></FaStar> {product.rating} / 5 rating</span>
            <span>•</span>
            <span>{product.stock} items in stock</span>
          </div>
          <div className="product-meta">
            <StarRating /><span>rate this product</span>
          </div>

          <p className="product-description">{product.description}</p>

          <ul className="product-features">
            {product.features.map((feature) => (
              <li key={feature}>{feature}</li>
            ))}
          </ul>

          <div className="product-buy-card">
            <div className="product-price-row">
              <p className="product-price">{formattedPrice}</p>
              <span>Free shipping</span>
            </div>

            <p className="product-stock">Ready to ship today</p>

            <div className="product-buy-actions">
              <button
                type="button"
                className="btn-action"
                onClick={() =>
                  setStatusMessage(`${product.name} is ready for checkout in demo mode.`)
                }
              >
                Buy Now
              </button>

              <Link to="/" className="btn-secondary">
                Continue shopping
              </Link>
            </div>

            {statusMessage ? <p className="product-status-message">{statusMessage}</p> : null}
          </div>
        </article>
      </section>
    </main>
  )
}

export default ProductPage
