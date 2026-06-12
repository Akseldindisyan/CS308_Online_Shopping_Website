import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { getStoredUserId } from '../api/auth'
import { getDeliveries, type DeliveryDTO } from '../api/delivery'
import { getOrders, type Order } from '../api/orders'
import { getMyRefunds, requestRefund } from '../api/refunds'
import { useToast } from '../components/ToastProvider'
import '../App.css'

const statusSteps = ['PENDING', 'IN_TRANSIT', 'COMPLETED'] as const
type StepStatus = (typeof statusSteps)[number]

const statusLabel: Record<StepStatus, string> = {
  PENDING: 'Pending',
  IN_TRANSIT: 'In Transit',
  COMPLETED: 'Delivered',
}

const stepColor: Record<StepStatus, string> = {
  PENDING: '#f59e0b',
  IN_TRANSIT: '#3b82f6',
  COMPLETED: '#22c55e',
}

function StatusBar({ status }: { status: string }) {
  const currentIndex = statusSteps.indexOf(status as StepStatus)
  const activeIndex = currentIndex >= 0 ? currentIndex : 0
  const progressPercent = (activeIndex / (statusSteps.length - 1)) * 100
  const progressColor = stepColor[status as StepStatus] ?? stepColor.PENDING

  return (
    <div style={{ margin: '0.75rem 0' }}>
      <div style={{ position: 'relative', padding: '0 14px' }}>
        <div
          style={{
            position: 'absolute',
            top: 14,
            left: 28,
            right: 28,
            height: 3,
            background: '#374151',
            borderRadius: 999,
          }}
        >
          <div
            style={{
              width: `${progressPercent}%`,
              height: '100%',
              background: progressColor,
              borderRadius: 999,
              transition: 'width 0.3s ease, background 0.3s ease',
            }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {statusSteps.map((step, index) => {
            const isCompleted = index <= currentIndex && currentIndex >= 0
            const circleColor = isCompleted ? stepColor[step] : '#374151'

            return (
              <div
                key={step}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4,
                  position: 'relative',
                  zIndex: 1,
                  flex: '0 0 72px',
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: circleColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 13,
                    color: 'white',
                    fontWeight: 'bold',
                    flexShrink: 0,
                    transition: 'background 0.3s',
                  }}
                >
                  {isCompleted ? '✓' : index + 1}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: isCompleted ? '#e5e7eb' : '#6b7280',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {statusLabel[step]}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default function OrdersPage() {
  const userId = getStoredUserId()
  const [orders, setOrders] = useState<Order[]>([])
  const [deliveries, setDeliveries] = useState<DeliveryDTO[]>([])
  const [loading, setLoading] = useState(Boolean(userId))
  const [error, setError] = useState('')
  const [requestingRefundId, setRequestingRefundId] = useState<string | null>(null)
  const [requestedRefundIds, setRequestedRefundIds] = useState<Set<string>>(new Set())
  const { showToast } = useToast()

  useEffect(() => {
    if (!userId) return

    Promise.all([getOrders(userId), getDeliveries(userId), getMyRefunds()])
      .then(([loadedOrders, loadedDeliveries, refunds]) => {
        setOrders(loadedOrders)
        setDeliveries(loadedDeliveries)
        setRequestedRefundIds(
          new Set(
            refunds
              .filter((refund) => refund.status !== 'REJECTED')
              .map((refund) => refund.invoiceId),
          ),
        )
      })
      .catch(() => setError('Failed to load orders'))
      .finally(() => setLoading(false))
  }, [userId])

  const deliveryByInvoiceId = useMemo(
    () => new Map(deliveries.map((delivery) => [delivery.invoiceId, delivery])),
    [deliveries],
  )

  const handleRefundRequest = async (order: Order) => {
    if (!window.confirm('Request a refund for every item in this order?')) return

    setRequestingRefundId(order.invoiceId)
    try {
      await requestRefund(
        order.invoiceId,
        order.items.map((item) => item.invoiceItemId),
      )
      setRequestedRefundIds((current) => new Set(current).add(order.invoiceId))
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
          {orders.map((order) => {
            const delivery = deliveryByInvoiceId.get(order.invoiceId)
            const statusText = statusLabel[order.status as StepStatus] ?? order.status
            const statusColor = stepColor[order.status as StepStatus] ?? '#9ca3af'

            return (
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
                  <span style={{ color: statusColor, fontWeight: 'bold' }}>
                    {statusText}
                  </span>
                </div>
                {order.date && (
                  <p style={{ fontSize: 13, color: '#9ca3af', marginBottom: '0.5rem' }}>
                    {order.date}
                  </p>
                )}
                <StatusBar status={order.status} />
                {delivery?.address && (
                  <p style={{ fontSize: 13, color: '#9ca3af', marginBottom: '0.5rem' }}>
                    Address: {delivery.address}
                  </p>
                )}
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
                        <td style={{ textAlign: 'right', padding: '4px' }}>
                          {item.quantity}
                        </td>
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
                    gap: '1rem',
                  }}
                >
                  <button
                    type="button"
                    className="btn-secondary"
                    disabled={
                      requestingRefundId === order.invoiceId ||
                      requestedRefundIds.has(order.invoiceId) ||
                      order.items.length === 0
                    }
                    onClick={() => void handleRefundRequest(order)}
                  >
                    {requestedRefundIds.has(order.invoiceId)
                      ? 'Refund requested'
                      : requestingRefundId === order.invoiceId
                        ? 'Requesting...'
                        : 'Request refund'}
                  </button>
                  <strong>Total: ${order.totalPrice}</strong>
                </div>
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}
