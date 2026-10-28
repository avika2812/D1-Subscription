import './PaymentModal.css'
import { useState } from 'react'

function PaymentModal({planType,billingPeriod,onClose,onConfirm,loading,error,}) {
  const [cardholder, setCardholder] = useState('')
  const [cardNumber, setCardNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvv, setCvv] = useState('')
  const [formError, setFormError] = useState('')

  const prices = {
    Pro: { monthly: 199, yearly: 1999 },
    Premium: { monthly: 399, yearly: 3999 },
  }

  const price = prices[planType]?.[billingPeriod]

  function handleSubmit(e) {
    e.preventDefault()
    setFormError('')

    const digits = cardNumber.replace(/\s/g, '')

    if (!cardholder.trim()) {
      setFormError('Please enter the cardholder name.')
      return
    }

    if (!/^\d{16}$/.test(digits)) {
      setFormError('Enter a 16-digit test card number.')
      return
    }

    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry)) {
      setFormError('Enter expiry in MM/YY format.')
      return
    }

    if (!/^\d{3,4}$/.test(cvv)) {
      setFormError('Enter a valid test CVV.')
      return
    }

    // Simulated payment only; no real card is charged.
    onConfirm()
  }

  if (!price) return null

  return (
    <div className="payment-overlay">
      <div
        className="payment-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="payment-title"
      >
        <button
          type="button"
          className="payment-close"
          onClick={onClose}
          disabled={loading}
          aria-label="Close payment modal"
        >
          ×
        </button>

        <h2 id="payment-title">Confirm Your Plan</h2>

        <p>
          Plan: <strong>{planType}</strong>
        </p>
        <p>
          Billing: <strong>{billingPeriod}</strong>
        </p>
        <h3>₹{price}</h3>
        <p className="payment-note">
          Demo payment only. Do not enter real payment details.
        </p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="cardholder">Cardholder Name</label>
          <input
            id="cardholder"
            value={cardholder}
            onChange={(e) => setCardholder(e.target.value)}
            placeholder="Test User"
            autoComplete="off"
            required
          />

          <label htmlFor="card-number">Test Card Number</label>
          <input
            id="card-number"
            value={cardNumber}
            onChange={(e) =>
              setCardNumber(
                e.target.value.replace(/\D/g, '').slice(0, 16)
              )
            }
            placeholder="16 digits"
            inputMode="numeric"
            autoComplete="off"
            required
          />

          <div className="payment-fields">
            <div>
              <label htmlFor="expiry">Expiry (MM/YY)</label>
              <input
                id="expiry"
                value={expiry}
                onChange={(e) => setExpiry(e.target.value.slice(0, 5))}
                placeholder="MM/YY"
                autoComplete="off"
                required
              />
            </div>

            <div>
              <label htmlFor="cvv">Test CVV</label>
              <input
                id="cvv"
                value={cvv}
                onChange={(e) =>
                  setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))
                }
                placeholder="123"
                inputMode="numeric"
                autoComplete="off"
                required
              />
            </div>
          </div>

          {(formError || error) && (
            <p className="payment-error">{formError || error}</p>
          )}

          <button
            type="submit"
            className="payment-confirm"
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Confirm Demo Payment'}
          </button>

          <button
            type="button"
            className="payment-cancel"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  )
}

export default PaymentModal
