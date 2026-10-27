
import { useState, useEffect } from 'react'
import { SegmentedControl } from '@mantine/core'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import './Pricing.css'
import './PaymentModal.css'
import Monthly from './Monthly'
import Yearly from './Yearly'
import PaymentModal from './PaymentModal'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

function Pricing() {
  const [billing, setBilling] = useState('monthly')
  const [userPlan, setUserPlan] = useState('Free')
  const [planLoaded, setPlanLoaded] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const navigate = useNavigate()

  // Check the current plan when the page opens
  useEffect(() => {
    async function loadUserPlan() {
      const token = localStorage.getItem('token')

      if (!token) {
        setPlanLoaded(true)
        return
      }

      try {
        const response = await fetch(`${API_URL}/my-plan`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        const data = await response.json()

        if (response.status === 401) {
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          setUserPlan('Free')
          return
        }

        if (!response.ok) {
          throw new Error(data.message || 'Could not load your plan.')
        }

        setUserPlan(data.plan || 'Free')
      } catch (err) {
        console.error('Error loading user plan:', err)
        toast.error(err.message || 'Could not load your plan.')
      } finally {
        setPlanLoaded(true)
      }
    }

    loadUserPlan()
  }, [])

  // Check plan before opening the payment modal
  async function checkUserPlan(planType, billingPeriod) {
    const token = localStorage.getItem('token')

    if (!token) {
      toast.warning('Please login to upgrade your plan.')
      navigate('/login')
      return
    }

    try {
      setLoading(true)
      setError('')

      const response = await fetch(`${API_URL}/my-plan`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (response.status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        navigate('/login')
        throw new Error('Your session has expired. Please login again.')
      }

      if (!response.ok) {
        throw new Error(data.message || 'Could not check your plan.')
      }

      setUserPlan(data.plan || 'Free')

      if (data.plan === 'Paid') {
        toast.info('You already have a Paid plan.')
        return
      }

      setSelectedPlan({ planType, billingPeriod })
    } catch (err) {
      console.error('Error checking user plan:', err)
      toast.error(err.message || 'Could not check your current plan.')
    } finally {
      setLoading(false)
    }
  }

  // Confirm the demo upgrade
  async function confirmPayment() {
    const token = localStorage.getItem('token')

    if (!token || !selectedPlan) {
      toast.warning('Please login and select a plan.')
      navigate('/login')
      return
    }

    try {
      setLoading(true)
      setError('')

      const response = await fetch(`${API_URL}/upgrade`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          planType: selectedPlan.planType,
          billingPeriod: selectedPlan.billingPeriod,
        }),
      })

      const data = await response.json()

      if (response.status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        navigate('/login')
        throw new Error('Your session has expired. Please login again.')
      }

      if (!response.ok) {
        throw new Error(data.message || 'Upgrade failed.')
      }

      setUserPlan('Paid')
      setSelectedPlan(null)

      const savedUser = JSON.parse(
        localStorage.getItem('user') || '{}'
      )

      localStorage.setItem(
        'user',
        JSON.stringify({
          ...savedUser,
          plan: 'Paid',
          planType: selectedPlan.planType,
          billingPeriod: selectedPlan.billingPeriod,
        })
      )

      toast.success('Your plan has been upgraded successfully.')
    } catch (err) {
      console.error('Upgrade error:', err)
      setError(err.message || 'Upgrade failed.')
      toast.error(err.message || 'Could not upgrade your plan.')
    } finally {
      setLoading(false)
    }
  }

  const pricingComponent =
    billing === 'monthly' ? (
      <Monthly onUpgrade={checkUserPlan} />
    ) : (
      <Yearly onUpgrade={checkUserPlan} />
    )

  return (
    <div className="pricing-page">
      <h1>Plans & Pricing</h1>

      {userPlan === 'Paid' ? (
        <>
          <p className="pricing-subtitle">
            You are currently subscribed to a Paid plan.
          </p>

          {planLoaded && (
            <div className="current-plan-message">
              <h2>You're all set!</h2>
              <p>Your subscription is active.</p>
            </div>
          )}
        </>
      ) : (
        <>
          <p className="pricing-subtitle">
            Choose the plan that works best for you.
          </p>

          <SegmentedControl
            className="billing-toggle"
            value={billing}
            onChange={setBilling}
            data={[
              { label: 'Monthly', value: 'monthly' },
              { label: 'Yearly', value: 'yearly' },
            ]}
          />

          {!planLoaded ? (
            <p>Checking your current plan...</p>
          ) : (
            pricingComponent
          )}
        </>
      )}

      {selectedPlan && (
        <PaymentModal
          planType={selectedPlan.planType}
          billingPeriod={selectedPlan.billingPeriod}
          onClose={() => {
            if (!loading) {
              setSelectedPlan(null)
              setError('')
            }
          }}
          onConfirm={confirmPayment}
          loading={loading}
          error={error}
        />
      )}
    </div>
  )
}

export default Pricing


