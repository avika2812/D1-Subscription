
import { Link, Outlet, useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import Footer from '../components/Footer'
import portfolioData from '../components/PortfolioData'

function Navigation() {
  const navigate = useNavigate()
  const token = localStorage.getItem('token')

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to logout from DEV@Deakin?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, logout',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#7dd3c0',
      cancelButtonColor: '#a89b8c',
      reverseButtons: true,
      background: '#fdf6ec',
      color: '#333333',
    })

    if (result.isConfirmed) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')

      await Swal.fire({
        title: 'Logged out!',
        text: 'You have been logged out successfully.',
        icon: 'success',
        confirmButtonColor: '#7dd3c0',
        background: '#fdf6ec',
        color: '#333333',
        timer: 1500,
        showConfirmButton: false,
      })

      navigate('/login')
    }
  }

  return (
    <>
      <div className="top-navbar">
        <Link to="/" className="logo">
          DEV@Deakin
        </Link>

        <input
          type="search"
          className="search-box"
          placeholder="Search..."
        />

        {!token ? (
          <Link to="/login" className="nav-link">
            Login
          </Link>
        ) : (
          <button
            onClick={handleLogout}
            className="nav-link"
            type="button"
          >
            Logout
          </button>
        )}

        <Link to="/post" className="nav-link">
          Post
        </Link>

        <Link to="/pricing" className="nav-link">
          Pricing
        </Link>
      </div>

      <div className="banner">
        <img src={portfolioData.banner.image} alt="Banner" />
      </div>

      <Outlet />

      <Footer />
    </>
  )
}

export default Navigation
