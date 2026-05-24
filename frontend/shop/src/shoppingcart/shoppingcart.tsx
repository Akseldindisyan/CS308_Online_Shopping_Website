import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../hooks/useCart'
import { useToast } from '../components/ToastProvider'
import { useNavigate } from 'react-router-dom'
import { getStoredAuthToken } from '../api/auth'
import { getCurrentUser } from '../api/users'
import type { UserDTO } from '../data/types'
import './shoppingcart.css'

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)

function ShoppingCart() {
  const {
    items,
    cart,
    loading,
    productsLoading,
    error,
    mutating,
    removeItem,
    changeQuantity,
  } = useCart()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const [profile, setProfile] = useState<UserDTO | null>(null)
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileError, setProfileError] = useState('')

  const isLoggedIn = Boolean(getStoredAuthToken())

  useEffect(() => {
    if (error) {
      showToast(error, 'error')
    }
  }, [error, showToast])

  useEffect(() => {
    if (!isLoggedIn) {
      setProfile(null)
      setProfileError('')
      return
    }

    const loadProfile = async () => {
      setProfileLoading(true)
      setProfileError('')
      try {
        setProfile(await getCurrentUser())
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load profile'
        setProfileError(message)
      } finally {
        setProfileLoading(false)
      }
    }

    void loadProfile()
  }, [isLoggedIn])

  const itemCount = useMemo(
    () => items.reduce((total, item) => total + item.quantity, 0),
    [items],
  )

  const subtotal = cart?.totalPrice ?? 0
  const shipping = items.length === 0 || subtotal >= 1500 ? 0 : 29
  const tax = subtotal * 0.08
  const total = subtotal + shipping + tax

  const handleRemove = async (productId: string, productName: string) => {
    await removeItem(productId)
    showToast(`${productName} removed from cart`, 'info')
  }

  const hasStockIssue = items.some(
    (item) => item.stock !== null && item.quantity > item.stock,
  )
  const isProfileIncomplete = isLoggedIn && (
    !profile?.address?.trim() || !profile?.nat_id?.trim()
  )

  const checkoutBlockReason = (() => {
    if (!isLoggedIn) return 'You need to log in before checking out.'
    if (profileLoading) return 'Loading your profile information...'
    if (profileError) return 'Could not verify your profile information.'
    if (isProfileIncomplete) {
      return 'Please update your address and national ID in your profile before checkout.'
    }
    if (hasStockIssue) return 'Some items exceed available stock. Please adjust quantities.'
    if (!cart?.canCheckout) return 'Some items in your cart are unavailable or out of stock.'
    return null
  })()

  const isCheckoutDisabled =
    mutating ||
    profileLoading ||
    profileError !== '' ||
    hasStockIssue ||
    !cart?.canCheckout

  const handleCheckout = () => {
    if (!isLoggedIn) {
      //showToast('Please log in to complete your purchase.', 'error')
      navigate('/login?redirect=cart') // Redirect to login with a redirect back to cart a
      return
    }
    if (!profile?.address?.trim() || !profile?.nat_id?.trim()) {
      showToast('Please update your address and national ID before checkout.', 'error')
      navigate('/profile?redirect=cart')
      return
    }
    navigate('/checkout/payment', { state: { address: profile.address.trim() } })
  }

  if (loading) {
    return (
      <main className="cart-page">
        <div className="cart-breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <span>Cart</span>
        </div>
        <section className="cart-empty-state">
          <h2>Loading your cart…</h2>
        </section>
      </main>
    )
  }

  if (error && !cart) {
    return (
      <main className="cart-page">
        <div className="cart-breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <span>Cart</span>
        </div>
        <section className="cart-empty-state">
          <h2>Could not load your cart</h2>
          <p>{error}</p>
          <Link to="/" className="btn-action">Back to shop</Link>
        </section>
      </main>
    )
  }

  if (items.length === 0) {
    return (
      <main className="cart-page">
        <div className="cart-breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <span>Cart</span>
        </div>
        <section className="cart-empty-state">
          <h2>Your cart is empty</h2>
          <p>
            Looks like you have not added any products yet. Explore the catalog and come
            back when you are ready to check out.
          </p>
          <Link to="/" className="btn-action">
            Continue shopping
          </Link>
        </section>
      </main>
    )
  }

  return (
    <main className="cart-page">
      <div className="cart-breadcrumb" aria-label="Breadcrumb">
        <Link to="/">Home</Link>
        <span>/</span>
        <span>Shopping Cart</span>
      </div>

      <section className="cart-header">
        <div>
          <h1>Your Shopping Cart</h1>
          <p>
            Review your items, update quantities, and continue to secure checkout when
            you are ready.
          </p>
        </div>
        <span className="cart-chip">{itemCount} items ready for checkout</span>
      </section>

      <section className="cart-layout">
        <div className="cart-items-panel">
          <div className="cart-panel-title">
            <h2>Cart Items</h2>
            <span>
              {itemCount} selected products
              {productsLoading && ' · refreshing…'}
            </span>
          </div>

          {items.map((item) => {
            const atStockLimit =
              item.stock !== null && item.quantity >= item.stock
            const overStock =
              item.stock !== null && item.quantity > item.stock

            return (
              <article key={item.productId} className="cart-item-card">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.productName}
                    className="cart-item-image"
                  />
                ) : (
                  <div className="cart-item-image cart-item-image--placeholder" />
                )}

                <div className="cart-item-meta">
                  {item.category && (
                    <span className="cart-item-badge">{item.category}</span>
                  )}
                  <h3>{item.productName}</h3>
                  <p className="cart-item-subtext">
                    {overStock
                      ? `Only ${item.stock} in stock — please reduce quantity`
                      : 'In stock · ships soon'}
                  </p>

                  <div className="cart-item-actions">
                    <div
                      className="cart-quantity"
                      aria-label={`Quantity controls for ${item.productName}`}
                    >
                      <button
                        type="button"
                        disabled={mutating}
                        onClick={() =>
                          changeQuantity(item.productId, item.quantity - 1)
                        }
                      >
                        −
                      </button>
                      <strong>{item.quantity}</strong>
                      <button
                        type="button"
                        disabled={mutating || atStockLimit}
                        onClick={() =>
                          changeQuantity(item.productId, item.quantity + 1)
                        }
                      >
                        +
                      </button>
                    </div>

                    <button
                      type="button"
                      className="cart-remove-btn"
                      disabled={mutating}
                      onClick={() => handleRemove(item.productId, item.productName)}
                    >
                      Remove
                    </button>
                  </div>
                </div>

                <div className="cart-item-aside">
                  <span className="cart-item-price">
                    {formatCurrency(item.lineTotal)}
                  </span>
                  <span className="cart-item-subtext">
                    {formatCurrency(item.unitPrice)} each
                  </span>
                </div>
              </article>
            )
          })}
        </div>

        <aside className="cart-summary-card">
          <h2>Order Summary</h2>
          <p className="cart-summary-note">
            Taxes and shipping are calculated for demo purposes.
          </p>

          <div className="cart-summary-list">
            <div className="cart-summary-row">
              <span>Subtotal</span>
              <strong>{formatCurrency(subtotal)}</strong>
            </div>
            <div className="cart-summary-row">
              <span>Shipping</span>
              <strong>
                {shipping === 0 ? 'Free' : formatCurrency(shipping)}
              </strong>
            </div>
            <div className="cart-summary-row">
              <span>Estimated tax</span>
              <strong>{formatCurrency(tax)}</strong>
            </div>
          </div>

          <div className="cart-summary-total">
            <span>Total</span>
            <strong>{formatCurrency(total)}</strong>
          </div>

          {isLoggedIn && (
            <div className="cart-profile-summary">
              <div>
                <span>Delivery profile</span>
                {profileLoading ? (
                  <strong>Loading profile...</strong>
                ) : (
                  <strong>
                    {profile?.address?.trim() || 'Address missing'}
                  </strong>
                )}
              </div>
              <div>
                <span>National ID</span>
                <strong>{profile?.nat_id?.trim() || 'Missing'}</strong>
              </div>
              <Link to="/profile?redirect=cart" className="btn-secondary">
                Edit Profile
              </Link>
            </div>
          )}

          <div className="cart-summary-actions">
            <button
              type="button"
              className="btn-action"
              disabled={isCheckoutDisabled&&isLoggedIn}
              onClick={handleCheckout}
            >
              {mutating
                ? 'Processing…'
                : isLoggedIn
                  ? 'Proceed to Checkout'
                  : 'Log in to Checkout'}
            </button>

            {checkoutBlockReason && !mutating && (
              <p className="cart-checkout-hint" role="status">
                {checkoutBlockReason}
              </p>
            )}

            <Link to="/" className="btn-secondary">
              Continue Shopping
            </Link>
          </div>

          <ul className="cart-perks">
            <li>Secure payment and encrypted checkout</li>
            <li>30-day easy returns on eligible items</li>
            <li>Free shipping for orders over $1,500</li>
          </ul>
        </aside>
      </section>
    </main>
  )
}

export default ShoppingCart
