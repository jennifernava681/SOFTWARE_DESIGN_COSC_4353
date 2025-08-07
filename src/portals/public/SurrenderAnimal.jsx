
import React from "react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react"
import "../../index.css";
import "../../css/surrender.css";
import { apiFetch } from "../../api";
import NotificationBanner from "../../NotificationBanner";


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

const HeartIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.27 2 8.5C2 5.41 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.08C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.41 22 8.5C22 12.27 18.6 15.36 13.45 20.03L12 21.35Z" />
  </svg>
)

const PetIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M4.5 12.5C4.5 13.88 5.62 15 7 15S9.5 13.88 9.5 12.5 8.38 10 7 10 4.5 11.12 4.5 12.5M17 10C15.62 10 14.5 11.12 14.5 12.5S15.62 15 17 15 19.5 13.88 19.5 12.5 18.38 10 17 10M12 4C10.62 4 9.5 5.12 9.5 6.5S10.62 9 12 9 14.5 7.88 14.5 6.5 13.38 4 12 4M12 20C16.5 18.33 18 15.67 18 12.5C18 11.12 16.88 10 15.5 10S13 11.12 13 12.5C13 13.88 11.88 15 10.5 15S8 13.88 8 12.5C8 11.12 6.88 10 5.5 10S3 11.12 3 12.5C3 15.67 4.5 18.33 9 20H12Z" />
  </svg>
)

function SurrenderAnimal() {
  const [formData, setFormData] = useState({
    // Animal information
    animalName: "",
    animalType: "",
    breed: "",
    age: "",
    gender: "",
    weight: "",
    // color: "",
    // microchipped: "",
    // microchipNumber: "",
    // spayedNeutered: "",
    // vaccinated: "",

    // Surrender details
    animal_description: "",
    reason: "",
    urgency: "",

    // Agreement
    agreeToTerms: false,
  })

  const [isLoading, setIsLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [showBanner, setShowBanner] = useState(false)
  const [bannerMessage, setBannerMessage] = useState("")

  useEffect(() => {
    if (showBanner) {
      const timer = setTimeout(() => setShowBanner(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showBanner]);

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
    setShowBanner(false)

    try {
      // Check if user is logged in
      const token = localStorage.getItem("token");
      if (!token) {
        setBannerMessage("Please log in to submit a surrender request.");
        setShowBanner(true);
        setIsLoading(false);
        return;
      }

      // Get user info from localStorage
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      
      const surrenderData = {
        ...formData,
        user_id: user.id_user,
        status: 'pending',
        surrender_date: new Date().toISOString()
      };

      const response = await apiFetch("/api/surrender", "POST", surrenderData);
      
      setBannerMessage("Surrender request submitted successfully! We'll contact you soon.");
      setShowBanner(true);
      setSubmitted(true);
      
    } catch (error) {
      console.error("Surrender request error:", error);
      setBannerMessage("Failed to submit surrender request. Please try again.");
      setShowBanner(true);
    } finally {
      setIsLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="surrender-page">
        <NotificationBanner
          floating
          onClose={() => setShowBanner(false)}
          show={showBanner}
          message={bannerMessage}
        />
        
        <div className="surrender-background">
          <div className="surrender-background-overlay"></div>
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

        <div className="surrender-container">
          <div className="success-message">
            <div className="success-icon-green">
              <HeartIcon />
            </div>
            <h2>Request Submitted Successfully</h2>
            <p>
              Thank you for reaching out to us. We understand this is a difficult decision. Our team will review your
              request and contact you within 24-48 hours to discuss next steps.
            </p>
            <div className="form-actions">
              <button onClick={() => (window.location.href = "/")} className="btn btn-primary btn-large">
                Return to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="surrender-page">
      <NotificationBanner
        floating
        onClose={() => setShowBanner(false)}
        show={showBanner}
        message={bannerMessage}
      />
      
      {/* Background with animal silhouettes */}
      <div className="surrender-background">
        <div className="surrender-background-overlay"></div>
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

      <div className="surrender-container">
        {/* Header */}
        <div className="surrender-header">
          <div className="surrender-logo">
            <div className="surrender-logo-icon">
              <PawIcon />
            </div>
            <div className="surrender-logo-text">
              <h1>Hope Paws</h1>
              <p>Animal Rescue & Sanctuary</p>
            </div>
          </div>

          <div className="surrender-welcome">
            <h2>Animal Surrender Request</h2>
            <p>
              We understand that sometimes circumstances require difficult decisions. Please fill out this form
              completely so we can best help you and your pet.
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="surrender-form-container">
          <form onSubmit={handleSubmit} className="surrender-form">
            {/* Animal Information */}
            <div className="form-section">
              <h3 className="section-title">Animal Information</h3>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="animalType">Animal Type *</label>
                  <div className="input-wrapper">
                    <div className="input-icon">
                      <PetIcon />
                    </div>
                    <select
                      id="animalType"
                      name="animalType"
                      value={formData.animalType}
                      onChange={handleInputChange}
                      required
                      className="form-input form-select"
                    >
                      <option value="">Select animal type</option>
                      <option value="dog">Dog</option>
                      <option value="cat">Cat</option>
                      <option value="rabbit">Rabbit</option>
                      <option value="bird">Bird</option>
                      <option value="hamster">Hamster</option>
                      <option value="guinea_pig">Guinea Pig</option>
                      <option value="reptile">Reptile</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="animalName">Animal's Name *</label>
                  <div className="input-wrapper">
                    <div className="input-icon">
                      <HeartIcon />
                    </div>
                    <input
                      type="text"
                      id="animalName"
                      name="animalName"
                      value={formData.animalName}
                      onChange={handleInputChange}
                      placeholder="Enter animal's name"
                      required
                      className="form-input"
                    />
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="breed">Breed</label>
                  <div className="input-wrapper">
                    <input
                      type="text"
                      id="breed"
                      name="breed"
                      value={formData.breed}
                      onChange={handleInputChange}
                      placeholder="Enter breed"
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="age">Age</label>
                  <div className="input-wrapper">
                    <input
                      type="text"
                      id="age"
                      name="age"
                      value={formData.age}
                      onChange={handleInputChange}
                      placeholder="e.g., 2 years, 6 months"
                      className="form-input"
                    />
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="gender">Gender</label>
                  <div className="input-wrapper">
                    <select
                      id="gender"
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      className="form-input form-select"
                    >
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="unknown">Unknown</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="weight">Weight</label>
                  <div className="input-wrapper">
                    <input
                      type="text"
                      id="weight"
                      name="weight"
                      value={formData.weight}
                      onChange={handleInputChange}
                      placeholder="e.g., 25 lbs"
                      className="form-input"
                    />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="animal_description">Animal Description</label>
                <textarea
                  id="animal_description"
                  name="animal_description"
                  value={formData.animal_description}
                  onChange={handleInputChange}
                  placeholder="Please describe your animal's personality, behavior, medical conditions, and any other relevant information (max 300 characters)"
                  required
                  className="form-input"
                  rows="4"
                  maxLength="300"
                />
                <div className="character-count">{formData.animal_description.length}/300 characters</div>
              </div>
            </div>

            {/* Surrender Details */}
            <div className="form-section">
              <h3 className="section-title">Surrender Details</h3>

              <div className="form-group">
                <label htmlFor="reason">Reason for Surrender</label>
                <textarea
                  id="reason"
                  name="reason"
                  value={formData.reason}
                  onChange={handleInputChange}
                  placeholder="Please explain why you need to surrender your animal. This helps us understand your situation and provide appropriate support (max 200 characters)"
                  required
                  className="form-input"
                  rows="3"
                  maxLength="200"
                />
                <div className="character-count">{formData.reason.length}/200 characters</div>
              </div>

              <div className="form-group">
                <label htmlFor="urgency">Urgency Level</label>
                <div className="input-wrapper">
                  <select
                    id="urgency"
                    name="urgency"
                    value={formData.urgency}
                    onChange={handleInputChange}
                    required
                    className="form-input form-select"
                  >
                    <option value="">Select urgency level</option>
                    <option value="immediate">Immediate (within 24 hours)</option>
                    <option value="urgent">Urgent (within 1 week)</option>
                    <option value="moderate">Moderate (within 2-4 weeks)</option>
                    <option value="flexible">Flexible (timing negotiable)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Agreement */}
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
                  I understand that Hope Paws will review my request and contact me within 24-48 hours. I agree to
                  provide accurate information and understand that surrender decisions are made based on available space
                  and resources.
                </span>
              </label>
            </div>

            <div className="form-actions">
              <button
                type="submit"
                disabled={isLoading || !formData.agreeToTerms}
                className={`btn btn-primary btn-large ${isLoading ? "loading" : ""}`}
              >
                {isLoading ? (
                  <div className="loading-spinner"></div>
                ) : (
                  <>
                    <HeartIcon />
                    <span>Submit Surrender Request</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default SurrenderAnimal
