import { useState } from 'react'
import { useLocation, useNavigate, Navigate } from 'react-router-dom'
import { useCart } from '../hooks/useCart'
import { useToast } from '../components/ToastProvider'
import './payment.css'

interface PaymentState {
    address: string
}

type FieldErrors = {
    cardName?: string
    cardNumber?: string
    expiry?: string
    cvv?: string
}

function formatCardNumber(value: string) {
    return value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()
}

function formatExpiry(value: string) {
    const digits = value.replace(/\D/g, '').slice(0, 4)
    if (digits.length >= 3) return digits.slice(0, 2) + ' / ' + digits.slice(2)
    return digits
}

function isValidExpiry(expiry: string): boolean {
    const match = expiry.match(/^(\d{2})\s*\/\s*(\d{2})$/)
    if (!match) return false

    const month = parseInt(match[1], 10)
    const year = parseInt(match[2], 10)

    if (month < 1 || month > 12) return false

    const now = new Date()
    const currentYear = now.getFullYear() % 100
    const currentMonth = now.getMonth() + 1

    if (year < currentYear) return false
    if (year === currentYear && month < currentMonth) return false

    if (year > currentYear + 20) return false

    return true
}

function isValidCardName(name: string): boolean {
    const trimmed = name.trim()
    if (trimmed.length < 2 || trimmed.length > 50) return false
    return /^[A-Za-zÀ-ÿĞğÜüŞşİıÖöÇç\s'-]+$/.test(trimmed)
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
    const [errors, setErrors] = useState<FieldErrors>({})
    const [touched, setTouched] = useState<Record<keyof FieldErrors, boolean>>({
        cardName: false,
        cardNumber: false,
        expiry: false,
        cvv: false,
    })

    const validateField = (field: keyof FieldErrors, value: string): string | undefined => {
        switch (field) {
            case 'cardName':
                if (!value.trim()) return 'Cardholder name is required'
                if (!isValidCardName(value)) return 'Enter a valid name (letters only)'
                return undefined
            case 'cardNumber': {
                const digits = value.replace(/\s/g, '')
                if (!digits) return 'Card number is required'
                if (digits.length !== 16) return 'Card number must be 16 digits'
                return undefined
            }
            case 'expiry':
                if (!value) return 'Expiry date is required'
                if (value.length !== 7) return 'Use MM / YY format'
                if (!isValidExpiry(value)) return 'Card is expired or invalid'
                return undefined
            case 'cvv':
                if (!value) return 'CVV is required'
                if (value.length !== 3) return 'CVV must be 3 digits'
                return undefined
        }
    }

    const handleBlur = (field: keyof FieldErrors, value: string) => {
        setTouched((prev) => ({ ...prev, [field]: true }))
        setErrors((prev) => ({ ...prev, [field]: validateField(field, value) }))
    }

    const updateField = (
        field: keyof FieldErrors,
        value: string,
        setter: (v: string) => void,
    ) => {
        setter(value)
        // Touched ise canlı doğrulama yap, kullanıcı hatayı düzeltirken anında geri bildirim alsın
        if (touched[field]) {
            setErrors((prev) => ({ ...prev, [field]: validateField(field, value) }))
        }
    }

    const validateAll = (): boolean => {
        const newErrors: FieldErrors = {
            cardName: validateField('cardName', cardName),
            cardNumber: validateField('cardNumber', cardNumber),
            expiry: validateField('expiry', expiry),
            cvv: validateField('cvv', cvv),
        }
        setErrors(newErrors)
        setTouched({ cardName: true, cardNumber: true, expiry: true, cvv: true })
        return Object.values(newErrors).every((e) => !e)
    }

    const handleConfirm = async () => {
        if (!validateAll()) {
            showToast('Please fix the errors before continuing', 'error')
            return
        }
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
                    autoComplete="cc-name"
                    value={cardName}
                    aria-invalid={!!errors.cardName}
                    aria-describedby={errors.cardName ? 'card-name-error' : undefined}
                    onChange={(e) => updateField('cardName', e.target.value, setCardName)}
                    onBlur={(e) => handleBlur('cardName', e.target.value)}
                />
                {errors.cardName && (
                    <span id="card-name-error" className="payment-error">{errors.cardName}</span>
                )}

                <label htmlFor="card-number">Card number</label>
                <input
                    id="card-number"
                    type="text"
                    inputMode="numeric"
                    placeholder="1234 5678 9012 3456"
                    autoComplete="cc-number"
                    value={cardNumber}
                    aria-invalid={!!errors.cardNumber}
                    aria-describedby={errors.cardNumber ? 'card-number-error' : undefined}
                    onChange={(e) =>
                        updateField('cardNumber', formatCardNumber(e.target.value), setCardNumber)
                    }
                    onBlur={(e) => handleBlur('cardNumber', e.target.value)}
                />
                {errors.cardNumber && (
                    <span id="card-number-error" className="payment-error">{errors.cardNumber}</span>
                )}

                <div className="payment-row">
                    <div>
                        <label htmlFor="expiry">Expiry date</label>
                        <input
                            id="expiry"
                            type="text"
                            inputMode="numeric"
                            placeholder="MM / YY"
                            autoComplete="cc-exp"
                            value={expiry}
                            aria-invalid={!!errors.expiry}
                            aria-describedby={errors.expiry ? 'expiry-error' : undefined}
                            onChange={(e) =>
                                updateField('expiry', formatExpiry(e.target.value), setExpiry)
                            }
                            onBlur={(e) => handleBlur('expiry', e.target.value)}
                        />
                        {errors.expiry && (
                            <span id="expiry-error" className="payment-error">{errors.expiry}</span>
                        )}
                    </div>
                    <div>
                        <label htmlFor="cvv">CVV</label>
                        <input
                            id="cvv"
                            type="text"
                            inputMode="numeric"
                            placeholder="123"
                            maxLength={3}
                            autoComplete="cc-csc"
                            value={cvv}
                            aria-invalid={!!errors.cvv}
                            aria-describedby={errors.cvv ? 'cvv-error' : undefined}
                            onChange={(e) =>
                                updateField(
                                    'cvv',
                                    e.target.value.replace(/\D/g, '').slice(0, 3),
                                    setCvv,
                                )
                            }
                            onBlur={(e) => handleBlur('cvv', e.target.value)}
                        />
                        {errors.cvv && (
                            <span id="cvv-error" className="payment-error">{errors.cvv}</span>
                        )}
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
                    disabled={loading}
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