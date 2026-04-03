import { useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { FaStar } from 'react-icons/fa'
import './product_page.css'
import { products, type Product, type ProductReview } from './productData'
import StarRating from './rating'

function ProductPageContent({ product }: { product: Product }) {
  const [selectedImage, setSelectedImage] = useState(product.image)
  const [statusMessage, setStatusMessage] = useState('')
  const [reviewMessage, setReviewMessage] = useState('')
  const [reviewMessageType, setReviewMessageType] = useState<'success' | 'error' | ''>('')
  const [reviews, setReviews] = useState<ProductReview[]>(product.reviews ?? [])
  const [reviewForm, setReviewForm] = useState({ author: '', text: '', rating: 0 })

  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(product.price)

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((total, review) => total + review.rating, 0) / reviews.length
      : product.rating

  const totalReviewsLabel = `${reviews.length} ${reviews.length === 1 ? 'comment' : 'comments'}`

  const handleReviewSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const author = reviewForm.author.trim()
    const text = reviewForm.text.trim()

    if (!author || !text || reviewForm.rating === 0) {
      setReviewMessage('Please add your name, a comment, and a star rating before submitting.')
      setReviewMessageType('error')
      return
    }

    const newReview: ProductReview = {
      id: Date.now(),
      author,
      text,
      rating: reviewForm.rating,
      date: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
    }

    setReviews((currentReviews) => [newReview, ...currentReviews])
    setReviewForm({ author: '', text: '', rating: 0 })
    setReviewMessage('Thanks! Your comment was added in demo mode.')
    setReviewMessageType('success')
  }

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
            <img src={selectedImage} alt={product.name} className="product-main-image" />

            <div className="product-thumbnails" aria-label="Product gallery">
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
            </div>
          </article>
        </div>

        <article className="product-summary-card">
          <span className="product-badge">{product.category}</span>
          <h1>{product.name}</h1>

          <div className="product-meta">
            <span>
              <FaStar color="#ffc107" /> {averageRating.toFixed(1)} / 5 rating
            </span>
            <span>•</span>
            <span>{totalReviewsLabel}</span>
            <span>•</span>
            <span>{product.stock} items in stock</span>
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

      <section className="product-reviews-section">
        <div className="product-reviews-header">
          <div>
            <h2>Customer comments</h2>
            <p>Read recent feedback or leave a quick comment about {product.name}.</p>
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
                      <h3>{review.author}</h3>
                      <span className="product-review-date">{review.date}</span>
                    </div>
                    <StarRating value={review.rating} readOnly size={18} />
                  </div>
                  <p>{review.text}</p>
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
              <label className="product-form-field">
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
              </label>

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
                  placeholder="Tell us what you liked or what could be better"
                />
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
  const { id } = useParams()
  const product = products.find((item) => item.id === Number(id))

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

  return <ProductPageContent key={product.id} product={product} />
}

export default ProductPage

