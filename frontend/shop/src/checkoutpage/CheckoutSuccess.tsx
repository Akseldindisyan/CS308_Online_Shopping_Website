import { Link, useLocation, Navigate } from 'react-router-dom'
import type { InvoiceDTO } from '../data/types'
import './checkout-success.css'
import type { Key, ReactElement, JSXElementConstructor, ReactNode, ReactPortal } from 'react'

const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
    }).format(value)

const formatDate = (value: string) => {
    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) {
        return value
    }
    return parsed.toLocaleString()
}

function CheckoutSuccess() {
    const location = useLocation()
    const invoice = (location.state as { invoice?: InvoiceDTO } | null)?.invoice

    // Direct visit without state — send them home
    if (!invoice) {
        return <Navigate to="/" replace />
    }

    return (
        <main className="checkout-success-page">
            <section className="checkout-success-card">
                <div className="checkout-success-icon" aria-hidden="true">
                    ✓
                </div>
                <h1>Order Confirmed</h1>
                <p className="checkout-success-subtitle">
                    Thank you for your purchase. A copy of your invoice is shown below.
                </p>

                <dl className="checkout-success-meta">
                    <div>
                        <dt>Invoice ID</dt>
                        <dd>{invoice.invoiceId}</dd>
                    </div>
                    <div>
                        <dt>Date</dt>
                        <dd>{formatDate(invoice.date)}</dd>
                    </div>
                </dl>

                <div className="checkout-success-items">
                    <h2>Items</h2>
                    <ul>
                        {invoice.items.map((item: { productId: Key | null | undefined; productName: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; quantity: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; lineTotal: number }) => (
                            <li key={item.productId}>
                                <div>
                                    <strong>{item.productName}</strong>
                                    <span> × {item.quantity}</span>
                                </div>
                                <span>{formatCurrency(item.lineTotal)}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="checkout-success-total">
                    <span>Total</span>
                    <strong>{formatCurrency(invoice.totalPrice)}</strong>
                </div>

                <div className="checkout-success-actions">
                    <Link to="/" className="btn-action">
                        Continue shopping
                    </Link>
                </div>
            </section>
        </main>
    )
}

export default CheckoutSuccess