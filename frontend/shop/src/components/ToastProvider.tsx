import {
    createContext,
    useCallback,
    useContext,
    useState,
    type ReactNode,
} from 'react'
import './toast.css'

type ToastKind = 'success' | 'error' | 'info'

interface Toast {
    id: number
    kind: ToastKind
    message: string
}

interface ToastContextValue {
    showToast: (message: string, kind?: ToastKind) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

let toastIdCounter = 0

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([])

    const showToast = useCallback(
        (message: string, kind: ToastKind = 'info') => {
            const id = ++toastIdCounter
            setToasts((current) => [...current, { id, kind, message }])
            setTimeout(() => {
                setToasts((current) => current.filter((t) => t.id !== id))
            }, 3000)
        },
        [],
    )

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="toast-container" role="status" aria-live="polite">
                {toasts.map((toast) => (
                    <div key={toast.id} className={`toast toast--${toast.kind}`}>
                        {toast.message}
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    )
}

export function useToast(): ToastContextValue {
    const ctx = useContext(ToastContext)
    if (!ctx) {
        throw new Error('useToast must be used within ToastProvider')
    }
    return ctx
}