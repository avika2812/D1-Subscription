
import { useState } from 'react'
import '../App.css'
import './Footer.css'
import { toast } from 'react-toastify'
import Swal from 'sweetalert2'

function Footer() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubscribe = async () => {
    if (!email.trim()) {
      setMessage('Please enter your email address.')
      return
    }

    setLoading(true)
    setMessage('')

    try {
      fetch(`${import.meta.env.VITE_API_URL}/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          email: email.trim()
        })
      })

      const result = await response.text()

      if (response.ok) {
  Swal.fire({
  title: 'Subscribed!',
  text: 'Welcome to the DEV@Deakin community!',
  icon: 'success',
  confirmButtonText: 'Great!'
})
  setEmail('')
} else {
  toast.error(result || 'Subscription failed. Please try again.')
}
    } catch (error) {
      toast.error('Unable to connect to the server.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <footer>
      <div className="newsletter">
        <h3>SIGN UP FOR OUR DAILY INSIDER</h3>

        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />

        <button onClick={handleSubscribe} disabled={loading}>
          {loading ? 'Subscribing...' : 'Subscribe'}
        </button>

        {message && <p role="status">{message}</p>}
      </div>

      <div className="footer-content">
        <div>
          <h4>Explore</h4>
          <p>Home</p>
          <p>Questions</p>
          <p>Articles</p>
          <p>Tutorials</p>
        </div>

        <div>
          <h4>Support</h4>
          <p>FAQs</p>
          <p>Help</p>
          <p>Contact Us</p>
        </div>

        <div>
          <h4>Stay Connected</h4>
          <p>Facebook</p>
          <p>Twitter</p>
          <p>Instagram</p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>DEV@Deakin 2022</p>

        <div>
          <span>Privacy Policy</span>
          <span>Terms</span>
          <span>Code of Conduct</span>
        </div>
      </div>
    </footer>
  )
}

export default Footer
