"use client"

import "../index.css" // Cambiado para apuntar al archivo correcto
import "../css/LoginUSER.css" // Ajustado para la estructura de carpetas
import { useState } from "react"
import { Link } from "react-router-dom"

// Icons
const PawIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
    <ellipse cx="12" cy="16" rx="4" ry="3" />
    <circle cx="8" cy="10" r="1.5" />
    <circle cx="12" cy="8" r="1.5" />
    <circle cx="16" cy="10" r="1.5" />
    <circle cx="18" cy="13" r="1.2" />
  </svg>
)

const EyeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
  </svg>
)

const EyeOffIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z" />
  </svg>
)

const UserIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
  </svg>
)

const LockIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
  </svg>
)

const HeartIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.27 2 8.5C2 5.41 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.08C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.41 22 8.5C22 12.27 18.6 15.36 13.45 20.03L12 21.35Z" />
  </svg>
)

function LoginUSER() {
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      console.log("Login attempt:", formData)
    }, 2000)
  }

  return (
    <div className="login-page">
      {/* Background with animal silhouettes */}
      <div className="login-background">
        <div className="login-background-overlay"></div>
        <div className="floating-paws">
          <div className="floating-paw paw-1">
            <PawIcon />
          </div>
          <div className="floating-paw paw-2">
            <PawIcon />
          </div>
          <div className="floating-paw paw-3">
            <PawIcon />
          </div>
          <div className="floating-paw paw-4">
            <PawIcon />
          </div>
          <div className="floating-paw paw-5">
            <PawIcon />
          </div>
        </div>
      </div>

      <div className="login-container">
        {/* Left side - Branding */}
        <div className="login-branding">
          <div className="login-logo">
            <div className="login-logo-icon">
              <PawIcon />
            </div>
            <div className="login-logo-text">
              <h1>Hope Paws</h1>
              <p>Animal Rescue & Sanctuary</p>
            </div>
          </div>

          <div className="login-welcome">
            <h2>Welcome Back!</h2>
            <p>Sign in to continue helping animals find their forever homes</p>

            <div className="login-stats">
              <div className="login-stat">
                
              </div>
              <div className="login-stat">
                
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Login Form */}
        <div className="login-form-container">
          <div className="login-form-wrapper">
            <div className="login-form-header">
              <h3>Sign In</h3>
              <p>Enter your credentials to access your account</p>
            </div>

            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <div className="input-wrapper">
                  <div className="input-icon">
                    <UserIcon />
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email"
                    required
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="input-wrapper">
                  <div className="input-icon">
                    <LockIcon />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter your password"
                    required
                    className="form-input"
                  />
                  <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>

              <div className="form-options">
                <label className="checkbox-wrapper">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleInputChange}
                    className="checkbox-input"
                  />
                  <span className="checkbox-custom"></span>
                  <span className="checkbox-label">Remember me</span>
                </label>
                <Link to="/forgot-password" className="forgot-password">
                  Forgot password?
                </Link>
              </div>

              <button type="submit" disabled={isLoading} className={`login-button ${isLoading ? "loading" : ""}`}>
                {isLoading ? (
                  <div className="loading-spinner"></div>
                ) : (
                  <>
                    <HeartIcon />
                    <span>Sign In</span>
                  </>
                )}
              </button>
            </form>

            <div className="login-footer">
              <p>
                Don't have an account?{" "}
                <Link to="/register" className="register-link">
                  Sign up here
                </Link>
              </p>
              <p className="back-home">
                <Link to="/" className="home-link">
                  ← Back to Home
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginUSER
