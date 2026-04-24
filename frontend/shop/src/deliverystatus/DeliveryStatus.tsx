import { useState } from 'react'
import { Link } from 'react-router-dom'
import { deliveries, products, type Delivery } from '../data'
import '../App.css'
import './deliverystatus.css'

const STATUS_ORDER = ['processing', 'in-transit', 'delivered'] as const
type StatusKey = 'processing' | 'in-transit' | 'delivered'

const STATUS_META: Record<StatusKey, { label: string; color: string }> = {
  processing:  { label: 'Processing',  color: '#FBBF24' },
  'in-transit': { label: 'In Transit', color: '#3B82F6' },
  delivered:  { label: 'Delivered',  color: '#22C55E' },
}

// Mock: logged-in customer id
const CURRENT_USER = 'USR-2841'

function StatusTracker({ status }: { status: StatusKey }) {
  const steps = ['processing', 'in-transit', 'delivered']
  const activeIndex = steps.indexOf(status)

  return (
    <div className="ds-tracker">
      {steps.map((step, i) => {
        const done = i < activeIndex
        const active = i === activeIndex
        return (
          <div key={step} className="ds-tracker-step">
            <div
              className={`ds-tracker-dot ${done ? 'done' : ''} ${active ? 'active' : ''}`}
            >
              {done ? (
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M2 5l2.5 2.5L8 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : null}
            </div>
            <span className={`ds-tracker-label ${active || done ? 'ds-label-active' : ''}`}>
              {step === 'processing' ? 'Processing' : step === 'in-transit' ? 'In Transit' : 'Delivered'}
            </span>
            {i < steps.length - 1 && (
              <div className={`ds-tracker-line ${done || (active && i < activeIndex) ? 'done' : ''}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

function DeliveryCard({ delivery }: { delivery: Delivery }) {
  const product = products.find(p => p.id === delivery.productId)
  const meta = STATUS_META[delivery.status]

  return (
    <article className="ds-card">
      <div className="ds-card-top">
        <div className="ds-card-info">
          <div className="ds-card-id">#{delivery.deliveryId}</div>
          <h3 className="ds-card-name">{product?.name ?? 'Unknown Product'}</h3>
          <p className="ds-card-addr">
            <span className="ds-addr-icon">
              <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 1a5 5 0 00-5 5c0 3.5 5 9 5 9s5-5.5 5-9a5 5 0 00-5-5zm0 7a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </span>
            {delivery.address}, {delivery.addressDetail}
          </p>
        </div>
        <div className="ds-card-side">
          <span className="ds-badge" style={{ background: meta.color + '22', color: meta.color, border: `1px solid ${meta.color}44` }}>
            {meta.label}
          </span>
          <div className="ds-card-total">${delivery.totalPrice.toLocaleString()}</div>
          <div className="ds-card-qty">Qty: {delivery.quantity}</div>
        </div>
      </div>
      <StatusTracker status={delivery.status} />
    </article>
  )
}

export default function DeliveryStatus() {
  const [filter, setFilter] = useState<'all' | StatusKey>('all')

  // In a real app these would be the logged-in user's deliveries
  const myDeliveries = deliveries.filter(d => d.customerId === CURRENT_USER)

  const filtered = myDeliveries.filter(d =>
    filter === 'all' ? true :
    filter === 'delivered' ? d.status === 'delivered' || d.completed :
    d.status === filter
  )

  // For demo purposes show all deliveries since mock only has one for this user
  const displayDeliveries = myDeliveries.length <= 1 ? deliveries : filtered

  const counts = {
    all: deliveries.length,
    processing: deliveries.filter(d => d.status === 'processing').length,
    'in-transit': deliveries.filter(d => d.status === 'in-transit').length,
    delivered: deliveries.filter(d => d.status === 'delivered').length,
  }

  return (
    <main className="ds-page">
      <div className="ds-breadcrumb" aria-label="Breadcrumb">
        <Link to="/">Home</Link>
        <span>/</span>
        <span>My Orders</span>
      </div>

      <header className="ds-header">
        <div>
          <h1>My Orders</h1>
          <p>Track the status of your purchases</p>
        </div>
      </header>

      <nav className="ds-filters" aria-label="Filter by status">
        {(['all', 'processing', 'in-transit', 'delivered'] as const).map(f => (
          <button
            key={f}
            className={`ds-filter-btn ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f === 'all' ? 'All' : STATUS_META[f]?.label ?? f}
            <span className="ds-filter-count">{counts[f]}</span>
          </button>
        ))}
      </nav>

      <div className="ds-list">
        {displayDeliveries.length === 0 ? (
          <div className="ds-empty">
            <p>No orders found for the selected filter.</p>
            <Link to="/" className="btn-action">Continue Shopping</Link>
          </div>
        ) : (
          displayDeliveries.map(d => <DeliveryCard key={d.deliveryId} delivery={d} />)
        )}
      </div>
    </main>
  )
}
