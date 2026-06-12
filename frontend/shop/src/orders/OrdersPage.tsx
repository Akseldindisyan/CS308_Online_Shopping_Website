import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getStoredUserId } from '../api/auth'
import { getOrders, type Order } from '../api/orders'
import { getMyRefunds, requestRefund } from '../api/refunds'
import { useToast } from '../components/ToastProvider'
import '../App.css'

export default function OrdersPage() {
  const userId = getStoredUserId()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(Boolean(userId))
  const [error, setError] = useState('')
  const [requestingRefundId, setRequestingRefundId] = useState<string | null>(null)
  const [refundStatusByInvoice, setRefundStatusByInvoice] = useState<Map<string, string>>(new Map())
  const { showToast } = useToast()

  useEffect(() => {
    if (!userId) return

    Promise.all([getOrders(userId), getMyRefunds()])
      .then(([loadedOrders, refunds]) => {
        setOrders(loadedOrders)
        const statusMap = new Map<string, string>()
        refunds
          .filter((refund) => refund.status !== 'REJECTED')
          .forEach((refund) => statusMap.set(refund.invoiceId, refund.status))
        setRefundStatusByInvoice(statusMap)
      })
      .catch(() => setError('Failed to load orders'))
      .finally(() => setLoading(false))
  }, [userId])

  const handleRefundRequest = async (order: Order) => {
    if (!window.confirm('Request a refund for every item in this order?')) return

    setRequestingRefundId(order.invoiceId)
    try {
      await requestRefund(
        order.invoiceId,
        order.items.map((item) => item.invoiceItemId),
      )
      setRefundStatusByInvoice((current) => new Map(current).set(order.invoiceId, 'UNDECIDED'))
      showToast('Refund request submitted', 'success')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to request refund'
      setError(message)
      showToast(message, 'error')
    } finally {
      setRequestingRefundId(null)
    }
  }

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
                    <tr key={item.invoiceItemId} style={{ borderBottom: '1px solid #333' }}>
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
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: '0.75rem',
                }}
              >
                <button
                  type="button"
                  className="btn-secondary"
                  disabled={
                    requestingRefundId === order.invoiceId ||
                    refundStatusByInvoice.has(order.invoiceId) ||
                    order.items.length === 0
                  }
                  onClick={() => void handleRefundRequest(order)}
                >
                  {refundStatusByInvoice.get(order.invoiceId) === 'ACCEPTED'
                    ? 'Refunded'
                    : refundStatusByInvoice.get(order.invoiceId) === 'UNDECIDED'
                      ? 'Refund requested'
                      : requestingRefundId === order.invoiceId
                        ? 'Requesting...'
                        : 'Request refund'}
                </button>
                <strong>Total: ${order.totalPrice}</strong>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
