"use client"

import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import NotificationBanner from "../../NotificationBanner.jsx"
import "../../css/LoginUSER.css"
import "../../index.css"

const API_BASE_URL = "https://hopepaws-api-hfbwhtazhsg4cjbb.centralus-01.azurewebsites.net/api"

function LoginSTAFF() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ email: "", password: "" })
  const [showPassword, setShowPassword] = useState(false)
  const [banner, setBanner] = useState({ message: "", type: "success", show: false })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (banner.show) {
      const timer = setTimeout(() => setBanner({ ...banner, show: false }), 4000)
      return () => clearTimeout(timer)
    }
  }, [banner])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Login failed")
      }

      // Guardar token e info de usuario
      localStorage.setItem("token", data.token)
      localStorage.setItem("user", JSON.stringify(data.user))

      setBanner({ message: "Login successful!", type: "success", show: true })

      // Redireccionar según rol
      setTimeout(() => {
        if (data.user.role === "manager") {
          navigate("/managerDashboard")
        } else if (data.user.role === "veterinarian") {
          navigate("/vetDashboard")
        } else {
          navigate("/animals") // fallback
        }
      }, 1500)
    } catch (err) {
      setBanner({ message: err.message, type: "error", show: true })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="login-page">
      <NotificationBanner
        message={banner.message}
        type={banner.type}
        show={banner.show}
        floating
        onClose={() => setBanner({ ...banner, show: false })}
      />

      <div className="login-container">
        <div className="login-form-container">
          <div className="login-form-wrapper">
            <div className="login-form-header">
              <h3>Staff Login</h3>
              <p>Managers & Veterinarians Only</p>
            </div>

            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  className="form-input"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="staff@email.com"
                />
              </div>

              <div className="form-group">
                <label>Password</label>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  className="form-input"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Enter password"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>

              <button type="submit" disabled={isLoading} className="login-button">
                {isLoading ? "Logging in..." : "Login"}
              </button>
            </form>

            <div className="login-footer">
              <p>
                Not staff?{" "}
                <Link to="/login" className="register-link">
                  Public Login
                </Link>
              </p>
              <p className="back-home">
                <Link to="/" className="home-link">← Back to Home</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginSTAFF

