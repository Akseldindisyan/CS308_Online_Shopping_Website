import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getOrders, type Order } from '../api/orders'
import { getStoredUserId } from '../api/auth'
import { apiRequest } from '../api/client'
import '../App.css'

interface DeliveryItem {
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

interface Delivery {
  deliveryId: string
  customerId: string
  items: DeliveryItem[]
  totalPrice: number
  address: string
  completed: boolean
  status: string
}

const statusSteps = ['PROCESSING', 'IN_TRANSIT', 'DELIVERED']

const statusLabel: Record<string, string> = {
  PENDING: 'Processing',
  PROCESSING: 'Processing',
  IN_TRANSIT: 'In Transit',
  DELIVERED: 'Delivered',
}

const statusColor: Record<string, string> = {
  PENDING: '#f59e0b',
  PROCESSING: '#f59e0b',
  IN_TRANSIT: '#3b82f6',
  DELIVERED: '#22c55e',
}

function StatusBar({ status }: { status: string }) {
  const normalized = status?.toUpperCase()
  const currentIndex = normalized === 'PENDING' ? 0 : statusSteps.indexOf(normalized)

  return (
    <div style={{ margin: '0.75rem 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0' }}>
        {statusSteps.map((step, index) => {
          const isCompleted = index <= currentIndex
          const isLast = index === statusSteps.length - 1
          return (
            <div key={step} style={{ display: 'flex', alignItems: 'center', flex: isLast ? 0 : 1 }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: isCompleted ? statusColor[normalized] ?? '#22c55e' : '#374151',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, color: 'white', fontWeight: 'bold', flexShrink: 0
              }}>
                {isCompleted ? '✓' : index + 1}
              </div>
              <div style={{ fontSize: 11, color: isCompleted ? '#e5e7eb' : '#6b7280', marginLeft: 4, marginRight: 4, whiteSpace: 'nowrap' }}>
                {statusLabel[step] ?? step}
              </div>
              {!isLast && (
                <div style={{
                  flex: 1, height: 2, minWidth: 20,
                  background: index < currentIndex ? (statusColor[normalized] ?? '#22c55e') : '#374151',
                  margin: '0 4px'
                }} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function OrdersPage() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const userId = getStoredUserId()

  useEffect(() => {
    if (!userId) { setLoading(false); return }
    apiRequest<Delivery[]>(`/api/delivery/user/${userId}`)
      .then(setDeliveries)
      .catch(() => setError('Failed to load orders'))
      .finally(() => setLoading(false))
  }, [userId])

  if (!userId) return (
    <div className="page">
      <div className="main-content">
        <p>Please <Link to="/login">login</Link> to view your orders.</p>
      </div>
    </div>
  )

  return (
    <div className="page">
      <header className="header">
        <div className="header-top">
          <Link to="/" className="logo">TEKNOSU</Link>
          <div className="header-actions">
            <Link to="/cart" className="btn-primary">My Cart</Link>
            <Link to="/wishlist" className="btn-secondary">My Wishlist</Link>
          </div>
        </div>
      </header>
      <main className="main-content">
        <h1>My Orders</h1>
        {loading && <p>Loading...</p>}
        {error && <p className="search-error">{error}</p>}
        {!loading && deliveries.length === 0 && <p>No orders yet.</p>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {deliveries.map(delivery => (
            <div key={delivery.deliveryId} className="product-card" style={{ maxWidth: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <strong>Order #{delivery.deliveryId.slice(0, 8)}</strong>
                <span style={{ color: statusColor[delivery.status?.toUpperCase()] ?? '#22c55e', fontWeight: 'bold' }}>
                  {statusLabel[delivery.status?.toUpperCase()] ?? delivery.status}
                </span>
              </div>
              <StatusBar status={delivery.status} />
              {delivery.address && (
                <p style={{ fontSize: 13, color: '#9ca3af', marginBottom: '0.5rem' }}>
                  📦 {delivery.address}
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
                  {delivery.items.map(item => (
                    <tr key={item.productId} style={{ borderBottom: '1px solid #333' }}>
                      <td style={{ padding: '4px' }}>{item.productName}</td>
                      <td style={{ textAlign: 'right', padding: '4px' }}>{item.quantity}</td>
                      <td style={{ textAlign: 'right', padding: '4px' }}>${item.unitPrice}</td>
                      <td style={{ textAlign: 'right', padding: '4px' }}>${item.totalPrice}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p style={{ textAlign: 'right', marginTop: '0.5rem' }}>
                <strong>Total: ${delivery.totalPrice}</strong>
              </p>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}