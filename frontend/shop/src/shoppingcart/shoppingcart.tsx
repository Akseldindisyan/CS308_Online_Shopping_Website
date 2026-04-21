import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { products, type Product } from '../product_page/productData'
import './shoppingcart.css'

type CartItem = Pick<Product, 'id' | 'name' | 'category' | 'price' | 'image'> & {
  quantity: number
  delivery: string
}

const initialCartItems: CartItem[] = products.slice(0, 3).map((product, index) => ({
  id: product.id,
  name: product.name,
  category: product.category,
  price: product.price,
  image: product.image,
  quantity: [1, 2, 1][index] ?? 1,
  delivery: ['Tomorrow', '2-3 business days', 'Friday'][index] ?? 'This week',
}))

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)

function ShoppingCart() {
  const [cartItems, setCartItems] = useState<CartItem[]>(initialCartItems)

  const itemCount = useMemo(
    () => cartItems.reduce((total, item) => total + item.quantity, 0),
    [cartItems],
  )

  const subtotal = useMemo(
    () => cartItems.reduce((total, item) => total + item.price * item.quantity, 0),
    [cartItems],
  )

  const shipping = cartItems.length === 0 || subtotal >= 1500 ? 0 : 29
  const tax = subtotal * 0.08
  const total = subtotal + shipping + tax

  const changeQuantity = (id: number, delta: number) => {
    setCartItems((currentItems) =>
      currentItems.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item,
      ),
    )
  }

  const removeItem = (id: number) => {
    setCartItems((currentItems) => currentItems.filter((item) => item.id !== id))
  }

  if (cartItems.length === 0) {
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
            <span>{itemCount} selected products</span>
          </div>

          {cartItems.map((item) => (
            <article key={item.id} className="cart-item-card">
              <img src={item.image} alt={item.name} className="cart-item-image" />

              <div className="cart-item-meta">
                <span className="cart-item-badge">{item.category}</span>
                <h3>{item.name}</h3>
                <p className="cart-item-subtext">
                  Delivery estimate: <strong>{item.delivery}</strong>
                </p>

                <div className="cart-item-actions">
                  <div className="cart-quantity" aria-label={`Quantity controls for ${item.name}`}>
                    <button type="button" onClick={() => changeQuantity(item.id, -1)}>
                      −
                    </button>
                    <strong>{item.quantity}</strong>
                    <button type="button" onClick={() => changeQuantity(item.id, 1)}>
                      +
                    </button>
                  </div>

                  <button
                    type="button"
                    className="cart-remove-btn"
                    onClick={() => removeItem(item.id)}
                  >
                    Remove
                  </button>
                </div>
              </div>

              <div className="cart-item-aside">
                <span className="cart-item-price">{formatCurrency(item.price * item.quantity)}</span>
                <span className="cart-item-subtext">{formatCurrency(item.price)} each</span>
                <span className="cart-item-delivery">In stock</span>
              </div>
            </article>
          ))}
        </div>

        <aside className="cart-summary-card">
          <h2>Order Summary</h2>
          <p className="cart-summary-note">Taxes and shipping are calculated for demo purposes.</p>

          <div className="cart-summary-list">
            <div className="cart-summary-row">
              <span>Subtotal</span>
              <strong>{formatCurrency(subtotal)}</strong>
            </div>
            <div className="cart-summary-row">
              <span>Shipping</span>
              <strong>{shipping === 0 ? 'Free' : formatCurrency(shipping)}</strong>
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

          <div className="cart-summary-actions">
            <button type="button" className="btn-action">
              Proceed to Checkout
            </button>
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
