"use client"

import React from "react";
import { Link } from "react-router-dom";
import { useState } from "react"
import "../../index.css";
import "../../css/register.css";
import { apiFetch } from "../../api";
import { useNavigate } from "react-router-dom"
import DatePicker from "react-multi-date-picker";
import DatePanel from "react-multi-date-picker/plugins/date_panel";

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

const MailIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4M20 8L12 13L4 8V6L12 11L20 6V8Z" />
  </svg>
)

const HomeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M10 20V14H14V20H19V12H22L12 3L2 12H5V20H10Z" />
  </svg>
)

const CalendarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 3H18V1H16V3H8V1H6V3H5C3.89 3 3 3.9 3 5V19C3 20.1 3.89 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3M19 19H5V8H19V19M7 10H12V15H7" />
  </svg>
)

const QuestionIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12S6.48 22 12 22 22 17.52 22 12 17.52 2 12 2M13 19H11V17H13V19M15.07 11.25L14.17 12.17C13.45 12.9 13 13.5 13 15H11V14.5C11 13.4 11.45 12.4 12.17 11.67L13.41 10.41C13.78 10.05 14 9.55 14 9C14 7.9 13.1 7 12 7S10 7.9 10 9H8C8 6.79 9.79 5 12 5S16 6.79 16 9C16 9.88 15.64 10.68 15.07 11.25Z" />
  </svg>
)

const HeartIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.27 2 8.5C2 5.41 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.08C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.41 22 8.5C22 12.27 18.6 15.36 13.45 20.03L12 21.35Z" />
  </svg>
)

function RegisterUSER() {

  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    address: "",
    address2: "",
    city: "",
    state: "",
    sex: "",
    dateOfBirth: "",
    securityQuestion: "",
    securityAnswer: "",
    agreeToTerms: false,
    skills: [],
    preferences: "",
    availability: [],
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

    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords don't match!")
      setIsLoading(false)
      return
    }

    // Check required fields
    const requiredFields = ['name', 'email', 'password', 'address', 'city', 'state'];
    const missingFields = requiredFields.filter(field => !formData[field]);
    
    if (missingFields.length > 0) {
      alert(`Please fill in all required fields: ${missingFields.join(', ')}`);
      setIsLoading(false)
      return
    }

    try {
      // Format availability dates
      const availabilityDates = formData.availability && Array.isArray(formData.availability) 
        ? formData.availability.map(date => {
            if (typeof date === 'string') return date;
            if (date && date.format) return date.format('YYYY-MM-DD');
            return null;
          }).filter(date => date)
        : [];

      const userPayload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: "public",
        address: formData.address,
        address2: formData.address2,
        city: formData.city,
        state: formData.state,
        sex: formData.sex,
        dateOfBirth: formData.dateOfBirth,
        securityQuestion: formData.securityQuestion,
        securityAnswer: formData.securityAnswer,
        skills: formData.skills || [],
        preferences: formData.preferences,
        availability: availabilityDates
      };

      // Debug: Log the payload being sent
      console.log('=== FRONTEND DEBUG ===');
      console.log('Form data:', formData);
      console.log('User payload:', userPayload);
      console.log('Required fields check:');
      console.log('- name:', userPayload.name, 'type:', typeof userPayload.name, 'length:', userPayload.name ? userPayload.name.length : 0);
      console.log('- email:', userPayload.email, 'type:', typeof userPayload.email, 'length:', userPayload.email ? userPayload.email.length : 0);
      console.log('- password:', userPayload.password ? '[HIDDEN]' : 'null', 'type:', typeof userPayload.password, 'length:', userPayload.password ? userPayload.password.length : 0);
      console.log('- address:', userPayload.address, 'type:', typeof userPayload.address, 'length:', userPayload.address ? userPayload.address.length : 0);
      console.log('- city:', userPayload.city, 'type:', typeof userPayload.city, 'length:', userPayload.city ? userPayload.city.length : 0);
      console.log('- state:', userPayload.state, 'type:', typeof userPayload.state, 'length:', userPayload.state ? userPayload.state.length : 0);
      console.log('- sex:', userPayload.sex, 'type:', typeof userPayload.sex);
      console.log('- dateOfBirth:', userPayload.dateOfBirth, 'type:', typeof userPayload.dateOfBirth);
      console.log('- securityQuestion:', userPayload.securityQuestion, 'type:', typeof userPayload.securityQuestion);

      // Skip the optional checks and go straight to registration
      console.log('Proceeding with registration...');

      const response = await apiFetch("/api/users/register", "POST", userPayload);
      
      if (response.message) {
        alert("Account created successfully! You can now log in.");
        navigate("/login");
      } else {
        alert("Registration successful!");
        navigate("/login");
      }
    } catch (err) {
      console.error('Registration error:', err);
      alert(err.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
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
            <h2>Join Our Mission!</h2>
            <p>Create your account and help us save more animals in need</p>

            <div className="login-stats">
              <div className="login-stat">
               
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Register Form */}
        <div className="login-form-container">
          <div className="login-form-wrapper">
            <div className="login-form-header">
              <h3>Create Account</h3>
              <p>Fill in your information to get started</p>
            </div>

            <form onSubmit={handleSubmit} className="login-form">
              {/* Personal Information */}
              <div className="form-section">
                <h4 className="section-title">Personal Information</h4>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="name">Full Name</label>
                    <div className="input-wrapper">
                      <div className="input-icon">
                        <UserIcon />
                      </div>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Enter your full name"
                        required
                        maxLength={50}
                        className="form-input"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">Email Address</label>
                    <div className="input-wrapper">
                      <div className="input-icon">
                        <MailIcon />
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
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="dateOfBirth">Date of Birth</label>
                    <div className="input-wrapper">
                      <div className="input-icon">
                        <CalendarIcon />
                      </div>
                      <input
                        type="date"
                        id="dateOfBirth"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleInputChange}
                        required
                        className="form-input"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="sex">Gender</label>
                    <div className="input-wrapper">
                      <select
                        id="sex"
                        name="sex"
                        value={formData.sex}
                        onChange={handleInputChange}
                        required
                        className="form-input form-select"
                      >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                        <option value="prefer-not-to-say">Prefer not to say</option>
                      </select>
                    </div>
                  </div>
                </div>

                
              </div>

              {/* Address Information */}
              <div className="form-section">
                <h4 className="section-title">Address Information</h4>

                <div className="form-group">
                  <label htmlFor="address">Address 1</label>
                  <div className="input-wrapper">
                    <div className="input-icon">
                      <HomeIcon />
                    </div>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Enter your street address"
                      required
                      maxLength={100}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="address2">Address 2 (Optional)</label>
                  <div className="input-wrapper">
                    <div className="input-icon">
                      <HomeIcon />
                    </div>
                    <input
                      type="text"
                      id="address2"
                      name="address2"
                      value={formData.address2}
                      onChange={handleInputChange}
                      placeholder="Apartment, suite, unit, etc."
                      maxLength={100}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="city">City</label>
                    <div className="input-wrapper">
                      <input
                        type="text"
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder="Enter your city"
                        required
                        maxLength={100}
                        className="form-input"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="state">State</label>
                    <div className="input-wrapper">
                      <select
                        id="state"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        required
                        className="form-input form-select"
                      >
                        <option value="">Select State</option>
                        <option value="AL">Alabama</option>
                        <option value="AK">Alaska</option>
                        <option value="AZ">Arizona</option>
                        <option value="AR">Arkansas</option>
                        <option value="CA">California</option>
                        <option value="CO">Colorado</option>
                        <option value="CT">Connecticut</option>
                        <option value="DE">Delaware</option>
                        <option value="FL">Florida</option>
                        <option value="GA">Georgia</option>
                        <option value="HI">Hawaii</option>
                        <option value="ID">Idaho</option>
                        <option value="IL">Illinois</option>
                        <option value="IN">Indiana</option>
                        <option value="IA">Iowa</option>
                        <option value="KS">Kansas</option>
                        <option value="KY">Kentucky</option>
                        <option value="LA">Louisiana</option>
                        <option value="ME">Maine</option>
                        <option value="MD">Maryland</option>
                        <option value="MA">Massachusetts</option>
                        <option value="MI">Michigan</option>
                        <option value="MN">Minnesota</option>
                        <option value="MS">Mississippi</option>
                        <option value="MO">Missouri</option>
                        <option value="MT">Montana</option>
                        <option value="NE">Nebraska</option>
                        <option value="NV">Nevada</option>
                        <option value="NH">New Hampshire</option>
                        <option value="NJ">New Jersey</option>
                        <option value="NM">New Mexico</option>
                        <option value="NY">New York</option>
                        <option value="NC">North Carolina</option>
                        <option value="ND">North Dakota</option>
                        <option value="OH">Ohio</option>
                        <option value="OK">Oklahoma</option>
                        <option value="OR">Oregon</option>
                        <option value="PA">Pennsylvania</option>
                        <option value="RI">Rhode Island</option>
                        <option value="SC">South Carolina</option>
                        <option value="SD">South Dakota</option>
                        <option value="TN">Tennessee</option>
                        <option value="TX">Texas</option>
                        <option value="UT">Utah</option>
                        <option value="VT">Vermont</option>
                        <option value="VA">Virginia</option>
                        <option value="WA">Washington</option>
                        <option value="WV">West Virginia</option>
                        <option value="WI">Wisconsin</option>
                        <option value="WY">Wyoming</option>
                      </select>
                    </div>
                  </div>
                </div>


              </div>

              {/* Skills and Preferences */}
              <div className="form-section">
                <h4 className="section-title">Skills and Preferences</h4>

                <div className="form-group">
                  <label htmlFor="skills">Skills</label>
                  <div className="input-wrapper">
                    <select
                      id="skills"
                      name="skills"
                      multiple
                      className="form-input form-select"
                      value={formData.skills || []}
                      onChange={e => {
                        const options = Array.from(e.target.selectedOptions, option => option.value);
                        setFormData(prev => ({ ...prev, skills: options }));
                      }}
                    >
                      <option value="Animal Care">Animal Care</option>
                      <option value="Event Planning">Event Planning</option>
                      <option value="Fundraising">Fundraising</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Transport">Transport</option>
                      <option value="Medical">Medical</option>
                      <option value="Training">Training</option>
                      
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="preferences">Preferences (Optional)</label>
                  <textarea
                    id="preferences"
                    name="preferences"
                    value={formData.preferences || ''}
                    onChange={handleInputChange}
                    placeholder="Share any preferences or special requirements..."
                    maxLength={500}
                    className="form-input"
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '2.5rem', position: 'relative', zIndex: 100 }}>
                  <label htmlFor="availability">Availability</label>
                  <DatePicker
                    multiple
                    value={formData.availability || []}
                    onChange={dates => setFormData(prev => ({ ...prev, availability: dates }))}
                    format="YYYY-MM-DD"
                    id="availability"
                    name="availability"
                    plugins={[<DatePanel />]}
                    input={false}
                  />
                  <small>Select one or more dates you are available.</small>
                  <style>{`
                    .form-group[style*='zIndex: 100'] .rmdp-wrapper, .form-group[style*='zIndex: 100'] .rmdp-shadow {
                      z-index: 99999 !important;
                      position: absolute !important;
                      background: #fff !important;
                    }
                  `}</style>
                </div>
              </div>

              {/* Security Information */}
              <div className="form-section">
                <h4 className="section-title">Security Information</h4>

                <div className="form-row">
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
                        placeholder="Create a password"
                        required
                        className="form-input"
                      />
                      <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                      </button>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="confirmPassword">Confirm Password</label>
                    <div className="input-wrapper">
                      <div className="input-icon">
                        <LockIcon />
                      </div>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        placeholder="Confirm your password"
                        required
                        className="form-input"
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="securityQuestion">Security Question</label>
                  <div className="input-wrapper">
                    <div className="input-icon">
                      <QuestionIcon />
                    </div>
                    <select
                      id="securityQuestion"
                      name="securityQuestion"
                      value={formData.securityQuestion}
                      onChange={handleInputChange}
                      required
                      className="form-input form-select"
                    >
                      <option value="">Choose a security question</option>
                      <option value="pet-name">What was the name of your first pet?</option>
                      <option value="mother-maiden">What is your mother's maiden name?</option>
                      <option value="birth-city">In what city were you born?</option>
                      <option value="school-name">What was the name of your elementary school?</option>
                      <option value="favorite-animal">What is your favorite animal?</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="securityAnswer">Security Answer</label>
                  <div className="input-wrapper">
                    <input
                      type="text"
                      id="securityAnswer"
                      name="securityAnswer"
                      value={formData.securityAnswer}
                      onChange={handleInputChange}
                      placeholder="Enter your answer"
                      required
                      className="form-input"
                    />
                  </div>
                </div>
              </div>

              <div className="form-options">
                <label className="checkbox-wrapper">
                  <input
                    type="checkbox"
                    name="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onChange={handleInputChange}
                    className="checkbox-input"
                    required
                  />
                  <span className="checkbox-custom"></span>
                  <span className="checkbox-label">
                    I agree to the{" "}
                    <Link to="/terms" className="terms-link">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link to="/privacy" className="terms-link">
                      Privacy Policy
                    </Link>
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading || !formData.agreeToTerms}
                className={`login-button ${isLoading ? "loading" : ""}`}
              >
                {isLoading ? (
                  <div className="loading-spinner"></div>
                ) : (
                  <>
                    <HeartIcon />
                    <span>Create Account</span>
                  </>
                )}
              </button>
            </form>

            <div className="login-footer">
              <p>
                Already have an account?{" "}
                <Link to="/login" className="register-link">
                  Sign in here
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

      <style>{`
      .rmdp-wrapper, .rmdp-shadow {
        z-index: 99999 !important;
        position: absolute !important;
        background: #fff !important;
      }
      `}</style>
    </div>
  )
}

export default RegisterUSER