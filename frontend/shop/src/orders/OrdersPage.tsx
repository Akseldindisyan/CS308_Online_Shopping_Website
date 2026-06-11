import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getStoredUserId } from '../api/auth'
import { getOrders, type Order } from '../api/orders'
import '../App.css'

export default function OrdersPage() {
  const userId = getStoredUserId()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(Boolean(userId))
  const [error, setError] = useState('')

  useEffect(() => {
    if (!userId) return

    getOrders(userId)
      .then(setOrders)
      .catch(() => setError('Failed to load orders'))
      .finally(() => setLoading(false))
  }, [userId])

  if (!userId)
    return (
      <div className="page">
        <div className="main-content">
          <p>
            Please <Link to="/login">login</Link> to view your orders.
          </p>
        </div>
      </div>
    )

  return (
    <div className="page">
      <header className="header">
        <div className="header-top">
          <Link to="/" className="logo">
            TEKNOSU
          </Link>
          <div className="header-actions">
            <Link to="/cart" className="btn-primary">
              My Cart
            </Link>
            <Link to="/wishlist" className="btn-secondary">
              My Wishlist
            </Link>
          </div>
        </div>
      </header>
      <main className="main-content">
        <h1>My Orders</h1>
        {loading && <p>Loading...</p>}
        {error && <p className="search-error">{error}</p>}
        {!loading && orders.length === 0 && <p>No orders yet.</p>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {orders.map((order) => (
            <div
              key={order.invoiceId}
              className="product-card"
              style={{ maxWidth: '100%' }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '0.5rem',
                }}
              >
                <strong>Order #{order.invoiceId.slice(0, 8)}</strong>
                {order.date && <span>{order.date}</span>}
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #444' }}>
                    <th style={{ textAlign: 'left', padding: '4px' }}>Product</th>
                    <th style={{ textAlign: 'right', padding: '4px' }}>Qty</th>
                    <th style={{ textAlign: 'right', padding: '4px' }}>Unit Price</th>
                    <th style={{ textAlign: 'right', padding: '4px' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item) => (
                    <tr key={item.productId} style={{ borderBottom: '1px solid #333' }}>
                      <td style={{ padding: '4px' }}>{item.productName}</td>
                      <td style={{ textAlign: 'right', padding: '4px' }}>{item.quantity}</td>
                      <td style={{ textAlign: 'right', padding: '4px' }}>
                        ${item.unitPrice}
                      </td>
                      <td style={{ textAlign: 'right', padding: '4px' }}>
                        ${item.totalPrice}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p style={{ textAlign: 'right', marginTop: '0.5rem' }}>
                <strong>Total: ${order.totalPrice}</strong>
              </p>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
