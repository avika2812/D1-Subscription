
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signinwithGoogle } from '../Firebase'
import '../App.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()

  // Email and password login
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    try {
      setLoading(true)

      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Login failed.')
      }

      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))

      navigate('/')
    } catch (error) {
      setError(error.message || 'Login failed. Please check your details.')
    } finally {
      setLoading(false)
    }
  }

  // Google login with backend JWT session
  const handleGoogleLogin = async () => {
    setError('')

    try {
      setLoading(true)

      // Sign in with Google using Firebase
      const result = await signinwithGoogle()

      // Get Firebase ID token
      const idToken = await result.user.getIdToken()

      // Send Firebase token to the backend
      const response = await fetch(`${API_URL}/google-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idToken }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Google login failed.')
      }

      // Store the backend JWT and user details
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))

      // Redirect to homepage
      navigate('/')
    } catch (error) {
      setError(error.message || 'Google login failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Login</h1>
        <p>Welcome back to DEV@Deakin!</p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="login-email">Email Address</label>
          <input
            id="login-email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label htmlFor="login-password">Password</label>
          <input
            id="login-password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && <p className="error-message">{error}</p>}

          <button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p>or</p>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
        >
          {loading ? 'Please wait...' : 'Continue with Google'}
        </button>

        <p className="auth-switch">
          Don't have an account? <Link to="/signup">Sign Up</Link>
        </p>
      </div>
    </div>
  )
}

export default Login
