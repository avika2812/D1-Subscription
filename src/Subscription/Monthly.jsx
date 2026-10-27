
function Monthly({ onUpgrade }) {
  return (
    <div className="pricing-container">
      <div className="pricing-card grey-card">
        <h2>Free</h2>
        <p>Perfect for getting started</p>
        <h3>₹0 <span>/ month</span></h3>
        <hr />
        <ul>
          <li>✓ Access to free posts</li>
          <li>✓ 5 posts per month</li>
          <li>✓ 2 MB image upload limit</li>
          <li>✓ Basic community features</li>
        </ul>
        <button className="pricing-button grey-button" type="button">
          Current Plan
        </button>
      </div>

      <div className="pricing-card gold-card">
        <span className="popular-label">Most Popular</span>
        <h2>Pro</h2>
        <p>More features and flexibility</p>
        <h3>₹199 <span>/ month</span></h3>
        <hr />
        <ul>
          <li>✓ Access to free and paid posts</li>
          <li>✓ 50 posts per month</li>
          <li>✓ 10 MB image upload limit</li>
          <li>✓ Advanced community features</li>
          <li>✓ Priority support</li>
        </ul>
        <button
          className="pricing-button gold-button"
          type="button"
          onClick={() => onUpgrade('Pro', 'monthly')}
        >
          Upgrade Plan
        </button>
      </div>

      <div className="pricing-card grey-card">
        <h2>Premium</h2>
        <p>For power users and creators</p>
        <h3>₹399 <span>/ month</span></h3>
        <hr />
        <ul>
          <li>✓ Access to all posts</li>
          <li>✓ Unlimited posts</li>
          <li>✓ 50 MB image upload limit</li>
          <li>✓ Team collaboration</li>
          <li>✓ Priority support</li>
        </ul>
        <button
          className="pricing-button grey-button"
          type="button"
          onClick={() => onUpgrade('Premium', 'monthly')}
        >
          Get Started
        </button>
      </div>
    </div>
  )
}

export default Monthly

