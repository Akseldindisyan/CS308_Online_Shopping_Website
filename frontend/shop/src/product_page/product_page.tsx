import { useState, useEffect, type FormEvent, useCallback } from 'react'
import { Link, useParams } from 'react-router-dom'
import { FaStar } from 'react-icons/fa'
import './product_page.css'
import { products, type Product } from './productData'
import { getStoredAuthToken } from '../api/auth'
import StarRating from './rating'
import { useToast } from '../components/ToastProvider'
import { useNavigate } from 'react-router-dom'
import type { UUID } from "../data/types.ts";
import { addItemToCart, getCartItemCount } from "../api/cart.ts";
import { useCart } from '../hooks/useCart'


type ProductReview = {
  id: number
  username: string
  comment: string
  rating: number
  createdAt: string
}

function ProductPageContent({ product: initialProduct }: { product: Product }) {
  const [product, setProduct] = useState<Product>(initialProduct)
  let url = "http://localhost:8080/api/review/product/"
  let id = product.id

  useEffect(() => {
    fetch(url + id)
      .then(res => res.json())
      .then(data => setReviews(data))
  }, [])

  const [selectedImage, setSelectedImage] = useState(product.image_url)
  const [statusMessage, setStatusMessage] = useState('')
  const [reviewMessage, setReviewMessage] = useState('')
  const [reviewMessageType, setReviewMessageType] = useState<'success' | 'error' | ''>('')
  const [reviews, setReviews] = useState<ProductReview[]>([])
  const [reviewForm, setReviewForm] = useState({ author: '', text: '', rating: 0, })
  const [addingToCart, setAddingToCart] = useState<UUID | null>(null)
  const [cartCount, setCartCount] = useState(0)

  const { showToast } = useToast()
  const navigate = useNavigate()
  const { items: cartItems } = useCart()

  const hasDiscount = product.discountRate && product.discountRate > 0

  const oldPrice = hasDiscount
      ? product.price / (1 - (product.discountRate / 100))
      : product.price

  const formattedCurrentPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(product.price)

  const formattedOldPrice = hasDiscount
      ? new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
      }).format(oldPrice)
      : null

  const averageRating = product.rating

  const totalReviewsLabel = `${reviews.length} ${reviews.length === 1 ? 'comment' : 'comments'}`

  const productIdStr = product.id.toString()
  const currentInCart =
    cartItems.find((item) => item.productId === productIdStr)?.quantity ?? 0
  const atStockLimit = currentInCart >= product.stock

  const refreshCartCount = useCallback(async () => {
    try {
      const count = await getCartItemCount()
      setCartCount(count)
    } catch (err) {
      console.error('Failed to load cart count:', err)
    }
  }, [])

  const handleAddToCart = async (productId: UUID, productName: string) => {
    if (currentInCart >= product.stock) {
      showToast(
        `Cannot add more — only ${product.stock} in stock and you already have ${currentInCart} in your cart`,
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

  const handleReviewSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const isLoggedIn = Boolean(getStoredAuthToken())
    const comment = reviewForm.text.trim()

    if (!isLoggedIn) {
      showToast('Please log in to comment.', 'error')
      return
    }

    if (reviewForm.rating === 0) {
      setReviewMessage('Please select a star rating before submitting.')
      setReviewMessageType('error')
      return
    }

    const url = "http://localhost:8080/api/review/product/comment/"
    const id = product.id
    const token = localStorage.getItem('authToken')
    const today = new Date().toISOString().split('T')[0]

    fetch(url, {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token,
        productId: id,
        comment,
        rating: reviewForm.rating,
        commentDate: today
      })
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to submit')
        setReviewForm({ author: '', text: '', rating: 0 })
        setReviewMessage(
          comment.length === 0
            ? 'Thanks! Your rating has been recorded.'
            : 'Thanks! Your comment is awaiting approval and will appear once reviewed.'
        )
        setReviewMessageType('success')

        return Promise.all([
          fetch(`http://localhost:8080/api/review/product/${id}`).then(r => r.json()),
          fetch(`http://localhost:8080/api/products/${id}`).then(r => r.json()),
        ])
      })
      .then((results) => {
        if (!results) return
        const [reviewsData, productData] = results
        setReviews(reviewsData)
        setProduct(productData)
      })
  }

  return (
    <main className="product-page">
      <div className="product-breadcrumb" aria-label="Breadcrumb">
        <Link to="/">Home</Link>
        <span>/</span>
        <span>{product.category}</span>
        <span>/</span>
        <span>{product.productName}</span>
      </div>

      <section className="product-detail-layout">
        <div>
          <article className="product-gallery-card">
            <img src={selectedImage} alt={product.productName} className="product-main-image" />

            {/* <div className="product-thumbnails" aria-label="Product gallery">
              {product.images.map((image, index) => (
                <button
                  key={image}
                  type="button"
                  className={`product-thumb ${selectedImage === image ? 'active' : ''}`}
                  onClick={() => setSelectedImage(image)}
                  aria-label={`View image ${index + 1} of ${product.name}`}
                >
                  <img src={image} alt={`${product.name} preview ${index + 1}`} />
                </button>
              ))}
            </div> */}
          </article>
        </div>

        <article className="product-summary-card">
          <span className="product-badge">{product.category}</span>
          <h1>{product.productName}</h1>

          <div className="product-meta">
            <span style={{ display: (product.rating > 0) ? 'inherit' : 'none' }}>
               
              <FaStar color="#ffc107" /> {product.rating} / 5 rating
            </span>
            <span style={{ display: (product.rating <= 0) ? 'inherit' : 'none' }}>No ratings yet</span>
            <span>•</span>
            <span>{totalReviewsLabel}</span>
            <span>•</span>
            <span>{product.stock} items in stock</span>
          </div>

          <p className="product-description">{product.desc}</p>
          <p className="product-description">Model: {product.model}</p>
          <p className="product-description">Warranty Status: {product.warranty_status}</p>
          <p className="product-description">Serial Number: {product.serialNumber}</p>
          <p className="product-description">Distributor: {product.distInfo}</p>
           <p className="product-description">Made in {product.country}</p>
          {/* <ul className="product-features">
            {product.features.map((feature) => (
              <li key={feature}>{feature}</li>
            ))}
          </ul> */}

          <div className="product-buy-card">
            <div className="product-price-row">
              <div className="product-price-wrapper">
                {hasDiscount ? (
                    <>
                      <span className="old-price">{formattedOldPrice}</span>
                      <span className="new-price">{formattedCurrentPrice}</span>
                    </>
                ) : (
                    <p className="product-price">{formattedCurrentPrice}</p>
                )}
              </div>
              <span>Free shipping</span>
            </div>

            <p className="product-stock">Ready to ship today</p>

            <div className="product-buy-actions">
              {product.stock === 0 ? (
                <button
                  className="btn-action"
                  disabled
                  style={{ backgroundColor: 'grey', cursor: 'not-allowed' }}
                >
                  Out of Stock
                </button>
              ) : (
                <button
                  type="button"
                  className="btn-action"
                  disabled={atStockLimit || addingToCart === productIdStr}
                  onClick={() =>
                    handleAddToCart(productIdStr, product.productName)
                  }
                >
                  {atStockLimit
                    ? 'Stock limit reached'
                    : addingToCart === productIdStr
                      ? 'Adding…'
                      : 'Buy Now'}
                </button>
              )}

              <Link to="/" className="btn-secondary">
                Continue shopping
              </Link>
            </div>

            {atStockLimit && product.stock > 0 && (
              <p className="product-status-message">
                You already have {currentInCart} of {product.stock} available in your cart.
              </p>
            )}

            {statusMessage ? <p className="product-status-message">{statusMessage}</p> : null}
          </div>
        </article>
      </section>

      <section className="product-reviews-section">
        <div className="product-reviews-header">
          <div>
            <h2>Customer comments</h2>
            <p>Read recent feedback or leave a quick comment about {product.productName}.</p>
          </div>

          <div className="product-review-summary">
            <strong>{averageRating.toFixed(1)}</strong>
            <div className="product-rating-inline">
              <StarRating value={Math.round(averageRating)} readOnly />
              <span>{totalReviewsLabel}</span>
            </div>
          </div>
        </div>

        <div className="product-reviews-layout">
          <div className="product-review-list" aria-live="polite">
            {reviews.length > 0 ? (
              reviews.map((review) => (
                <article key={review.id} className="product-review-card">
                  <div className="product-review-top">
                    <div>
                      <h3>{review.username}</h3>
                      <span className="product-review-date">{review.createdAt}</span>
                    </div>
                    <StarRating value={review.rating} readOnly size={18} />
                  </div>
                  <p>{review.comment}</p>

                </article>
              ))
            ) : (
              <div className="product-empty-reviews">
                No comments yet. Be the first to share your experience.
              </div>
            )}
          </div>

          <aside className="product-review-form-card">
            <h3>Leave a comment</h3>
            <p className="product-review-help">Your feedback helps other shoppers in this demo store.</p>

            <form className="product-review-form" onSubmit={handleReviewSubmit}>
              {/* <label className="product-form-field">
                <span>Your name</span>
                <input
                  type="text"
                  value={reviewForm.author}
                  onChange={(event) => {
                    setReviewForm((currentForm) => ({
                      ...currentForm,
                      author: event.target.value,
                    }))
                    setReviewMessage('')
                    setReviewMessageType('')
                  }}
                  placeholder="Enter your name"
                />
              </label> */}
              <label className="product-form-field">
                <span>Your comment</span>
                <textarea

                  value={reviewForm.text}
                  onChange={(event) => {
                    setReviewForm((currentForm) => ({
                      ...currentForm,
                      text: event.target.value,
                    }))
                    setReviewMessage('')
                    setReviewMessageType('')
                  }}
                  rows={5}
                  placeholder="Optional — leave a comment (will appear after approval)" />
              </label>

              <div className="product-form-field">
                <span>Your rating</span>
                <StarRating
                  value={reviewForm.rating}
                  onChange={(rating) => {
                    setReviewForm((currentForm) => ({ ...currentForm, rating }))
                    setReviewMessage('')
                    setReviewMessageType('')
                  }}
                />
              </div>

              <button type="submit" className="btn-action">
                Submit comment
              </button>

              {reviewMessage ? (
                <p className={`product-review-message ${reviewMessageType}`}>
                  {reviewMessage}
                </p>
              ) : null}
            </form>
          </aside>
        </div>
      </section>
    </main>
  )
}

function ProductPage() {
  const [productInfo, setProductInfo] = useState<Product>()
  const { id } = useParams()
  let url = "http://localhost:8080/api/products/"
  let url_final = url + id
  useEffect(() => {
    fetch(url_final)
      .then(res => res.json())
      .then(data => setProductInfo(data))
  }, [])
  console.log(productInfo)

  if (!productInfo) {
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

  return <ProductPageContent key={productInfo.id} product={productInfo} />
}

export default ProductPage