import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { getStoredUserId } from '../api/auth'
import { getDeliveries, type DeliveryDTO } from '../api/delivery'
import { cancelOrder, getOrders, type Order } from '../api/orders'
import { getMyRefunds, requestRefund } from '../api/refunds'
import { useToast } from '../components/ToastProvider'
import '../App.css'

const statusSteps = ['PENDING', 'IN_TRANSIT', 'COMPLETED'] as const
type StepStatus = (typeof statusSteps)[number]
type OrderStatus = StepStatus | 'CANCELLED'

const statusLabel: Record<OrderStatus, string> = {
  PENDING: 'Pending',
  IN_TRANSIT: 'In Transit',
  COMPLETED: 'Delivered',
  CANCELLED: 'Cancelled',
}

const stepColor: Record<OrderStatus, string> = {
  PENDING: '#f59e0b',
  IN_TRANSIT: '#3b82f6',
  COMPLETED: '#22c55e',
  CANCELLED: '#ef4444',
}

function normalizeStatus(status: string | null | undefined): OrderStatus {
  const normalized = (status ?? '').trim().toUpperCase().replace(/[\s-]+/g, '_')

  if (normalized === 'CANCELLED' || normalized === 'CANCELED') {
    return 'CANCELLED'
  }
  if (normalized === 'IN_TRANSIT' || normalized === 'SHIPPED') {
    return 'IN_TRANSIT'
  }
  if (normalized === 'COMPLETED' || normalized === 'DELIVERED') {
    return 'COMPLETED'
  }

  return 'PENDING'
}

function StatusBar({ status }: { status: string }) {
  const normalized = normalizeStatus(status)
  const cancelled = normalized === 'CANCELLED'
  const currentIndex = cancelled ? statusSteps.length - 1 : statusSteps.indexOf(normalized)
  const progressPercent = cancelled
    ? 100
    : (currentIndex / (statusSteps.length - 1)) * 100
  const progressColor = stepColor[normalized]

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
            const isCompleted = cancelled || (index <= currentIndex && currentIndex >= 0)
            const circleColor = cancelled
              ? stepColor.CANCELLED
              : isCompleted
                ? stepColor[step]
                : '#374151'

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
                  {cancelled ? '×' : isCompleted ? '✓' : index + 1}
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
  const [refundStatusByInvoice, setRefundStatusByInvoice] = useState<Map<string, string>>(new Map())
  const [requestingRefundKey, setRequestingRefundKey] = useState<string | null>(null)
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null)
  const [requestedRefundItemIds, setRequestedRefundItemIds] = useState<Set<string>>(new Set())
  const { showToast } = useToast()

  useEffect(() => {
    if (!userId) return

    Promise.all([getOrders(userId), getDeliveries(userId), getMyRefunds()])
      .then(([loadedOrders, loadedDeliveries, refunds]) => {
        setOrders(loadedOrders)
        setDeliveries(loadedDeliveries)
        setRequestedRefundItemIds(
          new Set(
            refunds
              .filter((refund) => refund.status !== 'REJECTED')
              .flatMap((refund) => refund.items?.map((item) => item.invoiceItemId) ?? []),
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

  const handleRefundRequest = async (
    order: Order,
    itemIds: string[],
    confirmationMessage: string,
  ) => {
    if (itemIds.length === 0 || !window.confirm(confirmationMessage)) return

    const requestKey =
      itemIds.length === 1 ? itemIds[0] : `order-${order.invoiceId}`
    setRequestingRefundKey(requestKey)
    try {
      await requestRefund(order.invoiceId, itemIds)
      setRequestedRefundItemIds((current) => {
        const updated = new Set(current)
        itemIds.forEach((itemId) => updated.add(itemId))
        return updated
      })
        setRefundStatusByInvoice((current) => new Map(current).set(order.invoiceId, 'UNDECIDED'))
        showToast('Refund request submitted', 'success')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to request refund'
      setError(message)
      showToast(message, 'error')
    } finally {
      setRequestingRefundKey(null)
    }
  }

  const handleCancelOrder = async (order: Order) => {
    if (!window.confirm('Cancel this entire order?')) return

    setCancellingOrderId(order.invoiceId)
    try {
      await cancelOrder(order.invoiceId)
      setOrders((current) =>
        current.map((candidate) =>
          candidate.invoiceId === order.invoiceId
            ? { ...candidate, status: 'CANCELLED' }
            : candidate,
        ),
      )
      setDeliveries((current) =>
        current.map((delivery) =>
          delivery.invoiceId === order.invoiceId
            ? { ...delivery, status: 'CANCELLED', completed: false }
            : delivery,
        ),
      )
      showToast('Order cancelled successfully', 'success')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to cancel order'
      setError(message)
      showToast(message, 'error')
    } finally {
      setCancellingOrderId(null)
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
            const normalized = normalizeStatus(delivery?.status ?? order.status)
            const delivered = normalized === 'COMPLETED'
            const cancelled = normalized === 'CANCELLED'
            const refundableItems = order.items.filter(
              (item) => !requestedRefundItemIds.has(item.invoiceItemId),
            )
            const currentStatusColor = stepColor[normalized]
            const statusText = statusLabel[normalized]

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
                  <span style={{ color: currentStatusColor, fontWeight: 'bold' }}>
                    {statusText}
                  </span>
                </div>
                {order.date && (
                  <p style={{ fontSize: 13, color: '#9ca3af', marginBottom: '0.5rem' }}>
                    {order.date}
                  </p>
                )}
                <StatusBar status={normalized} />
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
                      {delivered && (
                        <th style={{ textAlign: 'right', padding: '4px' }}>Refund</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item) => {
                      const refundRequested = requestedRefundItemIds.has(
                        item.invoiceItemId,
                      )
                      const requesting =
                        requestingRefundKey === item.invoiceItemId

                      return (
                        <tr
                          key={item.invoiceItemId}
                          style={{ borderBottom: '1px solid #333' }}
                        >
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
                          {delivered && (
                            <td style={{ textAlign: 'right', padding: '4px' }}>
                              <button
                                type="button"
                                className="btn-secondary"
                                disabled={refundRequested || requestingRefundKey !== null}
                                onClick={() =>
                                  void handleRefundRequest(
                                    order,
                                    [item.invoiceItemId],
                                    `Request a refund for ${item.productName}?`,
                                  )
                                }
                              >
                                  {refundStatusByInvoice.get(order.invoiceId) === 'ACCEPTED'
                                      ? 'Refunded'
                                      : refundStatusByInvoice.get(order.invoiceId) === 'UNDECIDED'
                                          ? 'Refund requested'
                                          : requestingRefundId === order.invoiceId
                                              ? 'Requesting...'
                                              : 'Request refund'}
                              </button>
                            </td>
                          )}
                        </tr>
                      )
                    })}
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
                  {delivered ? (
                    <button
                      type="button"
                      className="btn-secondary"
                      disabled={
                        requestingRefundKey !== null ||
                        refundableItems.length === 0
                      }
                      onClick={() =>
                        void handleRefundRequest(
                          order,
                          refundableItems.map((item) => item.invoiceItemId),
                          refundableItems.length === order.items.length
                            ? 'Request a refund for every item in this order?'
                            : 'Request a refund for every remaining item in this order?',
                        )
                      }
                    >
                      {refundableItems.length === 0
                        ? 'Refund requested'
                        : requestingRefundKey === `order-${order.invoiceId}`
                          ? 'Requesting...'
                          : refundableItems.length === order.items.length
                            ? 'Refund entire order'
                            : 'Refund remaining items'}
                    </button>
                  ) : cancelled ? (
                    <button type="button" className="btn-secondary" disabled>
                      Order cancelled
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn-secondary"
                      disabled={cancellingOrderId !== null}
                      onClick={() => void handleCancelOrder(order)}
                      style={{ color: '#ef4444', borderColor: '#ef4444' }}
                    >
                      {cancellingOrderId === order.invoiceId
                        ? 'Cancelling...'
                        : 'Cancel order'}
                    </button>
                  )}
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
