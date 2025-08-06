import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import NotificationBanner from "../../NotificationBanner.jsx";
import "../../css/LoginUSER.css";
import "../../index.css";
import { apiFetch } from "../../api"; // ✅ Use the working fetch logic

// Icons (copied from LoginUSER for consistent styling)
const PawIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
    <ellipse cx="12" cy="16" rx="4" ry="3" />
    <circle cx="8" cy="10" r="1.5" />
    <circle cx="12" cy="8" r="1.5" />
    <circle cx="16" cy="10" r="1.5" />
    <circle cx="18" cy="13" r="1.2" />
  </svg>
);

const EyeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
  </svg>
);

const EyeOffIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z" />
  </svg>
);

const UserIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
  </svg>
);

const LockIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
  </svg>
);

function LoginSTAFF() {
  const navigate = useNavigate();
  // Original formData state, without 'rememberMe'
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [banner, setBanner] = useState({ message: "", type: "success", show: false });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (banner.show) {
      const timer = setTimeout(() => setBanner({ ...banner, show: false }), 4000);
      return () => clearTimeout(timer);
    }
  }, [banner]);

  // Original handleChange, only for email and password
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Original handleSubmit, with apiFetch and role-based redirection
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // ✅ Use centralized working fetch method
      const data = await apiFetch("/api/users/login", "POST", formData);
      // Save user data
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setBanner({ message: "Login successful!", type: "success", show: true });
      // Redirect based on role
      setTimeout(() => {
        if (data.user.role === "manager") {
          navigate("/managerdash");
        } else if (data.user.role === "veterinarian") {
          navigate("/vetDashboard");
        } else {
          navigate("/animals"); // fallback
        }
      }, 1500);
    } catch (err) {
      setBanner({ message: err.message || "Login failed", type: "error", show: true });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Background with animal silhouettes from LoginUSER */}
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

      <NotificationBanner
        message={banner.message}
        type={banner.type}
        show={banner.show}
        floating
        onClose={() => setBanner({ ...banner, show: false })}
      />

      <div className="login-container">
        {/* Left side - Branding from LoginUSER */}
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
            <h2>Staff Login</h2>
            <p>Managers & Veterinarians Only</p>
          </div>
        </div>

        {/* Right side - Login Form */}
        <div className="login-form-container">
          <div className="login-form-wrapper">
            <div className="login-form-header">
              <h3>Staff Login</h3>
              <p>Managers & Veterinarians Only</p>
            </div>
            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <div className="input-wrapper">
                  <div className="input-icon">
                    <UserIcon />
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="form-input"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="staff@email.com"
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
                    className="form-input"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder="Enter password"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
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
  );
}

export default LoginSTAFF;
