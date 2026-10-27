import './App.css'
import { Routes, Route } from 'react-router-dom'
import Navigation from './routes/Navigation'
import Homepage from './routes/Homepage'
import Login from './routes/Login'
import SignUp from './routes/SignUp'
import Post from './Post/Post'
import Pricing from './Subscription/Pricing'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

function App() {
  return (
    <>
    <Routes>
      <Route path="/" element={<Navigation />}>
        <Route index element={<Homepage />} />
        <Route path="login" element={<Login />} />
        <Route path="signup" element={<SignUp />} />
        <Route path="post" element={<Post />} />
        <Route path="pricing" element={<Pricing/>}/>
      </Route>
    </Routes>
    <ToastContainer position="top-right" autoClose={3000} />
    </>
    
  )
}

export default App
