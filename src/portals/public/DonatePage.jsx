"use client"
import "../../css/DonatePage.css"
import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import NotificationBanner from "../../NotificationBanner"
import { apiFetch } from "../../api";

function DonatePage() {
  // Mantener exactamente los mismos estados que el original
  const [amount, setAmount] = useState("")
  const [customAmount, setCustomAmount] = useState("")
  const [frequency, setFrequency] = useState("")
  const [endDate, setEndDate] = useState("")
  const [designation, setDesignation] = useState("")
  const [isFocused, setIsFocused] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    donationType: "",
    amount: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [showBanner, setShowBanner] = useState(false)

  // New state for money donation option when items is selected
  const [showMoneyOption, setShowMoneyOption] = useState(false)
  const [wantsMoneyToo, setWantsMoneyToo] = useState("")

  // Mantener exactamente el mismo useEffect
  useEffect(() => {
    if (showBanner) {
      const timer = setTimeout(() => setShowBanner(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [showBanner])

  // Mantener exactamente la misma lógica de handleChange
  const handleChange = (e) => {
    const { name, value, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "radio" ? value : value,
    }))
    if (name === "donationType") {
      if (value === "money") {
        setFormData((prev) => ({ ...prev, amount: "" }))
        setShowMoneyOption(false)
        setWantsMoneyToo("")
      } else if (value === "items") {
        setAmount("")
        setCustomAmount("")
        setShowMoneyOption(true)
        setWantsMoneyToo("")
      }
    }
  }

  // Handle money option selection
  const handleMoneyOptionChange = (value) => {
    setWantsMoneyToo(value)
    if (value === "no") {
      setAmount("")
      setCustomAmount("")
    }
  }

  // Mantener exactamente la misma lógica de handleSubmit
  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true);

    const isItemDonation = formData.donationType === "items";
    const isMoneyDonation = formData.donationType === "money" || (isItemDonation && wantsMoneyToo === "yes");
    const itemDescription = isItemDonation ? formData.amount : "";
    const finalAmount = isMoneyDonation ? (customAmount || amount) : "";

    // const finalAmount = customAmount || amount;
    
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        donation_type:
          formData.donationType === "money"
            ? "money"
            : formData.donationType === "items" && wantsMoneyToo === "yes"
            ? "money and items"
            : "items",
        amount: finalAmount,
        items: itemDescription,
        wantsMoneyToo,
        recurring_donation_period: frequency || null,
        recurring_donation_end_date: endDate || null,
        donation_designation_id: designation || null,
      };
    

      const response = await apiFetch('/api/donations', 'POST', payload);
      console.log('Donation submitted:', response);
      setShowBanner(true);
      
      setFormData({
        name: "",
        email: "",
        donationType: "",
        amount: "",
      });
      setAmount("");
      setCustomAmount("");
      setFrequency("");
      setEndDate("");
      setDesignation("");
      setWantsMoneyToo("");
    } catch (error) {
      console.error('Error submitting donation:', error.message);
      alert('Failed to submit donation. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="donation-page-container">
      {/* Decorative background elements */}
      <div className="bg-decoration bg-decoration-top"></div>
      <div className="bg-decoration bg-decoration-bottom"></div>

      <NotificationBanner
        floating
        onClose={() => setShowBanner(false)}
        show={showBanner}
        message="Thank you for your donation!"
      />

      <div className="donation-content-wrapper">
        {/* Main Form Card */}
        <div className="main-card">
          {/* Header with enhanced gradient */}
          <div className="card-header">
            {/* Decorative elements in header */}
            <div className="header-decoration header-decoration-1"></div>
            <div className="header-decoration header-decoration-2"></div>

            <div className="header-content">
              <h1 className="main-title">Donate Now</h1>
              
            </div>
          </div>

          {/* Form Content */}
          <div className="form-content">
            <form className="donation-form" onSubmit={handleSubmit}>
              {/* Personal Information */}
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="name" className="form-label">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    required
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email" className="form-label">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email address"
                    required
                    className="form-input"
                  />
                </div>
              </div>

              {/* Donation Type */}
              <div className="form-group">
                <label className="form-label">Donation Type</label>
                <div className="donation-type-options">
                  {["money", "items"].map((type) => (
                    <label
                      key={type}
                      className={`donation-type-option ${formData.donationType === type ? "selected" : ""}`}
                    >
                      <input
                        type="radio"
                        name="donationType"
                        value={type}
                        onChange={handleChange}
                        required
                        className="radio-input"
                      />
                      <span className="option-text">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Money Option Question (when items is selected) */}
              {showMoneyOption && (
                <div className="money-option-section">
                  <label className="money-option-label"> Do you also want to donate money along with items?</label>
                  <div className="money-option-choices">
                    {["yes", "no"].map((option) => (
                      <label
                        key={option}
                        className={`money-option-choice ${wantsMoneyToo === option ? "selected" : ""}`}
                      >
                        <input
                          type="radio"
                          name="wantsMoneyToo"
                          value={option}
                          onChange={(e) => handleMoneyOptionChange(e.target.value)}
                          className="radio-input-small"
                        />
                        <span className="choice-text">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Items Description (conditional) */}
              {formData.donationType !== "money" && formData.donationType !== "" && (
                <div className="form-group">
                  <label htmlFor="amount" className="form-label">
                    Items Description
                  </label>
                  <textarea
                    id="amount"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    placeholder="e.g. 2 bags of dog food, Dog beds, toys..."
                    className="form-textarea"
                  />
                </div>
              )}

              {/* Donation Amount - Show only if money is selected OR if items + money yes is selected */}
              {(formData.donationType === "money" ||
                (formData.donationType === "items" && wantsMoneyToo === "yes")) && (
                <fieldset
                  className={`amount-fieldset ${formData.donationType === "money" || wantsMoneyToo === "yes" ? "visible" : ""}`}
                >
                  <legend className="form-label">Donation Amount</legend>
                  <div className="amount-grid">
                    {[25, 50, 100, 250, 500].map((val) => (
                      <button
                        key={val}
                        type="button"
                        className={`amount-btn ${amount === String(val) ? "selected" : ""}`}
                        onClick={() => {
                          setAmount(String(val))
                          setCustomAmount("")
                        }}
                      >
                        ${val}
                      </button>
                    ))}
                    <div className={`custom-amount-wrapper ${isFocused ? "focused" : ""}`}>
                      <span className="dollar-prefix">$</span>
                      <input
                        type="number"
                        inputMode="numeric"
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        value={customAmount}
                        onChange={(e) => {
                          setCustomAmount(e.target.value)
                          setAmount("")
                        }}
                        className="custom-amount-input"
                        placeholder="Custom"
                      />
                    </div>
                  </div>
                </fieldset>
              )}

              {/* Frequency and End Date */}
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="recurring_donation_period" className="form-label">
                    Select Donation Frequency
                  </label>
                  <select
                    id="recurring_donation_period"
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value)}
                    className="form-select"
                  >
                    <option value="">-- Select Frequency --</option>
                    <option value="one_time">One-time</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="semi_annually">Semiannually</option>
                    <option value="annually">Annually</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="recurring_donation_end_date" className="form-label">
                    Ending (Optional)
                  </label>
                  <input
                    id="recurring_donation_end_date"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              {/* Designation */}
              <div className="form-group">
                <label htmlFor="donation_designation_id" className="form-label">
                  Select Designation
                </label>
                <select
                  id="donation_designation_id"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  className="form-select"
                >
                  <option value="">Please select...</option>
                  <option value="34389">General Donation</option>
                  <option value="85917">Pledges for BARC Euthanasia List Saves 2025</option>
                </select>
              </div>

              {/* Submit Button */}
              <div className="submit-button-wrapper">
                <button type="submit" disabled={isLoading} className={`submit-button ${isLoading ? "loading" : ""}`}>
                  {isLoading ? (
                    <>
                      <div className="loading-spinner"></div>
                      Processing...
                    </>
                  ) : formData.donationType === "items" && wantsMoneyToo === "no" ? (
                    " Donate Items Only"
                  ) : formData.donationType === "items" && wantsMoneyToo === "yes" ? (
                    " Donate Items + Money"
                  ) : formData.donationType === "items" ? (
                    " Donate Items"
                  ) : (
                    ` Donate ${
                      frequency === "one_time"
                        ? "Once"
                        : frequency === "monthly"
                          ? "Monthly"
                          : frequency === "quarterly"
                            ? "Quarterly"
                            : frequency === "semi_annually"
                              ? "Semiannually"
                              : frequency === "annually"
                                ? "Annually"
                                : frequency === "weekly"
                                  ? "Weekly"
                                  : ""
                    }`
                  )}
                </button>
              </div>

              {/* Back to Home Link */}
              <div className="back-home-wrapper">
                <Link to="/" className="back-home-link">
                  ← Back to Home
                </Link>
              </div>
            </form>
          </div>
        </div>

        {/* Information Section */}
        <div className="info-section">
          <div className="info-header">
            <div className="info-header-decoration"></div>
            <h2 className="info-title">🐾 Give Hope, Save Lives: Support Hope Paws Today</h2>
          </div>
          <div className="info-content">
            <div className="campaign-description">
              {/* Hero Section */}
              <div className="hero-section">
                <div className="hero-icon">🚨</div>
                <h3 className="hero-title">Every Second Counts</h3>
                <p className="hero-text">
                  Every day, countless stray, abandoned, and forgotten animals wander the streets left without care,
                  shelter, or hope. Without intervention, many end up in overcrowded shelters, facing euthanasia simply
                  because there's no room left.
                </p>
                <div className="hope-message">
                  <span className="hope-icon">✨</span>
                  <strong>With your help, that all can change.</strong>
                </div>
              </div>

              {/* Hope Paws Action */}
              <div className="action-section">
                <div className="section-icon">🐕‍🦺</div>
                <h3 className="section-title">That's where Hope Paws steps in and takes action.</h3>
                <div className="stats-card">
                  <div className="stat-item">
                    <span className="stat-number">2010</span>
                    <span className="stat-label">Founded</span>
                  </div>
                  <div className="stat-item highlight">
                    <span className="stat-number">52,000+</span>
                    <span className="stat-label">Lives Saved</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-number">∞</span>
                    <span className="stat-label">Hope Given</span>
                  </div>
                </div>
                <p>
                  Since 2010, Hope Paws has served as a lifeline for vulnerable animals rescuing, rehabilitating, and
                  relocating them to regions where adoptable pets are in high demand. There, they're welcomed into
                  loving homes and given a chance at a brighter future filled with love.
                </p>
              </div>

              {/* Why Support Matters */}
              <div className="support-section">
                <h3 className="section-title">
                  <span className="title-icon">💝</span>
                  Why Your Support Matters
                </h3>
                <div className="problem-solution">
                  <div className="problem-card">
                    <div className="card-icon">😢</div>
                    <h4>The Problem</h4>
                    <p>
                      Communities everywhere are struggling with overwhelming pet overpopulation. While some families
                      are ready to adopt, far too many dogs, cats, puppies, and kittens are left behind vastly
                      outnumbered and running out of time.
                    </p>
                  </div>
                  <div className="solution-card">
                    <div className="card-icon">🌟</div>
                    <h4>Our Solution</h4>
                    <p>Hope Paws steps in to close that gap. Your support helps fund:</p>
                  </div>
                </div>

                <div className="funding-grid">
                  <div className="funding-item">
                    <div className="funding-icon">🏥</div>
                    <h4>Critical Veterinary Care</h4>
                    <p>Getting pets healthy and ready for adoption</p>
                  </div>
                  <div className="funding-item">
                    <div className="funding-icon">🏠</div>
                    <h4>Safe Foster Homes</h4>
                    <p>Loving boarding while they wait for transport</p>
                  </div>
                  <div className="funding-item">
                    <div className="funding-icon">🎒</div>
                    <h4>Essential Supplies</h4>
                    <p>Crates, food, bedding, collars, and medications</p>
                  </div>
                  <div className="funding-item">
                    <div className="funding-icon">🚐</div>
                    <h4>Safe Transport</h4>
                    <p>Fleet of vans to trusted rescue partners across the U.S.</p>
                  </div>
                </div>

                <div className="important-note">
                  <div className="note-icon">⚠️</div>
                  <p>
                    <strong>Unlike many national groups, Hope Paws' funding isn't guaranteed.</strong> We operate solely
                    because of your support.
                  </p>
                </div>
              </div>

              {/* Compassion Into Action */}
              <div className="action-details-section">
                <h3 className="section-title">
                  <span className="title-icon">💪</span>
                  Turning Compassion Into Action
                </h3>

                <div className="cost-breakdown">
                  <div className="cost-card">
                    <div className="cost-amount">$400+</div>
                    <div className="cost-label">Per Animal Rescued</div>
                    <div className="cost-description">
                      Covers veterinary care, medications, food, temporary shelter, and transport
                    </div>
                  </div>
                </div>

                <div className="team-grid">
                  <div className="team-card">
                    <div className="team-icon">👩‍⚕️</div>
                    <h4>Animal Care Team</h4>
                    <p>Provides daily nourishment, enrichment, and compassionate attention to hundreds of animals</p>
                  </div>
                  <div className="team-card">
                    <div className="team-icon">🏥</div>
                    <h4>Medical Clinic</h4>
                    <p>On-site facility providing vital treatments, vaccinations, and preparation for new life</p>
                  </div>
                  <div className="team-card">
                    <div className="team-icon">🤝</div>
                    <h4>Rescue Coordination</h4>
                    <p>Carefully matches pets to our 40+ trusted partners across the country</p>
                  </div>
                  <div className="team-card">
                    <div className="team-icon">🏡</div>
                    <h4>Foster Support</h4>
                    <p>Ensures temporary homes are supported with training, supplies, and 24/7 guidance</p>
                  </div>
                </div>

                <div className="operational-note">
                  <div className="note-icon">ℹ️</div>
                  <p>
                    <em>
                      Hope Paws operates differently than many rescues we don't oversee the adoption process ourselves.
                      Instead, we work with trusted partners who find forever homes for the animals, which means{" "}
                      <strong>we don't receive any adoption fees</strong>. Your donation is what makes every rescue
                      journey possible from start to finish.
                    </em>
                  </p>
                </div>
              </div>

              {/* Impact Section */}
              <div className="impact-section">
                <h3 className="section-title">
                  <span className="title-icon">🎯</span>
                  Every Donation You Give
                </h3>
                <div className="impact-grid">
                  <div className="impact-item">
                    <div className="impact-icon">💖</div>
                    <h4>Saves a Life</h4>
                    <p>At risk of euthanasia</p>
                  </div>
                  <div className="impact-item">
                    <div className="impact-icon">🩺</div>
                    <h4>Funds Essential Care</h4>
                    <p>And rehabilitation</p>
                  </div>
                  <div className="impact-item">
                    <div className="impact-icon">🌈</div>
                    <h4>Provides Hope</h4>
                    <p>Where there was none</p>
                  </div>
                </div>

                <div className="impact-message">
                  <div className="message-icon">✨</div>
                  <p>
                    <strong>
                      <em>You're not just making a donation you're giving an animal their life back.</em>
                    </strong>
                  </p>
                </div>
              </div>

              {/* Why Hope Paws */}
              <div className="why-section">
                <h3 className="section-title">
                  <span className="title-icon">🏆</span>
                  Why Hope Paws?
                </h3>
                <div className="achievements-grid">
                  <div className="achievement-item">
                    <div className="achievement-icon">🥇</div>
                    <h4>Largest Rescue Transport Group</h4>
                    <p>Of its kind in the U.S.</p>
                  </div>
                  <div className="achievement-item">
                    <div className="achievement-icon">📊</div>
                    <h4>Over 52,000 Animals Saved</h4>
                    <p>And counting every day</p>
                  </div>
                  <div className="achievement-item">
                    <div className="achievement-icon">⭐</div>
                    <h4>Setting the Standard</h4>
                    <p>For humane animal transport and care</p>
                  </div>
                </div>

                <div className="dependency-note">
                  <div className="note-icon">🤲</div>
                  <p>
                    <em>But none of this is possible without contributors like you.</em>
                  </p>
                </div>
              </div>

              {/* Call to Action */}
              <div className="cta-section">
                <h3 className="section-title">
                  <span className="title-icon">🚀</span>
                  Join the Movement
                </h3>
                <div className="cta-content">
                  <div className="cta-message">
                    <p>Each rescue brings a new chance at life—and helps complete another family.</p>
                    <div className="tax-benefit">
                      <span className="benefit-icon">💰</span>
                      <strong>Give today—your donation is tax-deductible!</strong>
                    </div>
                  </div>

                  <div className="unity-message">
                    <p>Together, we can make a lasting impact—one life, one chance, one change at a time.</p>
                  </div>

                  <div className="final-cta">
                    <div className="final-icon">🎯</div>
                    <h4 className="final-message">Donate now. Save a life.</h4>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DonatePage
