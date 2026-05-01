import { useState } from 'react'
import { useLocation, useNavigate, Navigate } from 'react-router-dom'
import { useCart } from '../hooks/useCart'
import { useToast } from '../components/ToastProvider'
import './payment.css'

interface PaymentState {
    address: string
}

function formatCardNumber(value: string) {
    return value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()
}

function formatExpiry(value: string) {
    const digits = value.replace(/\D/g, '').slice(0, 4)
    if (digits.length >= 3) return digits.slice(0, 2) + ' / ' + digits.slice(2)
    return digits
}

function PaymentPage() {
    const location = useLocation()
    const navigate = useNavigate()
    const { showToast } = useToast()
    const { checkout, cart } = useCart()

    const state = location.state as PaymentState | null
    if (!state?.address) return <Navigate to="/cart" replace />

    const [cardName, setCardName] = useState('')
    const [cardNumber, setCardNumber] = useState('')
    const [expiry, setExpiry] = useState('')
    const [cvv, setCvv] = useState('')
    const [loading, setLoading] = useState(false)

    const isValid =
        cardName.trim().length > 0 &&
        cardNumber.replace(/\s/g, '').length === 16 &&
        expiry.length === 7 &&
        cvv.length >= 3

    const handleConfirm = async () => {
        if (!isValid) return
        setLoading(true)
        const result = await checkout(state.address)
        setLoading(false)
        if (result.ok) {
            showToast('Order placed successfully!', 'success')
            navigate('/checkout/success', { state: { invoice: result.invoice } })
        } else {
            showToast(result.message, 'error')
        }
    }

    return (
        <main className="payment-page">
            <section className="payment-card">
                <h1>Payment details</h1>
                <p className="payment-sub">Enter your card information to complete the order.</p>

                <label htmlFor="card-name">Cardholder name</label>
                <input
                    id="card-name"
                    type="text"
                    placeholder="John Smith"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                />

                <label htmlFor="card-number">Card number</label>
                <input
                    id="card-number"
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                />

                <div className="payment-row">
                    <div>
                        <label htmlFor="expiry">Expiry date</label>
                        <input
                            id="expiry"
                            type="text"
                            placeholder="MM / YY"
                            value={expiry}
                            onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                        />
                    </div>
                    <div>
                        <label htmlFor="cvv">CVV</label>
                        <input
                            id="cvv"
                            type="text"
                            placeholder="123"
                            maxLength={4}
                            value={cvv}
                            onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                        />
                    </div>
                </div>

                <hr className="payment-divider" />

                <div className="payment-total">
                    <span>Order total</span>
                    <strong>
                        {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'USD',
                            maximumFractionDigits: 0,
                        }).format(cart?.totalPrice ?? 0)}
                    </strong>
                </div>

                <button
                    className="payment-btn"
                    disabled={!isValid || loading}
                    onClick={handleConfirm}
                >
                    {loading ? 'Processing…' : 'Confirm payment'}
                </button>

                <p className="payment-lock">
                    Secured with 256-bit encryption
                </p>
            </section>
        </main>
    )
}

export default PaymentPage