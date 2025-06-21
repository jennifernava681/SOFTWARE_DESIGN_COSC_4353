"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import "../../../css/volunteer.css"

// US States for dropdown
const US_STATES = [
  { code: "AL", name: "Alabama" },
  { code: "AK", name: "Alaska" },
  { code: "AZ", name: "Arizona" },
  { code: "AR", name: "Arkansas" },
  { code: "CA", name: "California" },
  { code: "CO", name: "Colorado" },
  { code: "CT", name: "Connecticut" },
  { code: "DE", name: "Delaware" },
  { code: "FL", name: "Florida" },
  { code: "GA", name: "Georgia" },
  { code: "HI", name: "Hawaii" },
  { code: "ID", name: "Idaho" },
  { code: "IL", name: "Illinois" },
  { code: "IN", name: "Indiana" },
  { code: "IA", name: "Iowa" },
  { code: "KS", name: "Kansas" },
  { code: "KY", name: "Kentucky" },
  { code: "LA", name: "Louisiana" },
  { code: "ME", name: "Maine" },
  { code: "MD", name: "Maryland" },
  { code: "MA", name: "Massachusetts" },
  { code: "MI", name: "Michigan" },
  { code: "MN", name: "Minnesota" },
  { code: "MS", name: "Mississippi" },
  { code: "MO", name: "Missouri" },
  { code: "MT", name: "Montana" },
  { code: "NE", name: "Nebraska" },
  { code: "NV", name: "Nevada" },
  { code: "NH", name: "New Hampshire" },
  { code: "NJ", name: "New Jersey" },
  { code: "NM", name: "New Mexico" },
  { code: "NY", name: "New York" },
  { code: "NC", name: "North Carolina" },
  { code: "ND", name: "North Dakota" },
  { code: "OH", name: "Ohio" },
  { code: "OK", name: "Oklahoma" },
  { code: "OR", name: "Oregon" },
  { code: "PA", name: "Pennsylvania" },
  { code: "RI", name: "Rhode Island" },
  { code: "SC", name: "South Carolina" },
  { code: "SD", name: "South Dakota" },
  { code: "TN", name: "Tennessee" },
  { code: "TX", name: "Texas" },
  { code: "UT", name: "Utah" },
  { code: "VT", name: "Vermont" },
  { code: "VA", name: "Virginia" },
  { code: "WA", name: "Washington" },
  { code: "WV", name: "West Virginia" },
  { code: "WI", name: "Wisconsin" },
  { code: "WY", name: "Wyoming" },
]

// Available skills for volunteers
const VOLUNTEER_SKILLS = [
  "Dog Walking",
  "Cat Handling",
  "Animal Care",
  "Cleaning",
  "Medical Assistance",
  "Administrative Work",
  "Event Planning",
  "Photography",
  "Transportation",
  "Fundraising",
  "Social Media",
  "Training/Education",
]

// Days of the week
const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

function ApplyVolunteer() {
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    zipCode: "",
    availabilityDate: "",
    availableDays: [],
    availabilityTime: "",
    skills: [],
    motivation: "",
  })

  const [errors, setErrors] = useState({})
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }))
    }
  }

  const handleSkillChange = (skill) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.includes(skill) ? prev.skills.filter((s) => s !== skill) : [...prev.skills, skill],
    }))
  }

  const handleDayChange = (day) => {
    setFormData((prev) => ({
      ...prev,
      availableDays: prev.availableDays.includes(day)
        ? prev.availableDays.filter((d) => d !== day)
        : [...prev.availableDays, day],
    }))

    // Clear error when user selects a day
    if (errors.availableDays) {
      setErrors((prev) => ({
        ...prev,
        availableDays: "",
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    // Full Name validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required"
    } else if (formData.fullName.length > 50) {
      newErrors.fullName = "Full name must be 50 characters or less"
    }

    // Phone number validation
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required"
    } else if (!/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "Please enter a valid phone number"
    }

    // Address 1 validation
    if (!formData.address1.trim()) {
      newErrors.address1 = "Address is required"
    } else if (formData.address1.length > 100) {
      newErrors.address1 = "Address must be 100 characters or less"
    }

    // Address 2 validation (optional)
    if (formData.address2.length > 100) {
      newErrors.address2 = "Address 2 must be 100 characters or less"
    }

    // City validation
    if (!formData.city.trim()) {
      newErrors.city = "City is required"
    } else if (formData.city.length > 100) {
      newErrors.city = "City must be 100 characters or less"
    }

    // State validation
    if (!formData.state) {
      newErrors.state = "State is required"
    }

    // Zip code validation
    if (!formData.zipCode.trim()) {
      newErrors.zipCode = "Zip code is required"
    } else if (formData.zipCode.length < 5) {
      newErrors.zipCode = "Zip code must be at least 5 characters"
    } else if (formData.zipCode.length > 9) {
      newErrors.zipCode = "Zip code must be 9 characters or less"
    } else if (!/^\d{5}(-?\d{4})?$/.test(formData.zipCode)) {
      newErrors.zipCode = "Please enter a valid zip code"
    }

    // Availability date validation
    if (!formData.availabilityDate) {
      newErrors.availabilityDate = "Availability date is required"
    }

    // Available days validation
    if (formData.availableDays.length === 0) {
      newErrors.availableDays = "Please select at least one day"
    }

    // Availability time validation
    if (!formData.availabilityTime.trim()) {
      newErrors.availabilityTime = "Availability time is required"
    }

    // Skills validation
    if (formData.skills.length === 0) {
      newErrors.skills = "Please select at least one skill"
    }

    // Motivation validation
    if (!formData.motivation.trim()) {
      newErrors.motivation = "Please tell us why you want to volunteer"
    } else if (formData.motivation.length > 300) {
      newErrors.motivation = "Motivation must be 300 characters or less"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (validateForm()) {
      // Here you would typically send the data to your backend
      console.log("Form submitted:", formData)
      setIsSubmitted(true)
    }
  }

  if (isSubmitted) {
    return (
      <div className="volunteer-application">
        <div className="application-container">
          <div className="success-message">
            <div className="success-icon-green">✓</div>
            <h2>Application Submitted Successfully!</h2>
            <p>
              Thank you for your interest in volunteering with Hope Paws. We'll review your application and contact you
              within 3-5 business days.
            </p>
            <Link to="/" className="btn btn-primary">
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="volunteer-application">
      <div className="application-container">
        <div className="application-header">
          <h1>Volunteer Application</h1>
          <p>Join our team of dedicated volunteers and help make a difference in the lives of animals in need.</p>
        </div>

        <form onSubmit={handleSubmit} className="volunteer-form">
          {/* Personal Information Section */}
          <div className="form-section">
            <h3>Personal Information</h3>

            <div className="form-group">
              <label htmlFor="fullName">Full Name *</label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                maxLength="50"
                className={errors.fullName ? "error" : ""}
              />
              {errors.fullName && <span className="error-message">{errors.fullName}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="phoneNumber">Phone Number *</label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                placeholder="(555) 123-4567"
                className={errors.phoneNumber ? "error" : ""}
              />
              {errors.phoneNumber && <span className="error-message">{errors.phoneNumber}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="address1">Address 1 *</label>
              <input
                type="text"
                id="address1"
                name="address1"
                value={formData.address1}
                onChange={handleInputChange}
                maxLength="100"
                className={errors.address1 ? "error" : ""}
              />
              {errors.address1 && <span className="error-message">{errors.address1}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="address2">Address 2</label>
              <input
                type="text"
                id="address2"
                name="address2"
                value={formData.address2}
                onChange={handleInputChange}
                maxLength="100"
                className={errors.address2 ? "error" : ""}
              />
              {errors.address2 && <span className="error-message">{errors.address2}</span>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="city">City *</label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  maxLength="100"
                  className={errors.city ? "error" : ""}
                />
                {errors.city && <span className="error-message">{errors.city}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="state">State *</label>
                <select
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  className={errors.state ? "error" : ""}
                >
                  <option value="">Select State</option>
                  {US_STATES.map((state) => (
                    <option key={state.code} value={state.code}>
                      {state.name}
                    </option>
                  ))}
                </select>
                {errors.state && <span className="error-message">{errors.state}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="zipCode">Zip Code *</label>
                <input
                  type="text"
                  id="zipCode"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleInputChange}
                  maxLength="9"
                  placeholder="12345 or 12345-6789"
                  className={errors.zipCode ? "error" : ""}
                />
                {errors.zipCode && <span className="error-message">{errors.zipCode}</span>}
              </div>
            </div>
          </div>

          {/* Availability Section */}
          <div className="form-section">
            <h3>Availability</h3>

            <div className="form-group">
              <label htmlFor="availabilityDate">Available Start Date *</label>
              <input
                type="date"
                id="availabilityDate"
                name="availabilityDate"
                value={formData.availabilityDate}
                onChange={handleInputChange}
                min={new Date().toISOString().split("T")[0]}
                className={errors.availabilityDate ? "error" : ""}
              />
              {errors.availabilityDate && <span className="error-message">{errors.availabilityDate}</span>}
            </div>

            <div className="form-group">
              <label>Available Days *</label>
              <p className="field-description">Select all days you're available to volunteer:</p>
              <div className="days-grid">
                {DAYS_OF_WEEK.map((day) => (
                  <label key={day} className="day-checkbox">
                    <input
                      type="checkbox"
                      checked={formData.availableDays.includes(day)}
                      onChange={() => handleDayChange(day)}
                    />
                    <span className="checkmark"></span>
                    <span>{day}</span>
                  </label>
                ))}
              </div>
              {errors.availableDays && <span className="error-message">{errors.availableDays}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="availabilityTime">Preferred Time *</label>
              <select
                id="availabilityTime"
                name="availabilityTime"
                value={formData.availabilityTime}
                onChange={handleInputChange}
                className={errors.availabilityTime ? "error" : ""}
              >
                <option value="">Select Time</option>
                <option value="Morning (8AM-12PM)">Morning (8AM-12PM)</option>
                <option value="Afternoon (12PM-5PM)">Afternoon (12PM-5PM)</option>
                <option value="Evening (5PM-8PM)">Evening (5PM-8PM)</option>
                <option value="Flexible">Flexible</option>
              </select>
              {errors.availabilityTime && <span className="error-message">{errors.availabilityTime}</span>}
            </div>
          </div>

          {/* Skills Section */}
          <div className="form-section">
            <h3>Skills & Interests *</h3>
            <p>Please select all areas where you'd like to help:</p>

            <div className="skills-grid">
              {VOLUNTEER_SKILLS.map((skill) => (
                <label key={skill} className="skill-checkbox">
                  <input
                    type="checkbox"
                    checked={formData.skills.includes(skill)}
                    onChange={() => handleSkillChange(skill)}
                  />
                  <span className="checkmark"></span>
                  <span>{skill}</span>
                </label>
              ))}
            </div>
            {errors.skills && <span className="error-message">{errors.skills}</span>}
          </div>

          {/* Motivation Section */}
          <div className="form-section">
            <h3>Tell Us About Yourself</h3>

            <div className="form-group">
              <label htmlFor="motivation">Why do you want to volunteer with Hope Paws? *</label>
              <textarea
                id="motivation"
                name="motivation"
                value={formData.motivation}
                onChange={handleInputChange}
                maxLength="300"
                rows="4"
                placeholder="Share your motivation for volunteering and any relevant experience..."
                className={errors.motivation ? "error" : ""}
              />
              <div
                className={`character-count ${formData.motivation.length > 250 ? "warning" : ""} ${formData.motivation.length > 280 ? "danger" : ""}`}
              >
                {formData.motivation.length}/300 characters
              </div>
              {errors.motivation && <span className="error-message">{errors.motivation}</span>}
            </div>
          </div>

          {/* Submit Section */}
          <div className="form-section">
            <div className="form-actions">
              <button type="submit" className="btn btn-success btn-large">
                Submit Application
              </button>
              <Link to="/" className="btn btn-outline">
                Cancel
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ApplyVolunteer
